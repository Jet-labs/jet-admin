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
    const { tenantID } = req.params;
    const {
      cronJobTitle,
      cronJobDescription,
      cronJobSchedule,
      dataQueryID,
      dataQueryArgValues,
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
        dataQueryID,
        dataQueryArgValues,
        isDisabled,
        timeoutSeconds,
        retryAttempts,
        retryDelaySeconds,
      },
    });

    const newCronJob = await cronJobService.createCronJob({
      userID: parseInt(user.userID),
      cronJobTitle,
      tenantID: parseInt(tenantID),
      cronJobDescription,
      cronJobSchedule,
      dataQueryID: parseInt(dataQueryID),
      dataQueryArgValues,
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
        dataQueryID,
        dataQueryArgValues,
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
      tenantID,
    });

    Logger.log("success", {
      message: "cronJobController:getAllCronJobs:success",
      params: {
        userID: user.userID,
        tenantID,
        cronJobsLength: cronJobs.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      cronJobs,
      message: "Cron jobs fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "cronJobController:getAllCronJobs:catch-1",
      params: { userID: req.user?.userID, error },
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
    const { tenantID, cronJobID } = req.params;
    Logger.log("info", {
      message: "cronJobController:getCronJobByID:params",
      params: { userID: user.userID, tenantID, cronJobID },
    });

    const cronJob = await cronJobService.getCronJobByID({
      userID: parseInt(user.userID),
      tenantID: parseInt(tenantID),
      cronJobID: parseInt(cronJobID),
    });

    if (!cronJob) {
      Logger.log("warning", {
        message: "cronJobController:getCronJobByID:notfound",
        params: { userID: user.userID, tenantID, cronJobID },
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
        error,
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
    const { tenantID, cronJobID } = req.params;
    // Get only the fields allowed for update from the body
    const {
      cronJobTitle,
      cronJobDescription,
      cronJobSchedule,
      dataQueryID,
      dataQueryArgValues,
      isDisabled,
      timeoutSeconds,
      retryAttempts,
      retryDelaySeconds,
      // Do not allow updating nextRunAt directly via API
    } = req.body;

    const updateData = {
      cronJobTitle,
      cronJobDescription,
      cronJobSchedule,
      dataQueryID: parseInt(dataQueryID),
      dataQueryArgValues,
      isDisabled,
      timeoutSeconds,
      retryAttempts,
      retryDelaySeconds,
    };
    // Remove undefined fields so Prisma doesn't try to set them to null unless intended
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    Logger.log("info", {
      message: "cronJobController:updateCronJobByID:params",
      params: { userID: user.userID, tenantID, cronJobID, updateData },
    });

    const updatedCronJob = await cronJobService.updateCronJobByID({
      userID: parseInt(user.userID),
      tenantID: parseInt(tenantID),
      cronJobID: parseInt(cronJobID),
      updateData,
    });

    Logger.log("success", {
      message: "cronJobController:updateCronJobByID:success",
      params: { userID: user.userID, tenantID, cronJobID, updateData },
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
        cronJobID: req.params.cronJobID,
        error,
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
    const { tenantID, cronJobID } = req.params;
    Logger.log("info", {
      message: "cronJobController:deleteCronJobByID:params",
      params: { userID: user.userID, tenantID, cronJobID },
    });

    await cronJobService.deleteCronJobByID({
      userID: parseInt(user.userID),
      tenantID: parseInt(tenantID),
      cronJobID: parseInt(cronJobID),
    });

    Logger.log("success", {
      message: "cronJobController:deleteCronJobByID:success",
      params: { userID: user.userID, tenantID, cronJobID },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Cron job deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "cronJobController:deleteCronJobByID:catch-1",
      params: {
        userID: req.user?.userID,
        cronJobID: req.params.cronJobID,
        error,
      },
    });
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
cronJobController.getCronJobHistoryByID = async (req, res) => {
  try {
    const { user } = req;
    const { cronJobID, tenantID } = req.params;
    const { page = 1, pageSize = 20 } = req.query; // Get pagination from query params

    const take = pageSize ? parseInt(pageSize) : constants.ROW_PAGE_SIZE;
    const skip =
      page && parseInt(page) > 0 ? (parseInt(page) - 1) * take : undefined;

    Logger.log("info", {
      message: "cronJobController:getCronJobHistoryByID:params",
      params: { userID: user.userID, tenantID, cronJobID, page, pageSize },
    });

    const { cronJobHistory, cronJobHistoryCount } =
      await cronJobService.getCronJobHistoryByID({
        userID: parseInt(user.userID),
        cronJobID: parseInt(cronJobID),
        tenantID: parseInt(tenantID),
        skip,
        take,
      });

    Logger.log("success", {
      message: "cronJobController:getCronJobHistoryByID:success",
      params: {
        userID: user.userID,
        tenantID,
        cronJobID,
        skip,
        take,
        cronJobHistoryLength: cronJobHistory.length,
        cronJobHistoryCount,
      },
    });

    return expressUtils.sendResponse(res, true, {
      cronJobHistory,
      cronJobHistoryCount,
      nextPage:
        cronJobHistory?.length < take
          ? null
          : Math.floor((skip + take) / take) + 1,
    });
  } catch (error) {
    Logger.log("error", {
      message: "cronJobController:getCronJobHistoryByID:catch-1",
      params: {
        userID: req.user?.userID,
        cronJobID: req.params.cronJobID,
        error,
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
