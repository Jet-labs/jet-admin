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
const { resolveInputs, extractWorkflowDefinitions } = require("../../../utils/inputArgs.util");

class CronJobEngine {
  constructor() {
    this.scheduledJobs = {};
  }

  async runCronJob({ cronJob }) {
    Logger.log("info", { message: "CronJobEngine:runCronJob", params: { cronJobID: cronJob.cronJobID } });
    const startTime = new Date();
    try {
      const rawInputArgs = cronJob.workflowConfig?.inputArgs || {};
      let definitions = [];
      if (cronJob.tblWorkflows) {
        definitions = extractWorkflowDefinitions(cronJob.tblWorkflows);
      }
      const { resolved, errors, valid } = await resolveInputs({
        type: 'cron',
        id: !cronJob.tblWorkflows ? cronJob.cronJobID : undefined,
        definitions: definitions.length > 0 ? definitions : undefined,
        runtimeValues: rawInputArgs,
      });

      if (!valid) {
        throw new Error(`Cron job input validation failed: ${JSON.stringify(errors)}`);
      }

      const workflowRunResult = await workflowService.executeWorkflow({
        workflowID: cronJob.workflowID,
        tenantID: cronJob.tenantID,
        inputArgs: resolved,
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
