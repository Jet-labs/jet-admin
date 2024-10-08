const cron = require("node-cron");
const Logger = require("../utils/logger");
const { runQuery } = require("../modules/query/processors/postgresql");
const { JobHistoryService } = require("../modules/job/job-history.services");
const { QueryService } = require("../modules/query/query.services");
const { sqliteDB } = require("../db/sqlite");
const { jobQueryUtils } = require("../utils/postgres-utils/job-queries");

class CustomCronJobScheduler {
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
        message: "CustomCronJobScheduler:runner:success",
        params: { pmJobID: pmJob.pm_job_id },
      });
    } catch (err) {
      Logger.log("error", {
        message: "CustomCronJobScheduler:runner:catch-1",
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
      message: "CustomCronJobScheduler:runner:history created",
      params: { pmJobID: pmJob.pm_job_id },
    });
  };

  static scheduleCustomJobOnChange = async (pmJob) => {
    try {
      Logger.log("info", {
        message: "CustomCronJobScheduler:scheduleCustomJobOnChange:init",
        params: { pmJob },
      });
      const scheduledCustomJobs = global.scheduled_custom_jobs;
      if (scheduledCustomJobs) {
        if (scheduledCustomJobs[pmJob.pm_job_id]) {
          scheduledCustomJobs[pmJob.pm_job_id].stop();
          Logger.log("info", {
            message: "CustomCronJobScheduler:scheduleCustomJobOnChange:stopped",
            params: { pmJobID: pmJob.pm_job_id },
          });
          delete scheduledCustomJobs[pmJob.pm_job_id];
          global.scheduled_custom_jobs = scheduledCustomJobs;
        }
      } else {
        global.scheduled_custom_jobs = {};
        Logger.log("info", {
          message:
            "CustomCronJobScheduler:scheduleCustomJobOnChange:scheduled_custom_jobs created",
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
          "CustomCronJobScheduler:scheduleCustomJobOnChange:job scheduled",
        params: { pmJobID: pmJob.pm_job_id },
      });
    } catch (error) {
      Logger.log("error", {
        message: "CustomCronJobScheduler:scheduleCustomJobOnChange:catch-1",
        params: { error },
      });
    }
  };

  static deleteScheduledCustomJob = async (pmJobID) => {
    try {
      Logger.log("info", {
        message: "CustomCronJobScheduler:deleteScheduledCustomJob:init",
        params: { pmJobID },
      });
      const scheduledCustomJobs = global.scheduled_custom_jobs;
      if (scheduledCustomJobs) {
        if (scheduledCustomJobs[pmJobID]) {
          scheduledCustomJobs[pmJobID].stop();
          Logger.log("info", {
            message: "CustomCronJobScheduler:deleteScheduledCustomJob:stopped",
            params: { pmJobID },
          });
          delete scheduledCustomJobs[pmJobID];
          global.scheduled_custom_jobs = scheduledCustomJobs;
        }
      }

      Logger.log("success", {
        message:
          "CustomCronJobScheduler:deleteScheduledCustomJob:job scheduled",
        params: { pmJobID },
      });
    } catch (error) {
      Logger.log("error", {
        message: "CustomCronJobScheduler:deleteScheduledCustomJob:catch-1",
        params: { error },
      });
    }
  };

  static scheduleAllCustomJobs = async () => {
    try {
      Logger.log("info", {
        message: "CustomCronJobScheduler:scheduleAllCustomJobs:init",
      });
      const getAllJobsQuery = sqliteDB.prepare(jobQueryUtils.getAllJobs());
      const allPmJobs = getAllJobsQuery.all();
      const allPmJobsSchedulePromise = allPmJobs.map((pmJob) => {
        return this.scheduleCustomJobOnChange(pmJob);
      });
      await Promise.all(allPmJobsSchedulePromise);
      Logger.log("success", {
        message: "CustomCronJobScheduler:scheduleAllCustomJobs:jobs scheduled",
      });
    } catch (error) {
      Logger.log("error", {
        message: "CustomCronJobScheduler:scheduleAllCustomJobs:catch-1",
        params: { error },
      });
    }
  };
}

module.exports = { CustomCronJobScheduler };
