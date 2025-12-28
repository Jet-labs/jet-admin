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
 * Update instance context with optimistic locking and retry
 * @param {string} instanceID 
 * @param {Object} contextUpdate - Data to merge into context
 * @param {number} expectedVersion - Expected version for optimistic lock (optional, will use current if not provided)
 * @returns {Promise<Object>} Updated instance (or throws on max retries exceeded)
 */
stateManager.updateContext = async (instanceID, contextUpdate, expectedVersion = null) => {
  const MAX_RETRIES = 5;
  const BASE_DELAY_MS = 50;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const instance = await prisma.tblWorkflowInstances.findUnique({
      where: { instanceID },
    });
    
    if (!instance) {
      throw new Error(`Instance ${instanceID} not found`);
    }
    
    // Use current version if not provided or on retry
    const currentVersion = instance.version;
    
    // Merge context
    const updatedContext = {
      ...instance.contextData,
      ...contextUpdate,
    };
    
    // Optimistic lock update
    const result = await prisma.tblWorkflowInstances.updateMany({
      where: {
        instanceID,
        version: currentVersion,
      },
      data: {
        contextData: updatedContext,
        version: currentVersion + 1,
        updatedAt: new Date(),
      },
    });
    
    if (result.count > 0) {
      // Success
      return {
        ...instance,
        contextData: updatedContext,
        version: currentVersion + 1,
      };
    }
    
    // Version conflict - retry with exponential backoff
    if (attempt < MAX_RETRIES - 1) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 50;
      Logger.log('warning', {
        message: 'stateManager:updateContext:retrying',
        params: { instanceID, attempt: attempt + 1, delay },
      });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Max retries exceeded
  throw new Error(`Failed to update instance ${instanceID} after ${MAX_RETRIES} retries (optimistic lock)`);
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
      contextData: output ? { ...output } : undefined,
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

module.exports = { stateManager };
