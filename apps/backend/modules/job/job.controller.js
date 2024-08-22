const constants = require("../../constants");
const { extractError } = require("../../utils/error.util");
const Logger = require("../../utils/logger");
const { JobHistoryService } = require("./job-history.services");
const { JobService } = require("./job.services");

const jobController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
jobController.getAllJobs = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_jobs = state.authorized_jobs;

    Logger.log("info", {
      message: "jobController:getAllJobs:params",
      params: { pm_user_id },
    });

    const jobs = await JobService.getAllJobs({
      authorizedJobs: authorized_jobs,
    });

    Logger.log("success", {
      message: "jobController:getAllJobs:success",
      params: { pm_user_id, jobs },
    });

    return res.json({
      success: true,
      jobs: jobs,
    });
  } catch (error) {
    Logger.log("error", {
      message: "jobController:getAllJobs:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
jobController.getJobHistory = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_jobs = state.authorized_jobs;
    const { page, page_size } = req.query;
    let skip = 0;
    let take = page_size ? parseInt(page_size) : constants.ROW_PAGE_SIZE;
    if (parseInt(page) >= 0) {
      skip = (parseInt(page) - 1) * take;
    } else {
      skip = undefined;
      take = undefined;
    }

    Logger.log("info", {
      message: "jobController:getJobHistory:params",
      params: { pm_user_id },
    });

    const jobHistory = await JobHistoryService.getJobHistory({
      authorizedJobs: authorized_jobs,
      skip,
      take,
    });

    Logger.log("success", {
      message: "jobController:getJobHistory:success",
      params: { pm_user_id, jobHistoryLength: jobHistory.length },
    });

    return res.json({
      success: true,
      jobHistory,
      nextPage: jobHistory?.length < take ? null : parseInt(page) + 1,
    });
  } catch (error) {
    Logger.log("error", {
      message: "jobController:getJobHistory:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
jobController.getJobByID = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_job_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_jobs = state.authorized_jobs;

    Logger.log("info", {
      message: "jobController:getJobByID:params",
      params: { pm_user_id, pm_job_id },
    });

    const job = await JobService.getJobByID({
      pmJobID: pm_job_id,
      authorizedJobs: authorized_jobs,
    });

    Logger.log("success", {
      message: "jobController:getJobByID:success",
      params: { pm_user_id, job },
    });

    return res.json({
      success: true,
      job: job,
    });
  } catch (error) {
    Logger.log("error", {
      message: "jobController:getJobByID:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
jobController.addJob = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);

    Logger.log("info", {
      message: "jobController:addJob:params",
      params: { pm_user_id, body },
    });

    const job = await JobService.addJob({
      pmJobTitle: body.pm_job_title,
      pmQueryID: body.pm_query_id,
      pmJobSchedule: body.pm_job_schedule,
    });

    Logger.log("success", {
      message: "jobController:addJob:success",
      params: { pm_user_id, job },
    });

    return res.json({
      success: true,
      job,
    });
  } catch (error) {
    Logger.log("error", {
      message: "jobController:addJob:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
jobController.updateJob = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_jobs = state.authorized_jobs;

    Logger.log("info", {
      message: "jobController:updateJob:params",
      params: { pm_user_id, body },
    });

    const job = await JobService.updateJob({
      pmJobID: parseInt(body.pm_job_id),
      pmJobTitle: body.pm_job_title,
      pmQueryID: body.pm_query_id,
      pmJobSchedule: body.pm_job_schedule,
      authorizedJobs: authorized_jobs,
    });

    Logger.log("success", {
      message: "jobController:updateJob:success",
      params: { pm_user_id, job },
    });

    return res.json({
      success: true,
      job,
    });
  } catch (error) {
    Logger.log("error", {
      message: "jobController:updateJob:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
jobController.deleteJob = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_job_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_jobs = state.authorized_jobs;

    Logger.log("info", {
      message: "jobController:deleteJob:params",
      params: { pm_user_id, pm_job_id },
    });

    await JobService.deleteJob({
      pmJobID: pm_job_id,
      authorizedJobs: authorized_jobs,
    });

    Logger.log("success", {
      message: "jobController:deleteJob:success",
      params: { pm_user_id },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    Logger.log("error", {
      message: "jobController:deleteJob:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = { jobController };
