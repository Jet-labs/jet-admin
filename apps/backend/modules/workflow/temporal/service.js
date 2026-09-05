/**
 * Temporal Workflow Service — Temporal-only
 * Creates DB instance via stateManager then starts DSL workflow via Temporal.
 */

const { v4: uuidv4 } = require('uuid');
const Logger = require('../../../utils/logger');
const constants = require('../../../constants');
const { TASK_QUEUE, WORKFLOW_TYPE, SIGNALS } = require('./config');
const {
  resolveWorkflowConfig,
  applyWorkflowConfigToNodes,
  resolveWorkflowStartOptions,
} = require('./workflowConfig');

async function getTemporalClientSafe() {
  const { getTemporalClient } = require('./client');
  return getTemporalClient();
}

/**
 * Build React Flow graph payload for Temporal.
 * For persisted workflows: loads nodes/edges from tblWorkflowNodes/Edge
 * plus per-workflow execution policy from tblWorkflows.workflowOptions.
 */
async function loadPersistedGraph(workflowID) {
  const { prisma } = require('../../../config/prisma.config');
  const [workflow, dbNodes, dbEdges] = await Promise.all([
    prisma.tblWorkflows.findUnique({ where: { workflowID }, select: { workflowOptions: true } }),
    prisma.tblWorkflowNodes.findMany({ where: { workflowID } }),
    prisma.tblWorkflowEdge.findMany({ where: { workflowID } }),
  ]);

  const nodes = dbNodes.map((n) => ({
    id: n.nodeID,
    type: n.nodeType,
    data: n.nodeConfig || {},
  }));
  const edges = dbEdges.map((e) => ({
    id: e.edgeID,
    source: e.upstreamNodeID,
    target: e.downstreamNodeID,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
  }));
  const workflowOptions = (workflow && workflow.workflowOptions) || {};
  return { nodes, edges, workflowOptions };
}

/**
 * Start persisted workflow via Temporal.
 */
async function startWorkflowTemporal({ workflowID, tenantID, inputValues = {} }) {
  const { stateManager } = require('../workflowEngine/stateManager');
  const { getTemporalClient } = require('./client');

  Logger.log('info', { message: 'temporal:service:startWorkflow', params: { workflowID, tenantID } });

  const { instance, initialContext } = await stateManager.createInstance({
    workflowID,
    tenantID,
    inputValues,
  });

  const { nodes, edges, workflowOptions } = await loadPersistedGraph(workflowID);
  if (!nodes.find((n) => n.type === 'start')) {
    throw new Error(`No start node for workflow ${workflowID}`);
  }

  // Per-workflow policy: node.data > workflowOptions > platform defaults.
  // Materialize resolved timeouts/retries into the node payload so the
  // workflow and activities honor them without extra lookups.
  const workflowConfig = resolveWorkflowConfig(workflowOptions);
  const resolvedNodes = applyWorkflowConfigToNodes(nodes, workflowConfig);
  const startOptions = resolveWorkflowStartOptions(workflowConfig);

  const workflowId = instance.instanceID;

  let handle;
  try {
    const client = await getTemporalClient();
    handle = await client.workflow.start(WORKFLOW_TYPE, {
      taskQueue: TASK_QUEUE,
      workflowId,
      args: [
        {
          nodes: resolvedNodes,
          edges,
          initialContext,
          instanceID: instance.instanceID,
          tenantID,
          workflowID,
          isTestRun: false,
          workflowOptions,
          workflowConfig,
        },
      ],
      workflowRunTimeout: startOptions.workflowRunTimeout,
      workflowTaskTimeout: startOptions.workflowTaskTimeout,
      workflowIdReusePolicy: 3,
      retry: { maximumAttempts: 1 },
    });

    Logger.log('success', {
      message: 'temporal:service:workflowStarted',
      params: { instanceID: instance.instanceID, workflowId: handle.workflowId, runId: handle.firstExecutionRunId },
    });
    return { instanceID: instance.instanceID, temporalWorkflowId: handle.workflowId, runId: handle.firstExecutionRunId };
  } catch (err) {
    const isConnectionError = /Failed to connect|deadline|ECONNREFUSED|ENOTFOUND/i.test(err.message);
    Logger.log('error', { message: 'temporal:service:startFailed', params: { workflowID, error: err.message, isConnectionError } });
    await stateManager.completeInstance(instance.instanceID, 'FAILED').catch(() => {});
    await stateManager.logEvent({
      instanceID: instance.instanceID,
      nodeID: null,
      eventType: constants.WORKFLOW_LOG_EVENT_TYPES.SYSTEM_SET,
      payload: { __temporalStartError: err.message },
    }).catch(() => {});
    if (isConnectionError) {
      const help = 'Temporal not running at ' + require('./config').ADDRESS + '. Start it: docker compose -f docker-compose.temporal.yml up -d  (UI at http://localhost:8088)';
      const wrapped = new Error(help + ' :: ' + err.message);
      wrapped.code = 'TEMPORAL_NOT_RUNNING';
      throw wrapped;
    }
    throw err;
  }
}

async function startTestWorkflowTemporal({ nodes, edges, tenantID, inputValues = {}, workflowOptions = {}, sourceWorkflowID }) {
  const { stateManager } = require('../workflowEngine/stateManager');

  Logger.log('info', {
    message: 'temporal:service:startTestWorkflow',
    params: { tenantID, nodeCount: nodes.length, edgeCount: edges.length, sourceWorkflowID },
  });

  const startNode = nodes.find((n) => n.type === 'start');
  if (!startNode) throw new Error('No start node found in test workflow');

  const testWorkflowID = uuidv4();
  const { instance, initialContext } = await stateManager.createInstance({
    workflowID: testWorkflowID,
    tenantID,
    inputValues,
    isTest: true,
    // Attribute tests launched from a saved workflow editor so they appear
    // in that workflow's run history (unsaved-graph tests stay null).
    sourceWorkflowID,
  });

  // For test runs, store workflowDefinition sentinel for legacy getRunStatus compatibility (span)
  const workflowDefinition = {
    nodes: Object.fromEntries(nodes.map((n) => [n.id, { nodeID: n.id, nodeType: n.type, nodeConfig: n.data ?? {} }])),
    edges: edges.map((e) => ({
      upstreamNodeID: e.source,
      downstreamNodeID: e.target,
      sourceHandle: e.sourceHandle,
    })),
  };

  await stateManager.logEvent({
    instanceID: instance.instanceID,
    nodeID: null,
    eventType: constants.WORKFLOW_LOG_EVENT_TYPES.SYSTEM_SET,
    outputVariable: '__meta',
    payload: {
      __workflowDefinition: workflowDefinition,
      __isTestRun: true,
    },
  });

  const firstJobContext = {
    ...initialContext,
    __workflowDefinition: workflowDefinition,
    __isTestRun: true,
  };

  try {
    const client = await getTemporalClientSafe();
    const workflowId = instance.instanceID;
    // Same per-workflow resolution as persisted runs (node > workflow > platform).
    const workflowConfig = resolveWorkflowConfig(workflowOptions);
    const resolvedNodes = applyWorkflowConfigToNodes(nodes, workflowConfig);
    const startOptions = resolveWorkflowStartOptions(workflowConfig);
    const handle = await client.workflow.start(WORKFLOW_TYPE, {
      taskQueue: TASK_QUEUE,
      workflowId,
      args: [{ nodes: resolvedNodes, edges, initialContext: firstJobContext, instanceID: instance.instanceID, tenantID, workflowID: testWorkflowID, isTestRun: true, workflowOptions, workflowConfig }],
      workflowRunTimeout: startOptions.workflowRunTimeout,
      workflowTaskTimeout: startOptions.workflowTaskTimeout,
      workflowIdReusePolicy: 3,
      retry: { maximumAttempts: 1 },
    });
    Logger.log('success', { message: 'temporal:service:testWorkflowStarted', params: { instanceID: instance.instanceID } });
    return { instanceID: instance.instanceID, isTest: true, temporalWorkflowId: handle.workflowId, runId: handle.firstExecutionRunId };
  } catch (err) {
    const isConnectionError = /Failed to connect|deadline|ECONNREFUSED|ENOTFOUND/i.test(err.message);
    Logger.log('error', { message: 'temporal:service:testStartFailed', params: { error: err.message, isConnectionError } });
    await require('../workflowEngine/stateManager').stateManager.completeInstance(instance.instanceID, 'FAILED').catch(()=>{});
    await require('../workflowEngine/stateManager').stateManager.logEvent({
      instanceID: instance.instanceID, nodeID: null, eventType: constants.WORKFLOW_LOG_EVENT_TYPES.SYSTEM_SET,
      payload: { __temporalStartError: err.message },
    }).catch(()=>{});
    if (isConnectionError) {
      const help = 'Temporal not running at ' + require('./config').ADDRESS + '. Start it: docker compose -f docker-compose.temporal.yml up -d  (UI at http://localhost:8088)';
      const wrapped = new Error(help + ' :: ' + err.message);
      wrapped.code = 'TEMPORAL_NOT_RUNNING';
      throw wrapped;
    }
    throw err;
  }
}

/**
 * Run a child workflow synchronously and wait for its result.
 * Used by the subWorkflow node (activity-side execution): the child gets its
 * own DB instance + history (linked via parentInstanceID/parentNodeID) and the
 * parent activity blocks until the child completes. The parent node's
 * activity timeout caps the total wait — keep child durations well under it.
 *
 * Isolated context: the child sees ONLY `inputValues` as its ctx.input.
 */
async function runSubWorkflowAndWait({ childWorkflowID, inputValues = {}, tenantID, parentInstanceID, parentNodeID, depth = 0, isTest = false }) {
  const { stateManager } = require('../workflowEngine/stateManager');
  const { prisma } = require('../../../config/prisma.config');

  Logger.log('info', { message: 'temporal:service:runSubWorkflow', params: { childWorkflowID, tenantID, parentInstanceID, parentNodeID, depth, isTest } });

  // Tenant isolation: the child must belong to the same tenant.
  const child = await prisma.tblWorkflows.findFirst({
    where: { workflowID: childWorkflowID, tenantID },
    select: { workflowID: true, title: true },
  });
  if (!child) {
    throw new Error(`Sub-Workflow child not found in this tenant: ${childWorkflowID}`);
  }
  // Defense-in-depth self-reference check (handler checks first).
  if (parentInstanceID) {
    const parent = await prisma.tblWorkflowInstances.findUnique({
      where: { instanceID: parentInstanceID },
      select: { workflowID: true },
    });
    if (parent?.workflowID && String(parent.workflowID) === String(childWorkflowID)) {
      throw new Error('Sub-Workflow cannot call its own parent workflow (self-reference).');
    }
  }

  const systemContext = { __subDepth: depth + 1 };
  if (isTest) systemContext.__isTestRun = true;

  const { instance, initialContext } = await stateManager.createInstance({
    workflowID: childWorkflowID,
    tenantID,
    inputValues,
    isTest: Boolean(isTest),
    sourceWorkflowID: isTest ? childWorkflowID : undefined,
    parentInstanceID,
    parentNodeID,
    systemContext,
  });

  const { nodes, edges, workflowOptions } = await loadPersistedGraph(childWorkflowID);
  if (!nodes.find((n) => n.type === 'start')) {
    await stateManager.completeInstance(instance.instanceID, 'FAILED').catch(() => {});
    throw new Error(`Sub-Workflow child has no start node: ${childWorkflowID}`);
  }

  const workflowConfig = resolveWorkflowConfig(workflowOptions);
  const resolvedNodes = applyWorkflowConfigToNodes(nodes, workflowConfig);
  const startOptions = resolveWorkflowStartOptions(workflowConfig);

  const client = await getTemporalClientSafe();
  const handle = await client.workflow.start(WORKFLOW_TYPE, {
    taskQueue: TASK_QUEUE,
    workflowId: instance.instanceID,
    args: [{
      nodes: resolvedNodes,
      edges,
      initialContext,
      instanceID: instance.instanceID,
      tenantID,
      workflowID: childWorkflowID,
      isTestRun: Boolean(isTest),
      workflowOptions,
      workflowConfig,
    }],
    workflowRunTimeout: startOptions.workflowRunTimeout,
    workflowTaskTimeout: startOptions.workflowTaskTimeout,
    workflowIdReusePolicy: 3,
    retry: { maximumAttempts: 1 },
  });

  Logger.log('info', { message: 'temporal:service:subWorkflowStarted', params: { childInstanceID: instance.instanceID, parentInstanceID } });

  try {
    const result = await handle.result();
    const publicSnapshot = result && typeof result === 'object'
      ? Object.fromEntries(Object.entries(result).filter(([k]) => !k.startsWith('__') && !k.startsWith('_workflow')))
      : {};
    return {
      childInstanceID: instance.instanceID,
      status: result?._workflowStatus || 'COMPLETED',
      output: result?._workflowOutput ?? null,
      contextSnapshot: publicSnapshot,
    };
  } catch (err) {
    // The child workflow already recorded FAILED + emitted its own completion;
    // report failure (with DB status) so the parent applies errorHandling.
    const dbInstance = await stateManager.getInstance(instance.instanceID).catch(() => null);
    return {
      childInstanceID: instance.instanceID,
      status: (dbInstance && dbInstance.status) || 'FAILED',
      output: null,
      contextSnapshot: {},
      errorMessage: err?.message || String(err),
    };
  }
}

/**
 * Signal human input to a running Temporal workflow.
 * Called by dataCollection.service.submitCollectionData when driver=temporal.
 */
async function signalHumanInput({ instanceID, nodeID, data, collectionRequestID }) {
  const client = await getTemporalClientSafe();
  const handle = client.workflow.getHandle(instanceID); // workflowId == instanceID
  await handle.signal(SIGNALS.SUBMIT_HUMAN_INPUT, {
    nodeID,
    data,
    collectionRequestID,
  });
  Logger.log('success', { message: 'temporal:signal:humanInput', params: { instanceID, nodeID } });
  return { signalled: true };
}

async function cancelWorkflow({ instanceID }) {
  const client = await getTemporalClientSafe();
  const handle = client.workflow.getHandle(instanceID);
  try {
    await handle.signal(SIGNALS.CANCEL_WORKFLOW);
    await handle.cancel();
  } catch (e) {
    Logger.log('warning', { message: 'temporal:cancel:failed', params: { instanceID, error: e.message } });
  }
  return { cancelled: true };
}

async function terminateWorkflow({ instanceID, reason = 'terminated' }) {
  const client = await getTemporalClientSafe();
  const handle = client.workflow.getHandle(instanceID);
  await handle.terminate(reason);
  return { terminated: true };
}

async function describeWorkflow({ instanceID }) {
  const client = await getTemporalClientSafe();
  const handle = client.workflow.getHandle(instanceID);
  const desc = await handle.describe();
  return desc;
}

module.exports = {
  startWorkflowTemporal,
  startTestWorkflowTemporal,
  runSubWorkflowAndWait,
  signalHumanInput,
  cancelWorkflow,
  terminateWorkflow,
  describeWorkflow,
};
