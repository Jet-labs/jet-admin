const Logger = require("../../utils/logger"); // Adjust path as needed
const { prisma } = require("../../config/prisma.config"); // Adjust path as needed
const constants = require("../../constants");
const { grantCreatorAccess, removePoliciesForResource } = require("../../config/casbin.config");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
const { cronJobEngine } = require("./cronJobEngine/engine");

const cronJobService = {};

/**
 * Creates a new Cron Job definition.
 * @param {object} param0
 * @param {number} param0.userID - ID of the user creating the job
 * @param {string} param0.cronJobTitle
 * @param {string} [param0.cronJobDescription]
 * @param {string} param0.cronJobSchedule
 * @param {string} param0.workflowID
 * @param {object} [param0.workflowConfig]
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
  workflowID,
  workflowConfig,
  isDisabled,
  timeoutSeconds,
  retryAttempts,
  retryDelaySeconds,
  authContext,
}) => {
  Logger.log("info", {
    message: "cronJobService:createCronJob:params",
    params: {
      userID,
      cronJobTitle,
      tenantID,
      cronJobDescription,
      cronJobSchedule,
      workflowID,
      workflowConfig,
      isDisabled,
      timeoutSeconds,
      retryAttempts,
      retryDelaySeconds,
      authContext,
    },
  });

  try {
    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const finalCreatorID = creatorID || userID;
    if (!finalCreatorID && !createdByApiKeyID) {
      throw new Error("Creator ID or Created By API Key ID is required");
    }
    const newCronJob = await prisma.tblCronJobs.create({
      data: {
        cronJobTitle,
        tenantID,
        cronJobDescription,
        cronJobSchedule,
        workflowID,
        workflowConfig,
        isDisabled,
        timeoutSeconds,
        retryAttempts,
        retryDelaySeconds,
        creatorID,
        createdByApiKeyID,
      },
      include: {
        tblWorkflows: true,
      },
    });

    await grantCreatorAccess(tenantID, "cronjob", newCronJob.cronJobID, authContext, finalCreatorID);

    Logger.log("success", {
      message: "cronJobService:createCronJob:success",
      params: {
        cronJobTitle,
        tenantID,
        cronJobDescription,
        cronJobSchedule,
        workflowID,
        workflowConfig,
        isDisabled,
        timeoutSeconds,
        retryAttempts,
        retryDelaySeconds,
        cronJobID: newCronJob.cronJobID,
      },
    });
    await cronJobService.scheduleCronJobOnChange({ cronJob: newCronJob });

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
        workflowID,
        workflowConfig,
        isDisabled,
        timeoutSeconds,
        retryAttempts,
        retryDelaySeconds,
        error,
      },
    });
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
cronJobService.getAllCronJobs = async ({ userID, tenantID, search, page, pageSize }) => {
  Logger.log("info", {
    message: "cronJobService:getAllCronJobs:params",
    params: { userID, tenantID, search, page, pageSize },
  });

  try {
    const where = {
      tenantID: tenantID,
    };

    if (search) {
      where.OR = [
        {
          cronJobTitle: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          cronJobDescription: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          cronJobSchedule: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const findManyOptions = {
      where,
      orderBy: {
        createdAt: "desc", // Or order by title, etc.
      },
    };

    if (page && pageSize) {
      findManyOptions.skip = (page - 1) * pageSize;
      findManyOptions.take = pageSize;
    }

    const [cronJobs, totalCount] = await Promise.all([
      prisma.tblCronJobs.findMany(findManyOptions),
      prisma.tblCronJobs.count({ where }),
    ]);

    Logger.log("success", {
      message: "cronJobService:getAllCronJobs:success",
      params: { userID, count: cronJobs.length, totalCount },
    });

    return {
      cronJobs,
      totalCount,
      page: page || 1,
      pageSize: pageSize || cronJobs.length,
      totalPages: pageSize ? Math.ceil(totalCount / pageSize) : 1,
    };
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:getAllCronJobs:failure",
      params: { userID, error },
    });
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
cronJobService.getAllCronJobsForScheduler = async () => {
  Logger.log("info", {
    message: "cronJobService:getAllCronJobsForScheduler:init",
  });

  try {
    const cronJobs = await prisma.tblCronJobs.findMany({
      where: {
        isDisabled: false,
      },
      include: {
        tblWorkflows: true,
      },
      orderBy: {
        createdAt: "desc", // Or order by title, etc.
      },
    });

    Logger.log("success", {
      message: "cronJobService:getAllCronJobsForScheduler:success",
      params: { count: cronJobs.length },
    });
    return cronJobs;
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:getAllCronJobsForScheduler:catch-1",
      params: { error },
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
cronJobService.getCronJobByID = async ({ userID, tenantID, cronJobID }) => {
  Logger.log("info", {
    message: "cronJobService:getCronJobByID:params",
    params: { userID, tenantID, cronJobID },
  });

  try {
    const cronJob = await prisma.tblCronJobs.findFirst({
      where: {
        cronJobID: cronJobID,
        tenantID: tenantID,
      },
    });

    if (!cronJob) {
      Logger.log("warning", {
        message: "cronJobService:getCronJobByID:notfound",
        params: { userID, tenantID, cronJobID },
      });
      // You might want to throw an error here depending on how controllers handle null
      // throw new Error(`Cron job with ID ${cronJobID} not found.`);
      return null;
    }

    Logger.log("success", {
      message: "cronJobService:getCronJobByID:success",
      params: { userID, tenantID, cronJobID },
    });
    return cronJob;
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:getCronJobByID:failure",
      params: { userID, tenantID, cronJobID, error },
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
cronJobService.updateCronJobByID = async ({
  userID,
  tenantID,
  cronJobID,
  updateData,
}) => {
  Logger.log("info", {
    message: "cronJobService:updateCronJobByID:params",
    params: { userID, tenantID, cronJobID, updateData },
  });

  try {
    const updated = await prisma.tblCronJobs.updateMany({
      where: {
        cronJobID: cronJobID,
        tenantID: tenantID,
      },
      data: updateData,
    });
    if (updated.count === 0) {
      throw new Error("Cron job not found");
    }
    const updatedCronJob = await prisma.tblCronJobs.findFirst({
      where: {
        cronJobID: cronJobID,
        tenantID: tenantID,
      },
      include: {
        tblWorkflows: true,
      },
    });

    Logger.log("success", {
      message: "cronJobService:updateCronJobByID:success",
      params: { userID, tenantID, cronJobID, updateData },
    });
    await cronJobService.scheduleCronJobOnChange({ cronJob: updatedCronJob });
    return updatedCronJob;
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:updateCronJobByID:failure",
      params: { userID, tenantID, cronJobID, updateData, error },
    });
    throw error;
  }
};

/**
 * Deletes a Cron Job definition by its ID.
 * @param {object} param0
 * @param {number} param0.userID - ID of the user deleting the job
 * @param {number} param0.tenantID
 * @param {number} param0.cronJobID - The ID of the cron job to delete
 * @returns {Promise<object>} The deleted cron job object
 */
cronJobService.deleteCronJobByID = async ({ userID, tenantID, cronJobID }) => {
  Logger.log("info", {
    message: "cronJobService:deleteCronJobByID:params",
    params: { userID, tenantID, cronJobID },
  });

  try {
    // Delete history first, then the job inside a transaction
    const deletedCronJob = await prisma.$transaction(async (tx) => {
      const existing = await tx.tblCronJobs.findFirst({
        where: {
          cronJobID: cronJobID,
          tenantID: tenantID,
        },
      });
      if (!existing) {
        throw new Error("Cron job not found");
      }
      await tx.tblCronJobHistory.deleteMany({
        where: {
          cronJobID: cronJobID,
        },
      });
      await tx.tblCronJobs.deleteMany({
        where: {
          cronJobID: cronJobID,
          tenantID: tenantID,
        },
      });
      return existing;
    });
    Logger.log("info", {
      message: "cronJobService:deleteCronJobByID:deleted",
      params: { userID, tenantID, cronJobID },
    });
    await cronJobService.deleteScheduledCronJob({ cronJobID });

    await removePoliciesForResource(tenantID, `cronjob:${cronJobID}`);

    Logger.log("success", {
      message: "cronJobService:deleteCronJobByID:success",
      params: { userID, tenantID, cronJobID },
    });
    return deletedCronJob;
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:deleteCronJobByID:failure",
      params: { userID, tenantID, cronJobID, error },
    });
    throw error;
  }
};

/**
 * Clones a Cron Job definition.
 * @param {object} param0
 * @param {number} param0.userID - ID of the user cloning the job
 * @param {number} param0.tenantID
 * @param {number} param0.cronJobID - The ID of the cron job to clone
 * @returns {Promise<object>} The cloned cron job object
 */
cronJobService.cloneCronJob = async ({ userID, tenantID, cronJobID, authContext }) => {
  Logger.log("info", {
    message: "cronJobService:cloneCronJob:params",
    params: { userID, tenantID, cronJobID, authContext },
  });

  try {
    const existing = await prisma.tblCronJobs.findFirst({
      where: {
        cronJobID: cronJobID,
        tenantID: tenantID,
      },
    });

    if (!existing) {
      throw new Error(`Cron job with ID ${cronJobID} not found.`);
    }

    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const finalCreatorID = creatorID || userID;
    if (!finalCreatorID && !createdByApiKeyID) {
      throw new Error("Creator ID or Created By API Key ID is required");
    }
    const newCronJob = await prisma.tblCronJobs.create({
      data: {
        cronJobTitle: existing.cronJobTitle + " (Copy)",
        tenantID,
        cronJobDescription: existing.cronJobDescription,
        cronJobSchedule: existing.cronJobSchedule,
        workflowID: existing.workflowID,
        workflowConfig: existing.workflowConfig,
        isDisabled: true, // Safe default
        timeoutSeconds: existing.timeoutSeconds,
        retryAttempts: existing.retryAttempts,
        retryDelaySeconds: existing.retryDelaySeconds,
        creatorID,
        createdByApiKeyID,
      },
      include: {
        tblWorkflows: true,
      },
    });

    await grantCreatorAccess(tenantID, "cronjob", newCronJob.cronJobID, authContext, finalCreatorID);

    Logger.log("success", {
      message: "cronJobService:cloneCronJob:success",
      params: { userID, tenantID, cronJobID, newCronJobID: newCronJob.cronJobID },
    });

    await cronJobService.scheduleCronJobOnChange({ cronJob: newCronJob });

    return newCronJob;
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:cloneCronJob:failure",
      params: { userID, tenantID, cronJobID, error },
    });
    throw error;
  }
};



/**
 * Runs a Cron Job immediately — delegates to engine.
 */
cronJobService.runCronJob = async ({ cronJob }) => {
  return cronJobEngine.runCronJob({ cronJob });
};

/**
 * Schedule or reschedule a cron job after create/update — delegates to engine.
 */
cronJobService.scheduleCronJobOnChange = async ({ cronJob }) => {
  cronJobEngine.schedule({ cronJob });
};

/**
 * Unschedule a cron job after deletion — delegates to engine.
 */
cronJobService.deleteScheduledCronJob = async ({ cronJobID }) => {
  cronJobEngine.unschedule({ cronJobID });
};

/**
 * Schedule all enabled cron jobs on server startup.
 */
cronJobService.scheduleAllCronJobs = async () => {
  try {
    Logger.log("info", { message: "cronJobService:scheduleAllCronJobs:init" });
    const cronJobs = await cronJobService.getAllCronJobsForScheduler();
    await cronJobEngine.scheduleAll(cronJobs);
    return true;
  } catch (error) {
    Logger.log("error", { message: "cronJobService:scheduleAllCronJobs:catch", params: { error } });
  }
};

/**
 * Returns the status of the connection to the engine.
 */
cronJobService.getConnectionStatus = () => {
  return cronJobEngine.getStatus();
};

// --- Job History Service Functions ---

/**
 * Retrieves the execution history for a specific Cron Job.
 * @param {object} param0
 * @param {number} param0.userID - ID of the user requesting the history
 * @param {number} param0.tenantID - Page number for pagination
 * @param {number} param0.cronJobID - The ID of the cron job
 * @param {number} [param0.skip=0] - Page number for pagination
 * @param {number} [param0.take=20] - Number of records per page
 * @returns {Promise<Array<object>>} A list of job history records
 */
cronJobService.getCronJobHistoryByID = async ({
  userID,
  tenantID,
  cronJobID,
  skip,
  take,
}) => {
  Logger.log("info", {
    message: "cronJobService:getCronJobHistoryByID:params",
    params: { userID, tenantID, cronJobID, skip, take },
  });

  try {
    const cronJob = await cronJobService.getCronJobByID({
      userID,
      tenantID,
      cronJobID,
    });
    if (!cronJob) {
      Logger.log("error", {
        message: "cronJobService:getCronJobHistoryByID:catch-2",
        params: { userID, tenantID, cronJobID },
      });
      throw new Error(`Cron job with ID ${cronJobID} not found.`);
    }

    const cronJobHistory = await prisma.tblCronJobHistory.findMany({
      where: {
        cronJobID: cronJobID,
      },
      orderBy: {
        createdAt: "desc", // Show most recent history first
      },
      skip: skip,
      take: take,
    });

    const cronJobHistoryCount = await prisma.tblCronJobHistory.count({
      where: {
        cronJobID: cronJobID,
      },
    });

    Logger.log("success", {
      message: "cronJobService:getCronJobHistoryByID:success",
      params: {
        userID,
        tenantID,
        cronJobID,
        skip,
        take,
        cronJobHistoryLength: cronJobHistory.length,
        cronJobHistoryCount,
      },
    });

    return { cronJobHistory, cronJobHistoryCount };
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:getCronJobHistoryByID:failure",
      params: { userID, tenantID, cronJobID, error },
    });
    throw error;
  }
};

module.exports = { cronJobService };
