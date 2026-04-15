/**
 * Task Listener
 * Consumes node execution jobs from the queue, runs the appropriate handler,
 * and reports results back to the workflow engine via the results queue.
 *
 * Key improvements vs previous version:
 *  - Context is only refetched from DB when the job is tagged as a join node
 *    (i.e., it has multiple incoming edges). Sequential nodes already carry
 *    the latest context in their job payload — no extra DB read needed.
 *  - A per-node execution timeout (default: 30s for most nodes, configurable
 *    via nodeConfig.timeoutSeconds) wraps every handler.execute() call.
 *  - registerTaskWorker is now awaited (pg-boss is async).
 */

const { registerTaskWorker, addResult, addNodeJob } = require("../../../config/queue.config");
const { getHandler } = require('../handlers');
const { resolveTemplate: sharedResolveTemplate } = require("../../../utils/templateEngine");
const { stateManager } = require('../workflowEngine/stateManager');
const Logger = require("../../../utils/logger");

const WORKFLOW_TEMPLATE_OPTIONS = {
  allowedRoots: ['ctx'],
  preserveSingleExpressionType: true,
};

// Default timeout applied to every node unless nodeConfig overrides it
const DEFAULT_NODE_TIMEOUT_MS = 30_000;

// ─── Startup ──────────────────────────────────────────────────────────────────

/**
 * Register the task worker with the queue.
 * Must be awaited — pg-boss.work() returns a Promise.
 */
async function startTaskListener() {
  Logger.log('info', { message: 'taskListener:starting' });

  await registerTaskWorker(async (jobData) => {
    await _processJob(jobData);
  });

  Logger.log('success', { message: 'taskListener:started' });
}

// ─── Job processor ────────────────────────────────────────────────────────────

async function _processJob(jobData) {
  const {
    instanceID,
    nodeID,
    nodeType,
    nodeConfig,
    context,
    workflowID,
    attempts = 0,
    maxAttempts = 3,
    isTestRun = false,
    isJoinNode = false,  // ← set by orchestrator/dagScheduler
  } = jobData;

  Logger.log('info', {
    message: 'taskWorker:processing',
    params: { instanceID, nodeID, nodeType, attempt: attempts + 1, isJoinNode },
  });

  try {
    // ── Context freshness ──────────────────────────────────────────────────
    // For join nodes: parallel branches may have written to contextData after
    // this job was queued. We must refetch to guarantee we see all upstream
    // outputs before executing the join's handler.
    //
    // For sequential nodes (isJoinNode === false): the job payload context is
    // always complete — there's only one writer — so we skip the extra query.
    let currentContext = context;

    // taskWorker.js — join node context refresh
    if (!isTestRun && instanceID && isJoinNode) {
      // assembleContext folds NODE_COMPLETED + INPUT_SET + SYSTEM_SET log rows
      // getInstance() no longer carries contextData — that column was removed
      currentContext = await stateManager.assembleContext(instanceID);
      Logger.log('info', { message: 'taskWorker:contextRefetchedForJoinNode', params: { instanceID, nodeID } });
    }

    // ── Handler lookup ─────────────────────────────────────────────────────
    const handler = getHandler(nodeType);

    const timeoutMs = (nodeConfig?.timeoutSeconds ?? DEFAULT_NODE_TIMEOUT_MS / 1000) * 1000;

    // ── In _processJob, replace the handler.execute() call block ─────────────

    const result = await _withTimeout(
      handler.execute(nodeConfig, currentContext, {
        instanceID,
        nodeID,
        workflowID,
        nodeAttempt: attempts + 1,      // ← ADD: lets dataCollectionHandler store it
        resolveTemplate: (template, meta = {}) =>
          sharedResolveTemplate(template, currentContext, WORKFLOW_TEMPLATE_OPTIONS, {
            module: 'workflow',
            instanceID,
            workflowID,
            nodeID,
            ...meta,
          }),
      }),
      timeoutMs,
      `Node ${nodeID} (${nodeType}) timed out after ${timeoutMs}ms`
    );

    // ── Report result ──────────────────────────────────────────────────────
    // 'suspended' is a third outcome alongside 'success' and 'error'.
    // The orchestrator owns creating the DB record and emitting the socket.
    if (result.suspended) {
      await addResult({
        instanceID,
        nodeID,
        nodeType,
        outputVariable: nodeConfig?.outputVariable,
        status: 'suspended',
        output: result.output,   // contains the full collectionConfig
        nextHandle: result.nextHandle ?? 'output',
        queueDelay: 0,
        nodeAttempt: attempts + 1,
      });
    } else {
      await addResult({
        instanceID,
        nodeID,
        nodeType,
        outputVariable: nodeConfig?.outputVariable,
        status: 'success',
        output: result.output,
        nextHandle: result.nextHandle ?? 'output',
        queueDelay: result.queueDelay ?? 0,
        nodeAttempt: attempts + 1,
      });
    }

    Logger.log('success', { message: 'taskWorker:completed', params: { instanceID, nodeID, nodeType } });
  } catch (execError) {
    Logger.log('error', {
      message: 'taskWorker:failed',
      params: { instanceID, nodeID, nodeType, error: execError.message, attempt: attempts + 1 },
    });

    if (attempts + 1 < maxAttempts) {
      // Exponential backoff retry
      const delayMs = Math.pow(2, attempts) * 1000;

      Logger.log('info', {
        message: 'taskWorker:retrying',
        params: { instanceID, nodeID, delayMs, nextAttempt: attempts + 2 },
      });

      await addNodeJob(
        { ...jobData, attempts: attempts + 1 },
        { delay: delayMs }
      );
    } else {
      // Max retries exhausted — report error to orchestrator
      await addResult({
        instanceID,
        nodeID,
        nodeType,
        status: 'error',
        output: null,
        nextHandle: 'error',
        taskError: execError.message,
        nodeAttempt: attempts + 1,  // ← ADDED: records which attempt finally failed
      });
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Race a promise against a timeout.
 *
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @param {string} [message]
 * @returns {Promise<T>}
 */
function _withTimeout(promise, ms, message = `Operation timed out after ${ms}ms`) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

module.exports = { startTaskListener };