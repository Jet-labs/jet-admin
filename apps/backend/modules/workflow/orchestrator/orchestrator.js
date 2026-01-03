/**
 * Workflow Orchestrator
 * Main orchestration loop - Check-Decide-Act cycle
 */
const { v4: uuidv4 } = require('uuid');
const { getChannel, addNodeJob, QUEUE_NAMES } = require('../queue/queueConfig');
const { stateManager } = require('./stateManager');
const { dagScheduler } = require('./dagScheduler');
const Logger = require('../../../utils/logger');
const { socketIO } = require('../../../config/socket.io');
const constants = require('../../../constants');

/**
 * Handle task result from worker
 * This is the core Check-Decide-Act cycle
 */
async function handleTaskResult(result) {
  const { instanceID, nodeID, status, output, nextHandle, queueDelay, error } = result;
  
  Logger.log('info', {
    message: 'orchestrator:handleTaskResult',
    params: { instanceID, nodeID, status, nextHandle },
  });
  
  try {
    // 1. Get current instance state
    const instance = await stateManager.getInstance(instanceID);
    if (!instance) {
      Logger.log('error', { message: 'orchestrator:instanceNotFound', params: { instanceID } });
      return;
    }
    
    // Check if this is a test run (workflow definition stored in context)
    const isTestRun = instance.contextData.__isTestRun || instance.isTest;
    const workflowDefinition = instance.contextData.__workflowDefinition;
    
    // 2. Log execution event
    await stateManager.logNodeExecution({
      instanceID,
      nodeID,
      eventType: status === 'success' ? 'TASK_COMPLETED' : 'TASK_FAILED',
      outputData: output,
      errorMessage: error,
      isTest: isTestRun,
    });
    
    // 3. Update context with node output (keyed by node UUID)
    const contextUpdate = { [nodeID]: output };
    const updatedInstance = await stateManager.updateContext(
      instanceID,
      contextUpdate,
      instance.version
    );
    
    // *** Emit node update via WebSocket ***
    socketIO.to(instanceID).emit(constants.SOCKET_EMIT_EVENTS.WORKFLOW_NODE_UPDATE, {
      instanceID,
      nodeID,
      status,
      output,
      error,
    });
    
    // 4. Check if this is a terminal node
    let nodeType;
    if (isTestRun && workflowDefinition) {
      // Test mode: use in-memory definition
      nodeType = workflowDefinition.nodes[nodeID]?.nodeType;
    } else {
      // Normal mode: fetch from DB
      const nodes = await dagScheduler.getWorkflowNodes(instance.workflowID);
      nodeType = nodes.find(n => n.nodeID === nodeID)?.nodeType;
    }
    
    if (nodeType === 'end') {
      // Workflow complete
      const finalStatus = output?.status || 'success';
      Logger.log('info', {
        message: 'orchestrator:workflowComplete:output',
        params: { instanceID, output },
      });
      await stateManager.completeInstance(
        instanceID,
        finalStatus === 'success' ? 'COMPLETED' : 'FAILED',
        { ...updatedInstance.contextData, output: output?.workflowOutput }
      );
      
      // *** Emit workflow completion via WebSocket ***
      socketIO.to(instanceID).emit(constants.SOCKET_EMIT_EVENTS.WORKFLOW_STATUS_UPDATE, {
        instanceID,
        status: finalStatus === 'success' ? 'COMPLETED' : 'FAILED',
        contextData: { ...updatedInstance.contextData, output: output?.workflowOutput },
      });
      
      Logger.log('success', { message: 'orchestrator:workflowCompleted', params: { instanceID } });
      return;
    }
    
    // 5. Calculate and dispatch next nodes
    let nextNodes;
    if (isTestRun && workflowDefinition) {
      // Test mode: calculate from in-memory edges
      const edges = workflowDefinition.edges.filter(e => e.upstreamNodeID === nodeID);
      nextNodes = edges.map(e => workflowDefinition.nodes[e.downstreamNodeID]).filter(Boolean);
    } else {
      // Normal mode: use DAG scheduler
      nextNodes = await dagScheduler.calculateNextNodes(
        instance.workflowID,
        nodeID,
        nextHandle
      );
    }
    
    // 6. Queue next nodes
    for (const nextNode of nextNodes) {
      await addNodeJob({
        instanceID,
        nodeID: nextNode.nodeID,
        nodeType: nextNode.nodeType,
        nodeConfig: nextNode.nodeConfig,
        context: updatedInstance.contextData,
        workflowID: instance.workflowID,
        isTestRun,
      }, {
        delay: queueDelay || 0,
      });
    }
    
    // If no next nodes and not an end node, might be a dead end
    if (nextNodes.length === 0) {
      Logger.log('warning', {
        message: 'orchestrator:noNextNodes',
        params: { instanceID, nodeID },
      });
    }
    
  } catch (error) {
    Logger.log('error', {
      message: 'orchestrator:handleTaskResult:error',
      params: { instanceID, nodeID, error: error.message },
    });
    
    // Mark instance as failed on unrecoverable error
    await stateManager.completeInstance(instanceID, 'FAILED');
  }
}

/**
 * Start the results consumer (consumes from RabbitMQ results queue)
 */
async function startResultsConsumer() {
  const channel = await getChannel();
  
  // Set prefetch to limit concurrent processing
  await channel.prefetch(10);
  
  Logger.log('info', { message: 'orchestrator:starting results consumer' });
  
  channel.consume(QUEUE_NAMES.RESULTS, async (msg) => {
    if (!msg) return;
    
    let result;
    try {
      result = JSON.parse(msg.content.toString());
    } catch (parseError) {
      Logger.log('error', { message: 'orchestrator:invalidResultMessage', params: { error: parseError.message } });
      channel.nack(msg, false, false);
      return;
    }
    
    try {
      await handleTaskResult(result);
      channel.ack(msg);
      
      Logger.log('info', { message: 'orchestrator:resultProcessed', params: { nodeID: result.nodeID } });
    } catch (error) {
      Logger.log('error', { message: 'orchestrator:resultFailed', params: { error: error.message } });
      // Don't requeue - the error has been logged
      channel.nack(msg, false, false);
    }
  }, {
    noAck: false,
  });
  
  Logger.log('info', { message: 'orchestrator:resultsConsumerStarted' });
  
  return { channel };
}

/**
 * Start a workflow execution
 * @param {Object} params - { workflowID, tenantID, inputParams }
 * @returns {Promise<Object>} { instanceID }
 */
async function startWorkflow({ workflowID, tenantID, inputParams = {} }) {
  Logger.log('info', {
    message: 'orchestrator:startWorkflow',
    params: { workflowID, tenantID },
  });
  
  // 1. Create instance
  const instance = await stateManager.createInstance({
    workflowID,
    tenantID,
    inputParams,
  });
  
  // 2. Get start node
  const startNode = await dagScheduler.getStartNode(workflowID);
  
  // 3. Queue start node
  await addNodeJob({
    instanceID: instance.instanceID,
    nodeID: startNode.nodeID,
    nodeType: startNode.nodeType,
    nodeConfig: startNode.nodeConfig,
    context: instance.contextData,
    workflowID,
  });
  
  Logger.log('success', {
    message: 'orchestrator:workflowStarted',
    params: { instanceID: instance.instanceID },
  });
  
  return { instanceID: instance.instanceID };
}

/**
 * Start a TEST workflow execution using in-memory nodes/edges
 * This allows running workflows before saving to database
 * @param {Object} params - { nodes, edges, tenantID, inputParams }
 * @returns {Promise<Object>} { instanceID }
 */
async function startTestWorkflow({ nodes, edges, tenantID, inputParams = {} }) {
  Logger.log('info', {
    message: 'orchestrator:startTestWorkflow',
    params: { tenantID, nodeCount: nodes.length, edgeCount: edges.length },
  });
  
  // Use a temporary workflowID for test runs (must be valid UUID)
  const testWorkflowID = uuidv4();
  
  // 1. Create instance (will be cleaned up or marked as test)
  const instance = await stateManager.createInstance({
    workflowID: testWorkflowID,
    tenantID,
    inputParams,
    isTest: true,
  });
  
  // 2. Find start node from in-memory nodes
  const startNode = nodes.find(n => n.type === 'start');
  if (!startNode) {
    throw new Error('No start node found in workflow');
  }
  
  // 3. Store the in-memory workflow definition in context for later lookups
  const workflowDefinition = {
    nodes: nodes.reduce((acc, node) => {
      acc[node.id] = {
        nodeID: node.id,
        nodeType: node.type,
        nodeConfig: node.data || {},
      };
      return acc;
    }, {}),
    edges: edges.map(edge => ({
      upstreamNodeID: edge.source,
      downstreamNodeID: edge.target,
      sourceHandle: edge.sourceHandle,
    })),
  };
  
  // Update context with workflow definition for test mode
  await stateManager.updateContext(
    instance.instanceID,
    { 
      __workflowDefinition: workflowDefinition,
      __isTestRun: true,
    },
    instance.version
  );
  
  // 4. Queue start node with in-memory config
  await addNodeJob({
    instanceID: instance.instanceID,
    nodeID: startNode.id,
    nodeType: startNode.type,
    nodeConfig: startNode.data || {},
    context: { 
      input: inputParams, 
      __workflowDefinition: workflowDefinition,
      __isTestRun: true,
    },
    workflowID: testWorkflowID,
    isTestRun: true,
  });
  
  Logger.log('success', {
    message: 'orchestrator:testWorkflowStarted',
    params: { instanceID: instance.instanceID },
  });
  
  return { instanceID: instance.instanceID, isTest: true };
}

module.exports = {
  handleTaskResult,
  startResultsConsumer,
  startWorkflow,
  startTestWorkflow,
};
