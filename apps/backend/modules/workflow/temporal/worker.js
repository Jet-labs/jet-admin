/**
 * Temporal Worker Lifecycle
 * Bootstraps a Worker that hosts DSL Interpreter + activities.
 * Can run:
 *   1. In-process inside Express (dev) — startTemporalWorker() called from startup.js
 *   2. Sidecar via `node apps/backend/modules/workflow/temporal/worker.js` (recommended prod)
 *
 * Worker options:
 *  - taskQueue: jet-admin-workflows (see ./config TASK_QUEUE)
 *  - workflowsPath: ./workflows/dslWorkflow.js (file, not directory — Temporal bundles via esbuild)
 *  - activities: ./activities
 *  - concurrency via maxConcurrentActivityTaskExecutions etc.
 */
const { TASK_QUEUE, ADDRESS, NAMESPACE } = require('./config');
const Logger = require('../../../utils/logger');
const environmentVariables = require('../../../environment');

let workerInstance = null;
let isStarted = false;
let isStarting = false;
let shuttingDown = false;
let retryTimer = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isSdkMissingError(err) {
  return err && (err.code === 'MODULE_NOT_FOUND' || /Cannot find module '@temporalio\//.test(err.message || ''));
}

function isRetryableConnectError(err) {
  if (!err || isSdkMissingError(err)) return false;
  return /ECONNREFUSED|ENOTFOUND|10061|ConnectError|tonic|Failed to connect|deadline|ETIMEDOUT|ECONNRESET|temporar/i.test(err.message || String(err));
}

function getRetryConfig(overrides = {}) {
  const maxAttempts = overrides.maxAttempts ?? environmentVariables.TEMPORAL_WORKER_START_MAX_ATTEMPTS ?? 0;
  const baseDelayMs = overrides.baseDelayMs ?? environmentVariables.TEMPORAL_WORKER_START_BASE_DELAY_MS ?? 1000;
  const maxDelayMs = overrides.maxDelayMs ?? environmentVariables.TEMPORAL_WORKER_START_MAX_DELAY_MS ?? 30000;
  return { maxAttempts, baseDelayMs, maxDelayMs };
}

function computeBackoffDelay(attempt, baseDelayMs, maxDelayMs) {
  return Math.min(maxDelayMs, baseDelayMs * 2 ** Math.min(attempt, 6));
}

function cancelWorkerRetry() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
}

async function connectNative(NativeConnection) {
  const hasTLS = !!environmentVariables.TEMPORAL_TLS_CERT
    || !!environmentVariables.TEMPORAL_API_KEY
    || environmentVariables.TEMPORAL_TLS === 'true';
  if (hasTLS) {
    const fs = require('fs');
    const tls = {};
    if (environmentVariables.TEMPORAL_TLS_CERT) {
      tls.clientCertPair = {
        crt: fs.readFileSync(environmentVariables.TEMPORAL_TLS_CERT),
        key: fs.readFileSync(environmentVariables.TEMPORAL_TLS_KEY),
      };
    }
    if (environmentVariables.TEMPORAL_API_KEY) {
      tls.serverNameOverride = environmentVariables.TEMPORAL_TLS_SERVER_NAME;
    }
    return NativeConnection.connect({
      address: ADDRESS,
      tls: Object.keys(tls).length ? tls : undefined,
      apiKey: environmentVariables.TEMPORAL_API_KEY || undefined,
    });
  }
  return NativeConnection.connect({ address: ADDRESS });
}

function scheduleCrashRestart(err) {
  if (shuttingDown) return;
  if ((environmentVariables.TEMPORAL_WORKER_RESTART_ON_CRASH || 'true') !== 'true') return;
  if (retryTimer) return;
  const { baseDelayMs } = getRetryConfig();
  const delay = Math.min(baseDelayMs, 5000);
  Logger.log('warning', { message: 'temporal:worker:restart_scheduled', params: { error: err.message, retryInMs: delay } });
  retryTimer = setTimeout(() => {
    retryTimer = null;
    startTemporalWorkerWithRetry().catch(() => {});
  }, delay);
  if (retryTimer.unref) retryTimer.unref();
}

/**
 * Start Temporal Worker (Temporal-only)
 * Single attempt — use startTemporalWorkerWithRetry for resilient startup.
 */
async function startTemporalWorker() {
  if (isStarted && workerInstance) {
    Logger.log('info', { message: 'temporal:worker:already_started' });
    return workerInstance;
  }
  if (isStarting) {
    Logger.log('info', { message: 'temporal:worker:start_in_progress' });
    return workerInstance;
  }
  isStarting = true;
  shuttingDown = false;

  try {
    let Worker;
    let NativeConnection;
    try {
      ({ Worker, NativeConnection } = require('@temporalio/worker'));
    } catch (e) {
      Logger.log('error', {
        message: 'temporal:worker:sdk_not_installed',
        params: { error: e.message, hint: 'npm install @temporalio/worker in apps/backend' },
      });
      throw e;
    }

    Logger.log('info', { message: 'temporal:worker:starting', params: { taskQueue: TASK_QUEUE, address: ADDRESS, namespace: NAMESPACE } });

    const activities = require('./activities');
    const connection = await connectNative(NativeConnection);

    const workflowsPath = require.resolve('./workflows/dslWorkflow.js');

    const maxActivities = Number(environmentVariables.TEMPORAL_MAX_CONCURRENT_ACTIVITIES || 20);
    const maxWorkflows = Number(environmentVariables.TEMPORAL_MAX_CONCURRENT_WORKFLOWS || 20);
    workerInstance = await Worker.create({
      connection,
      namespace: NAMESPACE,
      taskQueue: TASK_QUEUE,
      workflowsPath,
      activities,
      maxConcurrentActivityTaskExecutions: Number.isFinite(maxActivities) ? maxActivities : 20,
      maxConcurrentWorkflowTaskExecutions: Number.isFinite(maxWorkflows) ? maxWorkflows : 20,
      enableSDKTracing: true,
    });

    workerInstance.run().catch((err) => {
      Logger.log('error', { message: 'temporal:worker:crashed', params: { error: err.message, stack: err.stack } });
      workerInstance = null;
      isStarted = false;
      scheduleCrashRestart(err);
    });

    isStarted = true;
    Logger.log('success', { message: 'temporal:worker:started', params: { taskQueue: TASK_QUEUE } });
    return workerInstance;
  } finally {
    isStarting = false;
  }
}

/**
 * Resilient startup — retries connection failures with exponential backoff.
 * maxAttempts 0 means retry indefinitely (sidecar / background ensure loop).
 */
async function startTemporalWorkerWithRetry(overrides = {}) {
  if (isStarted && workerInstance) return workerInstance;
  const { maxAttempts, baseDelayMs, maxDelayMs } = getRetryConfig(overrides);
  let attempt = 0;
  for (;;) {
    attempt += 1;
    try {
      cancelWorkerRetry();
      return await startTemporalWorker();
    } catch (err) {
      if (isSdkMissingError(err)) throw err;
      const retryable = isRetryableConnectError(err);
      const attemptsExhausted = maxAttempts > 0 && attempt >= maxAttempts;
      if (!retryable || attemptsExhausted) {
        Logger.log('error', { message: 'temporal:worker:start_failed', params: { error: err.message, attempt } });
        throw err;
      }
      const delay = computeBackoffDelay(attempt, baseDelayMs, maxDelayMs);
      Logger.log('warning', {
        message: 'temporal:worker:retry_scheduled',
        params: { error: err.message, attempt, maxAttempts: maxAttempts || 'unlimited', retryInMs: delay, address: ADDRESS },
      });
      await sleep(delay);
      if (shuttingDown) throw err;
    }
  }
}

/**
 * Graceful shutdown.
 */
async function stopTemporalWorker() {
  shuttingDown = true;
  cancelWorkerRetry();
  if (!workerInstance) {
    isStarted = false;
    return;
  }
  try {
    Logger.log('info', { message: 'temporal:worker:stopping' });
    workerInstance.shutdown();
  } catch (e) {
    Logger.log('warning', { message: 'temporal:worker:stop_failed', params: { error: e.message } });
  } finally {
    workerInstance = null;
    isStarted = false;
  }
}

function getWorker() {
  return workerInstance;
}

function isWorkerStarted() {
  return isStarted && !!workerInstance;
}

// Sidecar entrypoint: `node worker.js`
if (require.main === module) {
  (async () => {
    try {
      await startTemporalWorkerWithRetry({ maxAttempts: 0 });
      Logger.log('success', { message: 'temporal:worker:sidecar_running', params: { taskQueue: TASK_QUEUE } });
      process.on('SIGINT', async () => {
        await stopTemporalWorker();
        process.exit(0);
      });
      process.on('SIGTERM', async () => {
        await stopTemporalWorker();
        process.exit(0);
      });
    } catch (e) {
      Logger.log('error', { message: 'temporal:worker:sidecar_failed', params: { error: e.message } });
      process.exit(1);
    }
  })();
}

module.exports = {
  startTemporalWorker,
  startTemporalWorkerWithRetry,
  stopTemporalWorker,
  cancelWorkerRetry,
  getWorker,
  isWorkerStarted,
  isRetryableConnectError,
};
