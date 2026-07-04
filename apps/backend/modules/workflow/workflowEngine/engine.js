/**
 * Workflow Orchestrator — final version with optimistic locking
 *
 * Changes from previous version:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. handleTaskResult wraps its scheduling decision in a CAS retry loop.
 *    The log write (NODE_COMPLETED / NODE_FAILED) happens once, before the
 *    loop. The loop only retries the version bump + dispatch decision.
 *
 * 2. NODE_DISPATCHED is written by the CAS winner for every node it queues,
 *    inside the same version-bump operation. This is the authoritative record
 *    that a node has been scheduled for execution.
 *
 * 3. On retry, the loser filters next nodes against getDispatchedNodeIDs.
 *    If all next nodes are already dispatched, it stops. No duplicate dispatch.
 *
 * 4. nodeAttempt is now threaded from taskWorker → addResult → handleTaskResult
 *    → logEvent, so every NODE_COMPLETED / NODE_FAILED row records which
 *    execution attempt produced it.
 *
 * 5. The idempotency index on (instanceID, nodeID, eventType, nodeAttempt)
 *    means a duplicate handleTaskResult call for the same result (pg-boss
 *    at-least-once) hits a unique constraint on the log write and stops
 *    immediately, before reaching the CAS loop.
 *
 * CAS retry semantics:
 *   - MAX_CAS_RETRIES = 3 covers the realistic case of 2 branches completing
 *     within the same millisecond. More than 3 concurrent completions on the
 *     same instance would be unusual and is logged as an error.
 *   - Backoff between retries is intentionally short (10ms) because the
 *     blocking work is just one DB version-bump, not a long handler execution.
 */

const { v4: uuidv4 } = require('uuid');
const { registerResultsWorker, addNodeJob } = require("../../../config/queue.config");
const { stateManager } = require('./stateManager');
const { dagScheduler } = require('./dagScheduler');
const Logger = require("../../../utils/logger");
const { socketIO } = require("../../../config/socket.io");
const constants = require("../../../constants");
const { widgetWorkflowBridge } = require('../../widget/widgetWorkflowBridge');

const MAX_CAS_RETRIES = 3;
const CAS_RETRY_DELAY_MS = 10;

// ─── Public entry point ───────────────────────────────────────────────────────

async function handleTaskResult(result) {
  const {
    instanceID, nodeID, nodeType, outputVariable,
    status, output, nextHandle, queueDelay, taskError,
    nodeAttempt = 1,
  } = result;

  Logger.log('info', {
    message: 'orchestrator:handleTaskResult',
    params: { instanceID, nodeID, nodeType, status, nextHandle, nodeAttempt },
  });

  // ── Step 1: write the execution log row — exactly once ────────────────────
  // This is outside the CAS loop. If a duplicate result arrives (pg-boss
  // at-least-once), the unique index on (instanceID, nodeID, eventType,
  // nodeAttempt) will throw P2002 here and we return early — the CAS loop
  // is never reached, so there is no risk of a duplicate dispatch.
  // ── In handleTaskResult, replace the Step 1 block with this ──────────────

  // ── Step 1: write the execution log row — exactly once ────────────────────
  try {
    if (status === constants.WORKFLOW_STATUS.SUCCESS) {
      const payload = _buildLogPayload({ nodeID, nodeType, outputVariable, output, status });
      await stateManager.logEvent({
        instanceID,
        nodeID,
        eventType: constants.WORKFLOW_LOG_EVENT_TYPES.NODE_COMPLETED,
        nodeStatus: constants.WORKFLOW_STATUS.SUCCESS,
        outputVariable: outputVariable || null,
        payload,
        nodeAttempt,
      });

    } else if (status === constants.WORKFLOW_STATUS.SUSPENDED) {
      // ── Suspended: workflow is waiting for human input ──────────────────
      // Check first whether a PENDING request already exists (idempotency on
      // pg-boss at-least-once re-delivery; avoids duplicate DB records).
      const existing = await stateManager.getPendingRequestForNode(instanceID, nodeID);

      if (existing) {
        // Re-emit the socket in case the client missed the first delivery.
        socketIO.to(instanceID).emit(
          constants.SOCKET_EMIT_EVENTS.WORKFLOW_DATA_COLLECTION_REQUEST,
          {
            instanceID,
            nodeID,
            collectionRequestID: existing.collectionRequestID,
            collectionType: existing.collectionType,
            collectionConfig: existing.collectionConfig,
          }
        );
        return;
      }

      // Create the DB record.
      const config = output ?? {};                // output IS the collectionConfig
      const expiryMins = config.expiryMinutes ?? 60;
      const expiresAt = expiryMins > 0
        ? new Date(Date.now() + expiryMins * 60 * 1000)
        : null;

      const request = await stateManager.createDataCollectionRequest({
        instanceID,
        nodeID,
        nodeAttempt,
        collectionType: config.collectionType || 'form',
        collectionConfig: config,
        expiresAt,
      });

      // Write NODE_SUSPENDED to the append-only log (carries the request ID for
      // audit / replay purposes; is NOT folded into assembled context).
      await stateManager.logEvent({
        instanceID,
        nodeID,
        eventType: constants.WORKFLOW_LOG_EVENT_TYPES.NODE_SUSPENDED,
        nodeStatus: constants.WORKFLOW_STATUS.SUSPENDED,
        payload: { collectionRequestID: request.collectionRequestID },
        nodeAttempt,
      });

      // Notify the frontend.
      socketIO.to(instanceID).emit(
        constants.SOCKET_EMIT_EVENTS.WORKFLOW_DATA_COLLECTION_REQUEST,
        {
          instanceID,
          nodeID,
          collectionRequestID: request.collectionRequestID,
          collectionType: request.collectionType,
          collectionConfig: request.collectionConfig,
        }
      );

      // Do NOT advance the DAG — return here.
      Logger.log('info', {
        message: 'orchestrator:nodeSuspended',
        params: { instanceID, nodeID, collectionRequestID: request.collectionRequestID },
      });
      return;

    } else {
      // error path (unchanged)
      await stateManager.logEvent({
        instanceID,
        nodeID,
        eventType: constants.WORKFLOW_LOG_EVENT_TYPES.NODE_FAILED,
        nodeStatus: constants.WORKFLOW_STATUS.ERROR,
        payload: {},
        errorMessage: taskError || 'Unknown error',
        nodeAttempt,
      });
    }
  } catch (err) {
    if (err?.code === 'P2002') {
      Logger.log('info', {
        message: 'orchestrator:duplicateResult:discarded',
        params: { instanceID, nodeID, nodeAttempt },
      });
      return;
    }
    throw err;
  }

  // ── Step 2: assemble context once — used by both terminal and CAS paths ───
  const currentContext = await stateManager.assembleContext(instanceID);
  const instance = await stateManager.getInstance(instanceID);

  if (!instance) {
    Logger.log('error', { message: 'orchestrator:instanceNotFound', params: { instanceID } });
    return;
  }

  const { isTestRun, workflowDefinition } = _extractRunMode(instance, currentContext);

  // Emit node progress to socket/widget (outside CAS — no scheduling decision)
  _emitNodeProgress(instanceID, {
    nodeID, outputVariable, output, status, taskError,
    contextData: currentContext,
  });

  // ── Step 3: terminal node — finalise and return ───────────────────────────
  if (nodeType === 'end') {
    await _finalizeWorkflow(instanceID, { output, currentContext });
    return;
  }

  // ── Step 4: CAS retry loop — scheduling decision ──────────────────────────
  // Each iteration:
  //   a. read fresh instance version
  //   b. resolve next nodes from the current log state
  //   c. filter out nodes already dispatched by a concurrent winner
  //   d. attempt version bump — one winner, rest loop back
  //   e. winner writes NODE_DISPATCHED and calls addNodeJob

  for (let casAttempt = 1; casAttempt <= MAX_CAS_RETRIES; casAttempt++) {
    try {
      const freshInstance = await stateManager.getInstance(instanceID);
      if (!freshInstance) return;
      if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(freshInstance.status)) return;

      const currentVersion = freshInstance.version;

      // Resolve which nodes are ready to run next
      const nextNodes = await _resolveNextNodes({
        instance: freshInstance,
        isTestRun,
        workflowDefinition,
        nodeID,
        nextHandle,
        instanceID,
        contextData: currentContext,
      });

      if (nextNodes.length === 0) {
        Logger.log('info', { message: 'orchestrator:noNextNodes', params: { instanceID, nodeID } });
        return;
      }

      // Filter: which of these next nodes has a concurrent winner already dispatched
      // and not yet completed/failed? Completed dispatches are intentionally
      // reusable so loop-back edges can execute the same node again.
      const nextNodeIDs = nextNodes.map(n => n.nodeID);
      const alreadyDispatched = await stateManager.getOpenDispatchedNodeIDs(instanceID, nextNodeIDs);
      const toDispatch = nextNodes.filter(n => !alreadyDispatched.has(n.nodeID));

      if (toDispatch.length === 0) {
        // Every next node was already dispatched by a concurrent winner.
        // This CAS attempt's work is done — exit cleanly.
        Logger.log('info', {
          message: 'orchestrator:allNodesAlreadyDispatched',
          params: { instanceID, nodeID, casAttempt, skipped: nextNodeIDs },
        });
        return;
      }

      // Attempt the version bump — atomic gate across all pods
      const bumped = await _bumpVersion(instanceID, currentVersion);

      if (!bumped) {
        // Lost the race — another pod bumped the version first.
        // Loop back, re-read state, re-filter.
        Logger.log('info', {
          message: 'orchestrator:casFailed:retrying',
          params: { instanceID, nodeID, casAttempt, currentVersion },
        });

        if (casAttempt < MAX_CAS_RETRIES) {
          await _sleep(CAS_RETRY_DELAY_MS);
          continue;
        }

        Logger.log('error', {
          message: 'orchestrator:casMaxRetriesExceeded',
          params: { instanceID, nodeID, casAttempt },
        });
        return;
      }

      // ── Won the CAS ─────────────────────────────────────────────────────
      // Write NODE_DISPATCHED for every node we're about to queue.
      // This is the record that prevents the loser (on its retry) from
      // re-dispatching these nodes.
      // Write in bulk — one round-trip for all dispatched nodes.
      const dispatchCounts = await stateManager.getDispatchCounts(
        instanceID,
        toDispatch.map(n => n.nodeID)
      );
      const dispatches = toDispatch.map(n => ({
        ...n,
        _nodeAttempt: (dispatchCounts.get(n.nodeID) || 0) + 1,
      }));

      await stateManager.logEventBulk(
        dispatches.map(n => ({
          instanceID,
          nodeID: n.nodeID,
          eventType: constants.WORKFLOW_LOG_EVENT_TYPES.NODE_DISPATCHED,
          nodeStatus: null,
          payload: {},
          nodeAttempt: n._nodeAttempt,
        }))
      );

      // Now enqueue the actual jobs
      await _dispatchNextNodes({
        nextNodes: dispatches,
        instance: freshInstance,
        isTestRun,
        contextData: currentContext,
        queueDelay,
      });

      Logger.log('info', {
        message: 'orchestrator:dispatched',
        params: {
          instanceID,
          nodeID,
          casAttempt,
          dispatched: toDispatch.map(n => n.nodeID),
        },
      });
      return;

    } catch (err) {
      Logger.log('error', {
        message: 'orchestrator:casLoop:error',
        params: { instanceID, nodeID, casAttempt, error: err.message },
      });
      await stateManager.completeInstance(instanceID, 'FAILED').catch(() => { });
      return;
    }
  }
}

// ─── Version bump ─────────────────────────────────────────────────────────────

/**
 * Atomically increment version from currentVersion to currentVersion+1.
 * Returns true if this caller won (1 row updated).
 * Returns false if another caller already bumped it (0 rows updated).
 *
 * @param {string} instanceID
 * @param {number} currentVersion
 * @returns {Promise<boolean>}
 */
async function _bumpVersion(instanceID, currentVersion) {
  const { prisma } = require("../../../config/prisma.config");
  const result = await prisma.tblWorkflowInstances.updateMany({
    where: {
      instanceID,
      version: currentVersion,
      status: 'RUNNING',
    },
    data: {
      version: currentVersion + 1,
      updatedAt: new Date(),
    },
  });
  return result.count === 1;
}

// ─── Step helpers ─────────────────────────────────────────────────────────────

function _extractRunMode(instance, assembledContext) {
  return {
    isTestRun: assembledContext.__isTestRun || instance.isTest,
    workflowDefinition: assembledContext.__workflowDefinition,
  };
}

function _buildLogPayload({ nodeID, nodeType, outputVariable, output, status }) {
  const payload = {};

  if (outputVariable && output) {
    payload[outputVariable] = output[outputVariable] !== undefined
      ? output[outputVariable]
      : output;
  }

  if (output?.__contextPatch && typeof output.__contextPatch === 'object') {
    Object.assign(payload, output.__contextPatch);
  }

  if (nodeType === 'end' && output?.workflowOutput) {
    payload.output = output.workflowOutput;
  }

  payload[`__node_${nodeID}`] = { output, status, outputVariable };

  return payload;
}

/**
 * Strip internal/orchestrator keys from a context object before sending
 * to the frontend. Keys prefixed with __ are internal bookkeeping
 * (__node_*, __isTestRun, __workflowDefinition, __recoveryError, etc.)
 *
 * @param {object} context - Raw assembled context
 * @returns {object} User-facing context with only domain keys
 */
function _stripInternalKeys(context) {
  if (!context) return {};
  return Object.fromEntries(
    Object.entries(context).filter(([key]) => !key.startsWith('__'))
  );
}

function _emitNodeProgress(instanceID, { nodeID, outputVariable, output, status, taskError, contextData }) {
  // Build user-facing context (strip __node_*, __isTestRun, etc.)
  const userContext = _stripInternalKeys(contextData);

  // Emit to the workflow instance room — any subscriber gets real-time context
  socketIO.to(instanceID).emit(constants.SOCKET_EMIT_EVENTS.WORKFLOW_NODE_UPDATE, {
    instanceID, nodeID, status, output, error: taskError,
    contextData: userContext,
  });

  // Emit to registered widgets (processed data pipeline)
  widgetWorkflowBridge.emitContextUpdate(instanceID, {
    type: 'NODE_COMPLETE',
    nodeID,
    outputVariable,
    value: output?.[outputVariable] ?? output,
    status,
    contextSnapshot: userContext,
  });
}

async function _finalizeWorkflow(instanceID, { output, currentContext }) {
  const finalStatus = output?.status === 'error' ? 'FAILED' : 'COMPLETED';

  await stateManager.completeInstance(instanceID, finalStatus);

  const userContext = _stripInternalKeys(currentContext);

  socketIO.to(instanceID).emit(constants.SOCKET_EMIT_EVENTS.WORKFLOW_STATUS_UPDATE, {
    instanceID,
    status: finalStatus,
    contextData: userContext,
  });

  widgetWorkflowBridge.emitWorkflowStatus(instanceID, finalStatus, userContext);

  Logger.log('success', { message: 'orchestrator:workflowCompleted', params: { instanceID } });
}

async function _resolveNextNodes({
  instance, isTestRun, workflowDefinition,
  nodeID, nextHandle, instanceID, contextData,
}) {
  if (isTestRun && workflowDefinition) {
    return _resolveTestNextNodes({ workflowDefinition, nodeID, nextHandle, instanceID, contextData });
  }
  return dagScheduler.calculateNextNodes(instance.workflowID, nodeID, nextHandle, instanceID);
}

async function _dispatchNextNodes({ nextNodes, instance, isTestRun, contextData, queueDelay }) {
  for (const nextNode of nextNodes) {
    await addNodeJob(
      {
        instanceID: instance.instanceID,
        nodeID: nextNode.nodeID,
        nodeType: nextNode.nodeType,
        nodeConfig: nextNode.nodeConfig,
        context: contextData,
        workflowID: instance.workflowID,
        tenantID: instance.tenantID,
        isTestRun,
        isJoinNode: nextNode._isJoinNode ?? false,
        nodeAttempt: nextNode._nodeAttempt,
      },
      { delay: queueDelay || 0 }
    );
  }
}

// ─── Test-run helpers ─────────────────────────────────────────────────────────

async function _resolveTestNextNodes({ workflowDefinition, nodeID, nextHandle, instanceID, contextData }) {
  const normalizeHandle = (handle) => (handle === 'done' ? 'completed' : (handle || 'output'));
  const matchingEdges = workflowDefinition.edges.filter(
    (e) => e.upstreamNodeID === nodeID
      && normalizeHandle(e.sourceHandle) === normalizeHandle(nextHandle)
  );

  const candidateNodes = matchingEdges
    .map((e) => workflowDefinition.nodes[e.downstreamNodeID])
    .filter(Boolean);

  const readyNodes = await Promise.all(
    candidateNodes.map(async (candidateNode) => {
      const incomingEdges = workflowDefinition.edges.filter(
        (e) => e.downstreamNodeID === candidateNode.nodeID
      );
      const joinMode = candidateNode.nodeConfig?.joinMode ?? (candidateNode.nodeType === 'loop' ? 'any' : 'all');
      const ready = dagScheduler.isNodeReadyToExecute({
        incomingEdges, instanceID, joinMode,
        isTestRun: true, contextData,
      });
      return ready ? { ...candidateNode, _isJoinNode: incomingEdges.length > 1 } : null;
    })
  );

  return readyNodes.filter(Boolean);
}

// ─── Startup & recovery ───────────────────────────────────────────────────────

async function startResultsConsumer() {
  Logger.log('info', { message: 'orchestrator:startResultsConsumer' });

  await registerResultsWorker(async (result) => {
    try {
      await handleTaskResult(result);
    } catch (err) {
      Logger.log('error', { message: 'orchestrator:resultFailed', params: { error: err.message } });
    }
  });

  Logger.log('success', { message: 'orchestrator:resultsConsumerStarted' });
}

async function recoverStuckWorkflows() {
  const staleInstances = await stateManager.getStaleRunningInstances({ staleAfterMs: 5 * 60 * 1000 });
  if (staleInstances.length === 0) return;

  Logger.log('warning', {
    message: 'orchestrator:recoverStuckWorkflows',
    params: { count: staleInstances.length },
  });

  await stateManager.markInstancesAsRecovered(staleInstances.map((i) => i.instanceID));

  for (const instance of staleInstances) {
    socketIO.to(instance.instanceID).emit(constants.SOCKET_EMIT_EVENTS.WORKFLOW_STATUS_UPDATE, {
      instanceID: instance.instanceID,
      status: 'FAILED',
      error: 'Workflow recovered from crashed state',
    });
  }
}

// ─── Workflow launchers ───────────────────────────────────────────────────────

async function startWorkflow({ workflowID, tenantID, inputValues = {} }) {
  Logger.log('info', { message: 'orchestrator:startWorkflow', params: { workflowID, tenantID } });

  const { instance, initialContext } = await stateManager.createInstance({
    workflowID, tenantID, inputValues,
  });

  const startNode = await dagScheduler.getStartNode(workflowID);

  await addNodeJob({
    instanceID: instance.instanceID,
    nodeID: startNode.nodeID,
    nodeType: startNode.nodeType,
    nodeConfig: startNode.nodeConfig,
    context: initialContext,
    workflowID,
    tenantID,
    isJoinNode: false,
  });

  Logger.log('success', {
    message: 'orchestrator:workflowStarted',
    params: { instanceID: instance.instanceID },
  });

  return { instanceID: instance.instanceID };
}

async function startTestWorkflow({ nodes, edges, tenantID, inputValues = {} }) {
  Logger.log('info', {
    message: 'orchestrator:startTestWorkflow',
    params: { tenantID, nodeCount: nodes.length, edgeCount: edges.length },
  });

  const startNode = nodes.find((n) => n.type === 'start');
  if (!startNode) throw new Error('No start node found in test workflow');

  const testWorkflowID = uuidv4();

  const { instance, initialContext } = await stateManager.createInstance({
    workflowID: testWorkflowID, tenantID, inputValues, isTest: true,
  });

  const workflowDefinition = _buildWorkflowDefinition(nodes, edges);

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

  await addNodeJob({
    instanceID: instance.instanceID,
    nodeID: startNode.id,
    nodeType: startNode.type,
    nodeConfig: startNode.data ?? {},
    context: firstJobContext,
    workflowID: testWorkflowID,
    tenantID,
    isTestRun: true,
    isJoinNode: false,
  });

  Logger.log('success', {
    message: 'orchestrator:testWorkflowStarted',
    params: { instanceID: instance.instanceID },
  });

  return { instanceID: instance.instanceID, isTest: true };
}

function _buildWorkflowDefinition(nodes, edges) {
  return {
    nodes: Object.fromEntries(
      nodes.map((node) => [
        node.id,
        { nodeID: node.id, nodeType: node.type, nodeConfig: node.data ?? {} },
      ])
    ),
    edges: edges.map((edge) => ({
      upstreamNodeID: edge.source,
      downstreamNodeID: edge.target,
      sourceHandle: edge.sourceHandle,
    })),
  };
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  handleTaskResult,
  startResultsConsumer,
  recoverStuckWorkflows,
  startWorkflow,
  startTestWorkflow,

  __test__: {
    _extractRunMode,
    _buildLogPayload,
    _emitNodeProgress,
    _finalizeWorkflow,
    _resolveNextNodes,
    _dispatchNextNodes,
    _buildWorkflowDefinition,
    _bumpVersion,
  },
};
