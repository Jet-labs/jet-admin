const cron = require("node-cron");
const Logger = require("../utils/logger");
const { runQuery } = require("../modules/query/processors/postgresql");
const { JobHistoryService } = require("../modules/job/job-history.services");
const { QueryService } = require("../modules/query/query.services");
const { sqliteDB } = require("../db/sqlite");
const { jobQueryUtils } = require("../utils/postgres-utils/job-queries");

class CronJobScheduler {
  constructor() {}

  static runner = async (pmJob) => {
    const result = {};
    const pmQuery = await QueryService.getQueryByID({
      pmQueryID: pmJob.pm_query_id,
      authorizedQueries: true,
    });

    try {
      const runResult = runQuery({
        pmQueryID: pmQuery.pm_query_id,
        pmQuery: pmQuery.pm_query ? JSON.parse(pmQuery.pm_query) : null,
        pmQueryType: pmQuery.pm_query_type,
        pmQueryArgValues: pmQuery.pm_query_args
          ? JSON.parse(pmQuery.pm_query_args)
          : null,
      });
      result.success = true;
      result.result = Array.isArray(runResult)
        ? { resultLength: runResult.length }
        : { result: runResult };
      Logger.log("success", {
        message: "CronJobScheduler:runner:success",
        params: { pmJobID: pmJob.pm_job_id },
      });
    } catch (err) {
      Logger.log("error", {
        message: "CronJobScheduler:runner:catch-1",
        params: { pmJobID: pmJob.pm_job_id, error: err },
      });
      result.success = false;
      result.error = err;
    }

    await JobHistoryService.addJobHistory({
      pmJobID: pmJob.pm_job_id,
      pmHistoryResult: result,
    });
    Logger.log("info", {
      message: "CronJobScheduler:runner:history created",
      params: { pmJobID: pmJob.pm_job_id },
    });
  };

  static scheduleCronJobOnChange = async (pmJob) => {
    try {
      Logger.log("info", {
        message: "CronJobScheduler:scheduleCronJobOnChange:init",
        params: { pmJob },
      });
      const scheduledCronJobs = global.scheduled_custom_jobs;
      if (scheduledCronJobs) {
        if (scheduledCronJobs[pmJob.pm_job_id]) {
          scheduledCronJobs[pmJob.pm_job_id].stop();
          Logger.log("info", {
            message: "CronJobScheduler:scheduleCronJobOnChange:stopped",
            params: { pmJobID: pmJob.pm_job_id },
          });
          delete scheduledCronJobs[pmJob.pm_job_id];
          global.scheduled_custom_jobs = scheduledCronJobs;
        }
      } else {
        global.scheduled_custom_jobs = {};
        Logger.log("info", {
          message:
            "CronJobScheduler:scheduleCronJobOnChange:scheduled_custom_jobs created",
          params: { pmJobID: pmJob.pm_job_id },
        });
      }
      const job = cron.schedule(
        pmJob.pm_job_schedule,
        () => this.runner(pmJob),
        {
          name: `${pmJob.pm_job_id}`,
        }
      );
      global.scheduled_custom_jobs[pmJob.pm_job_id] = job;
      Logger.log("success", {
        message:
          "CronJobScheduler:scheduleCronJobOnChange:job scheduled",
        params: { pmJobID: pmJob.pm_job_id },
      });
    } catch (error) {
      Logger.log("error", {
        message: "CronJobScheduler:scheduleCronJobOnChange:catch-1",
        params: { error },
      });
    }
  };

  static deleteScheduledCronJob = async (pmJobID) => {
    try {
      Logger.log("info", {
        message: "CronJobScheduler:deleteScheduledCronJob:init",
        params: { pmJobID },
      });
      const scheduledCronJobs = global.scheduled_custom_jobs;
      if (scheduledCronJobs) {
        if (scheduledCronJobs[pmJobID]) {
          scheduledCronJobs[pmJobID].stop();
          Logger.log("info", {
            message: "CronJobScheduler:deleteScheduledCronJob:stopped",
            params: { pmJobID },
          });
          delete scheduledCronJobs[pmJobID];
          global.scheduled_custom_jobs = scheduledCronJobs;
        }
      }

      Logger.log("success", {
        message:
          "CronJobScheduler:deleteScheduledCronJob:job scheduled",
        params: { pmJobID },
      });
    } catch (error) {
      Logger.log("error", {
        message: "CronJobScheduler:deleteScheduledCronJob:catch-1",
        params: { error },
      });
    }
  };

  static scheduleAllCronJobs = async () => {
    try {
      Logger.log("info", {
        message: "CronJobScheduler:scheduleAllCronJobs:init",
      });
      const getAllJobsQuery = sqliteDB.prepare(jobQueryUtils.getAllJobs());
      const allPmJobs = getAllJobsQuery.all();
      const allPmJobsSchedulePromise = allPmJobs.map((pmJob) => {
        return this.scheduleCronJobOnChange(pmJob);
      });
      await Promise.all(allPmJobsSchedulePromise);
      Logger.log("success", {
        message: "CronJobScheduler:scheduleAllCronJobs:jobs scheduled",
      });
    } catch (error) {
      Logger.log("error", {
        message: "CronJobScheduler:scheduleAllCronJobs:catch-1",
        params: { error },
      });
    }
  };
}

module.exports = { CronJobScheduler };
