/**
 * Application Startup — Listener Bootstrap
 * Initializes all long-running listeners across modules.
 * Called once from index.js on server start.
 */
const { initializeQueue, closeQueue } = require('./queue.config');
const Logger = require('../utils/logger');
const environmentVariables = require('../environment');

let temporalEnsureStopped = false;

function ensureTemporalWorkerInBackground() {
  if (temporalEnsureStopped) return;
  let workerModule;
  try {
    workerModule = require('../modules/workflow/temporal/worker');
  } catch (err) {
    return;
  }
  if (workerModule.isWorkerStarted && workerModule.isWorkerStarted()) return;
  workerModule.startTemporalWorkerWithRetry({ maxAttempts: 0 }).catch(() => {});
}

/**
 * Start all application listeners
 * Temporal worker failure never aborts the rest of startup — it retries
 * in the background so API stays up and picks up the worker once
 * Temporal becomes reachable (fixes stuck RUNNING workflows when
 * backend boots before `temporal:7233`).
 */
async function startAllListeners() {
  Logger.log('info', { message: 'startup:startAllListeners:init' });

  try {
    // Temporal workflow driver — graceful if SDK not installed (allows tenant onboarding)
    await initializeQueue();
    try {
      const { startTemporalWorker } = require('../modules/workflow/temporal/worker');
      await startTemporalWorker();
    } catch (workerErr) {
      if (workerErr.code === 'MODULE_NOT_FOUND' || /Cannot find module '@temporalio\//.test(workerErr.message)) {
        Logger.log('warning', { message: 'startup:temporalWorkerSkipped:sdk_not_installed', params: { error: workerErr.message, hint: 'npm install @temporalio/worker in apps/backend or run npm install at repo root' } });
      } else {
        Logger.log('warning', { message: 'startup:temporalWorkerDeferred', params: { error: workerErr.message, hint: 'Temporal not reachable yet — retrying in background; workflows stay RUNNING until worker connects' } });
        temporalEnsureStopped = false;
        ensureTemporalWorkerInBackground();
      }
    }

    // Mark RUNNING workflow instances with no heartbeat as FAILED so the UI
    // doesn't show them as running forever after a crash/restart.
    // Best-effort: never blocks startup.
    try {
      const { stateManager } = require('../modules/workflow/workflowEngine/stateManager');
      const staleAfterMs = Number(environmentVariables.WORKFLOW_STALE_AFTER_MS || 5 * 60 * 1000);
      const stale = await stateManager.getStaleRunningInstances({ staleAfterMs });
      if (stale.length > 0) {
        await stateManager.markInstancesAsRecovered(stale.map((i) => i.instanceID));
        Logger.log('warning', { message: 'startup:workflows:recoveredStale', params: { count: stale.length } });
      }
    } catch (recoveryErr) {
      Logger.log('warning', { message: 'startup:workflows:recoverySkipped', params: { error: recoveryErr.message } });
    }

    // 4. Listener pipeline worker (processes listener events from queue)
    const { startPipelineWorker } = require('../modules/listener/listenerEngine/pipelineWorker');
    await startPipelineWorker();

    // 5. Listener engine (bootstraps all active listeners & shared webhook ingress server)
    const { listenerEngine } = require('../modules/listener/listenerEngine/engine');
    await listenerEngine.startAll();

    // 6. Audit log flusher (buffers and batch-saves audit logs)
    const { auditService } = require('../modules/audit/audit.service');
    auditService.startFlusher();

    Logger.log('success', { message: 'startup:startAllListeners:done' });
  } catch (error) {
    Logger.log('error', { message: 'startup:startAllListeners:failed', params: { error: error.message } });
    throw error;
  }
}

/**
 * Stop all application listeners (graceful shutdown)
 */
async function stopAllListeners() {
  Logger.log('info', { message: 'startup:stopAllListeners:init' });
  temporalEnsureStopped = true;

  try {
    const { listenerEngine } = require('../modules/listener/listenerEngine/engine');
    await listenerEngine.stopAll();
  } catch (e) { /* ignore */ }

  try {
    const { auditService } = require('../modules/audit/audit.service');
    await auditService.stopFlusher();
  } catch (e) { /* ignore */ }

  try {
    const { stopTemporalWorker } = require('../modules/workflow/temporal/worker');
    await stopTemporalWorker();
    const { closeTemporalClient } = require('../modules/workflow/temporal/client');
    await closeTemporalClient();
  } catch (e) { /* ignore */ }

  await closeQueue();

  Logger.log('success', { message: 'startup:stopAllListeners:done' });
}

module.exports = { startAllListeners, stopAllListeners, ensureTemporalWorkerInBackground };
