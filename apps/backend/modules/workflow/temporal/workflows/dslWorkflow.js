/**
 * DSL Interpreter Workflow — Temporal-only, Deterministic
 * Preserves 100% React Flow JSON {nodes, edges} from frontend.
 *
 * Core abstraction: executeNode (from @jet-admin/workflow-nodes-logic)
 * All node types flow through a single activity `executeNodeActivity` which
 * internally delegates to the shared logic package. Workflow only orchestrates
 * graph traversal, durable timers, and human signals.
 *
 * Features:
 *  - Wave DAG executor with joinMode all|any barrier (mirrors dagScheduler)
 *  - Native JS for-loop for loop nodes (no __loop_* cursor)
 *  - Durable delay via sleep()
 *  - HITL via Signals + condition()
 *  - Multi-ready waves execute sequentially in sorted order (deterministic;
 *    shared-context mutation makes Promise.all unsafe — see below)
 */
import {
  proxyActivities,
  defineSignal,
  setHandler,
  condition,
  sleep,
  ApplicationFailure,
  CancellationScope,
} from '@temporalio/workflow';
import {
  normalizeHandle,
  buildGraphMaps,
  getOutgoingEdges,
  isNodeReady,
  resolveSourceVariable,
  normalizeItems,
} from './helpers.js';
import {
  resolveNodePolicy,
  resolveHumanTimeout,
  isNonRetryableError,
  SIGNALS,
  WORKFLOW_PROGRESS,
  ERROR_HANDLING,
} from './workflowPolicy.js';

// ──────────────────────────────────────────────────────────────────────────────
// Activities — node execution uses per-node stubs (see executeNode);
// infra activities share a single non-retryable stub.
// ──────────────────────────────────────────────────────────────────────────────

const { emitProgressActivity, emitWorkflowCompletedActivity, createDataCollectionRequestActivity } = proxyActivities({
  startToCloseTimeout: '30 seconds',
  retry: { maximumAttempts: 1 },
});

// Progress emits are observability only — they must never fail the workflow.
// A slow DB/socket (e.g. 10s+ emit during Fetch FX rates) previously surfaced
// as generic "Activity task timed out" and bypassed the node's errorHandling
// (e.g. `continue` + error edge to Summarize), failing the whole run.
async function safeEmitProgress(payload) {
  try {
    await emitProgressActivity(payload);
  } catch (_) {
    // Best-effort only — node execution result is source of truth.
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Signals
// ──────────────────────────────────────────────────────────────────────────────

export const submitHumanInputSignal = defineSignal(SIGNALS.SUBMIT_HUMAN_INPUT); // { nodeID, data }
export const cancelWorkflowSignal = defineSignal(SIGNALS.CANCEL_WORKFLOW);

// ──────────────────────────────────────────────────────────────────────────────
// Context helpers
// ──────────────────────────────────────────────────────────────────────────────

function mergeOutputIntoContext(context, node, activityResult) {
  const output = activityResult?.output || {};
  const outputVariable = node?.data?.outputVariable;
  if (output.__contextPatch && typeof output.__contextPatch === 'object') Object.assign(context, output.__contextPatch);
  if (Array.isArray(output.__deleteKeys)) for (const k of output.__deleteKeys) delete context[k];
  if (outputVariable) {
    if (output[outputVariable] !== undefined) context[outputVariable] = output[outputVariable];
    else if (output.success !== undefined) {
      const filtered = {};
      let hasDomain = false;
      for (const [k, v] of Object.entries(output)) {
        if (k.startsWith('__') || k === 'success' || k === 'error') continue;
        filtered[k] = v; hasDomain = true;
      }
      if (hasDomain) {
        const keys = Object.keys(filtered);
        context[outputVariable] = keys.length === 1 ? filtered[keys[0]] : filtered;
      } else context[outputVariable] = output[outputVariable] ?? output;
    }
  }
  if (node.type === 'end' && output.workflowOutput) context.output = output.workflowOutput;
  context[`__node_${node.id}`] = { output, status: 'success', outputVariable };
  return context;
}

/**
 * Suspend-timeout routing for human nodes (dataCollection / approval).
 * Returns the handle to route to on timeout, or null to fail the run
 * (legacy dataCollection behaviour). Approval defaults to 'expired';
 * explicit `timeoutHandle` wins; `onTimeout: 'fail'` forces failure.
 */
function resolveSuspendTimeoutHandle(node) {
  const data = node?.data || {};
  if (data.onTimeout === 'fail') return null;
  if (data.timeoutHandle) return data.timeoutHandle;
  if (node?.type === 'approval') return 'expired';
  return null;
}

function normalizeApprovalDecision(humanData) {
  // Current form shape: explicit { decision: 'approve' | 'reject' } radio.
  if (humanData && typeof humanData.decision === 'string') {
    return { approved: humanData.decision.toLowerCase() === 'approve', comment: humanData?.comment ?? '' };
  }
  // Legacy checkbox shape { approved: boolean } from earlier form version.
  const raw = humanData?.approved;
  const approved = raw === true || String(raw).toLowerCase() === 'true';
  return { approved, comment: humanData?.comment ?? '' };
}

// ──────────────────────────────────────────────────────────────────────────────
// executeNode — common abstraction for ALL node types
// Thin deterministic wrapper around the activity. Handles delay sleep & emits.
// This is the ONLY place workflow invokes node logic — satisfies requirement.
// ──────────────────────────────────────────────────────────────────────────────

/**
 * @param {object} node — React Flow node { id, type, data }
 * @param {object} context — mutable workflow context (shared reference)
 * @param {object} common — { instanceID, tenantID, workflowID, humanInputs, workflowConfig }
 * @returns {Promise<object>} activityResult or { __suspend: true, ... }
 *
 * Execution policy precedence: node.data > workflowConfig(+nodeDefaults) >
 * platform defaults (workflowPolicy.js). Temporal-level retries are disabled
 * (maximumAttempts 1); retries are applied here durably with sleep() between
 * attempts so they survive worker restarts and honor per-node delays.
 */
async function executeNode(node, context, common) {
  const { instanceID, tenantID, workflowID, workflowConfig } = common;
  const nodeID = node.id;
  const nodeType = node.type;
  const nodeConfig = node.data || {};

  // Per-node policy (service.js pre-materializes these into node.data;
  // resolveNodePolicy re-applies the same precedence defensively).
  const policy = resolveNodePolicy(nodeType, nodeConfig, workflowConfig);
  const totalAttempts = policy.retryLimit + 1;
  const errorHandling = nodeConfig.errorHandling || ERROR_HANDLING.FAIL_WORKFLOW;
  const outputVariable = nodeConfig.outputVariable || null;
  const retriesAllowed =
    errorHandling === ERROR_HANDLING.FAIL_WORKFLOW ||
    errorHandling === ERROR_HANDLING.RETRY_THEN_FAIL ||
    errorHandling === ERROR_HANDLING.RETRY_THEN_CONTINUE;
  const continueOnExhausted =
    errorHandling === ERROR_HANDLING.CONTINUE ||
    errorHandling === ERROR_HANDLING.CONTINUE_DEFAULT ||
    errorHandling === ERROR_HANDLING.SKIP_ITEM ||
    errorHandling === ERROR_HANDLING.RETRY_THEN_CONTINUE;

  // Per-node Temporal timeout — derived from deterministic inputs only,
  // so every replay creates the identical stub.
  const { executeNodeActivity: nodeActivity } = proxyActivities({
    startToCloseTimeout: `${policy.timeoutSeconds} seconds`,
    retry: { maximumAttempts: 1 },
  });

  // Loop is handled natively by caller — should not enter here
  if (nodeType === 'loop') throw ApplicationFailure.nonRetryable(`Loop node ${nodeID} must be handled by native for-loop`);

  let lastErrorOutput = null;
  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    await safeEmitProgress({
      instanceID, nodeID, nodeType, status: WORKFLOW_PROGRESS.RUNNING, output: null,
      contextData: { ...context }, outputVariable, nodeAttempt: attempt,
    });

    let result;
    try {
      result = await nodeActivity({
        node: { id: nodeID, type: nodeType, data: { ...nodeConfig, timeoutSeconds: policy.timeoutSeconds, retryLimit: policy.retryLimit, retryDelaySeconds: policy.retryDelaySeconds } },
        context: { ...context },
        tenantID, instanceID, workflowID,
      });
    } catch (err) {
      const errorMessage = err?.message || String(err);
      const exhausted = attempt >= totalAttempts;
      // Deterministic user-code failures (non-retryable) never retry.
      if (isNonRetryableError(err) || exhausted || !retriesAllowed) {
        await safeEmitProgress({
          instanceID, nodeID, nodeType, status: WORKFLOW_PROGRESS.FAILED, output: null, errorMessage,
          contextData: { ...context }, outputVariable, nodeAttempt: attempt,
        });
        if (continueOnExhausted) {
          return {
            output: { ...(outputVariable ? { [outputVariable]: null } : {}), success: false, error: { message: errorMessage } },
            nextHandle: 'error',
          };
        }
        throw err;
      }
      if (policy.retryDelaySeconds > 0) await sleep(policy.retryDelaySeconds * 1000);
      continue;
    }

    // DataCollection suspension — signal to caller to wait for human input
    if (result?.suspended) {
      await safeEmitProgress({
        instanceID, nodeID, nodeType, status: WORKFLOW_PROGRESS.SUSPENDED, output: result.output,
        contextData: { ...context }, outputVariable,
      });
      return { __suspend: true, collectionConfig: result.output, nodeID, outputVariable: outputVariable || 'collectedData' };
    }

    // Handler-reported failure with a retry_then_* mode — retry durably.
    if (result?.output?.success === false && (errorHandling === ERROR_HANDLING.RETRY_THEN_CONTINUE || errorHandling === ERROR_HANDLING.RETRY_THEN_FAIL)) {
      lastErrorOutput = result;
      if (attempt < totalAttempts) {
        if (policy.retryDelaySeconds > 0) await sleep(policy.retryDelaySeconds * 1000);
        continue;
      }
      await safeEmitProgress({
        instanceID, nodeID, nodeType, status: WORKFLOW_PROGRESS.FAILED, output: result.output,
        errorMessage: result.output?.error?.message || 'Node reported failure',
        contextData: { ...context }, outputVariable, nodeAttempt: attempt,
      });
      if (errorHandling === ERROR_HANDLING.RETRY_THEN_FAIL) {
        throw ApplicationFailure.nonRetryable(
          result.output?.error?.message || `Node ${nodeID} failed after ${totalAttempts} attempt(s)`
        );
      }
      return result;
    }

    // Delay — activity computed queueDelay, workflow sleeps durably
    if (nodeType === 'delay' && result?.queueDelay > 0) {
      await sleep(result.queueDelay);
    }

    // Merge context + emit SUCCESS
    mergeOutputIntoContext(context, node, result);
    await safeEmitProgress({
      instanceID, nodeID, nodeType, status: WORKFLOW_PROGRESS.SUCCESS, output: result.output,
      contextData: { ...context }, outputVariable, nodeAttempt: attempt,
    });
    return result;
  }

  // Unreachable in practice (loop always returns/throws); defensive fallback.
  if (lastErrorOutput) return lastErrorOutput;
  throw ApplicationFailure.nonRetryable(`Node ${nodeID} exhausted ${totalAttempts} attempt(s) without a result`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Loop — native JS for-loop, no graph cycle
// ──────────────────────────────────────────────────────────────────────────────

async function executeLoopNode(loopNode, context, common, graph) {
  const { nodeMap, outgoingBySource } = graph;
  const { instanceID, workflowConfig } = common;
  const nodeConfig = loopNode.data || {};
  const outputVariable = nodeConfig.outputVariable || 'loopResults';
  const itemVariable = nodeConfig.itemVariable || 'item';
  const indexVariable = nodeConfig.indexVariable || 'index';
  // Bounds mirror frontend loopNode.jsx (1-100000) and legacy loopHandler.
  // delayBetweenItems is milliseconds (0-60000), matching the UI label.
  const rawMax = Number(nodeConfig.maxIterations ?? 1000);
  const maxIterations = Number.isFinite(rawMax) ? Math.min(100000, Math.max(1, Math.trunc(rawMax))) : 1000;
  const rawDelay = Number(nodeConfig.delayBetweenItems ?? 0);
  const delayBetweenItems = Number.isFinite(rawDelay) ? Math.min(60000, Math.max(0, Math.trunc(rawDelay))) : 0;

  // Parity with legacy loopHandler: disabled loops emit empty results and
  // follow the completed handle without iterating.
  if (nodeConfig.isDisabled) {
    context[outputVariable] = [];
    context[`__node_${loopNode.id}`] = { output: { [outputVariable]: [] }, status: 'success' };
    await safeEmitProgress({
      instanceID, nodeID: loopNode.id, nodeType: 'loop', status: WORKFLOW_PROGRESS.SUCCESS,
      output: { [outputVariable]: [], totalItems: 0, skipped: true, success: true },
      contextData: { ...context }, outputVariable,
    });
    return { output: { [outputVariable]: [] }, nextHandle: 'completed' };
  }

  let items = resolveSourceVariable(nodeConfig.sourceVariable, context);
  if (!Array.isArray(items)) items = normalizeItems(items);
  if (items.length > maxIterations) throw ApplicationFailure.nonRetryable(`Loop ${loopNode.id} has ${items.length} items > maxIterations ${maxIterations}`);

  await safeEmitProgress({
    instanceID, nodeID: loopNode.id, nodeType: 'loop', status: WORKFLOW_PROGRESS.RUNNING, output: null,
    contextData: { ...context }, outputVariable,
  });

  const loopResults = [];
  const loopOutgoing = outgoingBySource.get(loopNode.id) || [];
  const loopBodyEdge = loopOutgoing.find((e) => normalizeHandle(e.sourceHandle) === 'loop');
  const completedEdge = loopOutgoing.find((e) => ['completed', 'done'].includes(normalizeHandle(e.sourceHandle)));
  const bodyEntryID = loopBodyEdge?.target;

  if (!bodyEntryID && items.length > 0) {
    context[outputVariable] = [];
    await safeEmitProgress({
      instanceID, nodeID: loopNode.id, nodeType: 'loop', status: WORKFLOW_PROGRESS.SUCCESS,
      output: { [outputVariable]: [], totalItems: items.length, success: true },
      contextData: { ...context }, outputVariable,
    });
    return { output: { [outputVariable]: [] }, nextHandle: 'completed' };
  }

  async function executeBodyIteration(iterContext) {
    if (!bodyEntryID) return null;
    let currentID = bodyEntryID;
    let lastResult = null;
    const visited = new Set();
    while (currentID) {
      if (visited.has(currentID)) break;
      visited.add(currentID);
      const curNode = nodeMap.get(currentID);
      if (!curNode || curNode.id === loopNode.id) break;
      let res;
      if (curNode.type === 'loop') {
        res = await executeLoopNode(curNode, iterContext, common, graph);
      } else {
        res = await executeNode(curNode, iterContext, common);
        if (res?.__suspend) {
          const timeout = resolveHumanTimeout(curNode.data, workflowConfig);
          const ok = await condition(() => common.humanInputs[res.nodeID] !== undefined, timeout);
          if (!ok) {
            const timeoutHandle = resolveSuspendTimeoutHandle(curNode);
            if (!timeoutHandle) throw ApplicationFailure.nonRetryable(`Data collection timeout for ${res.nodeID} inside loop ${loopNode.id}`);
            const expiredData = curNode.type === 'approval'
              ? { approved: false, expired: true, comment: '' }
              : { expired: true };
            iterContext[res.outputVariable] = expiredData;
            iterContext[`__node_${res.nodeID}`] = { output: { [res.outputVariable]: expiredData }, status: 'success' };
            await safeEmitProgress({
              instanceID, nodeID: res.nodeID, nodeType: curNode.type, status: WORKFLOW_PROGRESS.SUCCESS,
              output: { [res.outputVariable]: expiredData, success: true },
              errorMessage: 'Approval expired (timeout)',
              contextData: { ...iterContext }, outputVariable: res.outputVariable,
            });
            res = { output: { [res.outputVariable]: expiredData, success: true }, nextHandle: timeoutHandle };
          } else {
            const humanData = common.humanInputs[res.nodeID];
            delete common.humanInputs[res.nodeID];
            let resumeData = humanData;
            let resumeHandle = 'output';
            if (curNode.type === 'approval') {
              resumeData = normalizeApprovalDecision(humanData);
              resumeHandle = resumeData.approved ? 'approved' : 'rejected';
            }
            iterContext[res.outputVariable] = resumeData;
            iterContext[`__node_${res.nodeID}`] = { output: { [res.outputVariable]: resumeData }, status: 'success' };
            await safeEmitProgress({
              instanceID, nodeID: res.nodeID, nodeType: curNode.type, status: WORKFLOW_PROGRESS.SUCCESS,
              output: { [res.outputVariable]: resumeData, success: true },
              contextData: { ...iterContext }, outputVariable: res.outputVariable,
            });
            res = { output: { [res.outputVariable]: resumeData, success: true }, nextHandle: resumeHandle };
          }
        }
      }
      lastResult = res;
      let nextHandle = res?.nextHandle || 'output';
      let outgoing = getOutgoingEdges(currentID, nextHandle, outgoingBySource);
      if (outgoing.length === 0 && (curNode.type === 'condition' || curNode.type === 'switch')) outgoing = getOutgoingEdges(currentID, 'default', outgoingBySource);
      const nonLoop = outgoing.filter((e) => e.target !== loopNode.id);
      currentID = (nonLoop[0] || outgoing[0])?.target || null;
      if (currentID && completedEdge && currentID === completedEdge.target) currentID = null;
    }
    return lastResult;
  }

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    if (idx > 0 && delayBetweenItems > 0) await sleep(delayBetweenItems);
    const iterContext = { ...context, [itemVariable]: item, [indexVariable]: idx, item, index: idx };
    let iterationResult;
    try {
      iterationResult = await executeBodyIteration(iterContext);
    } catch (iterErr) {
      if ((nodeConfig.errorHandling || ERROR_HANDLING.FAIL_WORKFLOW) === ERROR_HANDLING.FAIL_WORKFLOW) throw iterErr;
      iterationResult = { output: { success: false, error: iterErr.message }, nextHandle: 'error' };
    }
    let bodyValue;
    if (iterationResult?.output) {
      const out = iterationResult.output;
      const candidateKeys = Object.keys(out).filter((k) => !k.startsWith('__') && k !== 'success' && k !== 'error');
      if (candidateKeys.length === 1) bodyValue = out[candidateKeys[0]];
      else if (candidateKeys.length > 0) bodyValue = out;
      else bodyValue = out[outputVariable] ?? out;
    } else bodyValue = item;
    if (bodyValue === undefined) bodyValue = iterationResult?.output ?? item;
    loopResults.push(bodyValue);
  }

  context[outputVariable] = loopResults;
  context[`__node_${loopNode.id}`] = { output: { [outputVariable]: loopResults }, status: 'success' };
  await safeEmitProgress({
    instanceID, nodeID: loopNode.id, nodeType: 'loop', status: WORKFLOW_PROGRESS.SUCCESS,
    output: { [outputVariable]: loopResults, totalItems: items.length, success: true },
    contextData: { ...context }, outputVariable,
  });
  return { output: { [outputVariable]: loopResults, totalItems: items.length, success: true }, nextHandle: 'completed' };
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Workflow
// ──────────────────────────────────────────────────────────────────────────────

export async function dslInterpreterWorkflow({ nodes, edges, initialContext, instanceID, tenantID, workflowID, isTestRun = false, workflowOptions = {}, workflowConfig = {} }) {
  let context = { ...(initialContext || {}) };
  if (isTestRun) context.__isTestRun = true;

  // Per-workflow policy: explicit workflowConfig wins, raw workflowOptions
  // (same field names) fills gaps, platform defaults apply last (see policy).
  const wfConfig = { ...(workflowOptions || {}), ...(workflowConfig || {}) };

  const humanInputs = {};
  setHandler(submitHumanInputSignal, (payload) => {
    const nid = payload.nodeID || payload.nodeId;
    if (nid) humanInputs[nid] = payload.data ?? payload.submittedData ?? payload;
  });
  let cancelled = false;
  setHandler(cancelWorkflowSignal, () => { cancelled = true; });

  const { nodeMap, outgoingBySource, incomingByTarget } = buildGraphMaps(nodes, edges);
  // Any terminal failure escaping the graph walk below (deadlock, node error
  // with fail_workflow, loop bounds, collection timeout, cancellation) must
  // still be recorded + broadcast before the Temporal run fails — otherwise
  // the instance stays RUNNING forever and neither history nor the live
  // console ever learns what happened. The original error is always rethrown
  // to preserve Temporal failure semantics.
  try {
    const startNode = nodes.find((n) => n.type === 'start');
    if (!startNode) throw ApplicationFailure.nonRetryable('No start node found');

    const completed = new Set();
    let frontier = [startNode.id];
    const enqueued = new Set(frontier);
    const common = { instanceID, tenantID, workflowID, humanInputs, workflowConfig: wfConfig };

    while (frontier.length > 0) {
      if (cancelled) throw ApplicationFailure.nonRetryable('Workflow cancelled via signal');

      const readyNodes = [];
      const deferred = [];
      for (const nid of frontier) {
        if (completed.has(nid)) continue;
        if (isNodeReady(nid, incomingByTarget, completed, nodeMap)) readyNodes.push(nid);
        else deferred.push(nid);
      }
      if (readyNodes.length === 0) {
        // Name the stuck nodes and the upstreams they wait on so the error is
        // actionable in the run console (raw IDs alone say nothing).
        const label = (nid) => {
          const n = nodeMap.get(nid);
          return n ? `${n.type}:${(n.data && n.data.title) || nid}` : nid;
        };
        const waitingOn = [];
        for (const nid of frontier) {
          for (const e of incomingByTarget.get(nid) || []) {
            if (!completed.has(e.source) && !waitingOn.includes(e.source)) waitingOn.push(e.source);
          }
        }
        throw ApplicationFailure.nonRetryable(
          `Deadlock: [${frontier.map(label).join('; ')}] waiting on [${waitingOn.map(label).join('; ')}] ` +
          `which can never complete — exclusive branches converging on one node (use separate end nodes or run one path), or a cycle.`
        );
      }

      readyNodes.sort();
      const hasSuspensible = readyNodes.some((id) => ['dataCollection', 'approval', 'loop'].includes(nodeMap.get(id)?.type));
      let nextAdditions = [];

      if (hasSuspensible || readyNodes.length === 1) {
        for (const nid of readyNodes) {
          const node = nodeMap.get(nid);
          if (!node) { completed.add(nid); continue; }
          if (node.type === 'loop') {
            const loopResult = await executeLoopNode(node, context, common, { nodeMap, outgoingBySource, incomingByTarget });
            completed.add(nid);
            for (const e of getOutgoingEdges(nid, loopResult.nextHandle, outgoingBySource)) {
              if (!completed.has(e.target) && !nextAdditions.includes(e.target)) nextAdditions.push(e.target);
            }
          } else if (node.type === 'end') {
            const res = await executeNode(node, context, common);
            completed.add(nid);
            const finalStatus = res.output?.status === 'error' ? 'FAILED' : 'COMPLETED';
            await emitWorkflowCompletedActivity({ instanceID, finalStatus, contextData: { ...context }, workflowOutput: res.output?.workflowOutput || null });
            return { ...context, _workflowStatus: finalStatus, _workflowOutput: res.output?.workflowOutput || null };
          } else {
            const result = await executeNode(node, context, common);
            if (result?.__suspend) {
              const timeout = resolveHumanTimeout(node.data, wfConfig);
              await createDataCollectionRequestActivity({ instanceID, nodeID: nid, nodeAttempt: 1, collectionConfig: result.collectionConfig });
              const signalled = await condition(() => humanInputs[nid] !== undefined, timeout);
              if (!signalled) {
                const timeoutHandle = resolveSuspendTimeoutHandle(node);
                if (!timeoutHandle) {
                  await safeEmitProgress({ instanceID, nodeID: nid, nodeType: node.type, status: WORKFLOW_PROGRESS.FAILED, output: null, errorMessage: `${node.type === 'approval' ? 'Approval' : 'Data collection'} timeout`, contextData: { ...context }, outputVariable: result.outputVariable });
                  throw ApplicationFailure.nonRetryable(`Data collection timeout for node ${nid}`);
                }
                // Designed outcome (not an error): record the timeout output as a
                // COMPLETED row so it survives in assembled history/context, with
                // the expiry noted on the row for the timeline.
                const expiredData = node.type === 'approval'
                  ? { approved: false, expired: true, comment: '' }
                  : { expired: true };
                context[result.outputVariable] = expiredData;
                context[`__node_${nid}`] = { output: { [result.outputVariable]: expiredData }, status: 'success' };
                await safeEmitProgress({ instanceID, nodeID: nid, nodeType: node.type, status: WORKFLOW_PROGRESS.SUCCESS, output: { [result.outputVariable]: expiredData, success: true }, errorMessage: `${node.type === 'approval' ? 'Approval' : 'Data collection'} expired (timeout) — routed to '${timeoutHandle}'`, contextData: { ...context }, outputVariable: result.outputVariable });
                completed.add(nid);
                let timeoutOutgoing = getOutgoingEdges(nid, timeoutHandle, outgoingBySource);
                if (timeoutOutgoing.length === 0 && timeoutHandle !== 'default') timeoutOutgoing = getOutgoingEdges(nid, 'default', outgoingBySource);
                if (timeoutOutgoing.length === 0) {
                  throw ApplicationFailure.nonRetryable(`Data collection timeout for node ${nid} (no '${timeoutHandle}' edge connected)`);
                }
                for (const e of timeoutOutgoing) if (!completed.has(e.target) && !nextAdditions.includes(e.target)) nextAdditions.push(e.target);
              } else {
                const humanData = humanInputs[nid]; delete humanInputs[nid];
                let resumeData = humanData;
                let resumeHandle = 'output';
                if (node.type === 'approval') {
                  resumeData = normalizeApprovalDecision(humanData);
                  resumeHandle = resumeData.approved ? 'approved' : 'rejected';
                }
                context[result.outputVariable] = resumeData;
                context[`__node_${nid}`] = { output: { [result.outputVariable]: resumeData }, status: 'success' };
                await safeEmitProgress({ instanceID, nodeID: nid, nodeType: node.type, status: WORKFLOW_PROGRESS.SUCCESS, output: { [result.outputVariable]: resumeData, success: true }, contextData: { ...context }, outputVariable: result.outputVariable });
                completed.add(nid);
                let resumeOutgoing = getOutgoingEdges(nid, resumeHandle, outgoingBySource);
                if (resumeOutgoing.length === 0 && resumeHandle !== 'output') resumeOutgoing = getOutgoingEdges(nid, 'output', outgoingBySource);
                for (const e of resumeOutgoing) if (!completed.has(e.target) && !nextAdditions.includes(e.target)) nextAdditions.push(e.target);
              }
            } else if (result?.__fanout && Array.isArray(result.handles)) {
              completed.add(nid);
              for (const h of result.handles) {
                for (const e of getOutgoingEdges(nid, h, outgoingBySource)) {
                  if (!completed.has(e.target) && !nextAdditions.includes(e.target) && !enqueued.has(e.target)) {
                    nextAdditions.push(e.target); enqueued.add(e.target);
                  } else if (!completed.has(e.target) && !frontier.includes(e.target) && !nextAdditions.includes(e.target)) {
                    nextAdditions.push(e.target);
                  }
                }
              }
            } else {
              completed.add(nid);
              let nextHandle = result?.nextHandle || 'output';
              let outgoing = getOutgoingEdges(nid, nextHandle, outgoingBySource);
              if (outgoing.length === 0 && (node.type === 'condition' || node.type === 'switch')) outgoing = getOutgoingEdges(nid, 'default', outgoingBySource);
              if (outgoing.length === 0 && nextHandle !== 'output' && nextHandle !== 'error') {
                const fb = getOutgoingEdges(nid, 'output', outgoingBySource);
                if (fb.length > 0) outgoing = fb;
              }
              for (const e of outgoing) {
                if (!completed.has(e.target) && !nextAdditions.includes(e.target) && !enqueued.has(e.target)) {
                  nextAdditions.push(e.target); enqueued.add(e.target);
                } else if (!completed.has(e.target) && !frontier.includes(e.target) && !nextAdditions.includes(e.target)) {
                  nextAdditions.push(e.target);
                }
              }
            }
          }
        }
      } else {
        // Sequential deterministic execution (NOT Promise.all): executeNode /
        // executeLoopNode mutate the shared `context` via mergeOutputIntoContext.
        // Concurrent mutation would race and break Temporal replay determinism.
        // readyNodes is sorted above, so replay order is stable.
        const parallelResults = [];
        for (const nid of readyNodes) {
          const node = nodeMap.get(nid);
          if (!node) { parallelResults.push({ nid, result: null, node }); continue; }
          if (node.type === 'loop') {
            parallelResults.push({ nid, result: await executeLoopNode(node, context, common, { nodeMap, outgoingBySource, incomingByTarget }), node });
          } else {
            parallelResults.push({ nid, result: await executeNode(node, context, common), node });
          }
        }
        for (const { nid, result, node } of parallelResults) {
          completed.add(nid);
          if (node.type === 'end') {
            const finalStatus = result?.output?.status === 'error' ? 'FAILED' : 'COMPLETED';
            await emitWorkflowCompletedActivity({ instanceID, finalStatus, contextData: { ...context }, workflowOutput: result?.output?.workflowOutput || null });
            return { ...context, _workflowStatus: finalStatus, _workflowOutput: result?.output?.workflowOutput || null };
          }
          if (result?.__fanout && Array.isArray(result.handles)) {
            for (const h of result.handles) {
              for (const e of getOutgoingEdges(nid, h, outgoingBySource)) {
                if (!completed.has(e.target) && !nextAdditions.includes(e.target) && !enqueued.has(e.target)) { nextAdditions.push(e.target); enqueued.add(e.target); }
              }
            }
            continue;
          }
          let nextHandle = result?.nextHandle || 'output';
          let outgoing = getOutgoingEdges(nid, nextHandle, outgoingBySource);
          if (outgoing.length === 0 && (node.type === 'condition' || node.type === 'switch')) outgoing = getOutgoingEdges(nid, 'default', outgoingBySource);
          for (const e of outgoing) if (!completed.has(e.target) && !nextAdditions.includes(e.target) && !enqueued.has(e.target)) { nextAdditions.push(e.target); enqueued.add(e.target); }
        }
      }

      const newFrontier = [...deferred];
      for (const nid of nextAdditions) if (!newFrontier.includes(nid) && !completed.has(nid)) newFrontier.push(nid);
      frontier = newFrontier;
      if (frontier.length === 0) {
        const endNode = nodes.find((n) => n.type === 'end');
        if (endNode && !completed.has(endNode.id)) {
          await emitWorkflowCompletedActivity({ instanceID, finalStatus: 'COMPLETED', contextData: { ...context }, workflowOutput: null });
        }
        break;
      }
    }
  } catch (err) {
    const message = err?.message || String(err);
    const isCancel =
      cancelled ||
      err?.name === 'CancelledFailure' ||
      /cancelled via signal/i.test(message);
    try {
      // nonCancellable: when the failure IS a Temporal cancellation, the
      // cancelled scope would otherwise reject this activity immediately and
      // the run would again end with no status update.
      await CancellationScope.nonCancellable(() =>
        emitWorkflowCompletedActivity({
          instanceID,
          finalStatus: isCancel ? 'CANCELLED' : 'FAILED',
          contextData: { ...context },
          workflowOutput: null,
          errorMessage: message,
        })
      );
    } catch (_) {
      // Best effort only — never mask the original failure.
    }
    throw err;
  }
  try { await emitWorkflowCompletedActivity({ instanceID, finalStatus: 'COMPLETED', contextData: { ...context }, workflowOutput: context.output || null }); } catch (_) {}
  return context;
}
