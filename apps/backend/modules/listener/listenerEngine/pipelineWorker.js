/**
 * Pipeline Worker
 * Consumes events from the listener event queue, applies transforms,
 * and dispatches actions (trigger_workflow, trigger_query, save_to_buffer, push_to_widget).
 *
 * Same pattern as workflow taskListener.js — registered as a fastq worker.
 */
const { registerListenerEventWorker } = require('../../../config/queue.config');
const { ListenerTransformerVm } = require('./listenerTransformerVm');
const { resolveTemplate: sharedResolveTemplate } = require('../../../utils/templateEngine');
const { socketIO } = require('../../../config/socket.io');
const { prisma } = require('../../../config/prisma.config');
const Logger = require('../../../utils/logger');

const TEMPLATE_OPTIONS = {
  preserveSingleExpressionType: true,
};

// ─── Startup ──────────────────────────────────────────────────────────────────

async function startPipelineWorker() {
  Logger.log('info', { message: 'pipelineWorker:starting' });

  registerListenerEventWorker(async (job) => {
    await _processEvent(job);
  });

  Logger.log('success', { message: 'pipelineWorker:started' });
}

// ─── Event Processor ──────────────────────────────────────────────────────────

async function _processEvent(job) {
  const { listenerID, tenantID, rawEvent, transformScript, actions } = job;

  try {
    // 1. Transform
    const { output: event, error: transformError } =
      ListenerTransformerVm.execute(transformScript, rawEvent);

    if (transformError) {
      Logger.log('warning', {
        message: 'pipelineWorker:transformError',
        params: { listenerID, error: transformError },
      });
    }

    // null/undefined = filtered out by transform
    if (!event) return;

    // 2. Dispatch each action in order
    for (const action of actions) {
      try {
        await _dispatchAction(tenantID, listenerID, action, event);
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

    // 3. Update metadata (async, non-blocking)
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

  } catch (err) {
    Logger.log('error', {
      message: 'pipelineWorker:processEvent:error',
      params: { listenerID, error: err.message },
    });
  }
}

// ─── Action Dispatch ──────────────────────────────────────────────────────────

async function _dispatchAction(tenantID, listenerID, action, event) {
  const { actionType, actionConfig } = action;

  switch (actionType) {
    case 'trigger_workflow': {
      const workflowService = require('../../workflow/workflow.service');
      const inputArgs = actionConfig.inputMapping
        ? sharedResolveTemplate(actionConfig.inputMapping, { event }, TEMPLATE_OPTIONS, {
            module: 'listener', listenerID,
          })
        : { event };
      await workflowService.executeWorkflow({
        workflowID: actionConfig.workflowID,
        tenantID,
        inputArgs,
      });
      break;
    }

    case 'trigger_query': {
      const { createQueryEngine } = require('../../dataQuery/dataQuery.service');
      const args = actionConfig.argMapping
        ? sharedResolveTemplate(actionConfig.argMapping, { event }, TEMPLATE_OPTIONS, {
            module: 'listener', listenerID,
          })
        : { event };
      const engine = createQueryEngine();
      await engine.executeQuery(actionConfig.dataQueryID, args);
      break;
    }

    case 'save_to_buffer': {
      await prisma.tblListenerEvents.create({
        data: {
          listenerID,
          tenantID,
          bufferName: actionConfig.bufferName || 'default',
          eventData: event,
          eventMeta: event.__metadata || null,
        },
      });
      // Async retention enforcement (non-blocking)
      _enforceRetention(listenerID, actionConfig).catch(() => {});
      break;
    }

    case 'push_to_widget': {
      const channelName = actionConfig.channelName || `listener:${listenerID}`;
      const data = actionConfig.dataPath
        ? _getByPath(event, actionConfig.dataPath)
        : event;

      if (actionConfig.widgetID) {
        socketIO.to(`widget:${actionConfig.widgetID}`).emit('listener_event', {
          channelName,
          data,
          mode: actionConfig.mode || 'replace',
          timestamp: Date.now(),
        });
      } else {
        // Broadcast to all subscribers of this listener's channel
        socketIO.emit('listener_event', {
          channelName,
          data,
          mode: actionConfig.mode || 'replace',
          timestamp: Date.now(),
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

  if (retentionPolicy === 'count' || retentionPolicy === 'both') {
    if (maxEvents && maxEvents > 0) {
      // Delete events beyond maxEvents (keep most recent)
      const cutoff = await prisma.tblListenerEvents.findFirst({
        where: { listenerID, bufferName: config.bufferName || 'default' },
        orderBy: { seqNo: 'desc' },
        skip: maxEvents,
        select: { seqNo: true },
      });
      if (cutoff) {
        await prisma.tblListenerEvents.deleteMany({
          where: {
            listenerID,
            bufferName: config.bufferName || 'default',
            seqNo: { lte: cutoff.seqNo },
          },
        });
      }
    }
  }

  if (retentionPolicy === 'time' || retentionPolicy === 'both') {
    if (maxAgeHours && maxAgeHours > 0) {
      const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
      await prisma.tblListenerEvents.deleteMany({
        where: {
          listenerID,
          bufferName: config.bufferName || 'default',
          receivedAt: { lt: cutoffTime },
        },
      });
    }
  }
}

function _getByPath(obj, path) {
  if (!path || !obj) return obj;
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

module.exports = { startPipelineWorker };
