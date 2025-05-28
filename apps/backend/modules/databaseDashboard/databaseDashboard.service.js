const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const databaseDashboardService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
databaseDashboardService.getAllDatabaseDashboards = async ({
  userID,
  tenantID,
}) => {
  Logger.log("info", {
    message: "databaseDashboardService:getAllDatabaseDashboards:params",
    params: {
      userID,
      tenantID,
    },
  });

  try {
    const databaseDashboards = await prisma.tblDatabaseDashboards.findMany({
      where: {
        tenantID: parseInt(tenantID),
      },
    });
    Logger.log("success", {
      message: "databaseDashboardService:getAllDatabaseDashboards:success",
      params: {
        userID,
        databaseDashboards,
      },
    });
    return databaseDashboards;
  } catch (error) {
    Logger.log("error", {
      message: "databaseDashboardService:getAllDatabaseDashboards:failure",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {string} param0.databaseDashboardName
 * @param {string} param0.databaseDashboardDescription
 * @param {JSON} param0.databaseDashboardConfig
 * @returns {Promise<boolean>}
 */
databaseDashboardService.createDatabaseDashboard = async ({
  userID,
  tenantID,
  databaseDashboardName,
  databaseDashboardDescription,
  databaseDashboardConfig,
}) => {
  Logger.log("info", {
    message: "databaseDashboardService:createDatabaseDashboard:params",
    params: {
      userID,
      tenantID,
      databaseDashboardName,
      databaseDashboardDescription,
      databaseDashboardConfig,
    },
  });

  try {
    await prisma.$transaction(async (tx) => {
      const databaseDashboard = await tx.tblDatabaseDashboards.create({
        data: {
          tenantID: parseInt(tenantID),
          databaseDashboardName,
          databaseDashboardDescription,
          databaseDashboardConfig,
          creatorID: parseInt(userID),
        },
      });
    });

    Logger.log("success", {
      message: "databaseDashboardService:createDatabaseDashboard:success",
      params: {
        userID,
        tenantID: parseInt(tenantID),
        databaseDashboardName,
        databaseDashboardDescription,
        databaseDashboardConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseDashboardService:createDatabaseDashboard:failure",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {string} param0.databaseDashboardID
 * @returns {Promise<Array<object>>}
 */
databaseDashboardService.getDatabaseDashboardByID = async ({
  userID,
  tenantID,
  databaseDashboardID,
}) => {
  Logger.log("info", {
    message: "databaseDashboardService:getDatabaseDashboardByID:params",
    params: {
      userID,
      tenantID,
      databaseDashboardID,
    },
  });

  try {
    const databaseDashboard = await prisma.tblDatabaseDashboards.findFirst({
      where: {
        tenantID: parseInt(tenantID),
        databaseDashboardID: parseInt(databaseDashboardID),
      },
    });
    Logger.log("success", {
      message: "databaseDashboardService:getDatabaseDashboardByID:success",
      params: {
        userID,
        databaseDashboard,
      },
    });
    return databaseDashboard;
  } catch (error) {
    Logger.log("error", {
      message: "databaseDashboardService:getDatabaseDashboardByID:failure",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.databaseDashboardID
 * @returns {Promise<boolean>}
 */
databaseDashboardService.cloneDatabaseDashboardByID = async ({
  userID,
  tenantID,
  databaseDashboardID,
}) => {
  Logger.log("info", {
    message: "databaseDashboardService:cloneDatabaseDashboardByID:params",
    params: {
      userID,
      tenantID,
      databaseDashboardID,
    },
  });

  try {
    const databaseDashboard = await prisma.tblDatabaseDashboards.findFirst({
      where: {
        tenantID: parseInt(tenantID),
        databaseDashboardID: parseInt(databaseDashboardID),
      },
    });
    if (!databaseDashboard) {
      throw new Error("Database dashboard not found");
    }
    await prisma.$transaction(async (tx) => {
      const newDatabaseDashboard = await tx.tblDatabaseDashboards.create({
        data: {
          tenantID: parseInt(tenantID),
          databaseDashboardName:
            databaseDashboard.databaseDashboardName + " (Copy)",
          databaseDashboardDescription:
            databaseDashboard.databaseDashboardDescription,
          databaseDashboardConfig: databaseDashboard.databaseDashboardConfig,
          creatorID: parseInt(userID),
        },
      });
    });
    Logger.log("success", {
      message: "databaseDashboardService:cloneDatabaseDashboardByID:success",
      params: {
        userID,
        databaseDashboardID,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseDashboardService:cloneDatabaseDashboardByID:failure",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {Object} params
 * @param {number} params.databaseDashboardID
 * @param {number} [params.userID]
 * @param {number} [params.tenantID]
 * @param {string} [params.databaseDashboardName]
 * @param {string} [params.databaseDashboardDescription]
 * @param {JSON} [params.databaseDashboardConfig]
 *
 * @returns {Promise<boolean>} True if update succeeded
 * @throws {Error} If database operation fails
 */
databaseDashboardService.updateDatabaseDashboardByID = async ({
  databaseDashboardID,
  userID,
  tenantID,
  databaseDashboardName,
  databaseDashboardDescription,
  databaseDashboardConfig,
}) => {
  Logger.log("info", {
    message: "databaseDashboardService:updateDatabaseDashboardByID:params",
    params: {
      databaseDashboardID,
      userID,
      tenantID,
      databaseDashboardName,
      databaseDashboardDescription,
      databaseDashboardConfig,
    },
  });

  try {
    const existingDashboard = await prisma.tblDatabaseDashboards.findFirst({
      where: {
        databaseDashboardID: parseInt(databaseDashboardID),
        tenantID: parseInt(tenantID),
      },
    });

    if (!existingDashboard) {
      throw new Error("Dashboard not found");
    }
    await prisma.$transaction(async (tx) => {
      const updatedDashboard = await tx.tblDatabaseDashboards.update({
        where: { databaseDashboardID: parseInt(databaseDashboardID) },
        data: {
          ...(databaseDashboardName != undefined && { databaseDashboardName }),
          ...(databaseDashboardDescription != undefined && {
            databaseDashboardDescription,
          }),
          ...(databaseDashboardConfig != undefined && {
            databaseDashboardConfig,
          }),
        },
      });
    });

    Logger.log("success", {
      message: "databaseDashboardService:updateDatabaseDashboardByID:success",
      params: {
        databaseDashboardID,
        userID,
        tenantID,
        databaseDashboardName,
        databaseDashboardDescription,
        databaseDashboardConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseDashboardService:updateDatabaseDashboardByID:catch-1",
      params: {
        databaseDashboardID,
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {string} param0.tenantID
 * @param {number} param0.databaseDashboardID
 * @returns {Promise<boolean>}
 */
databaseDashboardService.deleteDatabaseDashboardByID = async ({
  userID,
  tenantID,
  databaseDashboardID,
}) => {
  Logger.log("info", {
    message: "databaseDashboardService:deleteDatabaseDashboardByID:params",
    params: {
      userID,
      tenantID,
      databaseDashboardID,
    },
  });

  try {
    // Update the database query using Prisma
    await prisma.tblDatabaseDashboards.delete({
      where: {
        databaseDashboardID: parseInt(databaseDashboardID), // Assuming `id` is the primary key for the query
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
      },
    });

    Logger.log("success", {
      message: "databaseDashboardService:deleteDatabaseDashboardByID:success",
      params: {
        userID,
        tenantID,
        databaseDashboardID,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseDashboardService:deleteDatabaseDashboardByID:failure",
      params: {
        userID,
        tenantID,
        databaseDashboardID,
        error,
      },
    });
    throw error;
  }
};

module.exports = { databaseDashboardService };
