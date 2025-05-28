const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const dashboardService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
dashboardService.getAllDashboards = async ({ userID, tenantID }) => {
  Logger.log("info", {
    message: "dashboardService:getAllDashboards:params",
    params: {
      userID,
      tenantID,
    },
  });

  try {
    const dashboards = await prisma.tblDashboards.findMany({
      where: {
        tenantID: parseInt(tenantID),
      },
    });
    Logger.log("success", {
      message: "dashboardService:getAllDashboards:success",
      params: {
        userID,
        dashboards,
      },
    });
    return dashboards;
  } catch (error) {
    Logger.log("error", {
      message: "dashboardService:getAllDashboards:failure",
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
 * @param {string} param0.dashboardTitle
 * @param {string} param0.dashboardDescription
 * @param {JSON} param0.dashboardConfig
 * @returns {Promise<boolean>}
 */
dashboardService.createDashboard = async ({
  userID,
  tenantID,
  dashboardTitle,
  dashboardDescription,
  dashboardConfig,
}) => {
  Logger.log("info", {
    message: "dashboardService:createDashboard:params",
    params: {
      userID,
      tenantID,
      dashboardTitle,
      dashboardDescription,
      dashboardConfig,
    },
  });

  try {
    await prisma.$transaction(async (tx) => {
      const dashboard = await tx.tblDashboards.create({
        data: {
          tenantID: parseInt(tenantID),
          dashboardTitle,
          dashboardDescription,
          dashboardConfig,
          creatorID: parseInt(userID),
        },
      });
    });

    Logger.log("success", {
      message: "dashboardService:createDashboard:success",
      params: {
        userID,
        tenantID: parseInt(tenantID),
        dashboardTitle,
        dashboardDescription,
        dashboardConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "dashboardService:createDashboard:failure",
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
 * @param {string} param0.dashboardID
 * @returns {Promise<Array<object>>}
 */
dashboardService.getDashboardByID = async ({
  userID,
  tenantID,
  dashboardID,
}) => {
  Logger.log("info", {
    message: "dashboardService:getDashboardByID:params",
    params: {
      userID,
      tenantID,
      dashboardID,
    },
  });

  try {
    const dashboard = await prisma.tblDashboards.findFirst({
      where: {
        tenantID: parseInt(tenantID),
        dashboardID: parseInt(dashboardID),
      },
    });
    Logger.log("success", {
      message: "dashboardService:getDashboardByID:success",
      params: {
        userID,
        dashboard,
      },
    });
    return dashboard;
  } catch (error) {
    Logger.log("error", {
      message: "dashboardService:getDashboardByID:failure",
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
 * @param {number} param0.dashboardID
 * @returns {Promise<boolean>}
 */
dashboardService.cloneDashboardByID = async ({
  userID,
  tenantID,
  dashboardID,
}) => {
  Logger.log("info", {
    message: "dashboardService:cloneDashboardByID:params",
    params: {
      userID,
      tenantID,
      dashboardID,
    },
  });

  try {
    const dashboard = await prisma.tblDashboards.findFirst({
      where: {
        tenantID: parseInt(tenantID),
        dashboardID: parseInt(dashboardID),
      },
    });
    if (!dashboard) {
      throw new Error("Database dashboard not found");
    }
    await prisma.$transaction(async (tx) => {
      const newDashboard = await tx.tblDashboards.create({
        data: {
          tenantID: parseInt(tenantID),
          dashboardTitle: dashboard.dashboardTitle + " (Copy)",
          dashboardDescription: dashboard.dashboardDescription,
          dashboardConfig: dashboard.dashboardConfig,
          creatorID: parseInt(userID),
        },
      });
    });
    Logger.log("success", {
      message: "dashboardService:cloneDashboardByID:success",
      params: {
        userID,
        dashboardID,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "dashboardService:cloneDashboardByID:failure",
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
 * @param {number} params.dashboardID
 * @param {number} [params.userID]
 * @param {number} [params.tenantID]
 * @param {string} [params.dashboardTitle]
 * @param {string} [params.dashboardDescription]
 * @param {JSON} [params.dashboardConfig]
 *
 * @returns {Promise<boolean>} True if update succeeded
 * @throws {Error} If database operation fails
 */
dashboardService.updateDashboardByID = async ({
  dashboardID,
  userID,
  tenantID,
  dashboardTitle,
  dashboardDescription,
  dashboardConfig,
}) => {
  Logger.log("info", {
    message: "dashboardService:updateDashboardByID:params",
    params: {
      dashboardID,
      userID,
      tenantID,
      dashboardTitle,
      dashboardDescription,
      dashboardConfig,
    },
  });

  try {
    const existingDashboard = await prisma.tblDashboards.findFirst({
      where: {
        dashboardID: parseInt(dashboardID),
        tenantID: parseInt(tenantID),
      },
    });

    if (!existingDashboard) {
      throw new Error("Dashboard not found");
    }
    await prisma.$transaction(async (tx) => {
      const updatedDashboard = await tx.tblDashboards.update({
        where: { dashboardID: parseInt(dashboardID) },
        data: {
          ...(dashboardTitle != undefined && { dashboardTitle }),
          ...(dashboardDescription != undefined && {
            dashboardDescription,
          }),
          ...(dashboardConfig != undefined && {
            dashboardConfig,
          }),
        },
      });
    });

    Logger.log("success", {
      message: "dashboardService:updateDashboardByID:success",
      params: {
        dashboardID,
        userID,
        tenantID,
        dashboardTitle,
        dashboardDescription,
        dashboardConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "dashboardService:updateDashboardByID:catch-1",
      params: {
        dashboardID,
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
 * @param {number} param0.dashboardID
 * @returns {Promise<boolean>}
 */
dashboardService.deleteDashboardByID = async ({
  userID,
  tenantID,
  dashboardID,
}) => {
  Logger.log("info", {
    message: "dashboardService:deleteDashboardByID:params",
    params: {
      userID,
      tenantID,
      dashboardID,
    },
  });

  try {
    // Update the database query using Prisma
    await prisma.tblDashboards.delete({
      where: {
        dashboardID: parseInt(dashboardID), // Assuming `id` is the primary key for the query
        tenantID: parseInt(tenantID), // Ensure tenantID matches for security
      },
    });

    Logger.log("success", {
      message: "dashboardService:deleteDashboardByID:success",
      params: {
        userID,
        tenantID,
        dashboardID,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "dashboardService:deleteDashboardByID:failure",
      params: {
        userID,
        tenantID,
        dashboardID,
        error,
      },
    });
    throw error;
  }
};

module.exports = { dashboardService };
