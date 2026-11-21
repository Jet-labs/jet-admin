/**
 * CronJobEngine
 * Core lifecycle: scheduling, unscheduling, running cron jobs.
 * Extracted from cronJob.service.js.
 */
const cron = require("node-cron");
const Logger = require("../../../utils/logger");
const { prisma } = require("../../../config/prisma.config");
const { workflowService } = require("../../workflow/workflow.service");
const constants = require("../../../constants");
const { resolveInputs, extractWorkflowDefinitions } = require("../../../utils/input.util");
const { createSystemContext, ORIGIN_TYPES } = require("../../../utils/executionContext");
const { authorizedExecuteWorkflow } = require("../../../utils/authorizedProxy");
const { withTimeout } = require("../../../utils/async.util");
const { isRedisEnabled, getRedisClient } = require("../../../config/redis.config");
const crypto = require("crypto");

const CRON_LOCK_PREFIX = "cron:lock:";
const CRON_LOCK_ACQUIRE_TIMEOUT_MS = 3000;
const CRON_CANCEL_GRACE_MS = 30 * 1000;

/** Best-effort next occurrence. Never fabricate a value when the parser is absent. */
function computeNextRunAt(expression, from = new Date()) {
  try {
    // eslint-disable-next-line global-require
    const { CronExpressionParser } = require("cron-parser");
    for (let offset = 0; offset < 2; offset += 1) {
      const result = CronExpressionParser.parse(expression, {
        currentDate: new Date(from.getTime() + offset),
      }).next();
      if (result.toDate() > from) return result.toDate();
    }
    return null;
  } catch (_) {
    return null;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CronJobEngine {
  constructor() {
    this.scheduledJobs = {};
    this.scheduleFingerprints = {};
    // Per-process overlap guard. The Redis lock below prevents duplicates
    // across replicas; this prevents a slow job from overlapping itself in
    // the same process.
    this.runningJobs = new Set();
  }

  async _acquireDistributedLock(cronJob) {
    if (!isRedisEnabled()) {
      // Local/single-process development: no distributed lock available.
      return { acquired: true, degraded: true, release: async () => {} };
    }

    // The lock client must not queue commands while Redis is down: a delayed
    // SET after the caller has already given up would leave a phantom lock.
    const client = getRedisClient("cron-lock", {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });
    const key = `${CRON_LOCK_PREFIX}${cronJob.cronJobID}`;
    const token = crypto.randomUUID();
    const ttlSeconds = Math.max(
      60,
      Number(cronJob.timeoutSeconds) > 0 ? Number(cronJob.timeoutSeconds) : 300
    ) + 60;

    try {
      let lastError = null;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          // A freshly created client can still be connecting on the first
          // scheduled tick. Retry briefly before deciding the lock is
          // unavailable.
          // eslint-disable-next-line no-await-in-loop
          const result = await withTimeout(
            client.set(key, token, "PX", ttlSeconds * 1000, "NX"),
            CRON_LOCK_ACQUIRE_TIMEOUT_MS,
            "Cron lock acquisition timed out"
          );

          if (result !== "OK") {
            return { acquired: false, degraded: false, release: async () => {} };
          }

          return {
            acquired: true,
            degraded: false,
            release: async () => {
              try {
                await withTimeout(
                  client.eval(
                    'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end',
                    1,
                    key,
                    token
                  ),
                  CRON_LOCK_ACQUIRE_TIMEOUT_MS,
                  "Cron lock release timed out"
                );
              } catch (error) {
                Logger.log("warning", {
                  message: "CronJobEngine:runCronJob:lockReleaseFailed",
                  params: { cronJobID: cronJob.cronJobID, error: error.message },
                });
              }
            },
          };
        } catch (error) {
          lastError = error;
          if (attempt < 2) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }
      throw lastError;
    } catch (error) {
      // Redis is configured but unreachable. Fail closed by default so a
      // Redis outage cannot silently create duplicate scheduled runs across
      // replicas. Operators can opt into the legacy fail-open behavior with
      // CRON_LOCK_FAIL_OPEN=true.
      Logger.log("warning", {
        message: "CronJobEngine:runCronJob:lockUnavailable",
        params: { cronJobID: cronJob.cronJobID, error: error.message },
      });
      if (String(process.env.CRON_LOCK_FAIL_OPEN || "").toLowerCase() === "true") {
        return { acquired: true, degraded: true, release: async () => {} };
      }
      return { acquired: false, degraded: true, error: error.message, release: async () => {} };
    }
  }

  async _waitForWorkflowCompletion(instanceID, timeoutMs) {
    const terminal = new Set([
      constants.WORKFLOW_STATUS.COMPLETED,
      constants.WORKFLOW_STATUS.FAILED,
      constants.WORKFLOW_STATUS.CANCELLED,
    ]);
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      // eslint-disable-next-line no-await-in-loop
      const instance = await prisma.tblWorkflowInstances.findUnique({
        where: { instanceID },
        select: { status: true, completedAt: true },
      });
      if (!instance) {
        return { status: constants.WORKFLOW_STATUS.FAILED, error: "Workflow instance not found" };
      }
      if (terminal.has(instance.status)) {
        return { status: instance.status, completedAt: instance.completedAt };
      }
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return { status: "TIMEOUT" };
  }

  /**
   * Claim one scheduled occurrence. The lock is not an occurrence ledger:
   * released after a fast run, two replicas can both run a later tick. This
   * CAS makes (cronJobID, scheduledFor) exactly one claim, even when the
   * replicas' wall clocks differ by a fraction of a second.
   */
  async _claimOccurrence(cronJob, scheduledFor) {
    const occurrence = new Date(Math.floor(new Date(scheduledFor).getTime() / 1000) * 1000);
    const claimed = await prisma.tblCronJobs.updateMany({
      where: {
        cronJobID: cronJob.cronJobID,
        OR: [{ lastScheduledAt: null }, { lastScheduledAt: { lt: occurrence } }],
      },
      data: {
        lastScheduledAt: occurrence,
        nextRunAt: computeNextRunAt(cronJob.cronJobSchedule, occurrence),
      },
    });
    return claimed?.count === 1;
  }

  async runCronJob({ cronJob, triggerType = "SCHEDULED", scheduledFor = null }) {
    Logger.log("info", { message: "CronJobEngine:runCronJob", params: { cronJobID: cronJob.cronJobID, triggerType } });

    if (this.runningJobs.has(cronJob.cronJobID)) {
      Logger.log("warning", {
        message: "CronJobEngine:runCronJob:skippedAlreadyRunning",
        params: { cronJobID: cronJob.cronJobID },
      });
      return false;
    }

    this.runningJobs.add(cronJob.cronJobID);
    const lock = await this._acquireDistributedLock(cronJob);
    if (!lock.acquired) {
      this.runningJobs.delete(cronJob.cronJobID);
      Logger.log("info", {
        message: "CronJobEngine:runCronJob:skippedLocked",
        params: { cronJobID: cronJob.cronJobID },
      });
      return false;
    }

    const startTime = new Date();
    try {
      if (triggerType === "SCHEDULED" && scheduledFor) {
        if (!await this._claimOccurrence(cronJob, scheduledFor)) {
          Logger.log("info", { message: "CronJobEngine:runCronJob:occurrenceAlreadyClaimed", params: { cronJobID: cronJob.cronJobID, scheduledFor } });
          return false;
        }
      }

      const rawInputValues = cronJob.workflowConfig?.inputValues || {};
      let inputDefinitions = [];
      if (cronJob.tblWorkflows) {
        inputDefinitions = extractWorkflowDefinitions(cronJob.tblWorkflows);
      }
      const { resolved, errors, valid } = await resolveInputs({
        type: 'cron',
        id: !cronJob.tblWorkflows ? cronJob.cronJobID : undefined,
        inputDefinitions: inputDefinitions.length > 0 ? inputDefinitions : undefined,
        inputValues: rawInputValues,
      });

      if (!valid) {
        throw new Error(`Cron job input validation failed: ${JSON.stringify(errors)}`);
      }

      const maxAttempts = Math.max(0, Number(cronJob.retryAttempts) || 0) + 1;
      const retryDelayMs = Math.max(0, Number(cronJob.retryDelaySeconds) || 0) * 1000;
      const waitTimeoutSeconds = Number(cronJob.timeoutSeconds) > 0
        ? Number(cronJob.timeoutSeconds)
        : 300;
      const attempts = [];
      let workflowRunResult = null;
      let finalState = { status: "FAILED", error: "Workflow was not started" };

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        // A fresh attempt creates a distinct instance. Occurrence claiming is
        // outside this loop so retries never produce a second cron history row.
        workflowRunResult = await authorizedExecuteWorkflow({
          workflowID: cronJob.workflowID,
          tenantID: cronJob.tenantID,
          inputValues: resolved,
          executionCtx: createSystemContext(ORIGIN_TYPES.CRON, cronJob.cronJobID, cronJob.tenantID),
        });
        const instanceID = workflowRunResult?.instanceID;
        finalState = instanceID
          ? await this._waitForWorkflowCompletion(instanceID, waitTimeoutSeconds * 1000)
          : { status: "FAILED", error: "Workflow did not return an instanceID" };

        if (finalState.status === "TIMEOUT" && instanceID) {
          // An observation timeout is not proof the workflow stopped. Request
          // cancellation and keep the overlap lock until it is terminal or the
          // grace period expires; never release while a timed-out run may run.
          const { cancelWorkflow } = require("../../workflow/temporal/service");
          await cancelWorkflow({ instanceID }).catch((error) => {
            Logger.log("warning", { message: "CronJobEngine:runCronJob:cancelFailed", params: { cronJobID: cronJob.cronJobID, instanceID, error: error.message } });
          });
          const afterCancel = await this._waitForWorkflowCompletion(instanceID, CRON_CANCEL_GRACE_MS);
          finalState = { ...finalState, cancellationRequested: true, statusAfterCancel: afterCancel.status };
          attempts.push({ attempt, instanceID, status: "TIMEOUT", statusAfterCancel: afterCancel.status });
          break; // do not start a retry while the timed-out run may still be alive
        }

        attempts.push({ attempt, instanceID, status: finalState.status });
        if (finalState.status === constants.WORKFLOW_STATUS.COMPLETED) break;
        if (attempt < maxAttempts && retryDelayMs > 0) await sleep(retryDelayMs);
      }

      const succeeded = finalState.status === constants.WORKFLOW_STATUS.COMPLETED;
      const endTime = new Date();

      await prisma.tblCronJobHistory.create({
        data: {
          cronJobID: cronJob.cronJobID,
          result: JSON.stringify({
            ...(workflowRunResult || {}),
            attempts,
            finalWorkflowStatus: finalState.status,
            ...(finalState.cancellationRequested ? { cancellationRequested: true, statusAfterCancel: finalState.statusAfterCancel } : {}),
            completedAt: finalState.completedAt || null,
            ...(finalState.error ? { error: finalState.error } : {}),
          }),
          triggerType,
          status: succeeded ? constants.CRON_JOB_STATUS.SUCCESS : constants.CRON_JOB_STATUS.FAILURE,
          scheduledAt: scheduledFor ? new Date(scheduledFor) : startTime,
          startTime: startTime,
          endTime,
          durationMs: endTime - startTime,
        },
      });

      if (!succeeded) {
        Logger.log("error", {
          message: "CronJobEngine:runCronJob:workflowNotSuccessful",
          params: { cronJobID: cronJob.cronJobID, status: finalState.status },
        });
        return false;
      }

      return true;
    } catch (error) {
      Logger.log("error", { message: "CronJobEngine:runCronJob:failure", params: { cronJobID: cronJob.cronJobID, error: error.message } });
      await prisma.tblCronJobHistory.create({
        data: {
          cronJobID: cronJob.cronJobID,
          result: JSON.stringify({ message: error.message, stack: error.stack }),
          triggerType,
          status: constants.CRON_JOB_STATUS.FAILURE,
          scheduledAt: scheduledFor ? new Date(scheduledFor) : startTime,
          startTime: startTime,
          endTime: new Date(),
          durationMs: new Date() - startTime,
        },
      });
      throw error;
    } finally {
      this.runningJobs.delete(cronJob.cronJobID);
      await lock.release();
    }
  }

  schedule({ cronJob }) {
    try {
      // Always stop existing schedule first
      this.unschedule({ cronJobID: cronJob.cronJobID });

      if (cronJob.isDisabled) {
        Logger.log("info", { message: "CronJobEngine:schedule:disabled", params: { cronJobID: cronJob.cronJobID } });
        return;
      }

      if (!cron.validate(cronJob.cronJobSchedule)) {
        Logger.log("error", { message: "CronJobEngine:schedule:invalidExpression", params: { cronJobID: cronJob.cronJobID, expression: cronJob.cronJobSchedule } });
        return;
      }

      const job = cron.schedule(
        cronJob.cronJobSchedule,
        () => {
          // node-cron does not await callbacks; without this catch a failed
          // run becomes an unhandled rejection and can crash the process.
          // The tick time is the occurrence identity shared by every replica.
          this.runCronJob({ cronJob, triggerType: "SCHEDULED", scheduledFor: new Date() }).catch((error) => {
            Logger.log("error", {
              message: "CronJobEngine:schedule:runFailed",
              params: { cronJobID: cronJob.cronJobID, error: error.message },
            });
          });
        },
        { name: `${cronJob.cronJobID}` }
      );
      this.scheduledJobs[cronJob.cronJobID] = job;
      this.scheduleFingerprints[cronJob.cronJobID] = JSON.stringify([
        cronJob.cronJobSchedule, Boolean(cronJob.isDisabled), cronJob.updatedAt || null,
      ]);

      const nextRunAt = computeNextRunAt(cronJob.cronJobSchedule);
      if (nextRunAt) {
        prisma.tblCronJobs.update({ where: { cronJobID: cronJob.cronJobID }, data: { nextRunAt } }).catch(() => {});
      }

      Logger.log("success", { message: "CronJobEngine:schedule:done", params: { cronJobID: cronJob.cronJobID } });
    } catch (error) {
      Logger.log("error", { message: "CronJobEngine:schedule:error", params: { error: error.message } });
    }
  }

  unschedule({ cronJobID }) {
    if (this.scheduledJobs[cronJobID]) {
      this.scheduledJobs[cronJobID].stop();
      delete this.scheduledJobs[cronJobID];
      delete this.scheduleFingerprints[cronJobID];
      Logger.log("info", { message: "CronJobEngine:unschedule:stopped", params: { cronJobID } });
    }
  }

  /**
   * Fleet reconciliation: every replica periodically reloads schedules from
   * the DB so a change applied on one replica reaches the others. A local
   * timer alone is not a distributed source of truth.
   */
  reconcileSchedules(cronJobs = []) {
    const desired = new Map((cronJobs || []).map((cronJob) => [cronJob.cronJobID, cronJob]));
    for (const cronJobID of Object.keys(this.scheduledJobs)) {
      if (!desired.has(cronJobID)) this.unschedule({ cronJobID });
    }
    for (const cronJob of desired.values()) {
      const fingerprint = JSON.stringify([
        cronJob.cronJobSchedule, Boolean(cronJob.isDisabled), cronJob.updatedAt || null,
      ]);
      if (this.scheduleFingerprints[cronJob.cronJobID] !== fingerprint) this.schedule({ cronJob });
      else if (!this.scheduledJobs[cronJob.cronJobID]) this.schedule({ cronJob });
    }
    return { scheduled: Object.keys(this.scheduledJobs).length };
  }

  async scheduleAll(cronJobs) {
    Logger.log("info", { message: "CronJobEngine:scheduleAll:init", params: { count: cronJobs.length } });
    for (const cronJob of cronJobs) {
      this.schedule({ cronJob });
    }
    Logger.log("success", { message: "CronJobEngine:scheduleAll:done" });
  }

  getStatus() {
    const statuses = {};
    for (const id of Object.keys(this.scheduledJobs)) {
      statuses[id] = { state: 'scheduled' };
    }
    return statuses;
  }
}

const cronJobEngine = new CronJobEngine();

module.exports = { cronJobEngine };
