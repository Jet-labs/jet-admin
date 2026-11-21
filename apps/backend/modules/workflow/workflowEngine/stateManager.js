/**
 * State Manager
 * All database operations for workflow instances.
 *
 * Storage model — unified append-only log
 * ─────────────────────────────────────────
 * tblWorkflowInstanceLogs is the single source of truth for everything that
 * happens inside a workflow execution:
 *
 *   - Context (replaces contextData JSONB + tblWorkflowContextOutputs)
 *   - Execution audit (replaces tblNodeExecutionLogs)
 *   - Error records
 *   - System metadata
 *
 * Every mutation is an immutable INSERT. Nothing is ever updated or deleted
 * (except on test-instance cleanup).
 *
 * API surface
 * ────────────
 *   stateManager.logEvent(...)     — single write path for all event types
 *   stateManager.assembleContext(instanceID)  — fold NODE_COMPLETED +
 *                                               INPUT_SET + SYSTEM_SET payloads
 *   stateManager.getCompletedNodeIDs(instanceID, nodeIDs)  — barrier check
 *
 * eventType constants (WORKFLOW_LOG_EVENT_TYPES)
 * ──────────────────────────────────────
 *   INPUT_SET      payload carries { input: inputValues }, nodeID null
 *   NODE_COMPLETED payload carries node output + __node_<id> sentinel
 *   NODE_FAILED    payload empty, errorMessage carries the error text
 *   SYSTEM_SET     payload carries orchestrator metadata keys
 */

const { prisma } = require("../../../config/prisma.config");
const constants = require("../../../constants");
const Logger = require("../../../utils/logger");
const { v5: uuidv5 } = require('uuid');

const stateManager = {};
stateManager.WORKFLOW_LOG_EVENT_TYPES = constants.WORKFLOW_LOG_EVENT_TYPES;

// ─── Unified log write ────────────────────────────────────────────────────────

/**
 * Append a single immutable event row to tblWorkflowInstanceLogs.
 *
 * @param {{
 *   instanceID:     string
 *   nodeID:         string | null
 *   eventType:      'INPUT_SET' | 'NODE_COMPLETED' | 'NODE_FAILED' | 'NODE_DISPATCHED' | 'SYSTEM_SET'
 *   nodeStatus:     'success' | 'error' | null
 *   outputVariable: string | null
 *   payload:        object
 *   errorMessage:   string | null
 *   nodeAttempt:    number | null   — which execution attempt (1 = first, 2+ = retry)
 *                                     null for non-node events (INPUT_SET, SYSTEM_SET)
 * }}
 */
stateManager.logEvent = async ({
  instanceID,
  nodeID = null,
  eventType,
  nodeStatus = null,
  outputVariable = null,
  payload = {},
  errorMessage = null,
  nodeAttempt = null,
  eventKey = null,
  contextSnapshot,
}, client) => {
  Logger.log('info', {
    message: 'stateManager:logEvent',
    params: { instanceID, nodeID, eventType, nodeStatus, outputVariable, nodeAttempt },
  });

  const data = {
      instanceID,
      nodeID: nodeID != null ? String(nodeID) : null,
      eventType,
      nodeStatus: nodeStatus || null,
      outputVariable: outputVariable || null,
      payload: contextSnapshot != null ? { ...payload, __contextSnapshot: contextSnapshot } : payload,
      errorMessage: errorMessage || null,
      nodeAttempt: nodeAttempt ?? null,
      eventKey,
  };
  const write = async target => {
    const row = eventKey ? await target.tblWorkflowInstanceLogs.upsert({
      where: { instanceID_eventKey: { instanceID, eventKey } }, create: data, update: {},
    }) : await target.tblWorkflowInstanceLogs.create({ data });
    if (contextSnapshot != null && row?.eventSequence != null) {
      await target.tblWorkflowInstances.updateMany({
        where: {
          instanceID, status: { in: ['PENDING', 'RUNNING', 'SUSPENDED'] },
          OR: [{ projectionSequence: null }, { projectionSequence: { lt: row.eventSequence } }],
        },
        data: { contextProjection: row.payload?.__contextSnapshot ?? contextSnapshot, projectionSequence: row.eventSequence },
      });
    }
    return row;
  };
  // Event append and projection update either both commit or neither does.
  if (!client && contextSnapshot != null) return prisma.$transaction(write);
  return write(client || prisma);
};

// ─── logEventBulk — updated to pass nodeAttempt ───────────────────────────────

stateManager.logEventBulk = async (events) => {
  if (!events || events.length === 0) return { count: 0 };

  Logger.log('info', {
    message: 'stateManager:logEventBulk',
    params: { count: events.length },
  });

  return prisma.tblWorkflowInstanceLogs.createMany({
    data: events.map((e) => ({
      instanceID: e.instanceID,
      nodeID: e.nodeID != null ? String(e.nodeID) : null,
      eventType: e.eventType,
      nodeStatus: e.nodeStatus || null,
      outputVariable: e.outputVariable || null,
      payload: e.payload ?? {},
      errorMessage: e.errorMessage || null,
      nodeAttempt: e.nodeAttempt ?? null,
    })),
  });
};

// ─── Instance lifecycle ───────────────────────────────────────────────────────

/**
 * Create a new workflow instance and write its INPUT_SET log row.
 *
 * Returns { instance, initialContext } so the caller can pass initialContext
 * directly into the first job payload without a round-trip assembleContext call.
 *
 * @param {{ workflowID: string, tenantID: string, inputValues?: object, isTest?: boolean, sourceWorkflowID?: string, parentInstanceID?: string, parentNodeID?: string, systemContext?: object }}
 *   sourceWorkflowID — for test runs launched from a saved workflow editor:
 *   stored on the instance so the run shows up in that workflow's history.
 *   Still an isTest run; unsaved-graph tests omit it (stays null).
 *   parentInstanceID/parentNodeID — for sub-workflow (child) runs: links the
 *   child instance back to the parent node that spawned it (run history/audit).
 *   systemContext — extra non-input keys (e.g. `{ __subDepth: 1 }`) merged into
 *   the initial context AND recorded via SYSTEM_SET so live execution and
 *   assembled history agree.
 * @returns {Promise<{ instance: object, initialContext: object }>}
 */
stateManager.createInstance = async ({ workflowID, tenantID, inputValues = {}, isTest = false, sourceWorkflowID, parentInstanceID, parentNodeID, systemContext = {}, executionKey, executionDefinition }) => {
  Logger.log('info', {
    message: 'stateManager:createInstance',
    params: { workflowID, tenantID, isTest, sourceWorkflowID, parentInstanceID, parentNodeID },
  });

  return prisma.$transaction(async (tx) => {
    const data = {
        workflowID: isTest ? (sourceWorkflowID ?? null) : workflowID,
        tenantID,
        status: constants.WORKFLOW_STATUS.PENDING,
        startedAt: new Date(),
        isTest,
        ...(parentInstanceID ? { parentInstanceID } : {}),
        ...(parentNodeID ? { parentNodeID: String(parentNodeID) } : {}),
        ...(executionDefinition ? { executionDefinition } : {}),
        ...(executionKey ? { executionKey, instanceID: uuidv5(`${tenantID}:${executionKey}`, uuidv5.URL) } : {}),
    };
    const instance = executionKey ? await tx.tblWorkflowInstances.upsert({
      where: { tenantID_executionKey: { tenantID, executionKey } }, create: data, update: {},
    }) : await tx.tblWorkflowInstances.create({ data });

    const systemEntries = {
      ...(systemContext && typeof systemContext === 'object' ? systemContext : {}),
      ...(parentInstanceID ? { __parentInstanceID: parentInstanceID } : {}),
    };
    const inputPayload = { input: inputValues, ...systemEntries };

    // All initial writes use the same transaction as instance allocation.
    const initial = await stateManager.logEvent({
      instanceID: instance.instanceID,
      nodeID: null,
      eventType: constants.WORKFLOW_LOG_EVENT_TYPES.INPUT_SET,
      outputVariable: 'input',
      payload: inputPayload,
      contextSnapshot: inputPayload,
      eventKey: executionKey ? 'initial-input' : null,
    }, tx);
    if (Object.keys(systemEntries).length > 0) {
      await stateManager.logEvent({
        instanceID: instance.instanceID,
        nodeID: null,
        eventType: constants.WORKFLOW_LOG_EVENT_TYPES.SYSTEM_SET,
        payload: systemEntries,
        eventKey: executionKey ? 'initial-system' : null,
      }, tx);
    }

    return { instance, initialContext: initial?.payload?.__contextSnapshot || inputPayload };
  });
};

/**
 * Fetch a single instance row (status / timestamps / flags only).
 * For context call assembleContext().
 *
 * @param {string} instanceID
 * @returns {Promise<object | null>}
 */
stateManager.getInstance = async (instanceID) => {
  return prisma.tblWorkflowInstances.findUnique({ where: { instanceID } });
};

/**
 * Fetch an instance with its full log history ordered by insertion sequence.
 *
 * @param {string} instanceID
 * @returns {Promise<object | null>}
 */
stateManager.getInstanceWithLogs = async (instanceID) => {
  return prisma.tblWorkflowInstances.findUnique({
    where: { instanceID },
    include: {
      tblWorkflowInstanceLogs: { orderBy: { eventSequence: 'asc' } },
    },
  });
};

// ─── Dispatch check (NEW) ─────────────────────────────────────────────────────

/**
 * Return the set of nodeIDs from the candidate list that the CAS winner
 * has already written a NODE_DISPATCHED row for.
 *
 * Called by the optimistic lock loser on retry. If all next nodes are
 * already dispatched, the loser stops — no duplicate dispatch.
 *
 * @param {string}   instanceID
 * @param {string[]} nodeIDs   — candidate next-node IDs to check
 * @returns {Promise<Set<string>>}
 */
stateManager.getOpenDispatchedNodeIDs = async (instanceID, nodeIDs) => {
  if (!nodeIDs || nodeIDs.length === 0) return new Set();

  const rows = await prisma.tblWorkflowInstanceLogs.findMany({
    where: {
      instanceID,
      eventType: {
        in: [
          constants.WORKFLOW_LOG_EVENT_TYPES.NODE_DISPATCHED,
           constants.WORKFLOW_LOG_EVENT_TYPES.NODE_COMPLETED,
          constants.WORKFLOW_LOG_EVENT_TYPES.NODE_FAILED,
          constants.WORKFLOW_LOG_EVENT_TYPES.NODE_FAILED,
        ],
      },
      nodeID: { in: nodeIDs },
    },
    select: { nodeID: true, eventType: true },
  });

  const counts = new Map(nodeIDs.map((nodeID) => [
    nodeID,
    { dispatched: 0, terminal: 0 },
  ]));

  for (const row of rows) {
    const current = counts.get(row.nodeID) || { dispatched: 0, terminal: 0 };
    if (row.eventType === constants.WORKFLOW_LOG_EVENT_TYPES.NODE_DISPATCHED) {
      current.dispatched += 1;
    } else {
      current.terminal += 1;
    }
    counts.set(row.nodeID, current);
  }

  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count.dispatched > count.terminal)
      .map(([nodeID]) => nodeID)
  );
};

// Backwards-compatible alias for older tests/importers.
stateManager.getDispatchedNodeIDs = stateManager.getOpenDispatchedNodeIDs;

stateManager.getDispatchCounts = async (instanceID, nodeIDs) => {
  if (!nodeIDs || nodeIDs.length === 0) return new Map();

  const rows = await prisma.tblWorkflowInstanceLogs.findMany({
    where: {
      instanceID,
      eventType: constants.WORKFLOW_LOG_EVENT_TYPES.NODE_DISPATCHED,
      nodeID: { in: nodeIDs },
    },
    select: { nodeID: true },
  });

  const counts = new Map(nodeIDs.map((nodeID) => [nodeID, 0]));
  for (const row of rows) {
    counts.set(row.nodeID, (counts.get(row.nodeID) || 0) + 1);
  }

  return counts;
};

// ─── Context assembly ─────────────────────────────────────────────────────────

/**
 * Assemble the current context for an instance by folding all context-bearing
 * log rows in insertion order.
 *
 * Only INPUT_SET, NODE_COMPLETED, and SYSTEM_SET rows carry payload.
 * NODE_FAILED rows are excluded — failed nodes produce no output.
 * NODE_DISPATCHED is intentionally NOT in this list — it carries no payload
 * and should not contribute to the context object.
 *
 * Same-key conflict: the higher database eventSequence wins (later INSERT).
 * Identical semantics to the old jsonb || last-writer model, but the merge
 * now happens on already-committed, race-free data.
 *
 * @param {string} instanceID
 * @returns {Promise<object>} Assembled context object
 */
stateManager.assembleContext = async (instanceID) => {
  const instance = await prisma.tblWorkflowInstances.findUnique({
    where: { instanceID }, select: { finalContext: true, contextProjection: true },
  });
  // A terminal snapshot is authoritative even if a late activity writes a log.
  if (instance?.finalContext != null) return instance.finalContext;
  if (instance?.contextProjection != null) return instance.contextProjection;
  const rows = await prisma.tblWorkflowInstanceLogs.findMany({
    where: {
      instanceID,
      eventType: {
        in: [
          constants.WORKFLOW_LOG_EVENT_TYPES.INPUT_SET,
          constants.WORKFLOW_LOG_EVENT_TYPES.NODE_COMPLETED,
          constants.WORKFLOW_LOG_EVENT_TYPES.SYSTEM_SET,
        ],
      },
    },
    orderBy: { eventSequence: 'asc' },
    select: { payload: true },
  });

  return rows.reduce((acc, row) => {
    const payload = row.payload || {};
    const { __deleteKeys, __contextSnapshot, ...rest } = payload;
    if (__contextSnapshot && typeof __contextSnapshot === 'object' && !Array.isArray(__contextSnapshot)) return __contextSnapshot;
    const next = { ...acc };
    if (Array.isArray(__deleteKeys)) {
      for (const key of __deleteKeys) delete next[key];
    }
    return Object.assign(next, rest);
  }, {});
};

// ─── Barrier check ────────────────────────────────────────────────────────────

/**
 * Return the set of nodeIDs from the candidate list that have a
 * NODE_COMPLETED log row for this instance.
 *
 * Used by dagScheduler to check whether all upstream dependencies of a
 * join node have finished before dispatching it.
 *
 * @param {string}   instanceID
 * @param {string[]} nodeIDs      candidate upstream nodeIDs to check
 * @returns {Promise<Set<string>>}
 */
stateManager.getCompletedNodeIDs = async (instanceID, nodeIDs) => {
  if (!nodeIDs || nodeIDs.length === 0) return new Set();

  const rows = await prisma.tblWorkflowInstanceLogs.findMany({
    where: {
      instanceID,
      eventType: constants.WORKFLOW_LOG_EVENT_TYPES.NODE_COMPLETED,
      nodeID: { in: nodeIDs },
    },
    select: { nodeID: true },
  });

  return new Set(rows.map((r) => r.nodeID));
};

// ─── Data Collection helpers ──────────────────────────────────────────────

/**
 * Create a new PENDING data-collection request record.
 *
 * @param {{ instanceID, nodeID, nodeAttempt, collectionType, collectionConfig, expiresAt }}
 * @returns {Promise<object>} Prisma row including collectionRequestID
 */
stateManager.createDataCollectionRequest = async ({
  instanceID,
  nodeID,
  nodeAttempt,
  collectionType,
  collectionConfig,
  expiresAt,
  collectionRequestID,
  waitID,
}) => {
  Logger.log('info', {
    message: 'stateManager:createDataCollectionRequest',
    params: { instanceID, nodeID, collectionType },
  });

  const data = {
      ...(collectionRequestID ? { collectionRequestID } : {}),
      instanceID,
      nodeID: String(nodeID),
      waitID: waitID || null,
      nodeAttempt: nodeAttempt ?? null,
      status: constants.WORKFLOW_STATUS.PENDING,
      collectionType: collectionType || 'form',
      collectionConfig: collectionConfig ?? {},
      expiresAt: expiresAt ?? null,
  };
  if (collectionRequestID) return prisma.tblWorkflowDataCollectionRequests.upsert({
    where: { collectionRequestID }, create: data, update: {},
  });
  return prisma.tblWorkflowDataCollectionRequests.create({ data });
};

/**
 * Find a PENDING request for a specific node (used for idempotency on replay).
 *
 * @param {string} instanceID
 * @param {string} nodeID
 * @returns {Promise<object|null>}
 */
stateManager.getPendingRequestForNode = async (instanceID, nodeID) => {
  return prisma.tblWorkflowDataCollectionRequests.findFirst({
    where: { instanceID, nodeID: String(nodeID), status: constants.WORKFLOW_STATUS.PENDING },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Fetch a request by its primary key.
 *
 * @param {string} collectionRequestID
 * @returns {Promise<object|null>}
 */
stateManager.getDataCollectionRequest = async (collectionRequestID) => {
  return prisma.tblWorkflowDataCollectionRequests.findUnique({
    where: { collectionRequestID },
  });
};

stateManager.getInstanceForExecutionKey = (tenantID, executionKey) => prisma.tblWorkflowInstances.findUnique({
  where: { tenantID_executionKey: { tenantID, executionKey } },
});
stateManager.markInstanceStarted = instanceID => prisma.tblWorkflowInstances.updateMany({
  where: { instanceID, status: 'PENDING' }, data: { status: 'RUNNING', updatedAt: new Date() },
});

// The request row is the durable signal outbox. Lock the parent before the
// request (same ordering as finalization) to serialize submit-vs-termination.
stateManager.submitDataCollectionRequest = async (request, submittedData) => {
  const { isDeepStrictEqual } = require('node:util');
  const outcome = await prisma.$transaction(async tx => {
    const running = await tx.tblWorkflowInstances.updateMany({
      where: { instanceID: request.instanceID, status: 'RUNNING' },
      data: { version: { increment: 1 } },
    });
    if (!running.count) return { error: 'Workflow is no longer running' };
    const now = new Date();
    const expired = await tx.tblWorkflowDataCollectionRequests.updateMany({
      where: { collectionRequestID: request.collectionRequestID, status: 'PENDING', expiresAt: { lte: now } },
      data: { status: 'EXPIRED', updatedAt: now },
    });
    if (expired.count) return { error: 'Data collection request has expired' };
    await tx.tblWorkflowDataCollectionRequests.updateMany({
      where: { collectionRequestID: request.collectionRequestID, status: 'PENDING' },
      data: { status: 'SUBMITTED', submittedData, updatedAt: now },
    });
    const current = await tx.tblWorkflowDataCollectionRequests.findUnique({ where: { collectionRequestID: request.collectionRequestID } });
    if (!current || !['SUBMITTED', 'COMPLETED'].includes(current.status)) return { error: `Request is already ${current?.status || 'missing'}` };
    if (!isDeepStrictEqual(current.submittedData, submittedData)) return { error: 'A different submission has already been accepted' };
    return { request: current };
  });
  // Throw AFTER commit so the EXPIRED transition is not rolled back.
  if (outcome.error) throw new Error(outcome.error);
  return outcome.request;
};

stateManager.resolveDataCollectionRequest = async (collectionRequestID, expire = false) => {
  return prisma.$transaction(async tx => {
    await tx.tblWorkflowDataCollectionRequests.updateMany({
      where: { collectionRequestID, status: 'SUBMITTED' },
      data: { status: 'COMPLETED', updatedAt: new Date() },
    });
    if (expire) await tx.tblWorkflowDataCollectionRequests.updateMany({
      where: { collectionRequestID, status: 'PENDING' },
      data: { status: 'EXPIRED', updatedAt: new Date() },
    });
    return tx.tblWorkflowDataCollectionRequests.findUnique({ where: { collectionRequestID } });
  });
};

/**
 * Mark a request COMPLETED and store the user-submitted data.
 *
 * @param {string} collectionRequestID
 * @param {object} submittedData
 * @returns {Promise<object>}
 */
stateManager.completeDataCollectionRequest = async (collectionRequestID, submittedData) => {
  Logger.log('info', {
    message: 'stateManager:completeDataCollectionRequest',
    params: { collectionRequestID },
  });

  return prisma.tblWorkflowDataCollectionRequests.update({
    where: { collectionRequestID },
    data: {
      status: constants.WORKFLOW_STATUS.COMPLETED,
      submittedData: submittedData ?? {},
      updatedAt: new Date(),
    },
  });
};

/**
 * Return all PENDING requests for an instance (used by getRunStatus to let
 * a frontend that refreshed know it needs to show a collection form).
 *
 * @param {string} instanceID
 * @returns {Promise<object[]>}
 */
stateManager.getPendingDataCollectionRequests = async (instanceID) => {
  return prisma.tblWorkflowDataCollectionRequests.findMany({
    where: { instanceID, status: constants.WORKFLOW_STATUS.PENDING },
    orderBy: { createdAt: 'asc' },
  });
};

// ─── Completion ───────────────────────────────────────────────────────────────

/**
 * Mark an instance as COMPLETED / FAILED / CANCELLED.
 * Does not write any log row — status changes are instance-level only.
 *
 * @param {string} instanceID
 * @param {'COMPLETED' | 'FAILED' | 'CANCELLED'} status
 */
stateManager.completeInstance = async (instanceID, status, { contextData, workflowOutput, errorMessage } = {}) => {
  Logger.log('info', {
    message: 'stateManager:completeInstance',
    params: { instanceID, status },
  });

  if (!['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) throw new Error(`Invalid terminal status: ${status}`);
  return prisma.$transaction(async (tx) => {
    const result = await tx.tblWorkflowInstances.updateMany({
      where: { instanceID, status: { in: ['PENDING', 'RUNNING', 'SUSPENDED'] } },
      data: {
        status, completedAt: new Date(), updatedAt: new Date(),
        ...(contextData != null ? { finalContext: contextData } : {}),
        ...(workflowOutput != null ? { workflowOutput } : {}),
      },
    });
    if (result.count) {
      if (errorMessage) await tx.tblWorkflowInstanceLogs.create({
        data: {
          instanceID, eventType: constants.WORKFLOW_LOG_EVENT_TYPES.NODE_FAILED,
          errorMessage, payload: {}, eventKey: 'terminal-error',
        },
      });
      await tx.tblWorkflowDataCollectionRequests.updateMany({
        where: { instanceID, status: { in: ['PENDING', 'SUBMITTED'] } },
        data: { status: 'CANCELLED', updatedAt: new Date() },
      });
    }
    return result.count > 0;
  });
};

// ─── Recovery ────────────────────────────────────────────────────────────────

/**
 * Find RUNNING instances with no activity for longer than staleAfterMs.
 *
 * @param {{ staleAfterMs?: number, tenantID?: string }} [options]
 * @returns {Promise<object[]>}
 */
stateManager.getStaleRunningInstances = async ({ staleAfterMs = 5 * 60 * 1000, tenantID } = {}) => {
  const staleThreshold = new Date(Date.now() - staleAfterMs);

  return prisma.tblWorkflowInstances.findMany({
    where: {
      status: constants.WORKFLOW_STATUS.RUNNING,
      updatedAt: { lt: staleThreshold },
      ...(tenantID ? { tenantID } : {}),
    },
    orderBy: { updatedAt: 'asc' },
  });
};

/**
 * Reconcile candidates with Temporal. Age is only a selection criterion,
 * never proof that a durable workflow has failed.
 *
 * @param {string[]} instanceIDs
 */
stateManager.markInstancesAsRecovered = async (instanceIDs) => {
  if (instanceIDs.length === 0) return;

  Logger.log('warning', {
    message: 'stateManager:markInstancesAsRecovered',
    params: { count: instanceIDs.length, instanceIDs },
  });

  const { reconcileWorkflowInstance } = require('../temporal/service');
  for (const instanceID of instanceIDs) {
    await reconcileWorkflowInstance({ instanceID });
  }
};

// ─── Test helpers ─────────────────────────────────────────────────────────────

/**
 * Delete a test instance and all its log rows in a single transaction.
 *
 * @param {string} instanceID
 */
stateManager.deleteTestInstance = async (instanceID) => {
  const instance = await prisma.tblWorkflowInstances.findUnique({ where: { instanceID } });

  if (!instance) {
    throw new Error(`stateManager.deleteTestInstance: instance ${instanceID} not found`);
  }
  if (!instance.isTest) {
    throw new Error(`stateManager.deleteTestInstance: instance ${instanceID} is not a test instance`);
  }

  await prisma.$transaction([
    prisma.tblWorkflowInstanceLogs.deleteMany({ where: { instanceID } }),
    prisma.tblWorkflowInstances.delete({ where: { instanceID } }),
  ]);

  Logger.log('success', { message: 'stateManager:deleteTestInstance', params: { instanceID } });
};

module.exports = { stateManager };
