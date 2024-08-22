const Logger = require("../../utils/logger");
const { sqlite_db } = require("../../db/sqlite");
const {
  jobHistoryQueryUtils,
} = require("../../utils/postgres-utils/job-history-queries");
class JobHistoryService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {Object} param0.pmHistoryResult
   * @param {Number} param0.pmJobID
   * @returns {any|null}
   */
  static addJobHistory = async ({ pmJobID, pmHistoryResult }) => {
    Logger.log("info", {
      message: "JobHistoryService:addJobHistory:params",
      params: {
        pmJobID,
        pmHistoryResult,
      },
    });
    try {
      const addJobHistoryQuery = sqlite_db.prepare(
        jobHistoryQueryUtils.addJobHistory()
      );
      // Execute the insert
      addJobHistoryQuery.run(JSON.stringify(pmHistoryResult), pmJobID);
      Logger.log("success", {
        message: "JobHistoryService:addJobHistory:success",
      });
      return true;
    } catch (error) {
      Logger.log("error", {
        message: "JobHistoryService:addJobHistory:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Boolean|Array<Number>} param0.authorizedJobs
   * @param {Number} param0.skip
   * @param {Number} param0.take
   * @returns {any|null}
   */
  static getJobHistory = async ({ authorizedJobs, skip, take }) => {
    Logger.log("info", {
      message: "JobHistoryService:getJobHistory:params",
    });
    try {
      let jobHistory;
      if (authorizedJobs === true) {
        // Fetch all jobHistory if authorizedJobs is true
        const getJobHistoryQuery = sqlite_db.prepare(
          jobHistoryQueryUtils.getJobHistory(authorizedJobs, take, skip)
        );
        jobHistory = getJobHistoryQuery.all();
      } else {
        // Fetch jobHistory where pm_job_id is in the authorizedJobs array
        const getJobHistoryQuery = sqlite_db.prepare(
          jobHistoryQueryUtils.getJobHistory(authorizedJobs, take, skip)
        );
        jobHistory = getJobHistoryQuery.all(...authorizedJobs);
      }
      Logger.log("info", {
        message: "JobHistoryService:getJobHistory:job",
        params: {
          jobHistoryLength: jobHistory?.length,
        },
      });
      return jobHistory;
    } catch (error) {
      Logger.log("error", {
        message: "JobHistoryService:getJobHistory:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { JobHistoryService };
