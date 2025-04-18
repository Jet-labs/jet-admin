const Logger = require("../../utils/logger"); // Adjust path as needed
const { prisma } = require("../../config/prisma.config"); // Adjust path as needed
// const constants = require("../../constants"); // Include if needed

const cronJobService = {};

/**
 * Creates a new Cron Job definition.
 * @param {object} param0
 * @param {number} param0.userID - ID of the user creating the job
 * @param {string} param0.cronJobTitle
 * @param {string} [param0.cronJobDescription]
 * @param {string} param0.cronJobSchedule
 * @param {number} param0.databaseQueryID
 * @param {boolean} [param0.isDisabled]
 * @param {number} [param0.timeoutSeconds]
 * @param {number} [param0.retryAttempts]
 * @param {number} [param0.retryDelaySeconds]
 * @returns {Promise<object>} The created cron job object
 */
cronJobService.createCronJob = async ({
  userID,
  cronJobTitle,
  tenantID,
  cronJobDescription,
  cronJobSchedule,
  databaseQueryID,
  isDisabled,
  timeoutSeconds,
  retryAttempts,
  retryDelaySeconds,
  // Note: nextRunAt is typically calculated by the scheduler, not set directly on creation
}) => {
  Logger.log("info", {
    message: "cronJobService:createCronJob:params",
    params: {
      userID,
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

  try {
    const newCronJob = await prisma.tblCronJobs.create({
      data: {
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

    Logger.log("success", {
      message: "cronJobService:createCronJob:success",
      params: {
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
    return newCronJob;
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:createCronJob:failure",
      params: {
        userID,
        cronJobTitle,
        tenantID,
        cronJobDescription,
        cronJobSchedule,
        databaseQueryID,
        isDisabled,
        timeoutSeconds,
        retryAttempts,
        retryDelaySeconds,
        error: error.message,
      },
    });
    // Handle potential Prisma unique constraint errors (e.g., if title must be unique)
    if (error.code === "P2002" && error.meta?.target?.includes("title")) {
      throw new Error(`Cron job with title "${title}" already exists.`);
    }
    throw error;
  }
};

/**
 * Retrieves all Cron Job definitions.
 * @param {object} param0
 * @param {number} param0.userID - ID of the user requesting the list
 * @param {number} [param0.tenantID] - Page number for pagination
 * @returns {Promise<Array<object>>} A list of cron job objects
 */
cronJobService.getAllCronJobs = async ({ userID,tenantID }) => {
  Logger.log("info", {
    message: "cronJobService:getAllCronJobs:params",
    params: { userID,tenantID },
  });

  try {
    const cronJobs = await prisma.tblCronJobs.findMany({
      where: {
        tenantID: parseInt(tenantID),
      },
      orderBy: {
        createdAt: "desc", // Or order by title, etc.
      },
    });

    Logger.log("success", {
      message: "cronJobService:getAllCronJobs:success",
      params: { userID, count: cronJobs.length },
    });
    return cronJobs;
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:getAllCronJobs:failure",
      params: { userID, error: error.message },
    });
    throw error;
  }
};

/**
 * Retrieves a specific Cron Job by its ID.
 * @param {object} param0
 * @param {number} param0.userID - ID of the user requesting the job
 * @param {number} param0.tenantID - Page number for pagination
 * @param {number} param0.cronJobID - The ID of the cron job to retrieve
 * @returns {Promise<object|null>} The cron job object or null if not found
 */
cronJobService.getCronJobByID = async ({ userID,tenantID, cronJobID }) => {
  Logger.log("info", {
    message: "cronJobService:getCronJobByID:params",
    params: { userID,tenantID, cronJobID },
  });

  try {
    const cronJob = await prisma.tblCronJobs.findUnique({
      where: {
        cronJobID: parseInt(cronJobID), // Ensure cronJobID is an integer
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
      },
    });

    if (!cronJob) {
      Logger.log("warn", {
        message: "cronJobService:getCronJobByID:notfound",
        params: { userID,tenantID, cronJobID },
      });
      // You might want to throw an error here depending on how controllers handle null
      // throw new Error(`Cron job with ID ${cronJobID} not found.`);
      return null;
    }

    Logger.log("success", {
      message: "cronJobService:getCronJobByID:success",
      params: { userID,tenantID, cronJobID },
    });
    return cronJob;
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:getCronJobByID:failure",
      params: { userID,tenantID, cronJobID, error: error.message },
    });
    throw error;
  }
};

/**
 * Updates an existing Cron Job definition.
 * @param {object} param0
 * @param {number} param0.userID - ID of the user updating the job
 * @param {number} param0.cronJobID - The ID of the cron job to update
 * @param {object} param0.updateData - Object containing fields to update (title, description, cronSchedule, etc.)
 * @returns {Promise<object>} The updated cron job object
 */
cronJobService.updateCronJobByID = async ({ userID, cronJobID, updateData }) => {
  const logParams = { userID, cronJobID, updateData };
  Logger.log("info", {
    message: "cronJobService:updateCronJobByID:params",
    params: logParams,
  });

  try {
    // Ensure updatedAt is handled (Prisma does this automatically with @updatedAt)
    const updatedCronJob = await prisma.tblCronJobs.update({
      where: {
        cronJobID: parseInt(cronJobID),
      },
      data: updateData, // Pass only the fields to be updated
    });

    Logger.log("success", {
      message: "cronJobService:updateCronJobByID:success",
      params: logParams,
    });
    return updatedCronJob;
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:updateCronJobByID:failure",
      params: { ...logParams, error: error.message },
    });
    // Handle specific errors like P2025 (Record to update not found)
    if (error.code === "P2025") {
      throw new Error(`Cron job with ID ${cronJobID} not found for update.`);
    }
    // Handle potential unique constraint errors (e.g., if title must be unique)
    if (error.code === "P2002" && error.meta?.target?.includes("title")) {
      throw new Error(
        `Cron job with title "${updateData.title}" already exists.`
      );
    }
    throw error;
  }
};

/**
 * Deletes a Cron Job definition by its ID.
 * @param {object} param0
 * @param {number} param0.userID - ID of the user deleting the job
 * @param {number} param0.cronJobID - The ID of the cron job to delete
 * @returns {Promise<object>} The deleted cron job object
 */
cronJobService.deleteCronJobByID = async ({ userID, cronJobID }) => {
  Logger.log("info", {
    message: "cronJobService:deleteCronJobByID:params",
    params: { userID, cronJobID },
  });

  try {
    // Prisma will cascade delete history based on the schema relation (onDelete: Cascade)
    const deletedCronJob = await prisma.tblCronJobs.delete({
      where: {
        cronJobID: parseInt(cronJobID),
      },
    });

    Logger.log("success", {
      message: "cronJobService:deleteCronJobByID:success",
      params: { userID, cronJobID },
    });
    return deletedCronJob; // Return the object that was deleted
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:deleteCronJobByID:failure",
      params: { userID, cronJobID, error: error.message },
    });
    // Handle specific errors like P2025 (Record to delete not found)
    if (error.code === "P2025") {
      throw new Error(`Cron job with ID ${cronJobID} not found for deletion.`);
    }
    throw error;
  }
};

// --- Job History Service Functions ---

/**
 * Retrieves the execution history for a specific Cron Job.
 * @param {object} param0
 * @param {number} param0.userID - ID of the user requesting the history
 * @param {number} param0.cronJobID - The ID of the cron job
 * @param {number} [param0.page=1] - Page number for pagination
 * @param {number} [param0.pageSize=20] - Number of records per page
 * @returns {Promise<Array<object>>} A list of job history records
 */
cronJobService.getJobHistoryByJobID = async ({
  userID,
  cronJobID,
  page = 1,
  pageSize = 20,
}) => {
  const logParams = { userID, cronJobID, page, pageSize };
  Logger.log("info", {
    message: "cronJobService:getJobHistoryByJobID:params",
    params: logParams,
  });

  try {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const jobHistory = await prisma.tblJobHistory.findMany({
      where: {
        cronJobID: parseInt(cronJobID),
      },
      orderBy: {
        createdAt: "desc", // Show most recent history first
      },
      skip: skip,
      take: take,
    });

    // Optionally, get total count for pagination metadata
    const totalCount = await prisma.tblJobHistory.count({
      where: { cronJobID: parseInt(cronJobID) },
    });

    Logger.log("success", {
      message: "cronJobService:getJobHistoryByJobID:success",
      params: { ...logParams, count: jobHistory.length, totalCount },
    });
    // Return both history and pagination info
    return { history: jobHistory, totalCount, page, pageSize };
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:getJobHistoryByJobID:failure",
      params: { ...logParams, error: error.message },
    });
    throw error;
  }
};

module.exports = { cronJobService };
