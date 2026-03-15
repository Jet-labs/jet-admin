/**
 * DAG Scheduler
 * Calculates next nodes based on workflow graph and completed node handle
 */
const { prisma } = require('../../../config/prisma.config');
const Logger = require('../../../utils/logger');

const dagScheduler = {};

/**
 * Get the start node of a workflow
 * @param {string} workflowID 
 * @returns {Promise<Object>} Start node
 */
dagScheduler.getStartNode = async (workflowID) => {
  const nodes = await prisma.tblWorkflowNodes.findMany({
    where: { workflowID },
  });
  
  // Find node with type 'start'
  const startNode = nodes.find(n => n.nodeType === 'start');
  if (!startNode) {
    throw new Error(`No start node found for workflow ${workflowID}`);
  }
  
  return startNode;
};

/**
 * Get all nodes for a workflow
 * @param {string} workflowID 
 * @returns {Promise<Array>}
 */
dagScheduler.getWorkflowNodes = async (workflowID) => {
  return prisma.tblWorkflowNodes.findMany({
    where: { workflowID },
  });
};

/**
 * Get all edges for a workflow
 * @param {string} workflowID 
 * @returns {Promise<Array>}
 */
dagScheduler.getWorkflowEdges = async (workflowID) => {
  return prisma.tblWorkflowEdge.findMany({
    where: { workflowID },
  });
};

/**
 * Get all incoming edges to a specific node
 * @param {string} workflowID 
 * @param {string} nodeID - The downstream node to check
 * @returns {Promise<Array>} Array of incoming edges
 */
dagScheduler.getIncomingEdges = async (workflowID, nodeID) => {
  return prisma.tblWorkflowEdge.findMany({
    where: {
      workflowID,
      downstreamNodeID: nodeID,
    },
  });
};

/**
 * Check if a node is ready to execute based on its upstream dependencies.
 * Queries tblNodeExecutionLogs (append-only) to determine which upstream
 * parents have completed — this is race-condition-free because logs are
 * INSERT-committed before any context update.
 *
 * Supports two join modes:
 *   - 'all' (default): waits for ALL upstream parents to complete
 *   - 'any': fires as soon as ANY upstream parent completes
 * 
 * @param {Object} params
 * @param {Array} params.incomingEdges - All edges targeting this node
 * @param {string} params.instanceID - Workflow instance ID
 * @param {string} params.joinMode - 'all' or 'any' (default: 'all')
 * @param {boolean} params.isTestRun - Whether this is a test run
 * @param {Object} params.contextData - Fallback context for test runs
 * @returns {Promise<boolean>} Whether the node is ready to execute
 */
dagScheduler.isNodeReadyToExecute = async ({ incomingEdges, instanceID, joinMode = 'all', isTestRun = false, contextData = {} }) => {
  // If no incoming edges (e.g., start node) or single parent, always ready
  if (!incomingEdges || incomingEdges.length <= 1) {
    return true;
  }

  const upstreamNodeIDs = incomingEdges.map(e => e.upstreamNodeID);

  // For test runs, fall back to contextData check (logs use nodeUUID)
  if (isTestRun) {
    const isParentComplete = (nodeID) => contextData[`__node_${nodeID}`] != null;
    return joinMode === 'any'
      ? upstreamNodeIDs.some(isParentComplete)
      : upstreamNodeIDs.every(isParentComplete);
  }

  // For real runs: query committed execution logs (append-only, no race)
  const completedLogs = await prisma.tblNodeExecutionLogs.findMany({
    where: {
      instanceID,
      eventType: 'TASK_COMPLETED',
      nodeID: { in: upstreamNodeIDs },
    },
    select: { nodeID: true },
  });

  const completedNodeIDs = new Set(completedLogs.map(log => log.nodeID));

  Logger.log('info', {
    message: 'dagScheduler:barrierCheck',
    params: {
      instanceID,
      joinMode,
      upstreamNodes: upstreamNodeIDs,
      completedUpstream: [...completedNodeIDs],
    },
  });

  if (joinMode === 'any') {
    return upstreamNodeIDs.some(id => completedNodeIDs.has(id));
  }

  // Default: 'all' — wait for every upstream parent
  return upstreamNodeIDs.every(id => completedNodeIDs.has(id));
};

/**
 * Calculate next nodes to execute based on completed node and output handle.
 * Applies join/barrier logic: downstream nodes with multiple parents are only
 * returned when all (or any, per joinMode config) upstream parents have completed.
 * 
 * @param {string} workflowID 
 * @param {string} completedNodeID - The node that just completed
 * @param {string} outputHandle - The output handle used
 * @param {string} instanceID - Workflow instance ID (for barrier check via execution logs)
 * @returns {Promise<Array>} Array of next nodes to execute
 */
dagScheduler.calculateNextNodes = async (workflowID, completedNodeID, outputHandle = 'output', instanceID = null) => {
  Logger.log('info', {
    message: 'dagScheduler:calculateNextNodes',
    params: { workflowID, completedNodeID, outputHandle, instanceID },
  });
  
  // Get all edges from the completed node
  const edges = await prisma.tblWorkflowEdge.findMany({
    where: {
      workflowID,
      upstreamNodeID: completedNodeID,
    },
  });
  
  // Filter edges by sourceHandle matching the outputHandle from the completed node
  const filteredEdges = edges.filter(e => {
    const edgeHandle = e.sourceHandle || 'output';
    const resultHandle = outputHandle || 'output';
    return edgeHandle === resultHandle;
  });

  const downstreamNodeIDs = filteredEdges.map(e => e.downstreamNodeID);
  
  if (downstreamNodeIDs.length === 0) {
    Logger.log('info', { message: 'dagScheduler:noDownstreamNodes', params: { completedNodeID } });
    return [];
  }
  
  // Get node details
  const candidateNodes = await prisma.tblWorkflowNodes.findMany({
    where: {
      nodeID: { in: downstreamNodeIDs },
    },
  });

  // Apply join/barrier check: filter out nodes whose upstream deps aren't all met
  const readyNodes = [];
  for (const node of candidateNodes) {
    const incomingEdges = await dagScheduler.getIncomingEdges(workflowID, node.nodeID);
    const joinMode = node.nodeConfig?.joinMode || 'all';

    const ready = await dagScheduler.isNodeReadyToExecute({
      incomingEdges,
      instanceID,
      joinMode,
    });

    if (ready) {
      readyNodes.push(node);
    } else {
      Logger.log('info', {
        message: 'dagScheduler:nodeNotReady (waiting for upstream)',
        params: { nodeID: node.nodeID, joinMode },
      });
    }
  }
  
  Logger.log('info', {
    message: 'dagScheduler:nextNodes',
    params: { count: readyNodes.length, nodeIDs: readyNodes.map(n => n.nodeID) },
  });
  
  return readyNodes;
};

/**
 * Check if a workflow has reached an end state (no more nodes to execute)
 * @param {string} workflowID 
 * @param {string} completedNodeID 
 * @returns {Promise<boolean>}
 */
dagScheduler.isTerminalNode = async (workflowID, completedNodeID) => {
  const node = await prisma.tblWorkflowNodes.findUnique({
    where: { nodeID: completedNodeID },
  });
  
  return node?.nodeType === 'end';
};

module.exports = { dagScheduler };
