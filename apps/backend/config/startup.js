/**
 * Application Startup — Listener Bootstrap
 * Initializes all long-running listeners across modules.
 * Called once from index.js on server start.
 */
const { initializeQueue, closeQueue } = require('./queue.config');
const Logger = require('../utils/logger');
const environmentVariables = require('../environment');

let temporalEnsureStopped = false;

// Second failover trigger for proxy placement (the first is each proxy's
// own watch loop): periodically reconcile desired vs stored assignment so
// dead proxies' shards migrate and drift heals even if every proxy missed
// its tick. Idempotent — a converged state performs reads only.
const PROXY_SWEEP_INTERVAL_MS = 30 * 1000;
let proxySweepTimer = null;

async function sweepProxyPlacements() {
  try {
    // eslint-disable-next-line global-require
    const registry = require('../modules/proxyRegistry/proxyRegistry.service');
    // eslint-disable-next-line global-require
    const { prisma } = require('./prisma.config');
    const { moved, version, proxies } = await registry.reconcileAndAnnounce({
      fetchActiveIDs: async () => (
        await prisma.tblListeners.findMany({
          where: { status: 'active' },
          select: { listenerID: true },
        })
      ).map((r) => r.listenerID).filter(Boolean),
    });
    if (moved > 0) {
      Logger.log('info', { message: 'startup:proxySweep:rebalanced', params: { moved, version, proxies } });
    }
  } catch (err) {
    Logger.log('warning', { message: 'startup:proxySweep:skipped', params: { error: err.message } });
  }
}

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

    // 4. Listener pipeline worker — consumes raw envelopes from the Redis
    //    Streams consumer group and dispatches actions.
    const { startPipelineWorker } = require('../modules/listener/listenerEngine/pipelineWorker');
    await startPipelineWorker();

    // 5. Listener ingress (subscriptions + webhook handlers) is owned by the
    //    standalone listener-proxy app — this backend only consumes +
    //    dispatches and must NOT subscribe (that would double-publish).
    Logger.log('info', { message: 'startup:listenerIngress:proxy (subscriptions owned by listener-proxy)' });

    // 6. Proxy placement sweeper (see above) — first pass now, then interval.
    await sweepProxyPlacements();
    proxySweepTimer = setInterval(() => {
      sweepProxyPlacements().catch(() => { /* never throws, belt-and-braces */ });
    }, PROXY_SWEEP_INTERVAL_MS);
    if (typeof proxySweepTimer.unref === 'function') proxySweepTimer.unref();

    // 7. Audit log flusher (buffers and batch-saves audit logs)
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

  // No ingress to stop here — subscriptions live in the listener-proxy node.

  try {
    if (proxySweepTimer) clearInterval(proxySweepTimer);
  } catch (e) { /* ignore */ }
  proxySweepTimer = null;

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
