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
}) => {
  Logger.log('info', {
    message: 'stateManager:logEvent',
    params: { instanceID, nodeID, eventType, nodeStatus, outputVariable, nodeAttempt },
  });

  return prisma.tblWorkflowInstanceLogs.create({
    data: {
      instanceID,
      nodeID: nodeID != null ? String(nodeID) : null,
      eventType,
      nodeStatus: nodeStatus || null,
      outputVariable: outputVariable || null,
      payload,
      errorMessage: errorMessage || null,
      nodeAttempt: nodeAttempt ?? null,
    },
  });
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
 * @param {{ workflowID: string, tenantID: string, inputValues?: object, isTest?: boolean }}
 * @returns {Promise<{ instance: object, initialContext: object }>}
 */
stateManager.createInstance = async ({ workflowID, tenantID, inputValues = {}, isTest = false }) => {
  Logger.log('info', {
    message: 'stateManager:createInstance',
    params: { workflowID, tenantID, isTest },
  });

  const instance = await prisma.tblWorkflowInstances.create({
    data: {
      workflowID: isTest ? null : workflowID,
      tenantID,
      status: constants.WORKFLOW_STATUS.RUNNING,
      startedAt: new Date(),
      isTest,
    },
  });

  const inputPayload = { input: inputValues };

  // Use logEvent instead of raw Prisma so all writes go through one path
  await stateManager.logEvent({
    instanceID: instance.instanceID,
    nodeID: null,
    eventType: constants.WORKFLOW_LOG_EVENT_TYPES.INPUT_SET,
    outputVariable: 'input',
    payload: inputPayload,
  });

  return { instance, initialContext: inputPayload };
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
 * Fetch an instance with its full log history ordered by logID.
 *
 * @param {string} instanceID
 * @returns {Promise<object | null>}
 */
stateManager.getInstanceWithLogs = async (instanceID) => {
  return prisma.tblWorkflowInstances.findUnique({
    where: { instanceID },
    include: {
      tblWorkflowInstanceLogs: { orderBy: { logID: 'asc' } },
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
 * Same-key conflict: the row with the higher logID wins (later INSERT).
 * Identical semantics to the old jsonb || last-writer model, but the merge
 * now happens on already-committed, race-free data.
 *
 * @param {string} instanceID
 * @returns {Promise<object>} Assembled context object
 */
stateManager.assembleContext = async (instanceID) => {
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
    orderBy: { logID: 'asc' },
    select: { payload: true },
  });

  return rows.reduce((acc, row) => ({ ...acc, ...row.payload }), {});
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
}) => {
  Logger.log('info', {
    message: 'stateManager:createDataCollectionRequest',
    params: { instanceID, nodeID, collectionType },
  });

  return prisma.tblWorkflowDataCollectionRequests.create({
    data: {
      instanceID,
      nodeID: String(nodeID),
      nodeAttempt: nodeAttempt ?? null,
      status: constants.WORKFLOW_STATUS.PENDING,
      collectionType: collectionType || 'form',
      collectionConfig: collectionConfig ?? {},
      expiresAt: expiresAt ?? null,
    },
  });
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
stateManager.completeInstance = async (instanceID, status) => {
  Logger.log('info', {
    message: 'stateManager:completeInstance',
    params: { instanceID, status },
  });

  await prisma.tblWorkflowInstances.update({
    where: { instanceID },
    data: { status, completedAt: new Date(), updatedAt: new Date() },
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
      isTest: false,
      ...(tenantID ? { tenantID } : {}),
    },
    orderBy: { updatedAt: 'asc' },
  });
};

/**
 * Mark stale instances as FAILED and write a SYSTEM_SET log row for each,
 * recording the recovery event in the unified log.
 *
 * @param {string[]} instanceIDs
 */
stateManager.markInstancesAsRecovered = async (instanceIDs) => {
  if (instanceIDs.length === 0) return;

  Logger.log('warning', {
    message: 'stateManager:markInstancesAsRecovered',
    params: { count: instanceIDs.length, instanceIDs },
  });

  await prisma.tblWorkflowInstances.updateMany({
    where: { instanceID: { in: instanceIDs }, status: constants.WORKFLOW_STATUS.RUNNING },
    data: { status: constants.WORKFLOW_STATUS.FAILED, completedAt: new Date(), updatedAt: new Date() },
  });

  await stateManager.logEventBulk(
    instanceIDs.map((instanceID) => ({
      instanceID,
      nodeID: null,
      eventType: constants.WORKFLOW_LOG_EVENT_TYPES.SYSTEM_SET,
      outputVariable: '__recoveryError',
      payload: { __recoveryError: 'Instance marked FAILED by startup recovery sweep' },
    }))
  );
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
