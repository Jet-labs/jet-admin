/**
 * State Manager
 * Handles database operations for workflow instances with optimistic locking
 */
const { prisma } = require('../../../config/prisma.config');
const Logger = require('../../../utils/logger');

const stateManager = {};

/**
 * Create a new workflow instance
 * @param {Object} params - { workflowID, tenantID, inputParams, isTest }
 * @returns {Promise<Object>} Created instance
 */
stateManager.createInstance = async ({ workflowID, tenantID, inputParams = {}, isTest = false }) => {
  Logger.log('info', {
    message: 'stateManager:createInstance',
    params: { workflowID, tenantID, isTest },
  });
  
  const instance = await prisma.tblWorkflowInstances.create({
    data: {
      workflowID: isTest ? null : workflowID,
      tenantID,
      status: 'RUNNING',
      contextData: { input: inputParams },
      startedAt: new Date(),
      isTest,
    },
  });
  
  return instance;
};

/**
 * Get instance by ID
 * @param {string} instanceID 
 * @returns {Promise<Object>}
 */
stateManager.getInstance = async (instanceID) => {
  return prisma.tblWorkflowInstances.findUnique({
    where: { instanceID },
  });
};

/**
 * Update instance context with ATOMIC JSON merge.
 * Uses PostgreSQL's `jsonb || jsonb` operator to avoid read-modify-write races
 * when multiple nodes complete concurrently.
 * @param {string} instanceID 
 * @param {Object} contextUpdate - Data to merge into context
 * @param {number} expectedVersion - (unused, kept for API compat)
 * @returns {Promise<Object>} Updated instance
 */
stateManager.updateContext = async (instanceID, contextUpdate, expectedVersion = null) => {
  // Atomic merge: contextData = contextData || $update
  // This prevents one node's write from overwriting another's.
  const [updated] = await prisma.$queryRawUnsafe(
    `UPDATE "tblWorkflowInstances"
     SET "contextData" = "contextData" || $1::jsonb,
         "updatedAt" = NOW()
     WHERE "instanceID" = $2::uuid
     RETURNING *`,
    JSON.stringify(contextUpdate),
    instanceID
  );

  if (!updated) {
    throw new Error(`Instance ${instanceID} not found`);
  }

  // Parse contextData back if it comes as string from raw query
  if (typeof updated.contextData === 'string') {
    updated.contextData = JSON.parse(updated.contextData);
  }

  return updated;
};

/**
 * Mark instance as completed
 * @param {string} instanceID 
 * @param {string} status - 'COMPLETED', 'FAILED', 'CANCELLED'
 * @param {Object} output - Final output data
 */
stateManager.completeInstance = async (instanceID, status, output = null) => {
  Logger.log('info', {
    message: 'stateManager:completeInstance',
    params: { instanceID, status },
  });
  
  await prisma.tblWorkflowInstances.update({
    where: { instanceID },
    data: {
      status,
      completedAt: new Date(),
      updatedAt: new Date(),
      // Directly update context data if output is provided
      ...(output ? { contextData: output } : {}),
    },
  });
};

/**
 * Log node execution event
 * @param {Object} params - { instanceID, nodeID, eventType, inputData, outputData, errorMessage, isTest }
 */
stateManager.logNodeExecution = async ({ instanceID, nodeID, eventType, inputData, outputData, errorMessage, isTest = false }) => {
  await prisma.tblNodeExecutionLogs.create({
    data: {
      instanceID,
      nodeID: isTest ? null : nodeID,
      nodeUUID: isTest ? nodeID : null,
      eventType,
      inputData,
      outputData,
      errorMessage,
    },
  });
};

/**
 * Get instance with execution logs
 * @param {string} instanceID 
 * @returns {Promise<Object>}
 */
stateManager.getInstanceWithLogs = async (instanceID) => {
  return prisma.tblWorkflowInstances.findUnique({
    where: { instanceID },
    include: {
      tblNodeExecutionLogs: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
};

/**
 * Delete a test workflow instance and its logs
 * Only works for instances marked as isTest = true
 * @param {string} instanceID 
 * @returns {Promise<void>}
 */
stateManager.deleteTestInstance = async (instanceID) => {
  Logger.log('info', {
    message: 'stateManager:deleteTestInstance',
    params: { instanceID },
  });

  // First verify this is a test instance
  const instance = await prisma.tblWorkflowInstances.findUnique({
    where: { instanceID },
  });

  if (!instance) {
    throw new Error(`Instance ${instanceID} not found`);
  }

  if (!instance.isTest) {
    throw new Error(`Instance ${instanceID} is not a test instance`);
  }

  // Delete in transaction: logs first, then instance
  await prisma.$transaction([
    prisma.tblNodeExecutionLogs.deleteMany({
      where: { instanceID },
    }),
    prisma.tblWorkflowInstances.delete({
      where: { instanceID },
    }),
  ]);

  Logger.log('success', {
    message: 'stateManager:deleteTestInstance:deleted',
    params: { instanceID },
  });
};

module.exports = { stateManager };
