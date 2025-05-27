const Logger = require("../../utils/logger"); // Adjust path as needed
const cron = require("node-cron");
const { prisma } = require("../../config/prisma.config"); // Adjust path as needed
const {
  databaseQueryService,
} = require("../databaseQuery/databaseQuery.service");
const {
  tenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");
const constants = require("../../constants");
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
 * @param {object} [param0.databaseQueryArgValues]
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
  databaseQueryArgValues,
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
      databaseQueryArgValues,
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
        databaseQueryArgValues,
        isDisabled,
        timeoutSeconds,
        retryAttempts,
        retryDelaySeconds,
      },
      include: {
        tblDatabaseQueries: true,
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
        databaseQueryArgValues,
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
        databaseQueryID,
        databaseQueryArgValues,
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
cronJobService.getAllCronJobs = async ({ userID, tenantID }) => {
  Logger.log("info", {
    message: "cronJobService:getAllCronJobs:params",
    params: { userID, tenantID },
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
        tblDatabaseQueries: true,
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
    const cronJob = await prisma.tblCronJobs.findUnique({
      where: {
        cronJobID: parseInt(cronJobID), // Ensure cronJobID is an integer
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
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
    const updatedCronJob = await prisma.tblCronJobs.update({
      where: {
        cronJobID: parseInt(cronJobID),
        tenantID: parseInt(tenantID),
      },
      data: updateData,
      include: {
        tblDatabaseQueries: true,
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
    // Prisma will cascade delete history based on the schema relation (onDelete: Cascade)
    const deletedCronJob = await prisma.$transaction(async (tx) => {
      await tx.tblCronJobHistory.deleteMany({
        where: {
          cronJobID: parseInt(cronJobID),
        },
      });
      await tx.tblCronJobs.delete({
        where: {
          cronJobID: parseInt(cronJobID),
          tenantID: parseInt(tenantID),
        },
      });
    });
    Logger.log("info", {
      message: "cronJobService:deleteCronJobByID:deleted",
      params: { userID, tenantID, cronJobID },
    });
    await cronJobService.deleteScheduledCronJob({ cronJobID });
    Logger.log("success", {
      message: "cronJobService:deleteCronJobByID:success",
      params: { userID, tenantID, cronJobID },
    });
    return deletedCronJob; // Return the object that was deleted
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:deleteCronJobByID:failure",
      params: { userID, tenantID, cronJobID, error },
    });
    throw error;
  }
};

/**
 * Runs a Cron Job immediately.
 * @param {object} param0
 * @param {import("@prisma/client").tblCronJobs & {tblDatabaseQueries: import("@prisma/client").tblDatabaseQueries}} param0.cronJob - The ID of the cron job to run
 * @returns {Promise<object>} The cron job object
 */
cronJobService.runCronJob = async ({ cronJob }) => {
  Logger.log("info", {
    message: "cronJobService:runCronJob:params",
    params: { cronJob },
  });
  const startTime = new Date();
  try {
    const dbPool = await tenantAwarePostgreSQLPoolManager.getPool(
      cronJob.tenantID
    );
    const queryRunResult = await databaseQueryService.runDatabaseQueries({
      userID: parseInt(cronJob.cronJobID),
      tenantID: parseInt(cronJob.tenantID),
      dbPool,
      databaseQueries: [
        {
          databaseQueryOptions: {
            ...cronJob.tblDatabaseQueries.databaseQueryOptions,
            databaseQueryArgValues: cronJob.databaseQueryArgValues,
          },
        },
      ],
    });

    await prisma.tblCronJobHistory.create({
      data: {
        cronJobID: parseInt(cronJob.cronJobID),
        result: JSON.stringify(queryRunResult),
        triggerType: "SCHEDULED",
        status: constants.CRON_JOB_STATUS.SUCCESS,
        scheduledAt: startTime,
        startTime: startTime,
        endTime: new Date(),
        durationMs: new Date() - startTime,
      },
    });

    Logger.log("success", {
      message: "cronJobService:runCronJob:success",
      params: { cronJob },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:runCronJob:failure",
      params: { cronJob, error },
    });
    await prisma.tblCronJobHistory.create({
      data: {
        cronJobID: parseInt(cronJob.cronJobID),
        result: JSON.stringify(error),
        triggerType: "SCHEDULED",
        status: constants.CRON_JOB_STATUS.FAILURE,
        scheduledAt: startTime,
        startTime: startTime,
        endTime: new Date(),
        durationMs: new Date() - startTime,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {import("@prisma/client").tblCronJobs} param0.cronJob
 */
cronJobService.scheduleCronJobOnChange = async ({ cronJob }) => {
  try {
    Logger.log("info", {
      message: "cronJobService:scheduleCronJobOnChange:init",
      params: { cronJob },
    });
    const scheduledCronJobs = global.scheduledCronJobs;
    if (scheduledCronJobs) {
      if (scheduledCronJobs[cronJob.cronJobID]) {
        scheduledCronJobs[cronJob.cronJobID].stop();
        Logger.log("info", {
          message: "cronJobService:scheduleCronJobOnChange:stopped",
          params: { cronJobID: cronJob.cronJobID },
        });
        delete scheduledCronJobs[cronJob.cronJobID];
        global.scheduledCronJobs = scheduledCronJobs;
      }
    } else {
      global.scheduledCronJobs = {};
      Logger.log("info", {
        message:
          "cronJobService:scheduleCronJobOnChange:scheduledCronJobs created",
        params: { cronJobID: cronJob.cronJobID },
      });
    }
    const job = cron.schedule(
      cronJob.cronJobSchedule,
      () => cronJobService.runCronJob({ cronJob }),
      {
        name: `${cronJob.cronJobID}`,
      }
    );
    global.scheduledCronJobs[cronJob.cronJobID] = job;
    Logger.log("success", {
      message: "cronJobService:scheduleCronJobOnChange:job scheduled",
      params: { cronJobID: cronJob.cronJobID },
    });
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:scheduleCronJobOnChange:catch-1",
      params: { error },
    });
  }
};

cronJobService.deleteScheduledCronJob = async ({ cronJobID }) => {
  try {
    Logger.log("info", {
      message: "cronJobService:deleteScheduledCronJob:init",
      params: { cronJobID },
    });
    const scheduledCronJobs = global.scheduledCronJobs;
    if (scheduledCronJobs) {
      if (scheduledCronJobs[cronJobID]) {
        scheduledCronJobs[cronJobID].stop();
        Logger.log("info", {
          message: "cronJobService:deleteScheduledCronJob:stopped",
          params: { pmJobID },
        });
        delete scheduledCronJobs[pmJobID];
        global.scheduledCronJobs = scheduledCronJobs;
      }
    }

    Logger.log("success", {
      message: "cronJobService:deleteScheduledCronJob:job scheduled",
      params: { cronJobID },
    });
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:deleteScheduledCronJob:catch-1",
      params: { error },
    });
  }
};

cronJobService.scheduleAllCronJobs = async () => {
  try {
    Logger.log("info", {
      message: "cronJobService:scheduleAllCronJobs:init",
    });
    const cronJobs = await cronJobService.getAllCronJobsForScheduler();

    const cronJobsSchedulePromise = cronJobs.map((cronJob) => {
      return cronJobService.scheduleCronJobOnChange({ cronJob });
    });
    await Promise.all(cronJobsSchedulePromise);
    Logger.log("success", {
      message: "cronJobService:scheduleAllCronJobs:jobs scheduled",
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "cronJobService:scheduleAllCronJobs:catch-1",
      params: { error },
    });
  }
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
        cronJobID: parseInt(cronJobID),
      },
      orderBy: {
        createdAt: "desc", // Show most recent history first
      },
      skip: skip,
      take: take,
    });

    const cronJobHistoryCount = await prisma.tblCronJobHistory.count({
      where: {
        cronJobID: parseInt(cronJobID),
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
      params: { userID, tenantID, cronJobID, page, pageSize, error },
    });
    throw error;
  }
};

module.exports = { cronJobService };
