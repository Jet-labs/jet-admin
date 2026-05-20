/**
 * DAG Scheduler
 * Graph traversal engine — given a completed node and its output handle,
 * determines which downstream nodes are ready to execute next.
 *
 * Unified log model change
 * ─────────────────────────
 * The barrier check previously queried tblNodeExecutionLogs for rows with
 * eventType = 'TASK_COMPLETED'. That table no longer exists.
 *
 * It now calls stateManager.getCompletedNodeIDs(instanceID, upstreamNodeIDs)
 * which queries tblWorkflowInstanceLogs WHERE eventType = 'NODE_COMPLETED'.
 * Semantics are identical — the set of completed upstream node IDs is the
 * same data, just stored in one table instead of two.
 *
 * Everything else (outgoing edge lookup, candidate node fetch, batched
 * incoming edge query, barrier logic) is unchanged.
 */

const { prisma } = require("../../../config/prisma.config");
const { stateManager } = require('./stateManager');
const Logger = require("../../../utils/logger");

const dagScheduler = {};

function normalizeHandle(handle) {
  if (handle === 'done') return 'completed';
  return handle || 'output';
}

// ─── Simple lookups ───────────────────────────────────────────────────────────

dagScheduler.getStartNode = async (workflowID) => {
  const startNode = await prisma.tblWorkflowNodes.findFirst({
    where: { workflowID, nodeType: 'start' },
  });

  if (!startNode) {
    throw new Error(`dagScheduler.getStartNode: no start node found for workflow ${workflowID}`);
  }

  return startNode;
};

dagScheduler.getWorkflowNodes = async (workflowID) => {
  return prisma.tblWorkflowNodes.findMany({ where: { workflowID } });
};

dagScheduler.getWorkflowEdges = async (workflowID) => {
  return prisma.tblWorkflowEdge.findMany({ where: { workflowID } });
};

// ─── Barrier check ────────────────────────────────────────────────────────────

/**
 * Determine whether a node is ready to execute by checking its upstream deps.
 *
 * For real runs: completedNodeIDs is a Set built from tblWorkflowInstanceLogs
 * NODE_COMPLETED rows — passed in from calculateNextNodes to avoid per-node
 * DB queries (one batched fetch covers all candidates).
 *
 * For test runs: falls back to contextData.__node_<id> key presence because
 * test runs store frontend UUID strings in nodeID, which don't match the DB
 * UUID primary keys used in the barrier query.
 *
 * @param {object} params
 * @param {object[]}    params.incomingEdges
 * @param {string}      params.instanceID
 * @param {'all'|'any'} params.joinMode
 * @param {boolean}     params.isTestRun
 * @param {object}      params.contextData      — test-run fallback only
 * @param {Set<string>} params.completedNodeIDs — real-run barrier set
 * @returns {boolean}
 */
dagScheduler.isNodeReadyToExecute = ({
  incomingEdges,
  instanceID,
  joinMode = 'all',
  isTestRun = false,
  contextData = {},
  completedNodeIDs = new Set(),
}) => {
  // Single-parent (or no parent) nodes are always ready
  if (!incomingEdges || incomingEdges.length <= 1) return true;

  if (!['all', 'any'].includes(joinMode)) {
    Logger.log('warning', {
      message: 'dagScheduler:unknownJoinMode — defaulting to "all"',
      params: { instanceID, joinMode },
    });
    joinMode = 'all';
  }

  const upstreamNodeIDs = incomingEdges.map((e) => e.upstreamNodeID);

  if (isTestRun) {
    const done = (id) => contextData[`__node_${id}`] != null;
    return joinMode === 'any'
      ? upstreamNodeIDs.some(done)
      : upstreamNodeIDs.every(done);
  }

  Logger.log('info', {
    message: 'dagScheduler:barrierCheck',
    params: {
      instanceID,
      joinMode,
      upstreamNodes: upstreamNodeIDs,
      completedUpstream: [...completedNodeIDs].filter((id) => upstreamNodeIDs.includes(id)),
    },
  });

  return joinMode === 'any'
    ? upstreamNodeIDs.some((id) => completedNodeIDs.has(id))
    : upstreamNodeIDs.every((id) => completedNodeIDs.has(id));
};

// ─── Next-node resolution ─────────────────────────────────────────────────────

/**
 * Calculate nodes ready to execute after completedNodeID finishes on
 * handle outputHandle.
 *
 * DB query plan (4 queries regardless of fan-out width):
 *   1. Outgoing edges from completedNodeID
 *   2. Candidate node records
 *   3. ALL incoming edges for ALL candidates (batched)
 *   4. stateManager.getCompletedNodeIDs — queries tblWorkflowInstanceLogs
 *      NODE_COMPLETED rows for all upstream node IDs (replaces the old
 *      tblNodeExecutionLogs TASK_COMPLETED query)
 *
 * @param {string} workflowID
 * @param {string} completedNodeID
 * @param {string} [outputHandle='output']
 * @param {string} [instanceID]
 * @returns {Promise<object[]>} Nodes tagged with _isJoinNode boolean
 */
dagScheduler.calculateNextNodes = async (
  workflowID,
  completedNodeID,
  outputHandle = 'output',
  instanceID = null
) => {
  Logger.log('info', {
    message: 'dagScheduler:calculateNextNodes',
    params: { workflowID, completedNodeID, outputHandle, instanceID },
  });

  // ── 1. Outgoing edges filtered by sourceHandle ───────────────────────────
  const outgoingEdges = await prisma.tblWorkflowEdge.findMany({
    where: { workflowID, upstreamNodeID: completedNodeID },
  });

  const normalizedOutputHandle = normalizeHandle(outputHandle);
  const matchingEdges = outgoingEdges.filter(
    (e) => normalizeHandle(e.sourceHandle) === normalizedOutputHandle
  );

  if (matchingEdges.length === 0) {
    Logger.log('info', { message: 'dagScheduler:noDownstreamEdges', params: { completedNodeID } });
    return [];
  }

  const downstreamNodeIDs = matchingEdges.map((e) => e.downstreamNodeID);

  // ── 2. Candidate node records ────────────────────────────────────────────
  const candidateNodes = await prisma.tblWorkflowNodes.findMany({
    where: { nodeID: { in: downstreamNodeIDs } },
  });

  if (candidateNodes.length === 0) return [];

  // ── 3. ALL incoming edges for ALL candidates — single batched query ───────
  const allIncomingEdges = await prisma.tblWorkflowEdge.findMany({
    where: { workflowID, downstreamNodeID: { in: downstreamNodeIDs } },
  });

  const incomingEdgesByNode = new Map();
  for (const edge of allIncomingEdges) {
    if (!incomingEdgesByNode.has(edge.downstreamNodeID)) {
      incomingEdgesByNode.set(edge.downstreamNodeID, []);
    }
    incomingEdgesByNode.get(edge.downstreamNodeID).push(edge);
  }

  // ── 4. Completed node IDs from unified log — single batched query ─────────
  // Collect every upstreamNodeID referenced by any incoming edge
  const allUpstreamNodeIDs = [...new Set(allIncomingEdges.map((e) => e.upstreamNodeID))];

  // stateManager.getCompletedNodeIDs queries tblWorkflowInstanceLogs
  // WHERE eventType = 'NODE_COMPLETED' AND nodeID IN (allUpstreamNodeIDs)
  const completedNodeIDs = instanceID && allUpstreamNodeIDs.length > 0
    ? await stateManager.getCompletedNodeIDs(instanceID, allUpstreamNodeIDs)
    : new Set();

  // ── 5. Barrier check for each candidate ──────────────────────────────────
  const readyNodes = [];

  for (const node of candidateNodes) {
    const incomingEdges = incomingEdgesByNode.get(node.nodeID) ?? [];
    const joinMode = node.nodeConfig?.joinMode ?? (node.nodeType === 'loop' ? 'any' : 'all');
    const isJoinNode = incomingEdges.length > 1;

    const ready = dagScheduler.isNodeReadyToExecute({
      incomingEdges,
      instanceID,
      joinMode,
      isTestRun: false,
      completedNodeIDs,
    });

    if (ready) {
      readyNodes.push({ ...node, _isJoinNode: isJoinNode });
    } else {
      Logger.log('info', {
        message: 'dagScheduler:nodeNotReady',
        params: { nodeID: node.nodeID, joinMode, waitingFor: 'upstream deps' },
      });
    }
  }

  Logger.log('info', {
    message: 'dagScheduler:nextNodes',
    params: { count: readyNodes.length, nodeIDs: readyNodes.map((n) => n.nodeID) },
  });

  return readyNodes;
};

module.exports = { dagScheduler };
