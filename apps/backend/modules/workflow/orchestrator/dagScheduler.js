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
 * Calculate next nodes to execute based on completed node and output handle
 * @param {string} workflowID 
 * @param {string} completedNodeID - The node that just completed
 * @param {string} outputHandle - The output handle used (e.g., 'success', 'error', 'true', 'false')
 * @returns {Promise<Array>} Array of next nodes to execute
 */
dagScheduler.calculateNextNodes = async (workflowID, completedNodeID, outputHandle = 'output') => {
  Logger.log('info', {
    message: 'dagScheduler:calculateNextNodes',
    params: { workflowID, completedNodeID, outputHandle },
  });
  
  // Get all edges from the completed node
  const edges = await prisma.tblWorkflowEdge.findMany({
    where: {
      workflowID,
      upstreamNodeID: completedNodeID,
    },
  });
  
  // Filter edges by sourceHandle if specified in edge data
  // For now, take all downstream nodes (can enhance with handle matching later)
  const downstreamNodeIDs = edges.map(e => e.downstreamNodeID);
  
  if (downstreamNodeIDs.length === 0) {
    Logger.log('info', { message: 'dagScheduler:noDownstreamNodes', params: { completedNodeID } });
    return [];
  }
  
  // Get node details
  const nextNodes = await prisma.tblWorkflowNodes.findMany({
    where: {
      nodeID: { in: downstreamNodeIDs },
    },
  });
  
  Logger.log('info', {
    message: 'dagScheduler:nextNodes',
    params: { count: nextNodes.length, nodeIDs: nextNodes.map(n => n.nodeID) },
  });
  
  return nextNodes;
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
