/**
 * Workflow Test Executor
 *
 * Drives the full orchestrator → handler → orchestrator cycle in-process
 * without a real queue. Uses the same stateManager and dagScheduler as
 * production — only the transport (queue) and external I/O (DB, sockets)
 * are replaced.
 *
 * Two execution modes:
 *   sequential — one job at a time; deterministic, good for correctness tests
 *   parallel   — batch of concurrent jobs; surfaces race conditions on join nodes
 *
 * Fix: drainJobsFor(instanceID) replaces the global drainJobs() for all
 * per-instance runners. The flat drainJobs() is kept only for single-instance
 * tests that call it directly.
 *
 * Root cause of the stall bug:
 *   runConcurrentInstances launches N instances with Promise.all. Every
 *   launcher() pushes a start job into the shared pendingJobs array. Each
 *   instance's runner then called drainJobs() which returned ALL pending jobs
 *   regardless of instanceID — so instance-1's runner stole instance-2's start
 *   job, and instance-2 stalled with an empty queue.
 */

const { handleTaskResult } = require('../../modules/workflow/orchestrator/orchestrator');
const { getHandler } = require('../../modules/workflow/workers/handlers');
const { resolveTemplate } = require('../../utils/templateEngine');
const { stateManager } = require('../../modules/workflow/orchestrator/stateManager');

const TEMPLATE_OPTIONS = { allowedRoots: ['ctx'], preserveSingleExpressionType: true };

// ─── Pending job queue (populated by the mocked addNodeJob) ──────────────────
const pendingJobs = require('./pendingJobs');

/** Drain ALL pending jobs (used by single-instance tests). */
function drainJobs() {
  return pendingJobs.splice(0, pendingJobs.length);
}

/**
 * Drain only the jobs belonging to a specific instance.
 * Removes matched jobs in-place and returns them. Jobs for other instances
 * remain in the array for their own runners to pick up.
 */
function drainJobsFor(instanceID) {
  const mine = [];
  let i = 0;
  while (i < pendingJobs.length) {
    if (pendingJobs[i].instanceID === instanceID) {
      mine.push(...pendingJobs.splice(i, 1));
    } else {
      i++;
    }
  }
  return mine;
}

// ─── Core execution helpers ───────────────────────────────────────────────────

function makeHelpers(job) {
  return {
    instanceID: job.instanceID,
    nodeID: job.nodeID,
    workflowID: job.workflowID,
    resolveTemplate: (template, meta = {}) =>
      resolveTemplate(template, job.context, TEMPLATE_OPTIONS, {
        module: 'workflow-stress-test',
        ...meta,
      }),
  };
}

async function executeJob(job) {
  const handler = getHandler(job.nodeType);

  let context = job.context;

  // For join nodes, refetch fresh context from assembled log (mirrors taskWorker fix)
  if (!job.isTestRun && job.instanceID && job.isJoinNode) {
    context = await stateManager.assembleContext(job.instanceID);
  }

  try {
    const result = await handler.execute(job.nodeConfig, context, makeHelpers({ ...job, context }));

    await handleTaskResult({
      instanceID: job.instanceID,
      nodeID: job.nodeID,
      nodeType: job.nodeType,
      outputVariable: job.nodeConfig?.outputVariable,
      status: 'success',
      output: result.output,
      nextHandle: result.nextHandle ?? 'output',
      queueDelay: 0,
      taskError: null,
    });
  } catch (err) {
    await handleTaskResult({
      instanceID: job.instanceID,
      nodeID: job.nodeID,
      nodeType: job.nodeType,
      outputVariable: job.nodeConfig?.outputVariable,
      status: 'error',
      output: null,
      nextHandle: 'error',
      queueDelay: 0,
      taskError: err.message,
    });
  }
}

// ─── Public executor API ──────────────────────────────────────────────────────

/**
 * Run a workflow to completion, processing jobs one at a time.
 * Deterministic — no race conditions possible.
 *
 * @param {string} instanceID
 * @param {{ store, maxSteps?: number }} opts
 * @returns {Promise<{ instance, stats }>}
 */
async function runSequential(instanceID, { store, maxSteps = 200 } = {}) {
  const stats = { steps: 0, nodeExecutions: [] };
  const startTime = Date.now();

  for (let i = 0; i < maxSteps; i++) {
    const instance = store.getInstance(instanceID);
    if (isTerminal(instance?.status)) break;

    // Use instance-scoped drain so concurrent runners don't steal each other's jobs
    const jobs = drainJobsFor(instanceID);
    if (jobs.length === 0) {
      throw new Error(`Workflow ${instanceID} stalled at step ${i} — no pending jobs, status: ${instance?.status}`);
    }

    for (const job of jobs) {
      stats.steps++;
      stats.nodeExecutions.push({ nodeID: job.nodeID, nodeType: job.nodeType });
      await executeJob(job);
    }
  }

  const instance = store.getInstance(instanceID);
  stats.durationMs = Date.now() - startTime;
  return { instance, stats };
}

/**
 * Run a workflow to completion, processing each batch of jobs concurrently.
 * Surfaces join-node race conditions — use for concurrency correctness tests.
 *
 * @param {string} instanceID
 * @param {{ store, maxRounds?: number }} opts
 * @returns {Promise<{ instance, stats }>}
 */
async function runParallel(instanceID, { store, maxRounds = 100 } = {}) {
  const stats = { rounds: 0, nodeExecutions: [] };
  const startTime = Date.now();

  for (let round = 0; round < maxRounds; round++) {
    const instance = store.getInstance(instanceID);
    if (isTerminal(instance?.status)) break;

    // Use instance-scoped drain so concurrent runners don't steal each other's jobs
    const batch = drainJobsFor(instanceID);
    if (batch.length === 0) {
      throw new Error(`Workflow ${instanceID} stalled at round ${round}`);
    }

    stats.rounds++;
    batch.forEach(j => stats.nodeExecutions.push({ nodeID: j.nodeID, nodeType: j.nodeType }));

    // Process entire batch truly concurrently — this is what surfaces the
    // double-dispatch race condition on join nodes
    await Promise.all(batch.map(job => executeJob(job)));
  }

  const instance = store.getInstance(instanceID);
  stats.durationMs = Date.now() - startTime;
  return { instance, stats };
}

/**
 * Run N instances of the same workflow concurrently.
 *
 * Each instance gets its own runner that only drains its own jobs, so
 * instances can no longer starve each other via the shared pendingJobs array.
 *
 * @param {Function} launcher  — async () => instanceID
 * @param {number}   count
 * @param {{ store, mode?: 'sequential'|'parallel', maxSteps?: number }}
 * @returns {Promise<Array<{ instance, stats }>>}
 */
async function runConcurrentInstances(launcher, count, { store, mode = 'parallel', maxSteps = 200 } = {}) {
  const run = mode === 'parallel' ? runParallel : runSequential;

  const results = await Promise.all(
    Array.from({ length: count }, async () => {
      const instanceID = await launcher();
      return run(instanceID, { store, maxSteps });
    })
  );

  return results;
}

function isTerminal(status) {
  return ['COMPLETED', 'FAILED', 'CANCELLED'].includes(status);
}

module.exports = { pendingJobs, drainJobs, drainJobsFor, runSequential, runParallel, runConcurrentInstances, isTerminal };