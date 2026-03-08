/**
 * Workflow Orchestrator
 * Main orchestration loop - Check-Decide-Act cycle
 */
const { v4: uuidv4 } = require('uuid');
const { registerResultsWorker, addNodeJob, QUEUE_NAMES } = require('../../../config/queue.config');
const { stateManager } = require('./stateManager');
const { dagScheduler } = require('./dagScheduler');
const Logger = require('../../../utils/logger');
const { socketIO } = require('../../../config/socket.io');
const constants = require('../../../constants');
const { widgetWorkflowBridge } = require('../../widget/widgetWorkflowBridge');

/**
 * Handle task result from worker
 * This is the core Check-Decide-Act cycle
 */
async function handleTaskResult(result) {
  const { instanceID, nodeID, nodeType, outputVariable, status, output, nextHandle, queueDelay, error } = result;

  Logger.log('info', {
    message: 'orchestrator:handleTaskResult',
    params: { instanceID, nodeID, nodeType, outputVariable, status, nextHandle },
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

    // 3. Update context with node output
    let contextUpdate = {};
    if (outputVariable && output) {
      if (output[outputVariable] !== undefined) {
        contextUpdate[outputVariable] = output[outputVariable];
      } else {
        contextUpdate[outputVariable] = output;
      }
    }
    contextUpdate[`__node_${nodeID}`] = { output, status, outputVariable };

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

    // *** Emit to subscribed widgets ***
    widgetWorkflowBridge.emitContextUpdate(instanceID, {
      type: 'NODE_COMPLETE',
      nodeID,
      outputVariable,
      value: output?.[outputVariable] ?? output,
      status,
      contextSnapshot: updatedInstance.contextData,
    });

    // 4. Check if this is a terminal node
    let nodeType;
    if (isTestRun && workflowDefinition) {
      nodeType = workflowDefinition.nodes[nodeID]?.nodeType;
    } else {
      const nodes = await dagScheduler.getWorkflowNodes(instance.workflowID);
      nodeType = nodes.find(n => n.nodeID === nodeID)?.nodeType;
    }

    if (nodeType === 'end') {
      const finalStatus = output?.status || 'success';
      Logger.log('info', {
        message: 'orchestrator:workflowComplete:output',
        params: { instanceID },
      });
      await stateManager.completeInstance(
        instanceID,
        finalStatus === 'success' ? 'COMPLETED' : 'FAILED',
        { ...updatedInstance.contextData, output: output?.workflowOutput }
      );

      socketIO.to(instanceID).emit(constants.SOCKET_EMIT_EVENTS.WORKFLOW_STATUS_UPDATE, {
        instanceID,
        status: finalStatus === 'success' ? 'COMPLETED' : 'FAILED',
        contextData: { ...updatedInstance.contextData, output: output?.workflowOutput },
      });

      widgetWorkflowBridge.emitWorkflowStatus(
        instanceID,
        finalStatus === 'success' ? 'COMPLETED' : 'FAILED',
        { ...updatedInstance.contextData, output: output?.workflowOutput }
      );

      Logger.log('success', { message: 'orchestrator:workflowCompleted', params: { instanceID } });
      return;
    }

    // 5. Calculate and dispatch next nodes
    let nextNodes;
    if (isTestRun && workflowDefinition) {
      const edges = workflowDefinition.edges.filter(e => {
        if (e.upstreamNodeID !== nodeID) return false;
        const edgeHandle = e.sourceHandle || 'output';
        const resultHandle = nextHandle || 'output';
        return edgeHandle === resultHandle;
      });
      nextNodes = edges.map(e => workflowDefinition.nodes[e.downstreamNodeID]).filter(Boolean);
    } else {
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

    await stateManager.completeInstance(instanceID, 'FAILED');
  }
}

/**
 * Start the results consumer (in-memory queue)
 */
async function startResultsConsumer() {
  Logger.log('info', { message: 'orchestrator:starting results consumer' });

  registerResultsWorker(async (result) => {
    try {
      await handleTaskResult(result);
      Logger.log('info', { message: 'orchestrator:resultProcessed', params: { nodeID: result.nodeID } });
    } catch (error) {
      Logger.log('error', { message: 'orchestrator:resultFailed', params: { error: error.message } });
    }
  });

  Logger.log('info', { message: 'orchestrator:resultsConsumerStarted' });
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

  const instance = await stateManager.createInstance({
    workflowID,
    tenantID,
    inputParams,
  });

  const startNode = await dagScheduler.getStartNode(workflowID);

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
 * @param {Object} params - { nodes, edges, tenantID, inputParams }
 * @returns {Promise<Object>} { instanceID }
 */
async function startTestWorkflow({ nodes, edges, tenantID, inputParams = {} }) {
  Logger.log('info', {
    message: 'orchestrator:startTestWorkflow',
    params: { tenantID, nodeCount: nodes.length, edgeCount: edges.length },
  });

  const testWorkflowID = uuidv4();

  const instance = await stateManager.createInstance({
    workflowID: testWorkflowID,
    tenantID,
    inputParams,
    isTest: true,
  });

  const startNode = nodes.find(n => n.type === 'start');
  if (!startNode) {
    throw new Error('No start node found in workflow');
  }

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

  await stateManager.updateContext(
    instance.instanceID,
    {
      __workflowDefinition: workflowDefinition,
      __isTestRun: true,
    },
    instance.version
  );

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
