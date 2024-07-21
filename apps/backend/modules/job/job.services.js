const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
class JobService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.jobTitle
   * @param {String} param0.jobDescription
   * @param {any} param0.jobOptions
   * @returns {any|null}
   */
  static addJob = async ({ jobTitle, jobDescription, jobOptions }) => {
    Logger.log("info", {
      message: "JobService:addJob:params",
      params: {
        jobTitle,
        jobDescription,
        jobOptions,
      },
    });
    try {
      let newJob = null;
      const _graphIDs = [];
      if (jobOptions.graph_ids && Array.isArray(jobOptions.graph_ids)) {
        jobOptions.graph_ids.forEach((graph) => {
          _graphIDs.push(graph.graphID);
        });
      }
      newJob = await prisma.tbl_pm_jobs.create({
        data: {
          job_title: String(jobTitle),
          job_description: String(jobDescription),
          job_options: jobOptions,
          job_graph_ids: _graphIDs,
        },
      });
      Logger.log("success", {
        message: "JobService:addJob:newJob",
        params: {
          jobTitle,
          newJob,
        },
      });
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
   * @param {Number} param0.jobID
   * @param {String} param0.jobTitle
   * @param {String} param0.jobDescription
   * @param {any} param0.jobOptions
   * @param {Boolean|Array<Number>} param0.authorizedJobs
   * @returns {any|null}
   */
  static updateJob = async ({
    jobID,
    jobTitle,
    jobDescription,
    jobOptions,
    authorizedJobs,
  }) => {
    Logger.log("info", {
      message: "JobService:updateJob:params",
      params: {
        jobID,
        jobTitle,
        jobDescription,
        jobOptions,
      },
    });
    try {
      if (authorizedJobs === true || authorizedJobs.includes(jobID)) {
        const _graphIDs = [];
        if (jobOptions.graph_ids && Array.isArray(jobOptions.graph_ids)) {
          jobOptions.graph_ids.forEach((graph) => {
            _graphIDs.push(graph.graphID);
          });
        }
        const updatedJob = await prisma.tbl_pm_jobs.update({
          where: {
            pm_job_id: jobID,
          },
          data: {
            job_title: String(jobTitle),
            job_description: String(jobDescription),
            job_options: jobOptions,
            job_graph_ids: _graphIDs,
          },
        });
        Logger.log("success", {
          message: "JobService:updateJob:newJob",
          params: {
            updatedJob,
          },
        });
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
   * @param {Number} param0.jobID
   * @param {Boolean|Array<Number>} param0.authorizedJobs
   * @returns {any|null}
   */
  static getJobByID = async ({ jobID, authorizedJobs }) => {
    Logger.log("info", {
      message: "JobService:getJobByID:params",
      params: {
        jobID,
        authorizedJobs,
      },
    });
    try {
      if (authorizedJobs === true || authorizedJobs.includes(jobID)) {
        const job = await prisma.tbl_pm_jobs.findUnique({
          where: {
            pm_job_id: jobID,
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
   * @param {Number} param0.jobID
   * @param {Boolean|Array<Number>} param0.authorizedJobs
   * @returns {any|null}
   */
  static deleteJob = async ({ jobID, authorizedJobs }) => {
    Logger.log("info", {
      message: "JobService:deleteJob:params",
      params: {
        jobID,
        authorizedJobs,
      },
    });
    try {
      if (authorizedJobs === true || authorizedJobs.includes(jobID)) {
        const job = await prisma.tbl_pm_jobs.delete({
          where: {
            pm_job_id: jobID,
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
