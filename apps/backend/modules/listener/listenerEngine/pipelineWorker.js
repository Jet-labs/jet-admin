/**
 * Pipeline Worker
 * Consumes listener events (in-process fastq in embedded/memory mode,
 * Redis Streams consumer group in proxy/redis mode), applies transforms,
 * and dispatches actions (trigger_workflow, trigger_query, save_to_buffer, push_to_app_page).
 * Registered via queue.config.registerListenerEventWorker.
 *
 * Error policy (intentional):
 *   transform  → abort pipeline on error — downstream actions depend on clean data
 *   dispatch   → continue on error — side-effect failures are independent of each other
 */
const { registerListenerEventWorker } = require('../../../config/queue.config');
const { ListenerTransformerVm } = require('./listenerTransformerVm');
const { resolveTemplate: sharedResolveTemplate } = require("@jet-admin/expression-engine");
const { socketIO } = require('../../../config/socket.io');
const { prisma } = require('../../../config/prisma.config');
const Logger = require('../../../utils/logger');
const { createSystemContext, ORIGIN_TYPES } = require('../../../utils/executionContext');

const TEMPLATE_OPTIONS = {
  preserveSingleExpressionType: true,
};

// ─── Lazy service getters (avoids circular-dependency risk + hot-path require) ─

const { authorizedExecuteWorkflow, authorizedExecuteDataQuery } = require('../../../utils/authorizedProxy');

// ─── Startup ──────────────────────────────────────────────────────────────────

async function startPipelineWorker() {
  Logger.log('info', { message: 'pipelineWorker:starting' });

  registerListenerEventWorker(async (job) => {
    await _processEvent(job);
  });

  Logger.log('success', { message: 'pipelineWorker:started' });
}

// ─── Action resolution ──────────────────────────────────────────────────────
// Embedded (fastq) jobs carry an `actions` snapshot. Proxy (Redis) envelopes
// carry raw events only — resolve fresh enabled actions from DB so action
// CRUD never goes stale for in-flight messages (short TTL cache).

const ACTIONS_CACHE_TTL_MS = 5000;
const actionsCache = new Map(); // listenerID → { at, actions }

async function resolveActions(job) {
  // Embedded jobs always carry the snapshot (possibly empty = no-op).
  if (Array.isArray(job.actions)) {
    return job.actions;
  }
  const cached = actionsCache.get(job.listenerID);
  if (cached && Date.now() - cached.at < ACTIONS_CACHE_TTL_MS) {
    return cached.actions;
  }
  const actions = await prisma.tblListenerActions.findMany({
    where: { listenerID: job.listenerID, isEnabled: true },
    orderBy: { orderIndex: 'asc' },
  });
  actionsCache.set(job.listenerID, { at: Date.now(), actions });
  return actions;
}

// Test-room preview for proxy envelopes. (Embedded mode previews at ingress
// in engine.js; the proxy owns no sockets, so the consumer emits here.
// Guarded by __viaRedis so embedded jobs never double-emit.)
function maybeEmitTestPreview(job, actions) {
  try {
    if (!job || !job.__viaRedis) return;
    const rooms = socketIO?.sockets?.adapter?.rooms;
    if (!rooms) return;
    const testRoom = `listener_test:${job.listenerID}`;
    const room = rooms.get(testRoom);
    if (!room || room.size === 0) return;
    const transformAction = (actions || []).find((a) => a.actionType === 'transform' && a.isEnabled);
    const script = transformAction?.actionConfig?.script;
    let transformedEvent = job.rawEvent;
    let transformError = null;
    if (script && script.trim()) {
      const res = ListenerTransformerVm.execute(script, job.rawEvent);
      transformedEvent = res.output;
      transformError = res.error;
    }
    socketIO.to(testRoom).emit('listener_test_event', {
      listenerID: job.listenerID,
      rawEvent: job.rawEvent,
      transformedEvent,
      transformError,
      timestamp: Date.now(),
    });
  } catch (_) { /* best-effort only */ }
}

// ─── Event Processor ──────────────────────────────────────────────────────────

async function _processEvent(job) {
  const { listenerID, tenantID, rawEvent } = job;

  // Track pipeline outcome to conditionally update metadata
  let eventProcessed = false;

  try {
    const actions = await resolveActions(job);
    maybeEmitTestPreview(job, actions);
    let currentEvent = rawEvent;

    // Dispatch each action in order
    for (const action of actions) {
      if (!action.isEnabled) continue;

      try {
        if (action.actionType === 'transform') {
          // transform: abort pipeline on error — downstream actions depend on clean data
          const script = action.actionConfig?.script;
          if (script && script.trim()) {
            const { output, error: transformError } =
              ListenerTransformerVm.execute(script, currentEvent);

            if (transformError) {
              Logger.log('warning', {
                message: 'pipelineWorker:transformActionError',
                params: { listenerID, actionID: action.actionID, error: transformError },
              });
              // Stop pipeline execution on transformation error
              break;
            }

            currentEvent = output;

            // null/undefined = filtered out by transform script
            if (currentEvent == null) {
              Logger.log('info', {
                message: 'pipelineWorker:eventFilteredOut',
                params: { listenerID, actionID: action.actionID },
              });
              break;
            }
          }
        } else {
          // dispatch: continue on error — side-effect failures are independent
          await _dispatchAction(tenantID, listenerID, action, currentEvent);
          eventProcessed = true;
        }
      } catch (actionErr) {
        Logger.log('error', {
          message: 'pipelineWorker:actionError',
          params: {
            listenerID,
            actionID: action.actionID,
            actionType: action.actionType,
            error: actionErr.message,
          },
        });
        // Continue to next action — don't let one failure block others
      }
    }

    // Only update metadata when at least one dispatch action ran successfully,
    // avoiding inflated counts from filtered/aborted/all-disabled pipelines
    if (eventProcessed) {
      prisma.tblListeners.update({
        where: { listenerID },
        data: {
          lastEventAt: new Date(),
          eventCount: { increment: 1 },
        },
      }).catch(err => {
        Logger.log('error', {
          message: 'pipelineWorker:metadataUpdateError',
          params: { listenerID, error: err.message },
        });
      });
    }

  } catch (err) {
    Logger.log('error', {
      message: 'pipelineWorker:processEvent:error',
      params: { listenerID, error: err.message },
    });
    // Redis driver: propagate hard failures (e.g. action resolution against
    // a down DB) so the consumer loop moves the envelope to the DLQ stream
    // instead of silently dropping it. Memory driver keeps legacy swallow.
    if (job && job.__viaRedis) {
      throw err;
    }
  }
}

// ─── Action Dispatch ──────────────────────────────────────────────────────────

async function _dispatchAction(tenantID, listenerID, action, event) {
  const { actionType, actionConfig } = action;
  // Create a system execution context for this listener
  const executionCtx = createSystemContext(ORIGIN_TYPES.LISTENER, listenerID, tenantID);

  switch (actionType) {
    case 'trigger_workflow': {
      const inputValues = actionConfig.inputValues
        ? sharedResolveTemplate(actionConfig.inputValues, { event }, TEMPLATE_OPTIONS, {
          module: 'listener', listenerID,
        })
        : { event };
      await authorizedExecuteWorkflow({
        workflowID: actionConfig.workflowID,
        tenantID,
        inputValues,
        executionCtx,
      });
      break;
    }

    case 'trigger_query': {
      const inputValues = actionConfig.inputValues
        ? sharedResolveTemplate(actionConfig.inputValues, { event }, TEMPLATE_OPTIONS, {
          module: 'listener', listenerID,
        })
        : {};
      await authorizedExecuteDataQuery({
        dataQueryID: actionConfig.dataQueryID,
        inputValues,
        executionCtx,
      });
      break;
    }

    case 'save_to_buffer': {
      // Guard against transform scripts returning a primitive (string, number etc.),
      // which would throw a TypeError on __metadata access
      const eventMeta = (typeof event === 'object' && event !== null)
        ? (event.__metadata ?? null)
        : null;

      await prisma.tblListenerEvents.create({
        data: {
          listenerID,
          tenantID,
          bufferName: actionConfig.bufferName || 'default',
          eventData: event,
          eventMeta,
        },
      });
      // Async retention enforcement (non-blocking)
      _enforceRetention(listenerID, actionConfig).catch(() => { });
      break;
    }

    case 'push_to_app_page': {
      const channelName = actionConfig.channelName || `listener:${listenerID}`;
      const appPageID = actionConfig.appPageID;

      if (appPageID) {
        socketIO.to(`listener:app_page:${appPageID}`).emit('listener_event', {
          channelName,
          data: event,
          mode: actionConfig.mode || 'replace',
          limit: actionConfig.maxArrayLength || 1000,
          timestamp: Date.now(),
        });
      } else {
        Logger.log('warning', {
          message: 'pipelineWorker:push_to_app_page:missing_appPageID',
          params: { listenerID },
        });
      }
      break;
    }

    default:
      Logger.log('warning', {
        message: 'pipelineWorker:unknownActionType',
        params: { actionType, listenerID },
      });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function _enforceRetention(listenerID, config) {
  const { retentionPolicy, maxEvents, maxAgeHours } = config;
  const bufferName = config.bufferName || 'default';

  if (retentionPolicy === 'count' || retentionPolicy === 'both') {
    // Validate maxEvents is a positive integer to prevent Prisma skip: -1 / NaN / float
    if (Number.isInteger(maxEvents) && maxEvents > 0) {
      // Delete events beyond maxEvents (keep most recent)
      const cutoff = await prisma.tblListenerEvents.findFirst({
        where: { listenerID, bufferName },
        orderBy: { seqNo: 'desc' },
        skip: maxEvents,
        select: { seqNo: true },
      });
      if (cutoff) {
        await prisma.tblListenerEvents.deleteMany({
          where: {
            listenerID,
            bufferName,
            seqNo: { lte: cutoff.seqNo },
          },
        });
      }
    }
  }

  if (retentionPolicy === 'time' || retentionPolicy === 'both') {
    if (Number.isFinite(maxAgeHours) && maxAgeHours > 0) {
      const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
      await prisma.tblListenerEvents.deleteMany({
        where: {
          listenerID,
          bufferName,
          receivedAt: { lt: cutoffTime },
        },
      });
    }
  }
}

module.exports = { startPipelineWorker };