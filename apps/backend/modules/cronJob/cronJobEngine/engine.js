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

class CronJobEngine {
  constructor() {
    this.scheduledJobs = {};
  }

  async runCronJob({ cronJob }) {
    Logger.log("info", { message: "CronJobEngine:runCronJob", params: { cronJobID: cronJob.cronJobID } });
    const startTime = new Date();
    try {
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

      const workflowRunResult = await authorizedExecuteWorkflow({
        workflowID: cronJob.workflowID,
        tenantID: cronJob.tenantID,
        inputValues: resolved,
        executionCtx: createSystemContext(ORIGIN_TYPES.CRON, cronJob.cronJobID, cronJob.tenantID),
      });

      await prisma.tblCronJobHistory.create({
        data: {
          cronJobID: cronJob.cronJobID,
          result: JSON.stringify(workflowRunResult || { message: "Workflow started" }),
          triggerType: "SCHEDULED",
          status: constants.CRON_JOB_STATUS.SUCCESS,
          scheduledAt: startTime,
          startTime: startTime,
          endTime: new Date(),
          durationMs: new Date() - startTime,
        },
      });

      return true;
    } catch (error) {
      Logger.log("error", { message: "CronJobEngine:runCronJob:failure", params: { cronJobID: cronJob.cronJobID, error: error.message } });
      await prisma.tblCronJobHistory.create({
        data: {
          cronJobID: cronJob.cronJobID,
          result: JSON.stringify({ message: error.message, stack: error.stack }),
          triggerType: "SCHEDULED",
          status: constants.CRON_JOB_STATUS.FAILURE,
          scheduledAt: startTime,
          startTime: startTime,
          endTime: new Date(),
          durationMs: new Date() - startTime,
        },
      });
      throw error;
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

      const job = cron.schedule(
        cronJob.cronJobSchedule,
        () => this.runCronJob({ cronJob }),
        { name: `${cronJob.cronJobID}` }
      );
      this.scheduledJobs[cronJob.cronJobID] = job;

      Logger.log("success", { message: "CronJobEngine:schedule:done", params: { cronJobID: cronJob.cronJobID } });
    } catch (error) {
      Logger.log("error", { message: "CronJobEngine:schedule:error", params: { error: error.message } });
    }
  }

  unschedule({ cronJobID }) {
    if (this.scheduledJobs[cronJobID]) {
      this.scheduledJobs[cronJobID].stop();
      delete this.scheduledJobs[cronJobID];
      Logger.log("info", { message: "CronJobEngine:unschedule:stopped", params: { cronJobID } });
    }
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
