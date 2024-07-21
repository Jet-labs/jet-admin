const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
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
      jobID: pm_job_id,
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
      jobTitle: body.job_title,
      jobDescription: body.job_description,
      jobOptions: body.job_options,
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
      jobID: parseInt(body.pm_job_id),
      jobTitle: body.job_title,
      jobDescription: body.job_description,
      jobOptions: body.job_options,
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
      jobID: pm_job_id,
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
