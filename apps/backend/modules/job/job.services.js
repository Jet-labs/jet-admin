const constants = require("../../constants");
const { CustomCronJobScheduler } = require("../../jobs/cron.jobs");
const Logger = require("../../utils/logger");
const { sqlite_db } = require("../../db/sqlite");
const { jobQueryUtils } = require("../../utils/postgres-utils/job-queries");
const { queryQueryUtils } = require("../../utils/postgres-utils/query-queries");
class JobService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.pmJobTitle
   * @param {String} param0.pmJobSchedule
   * @param {Number} param0.pmQueryID
   * @returns {any|null}
   */
  static addJob = async ({ pmJobTitle, pmQueryID, pmJobSchedule }) => {
    Logger.log("info", {
      message: "JobService:addJob:params",
      params: {
        pmJobTitle,
        pmQueryID,
        pmJobSchedule,
      },
    });
    try {
      const addJobQuery = sqlite_db.prepare(jobQueryUtils.addJob());
      // Execute the insert
      const addJobQueryResult = addJobQuery.run(
        pmJobTitle,
        parseInt(pmQueryID),
        pmJobSchedule
      );
      // Retrieve the newly inserted job
      const newJobID = addJobQueryResult.lastInsertRowid;
      const newJob = this.getJobByID({
        pmJobID: newJobID,
        authorizedJobs: true,
      });
      CustomCronJobScheduler.scheduleCustomJobOnChange(newJob);
      Logger.log("success", {
        message: "JobService:addJob:success",
      });
      return true;
    } catch (error) {
      Logger.log("error", {
        message: "JobService:addJob:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmJobID
   * @param {String} param0.jobTitle
   * @param {String} param0.jobDescription
   * @param {any} param0.jobOptions
   * @param {Boolean|Array<Number>} param0.authorizedJobs
   * @returns {any|null}
   */
  static updateJob = async ({
    pmJobID,
    pmJobTitle,
    pmQueryID,
    pmJobSchedule,
    authorizedJobs,
  }) => {
    Logger.log("info", {
      message: "JobService:updateJob:params",
      params: {
        pmJobID,
        pmJobTitle,
        pmQueryID,
        pmJobSchedule,
      },
    });
    try {
      if (authorizedJobs === true || authorizedJobs.includes(pmJobID)) {
        const updatedJobQuery = sqlite_db.prepare(jobQueryUtils.updateJob());

        // Execute the update
        updatedJobQuery.run(
          pmJobTitle,
          parseInt(pmQueryID),
          pmJobSchedule,
          0, // Update the is_disabled field as needed
          pmJobID
        );
        const updatedJob = this.getJobByID({
          pmJobID: pmJobID,
          authorizedJobs: true,
        });
        Logger.log("success", {
          message: "JobService:updateJob:updatedJob",
          params: {
            updatedJob,
          },
        });
        CustomCronJobScheduler.scheduleCustomJobOnChange(updatedJob);
        return true;
      } else {
        Logger.log("error", {
          message: "JobService:updateJob:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "JobService:updateJob:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Boolean|Array<Number>} param0.authorizedJobs
   * @returns {any|null}
   */
  static getAllJobs = async ({ authorizedJobs }) => {
    Logger.log("info", {
      message: "JobService:getAllJobs:params",
    });
    try {
      let jobs;
      if (authorizedJobs === true) {
        // Fetch all jobs if authorizedJobs is true
        const getAllJobsQuery = sqlite_db.prepare(jobQueryUtils.getAllJobs());
        jobs = getAllJobsQuery.all();
      } else {
        // Fetch jobs where pm_job_id is in the authorizedJobs array
        const getAllJobsQuery = sqlite_db.prepare(
          jobQueryUtils.getAllJobs(authorizedJobs)
        );
        jobs = getAllJobsQuery.all(...authorizedJobs);
      }
      Logger.log("info", {
        message: "JobService:getAllJobs:job",
        params: {
          jobsLength: jobs?.length,
        },
      });
      return jobs;
    } catch (error) {
      Logger.log("error", {
        message: "JobService:getAllJobs:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmJobID
   * @param {Boolean|Array<Number>} param0.authorizedJobs
   * @returns {any|null}
   */
  static getJobByID = async ({ pmJobID, authorizedJobs }) => {
    Logger.log("info", {
      message: "JobService:getJobByID:params",
      params: {
        pmJobID,
        authorizedJobs,
      },
    });
    try {
      if (authorizedJobs === true || authorizedJobs.includes(pmJobID)) {
        const getJobByIDQuery = sqlite_db.prepare(jobQueryUtils.getJobByID());
        const job = getJobByIDQuery.get(pmJobID);

        // Retrieve related query
        const getQueryByIDQuery = sqlite_db.prepare(
          queryQueryUtils.getQueryByID()
        );
        const relatedQuery = getQueryByIDQuery.get(parseInt(job.pm_query_id));

        // Combine the job and related query into the result
        const result = {
          ...job,
          tbl_pm_queries: relatedQuery,
        };
        Logger.log("info", {
          message: "JobService:getJobByID:job",
          params: {
            result,
          },
        });
        return result;
      } else {
        Logger.log("error", {
          message: "JobService:getJobByID:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "JobService:getJobByID:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmJobID
   * @param {Boolean|Array<Number>} param0.authorizedJobs
   * @returns {any|null}
   */
  static deleteJob = async ({ pmJobID, authorizedJobs }) => {
    Logger.log("info", {
      message: "JobService:deleteJob:params",
      params: {
        pmJobID,
        authorizedJobs,
      },
    });
    try {
      if (authorizedJobs === true || authorizedJobs.includes(pmJobID)) {
        await CustomCronJobScheduler.deleteScheduledCustomJob(pmJobID);
        const deleteJobQuery = sqlite_db.prepare(jobQueryUtils.deleteJob());
        // Execute the delete
        deleteJobQuery.run(pmJobID);
        Logger.log("info", {
          message: "JobService:deleteJob:success",
        });
        return true;
      } else {
        Logger.log("error", {
          message: "JobService:deleteJob:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "JobService:deleteJob:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { JobService };
