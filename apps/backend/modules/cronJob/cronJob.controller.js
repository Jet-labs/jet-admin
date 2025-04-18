const constants = require("../../constants"); // Include if needed
const { expressUtils } = require("../../utils/express.utils"); // Adjust path as needed
const Logger = require("../../utils/logger"); // Adjust path as needed
const { cronJobService } = require("./cronJob.service");

const cronJobController = {};

/**
 * Handles request to create a new Cron Job.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
cronJobController.createCronJob = async (req, res) => {
  try {
    const { user } = req;
    const {tenantID} = req.params;
    const {
      cronJobTitle,
      cronJobDescription,
      cronJobSchedule,
      databaseQueryID,
      isDisabled,
      timeoutSeconds,
      retryAttempts,
      retryDelaySeconds,
    } = req.body;

    Logger.log("info", {
      message: "cronJobController:createCronJob:params",
      params: {
        userID: user.userID,
        cronJobTitle,
        tenantID,
        cronJobDescription,
        cronJobSchedule,
        databaseQueryID,
        isDisabled,
        timeoutSeconds,
        retryAttempts,
        retryDelaySeconds,
      },
    });

    const newCronJob = await cronJobService.createCronJob({
      userID: parseInt(user.userID),
      cronJobTitle,
      tenantID:parseInt(tenantID),
      cronJobDescription,
      cronJobSchedule,
      databaseQueryID: parseInt(databaseQueryID),
      isDisabled,
      timeoutSeconds,
      retryAttempts,
      retryDelaySeconds,
    });

    Logger.log("success", {
      message: "cronJobController:createCronJob:success",
      params: {
        userID: user.userID,
        cronJobTitle,
        tenantID,
        cronJobDescription,
        cronJobSchedule,
        databaseQueryID,
        isDisabled,
        timeoutSeconds,
        retryAttempts,
        retryDelaySeconds,
        cronJobID: newCronJob.cronJobID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      cronJob: newCronJob,
      message: "Cron job created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "cronJobController:createCronJob:catch-1",
      params: { userID: req.user?.userID, error },
    });
    // Pass the specific error message from the service
    return expressUtils.sendResponse(
      res,
      false,
      {},
      error.message || "Failed to create cron job."
    );
  }
};

/**
 * Handles request to get all Cron Jobs.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
cronJobController.getAllCronJobs = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "cronJobController:getAllCronJobs:params",
      params: { userID: user.userID, tenantID },
    });

    const cronJobs = await cronJobService.getAllCronJobs({
      userID: parseInt(user.userID),
      tenantID
    });

    Logger.log("success", {
      message: "cronJobController:getAllCronJobs:success",
      params: { userID: user.userID,tenantID, cronJobsLength: cronJobs.length },
    });

    return expressUtils.sendResponse(res, true, {
      cronJobs,
      message: "Cron jobs fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "cronJobController:getAllCronJobs:catch-1",
      params: { userID: req.user?.userID, error: error.message },
    });
    return expressUtils.sendResponse(
      res,
      false,
      {},
      error.message || "Failed to fetch cron jobs."
    );
  }
};

/**
 * Handles request to get a specific Cron Job by ID.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
cronJobController.getCronJobByID = async (req, res) => {
  try {
    const { user } = req;
    const {tenantID, cronJobID } = req.params;
    Logger.log("info", {
      message: "cronJobController:getCronJobByID:params",
      params: { userID: user.userID,tenantID, cronJobID },
    });

    const cronJob = await cronJobService.getCronJobByID({
      userID: parseInt(user.userID),
      tenantID:parseInt(tenantID),
      cronJobID: parseInt(cronJobID),
    });

    if (!cronJob) {
      Logger.log("warn", {
        message: "cronJobController:getCronJobByID:notfound",
        params: { userID: user.userID,tenantID, cronJobID },
      });
      return expressUtils.sendResponse(
        res,
        false,
        {},
        "Cron job not found.",
        404
      ); // Send 404
    }

    Logger.log("success", {
      message: "cronJobController:getCronJobByID:success",
      params: { userID: user.userID, cronJobID },
    });

    return expressUtils.sendResponse(res, true, {
      cronJob,
      message: "Cron job fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "cronJobController:getCronJobByID:catch-1",
      params: {
        userID: req.user?.userID,
        cronJobID: req.params.cronJobID,
        error: error.message,
      },
    });
    return expressUtils.sendResponse(
      res,
      false,
      {},
      error.message || "Failed to fetch cron job."
    );
  }
};

/**
 * Handles request to update a Cron Job by ID.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
cronJobController.updateCronJobByID = async (req, res) => {
  try {
    const { user } = req;
    const { jobID } = req.params;
    // Get only the fields allowed for update from the body
    const {
      title,
      description,
      cronSchedule,
      isDisabled,
      timeoutSeconds,
      retryAttempts,
      retryDelaySeconds,
      // Do not allow updating nextRunAt directly via API
    } = req.body;

    const updateData = {
      title,
      description,
      cronSchedule,
      isDisabled,
      timeoutSeconds,
      retryAttempts,
      retryDelaySeconds,
    };
    // Remove undefined fields so Prisma doesn't try to set them to null unless intended
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const logParams = { userID: user.userID, jobID, updateData };
    Logger.log("info", {
      message: "cronJobController:updateCronJobByID:params",
      params: logParams,
    });

    const updatedCronJob = await cronJobService.updateCronJobByID({
      userID: parseInt(user.userID),
      jobID: parseInt(jobID),
      updateData,
    });

    Logger.log("success", {
      message: "cronJobController:updateCronJobByID:success",
      params: logParams,
    });

    return expressUtils.sendResponse(res, true, {
      cronJob: updatedCronJob,
      message: "Cron job updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "cronJobController:updateCronJobByID:catch-1",
      params: {
        userID: req.user?.userID,
        jobID: req.params.jobID,
        error: error.message,
      },
    });
    // Check for specific errors from service
    if (error.message.includes("not found")) {
      return expressUtils.sendResponse(res, false, {}, error.message, 404);
    }
    if (error.message.includes("already exists")) {
      return expressUtils.sendResponse(res, false, {}, error.message, 409); // Conflict
    }
    return expressUtils.sendResponse(
      res,
      false,
      {},
      error.message || "Failed to update cron job."
    );
  }
};

/**
 * Handles request to delete a Cron Job by ID.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
cronJobController.deleteCronJobByID = async (req, res) => {
  try {
    const { user } = req;
    const { jobID } = req.params;
    Logger.log("info", {
      message: "cronJobController:deleteCronJobByID:params",
      params: { userID: user.userID, jobID },
    });

    await cronJobService.deleteCronJobByID({
      userID: parseInt(user.userID),
      jobID: parseInt(jobID),
    });

    Logger.log("success", {
      message: "cronJobController:deleteCronJobByID:success",
      params: { userID: user.userID, jobID },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Cron job deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "cronJobController:deleteCronJobByID:catch-1",
      params: {
        userID: req.user?.userID,
        jobID: req.params.jobID,
        error: error.message,
      },
    });
    // Check for specific errors from service
    if (error.message.includes("not found")) {
      return expressUtils.sendResponse(res, false, {}, error.message, 404);
    }
    return expressUtils.sendResponse(
      res,
      false,
      {},
      error.message || "Failed to delete cron job."
    );
  }
};

// --- Job History Controller Functions ---

/**
 * Handles request to get history for a specific Cron Job.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
cronJobController.getJobHistoryByJobID = async (req, res) => {
  try {
    const { user } = req;
    const { jobID } = req.params;
    const { page = 1, pageSize = 20 } = req.query; // Get pagination from query params

    const logParams = { userID: user.userID, jobID, page, pageSize };
    Logger.log("info", {
      message: "cronJobController:getJobHistoryByJobID:params",
      params: logParams,
    });

    const result = await cronJobService.getJobHistoryByJobID({
      userID: parseInt(user.userID),
      jobID: parseInt(jobID),
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });

    Logger.log("success", {
      message: "cronJobController:getJobHistoryByJobID:success",
      params: {
        ...logParams,
        count: result.history.length,
        totalCount: result.totalCount,
      },
    });

    return expressUtils.sendResponse(res, true, {
      ...result, // includes history, totalCount, page, pageSize
      message: "Cron job history fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "cronJobController:getJobHistoryByJobID:catch-1",
      params: {
        userID: req.user?.userID,
        jobID: req.params.jobID,
        error: error.message,
      },
    });
    return expressUtils.sendResponse(
      res,
      false,
      {},
      error.message || "Failed to fetch cron job history."
    );
  }
};

module.exports = { cronJobController };
