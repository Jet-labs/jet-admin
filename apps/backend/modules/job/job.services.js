const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const { CustomCronJobScheduler } = require("../../jobs/cron.jobs");
const Logger = require("../../utils/logger");
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
      let newJob = null;

      newJob = await prisma.tbl_pm_jobs.create({
        data: {
          pm_job_title: String(pmJobTitle),
          pm_query_id: parseInt(pmQueryID),
          pm_job_schedule: String(pmJobSchedule),
        },
        include: {
          tbl_pm_queries: true,
        },
      });
      Logger.log("success", {
        message: "JobService:addJob:newJob",
        params: {
          newJob,
        },
      });
      CustomCronJobScheduler.scheduleCustomJobOnChange(newJob);
      return newJob;
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
        const updatedJob = await prisma.tbl_pm_jobs.update({
          where: {
            pm_job_id: pmJobID,
          },
          data: {
            pm_job_title: String(pmJobTitle),
            pm_query_id: parseInt(pmQueryID),
            pm_job_schedule: String(pmJobSchedule),
          },
          include:{
            tbl_pm_queries:true
          }
        });
        Logger.log("success", {
          message: "JobService:updateJob:newJob",
          params: {
            updatedJob,
          },
        });
        CustomCronJobScheduler.scheduleCustomJobOnChange(updatedJob);
        return updatedJob;
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
      const jobs = await prisma.tbl_pm_jobs.findMany({
        where:
          authorizedJobs === true
            ? {}
            : {
                pm_job_id: {
                  in: authorizedJobs,
                },
              },
      });
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
        const job = await prisma.tbl_pm_jobs.findUnique({
          where: {
            pm_job_id: pmJobID,
          },
        });
        Logger.log("info", {
          message: "JobService:getJobByID:job",
          params: {
            job,
          },
        });
        return job;
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
        const deletedJobHistory = await prisma.tbl_pm_job_history.deleteMany({
          where: {
            pm_job_id: pmJobID,
          },
        });
        const job = await prisma.tbl_pm_jobs.delete({
          where: {
            pm_job_id: pmJobID,
          },
        });
        Logger.log("info", {
          message: "JobService:deleteJob:job",
          params: {
            job,
          },
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
