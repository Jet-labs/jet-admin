const { Client } = require("pg");
const { prisma } = require("../../config/prisma.config");
const {
  tenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { tenantRoleService } = require("../tenantRole/tenantRole.service");
const { databaseService } = require("../database/database.service");
const {
  databaseChartService,
} = require("../databaseChart/databaseChart.service");
const {
  databaseDashboardService,
} = require("../databaseDashboard/databaseDashboard.service");
const {
  databaseQueryService,
} = require("../databaseQuery/databaseQuery.service");
const { cronJobService } = require("../cronJob/cronJob.service");
const { apiKeyService } = require("../apiKey/apiKey.service");
const {
  databaseWidgetService,
} = require("../databaseWidget/databaseWidget.service");

const tenantService = {};

/**
 *
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {Number} param0.tenantID
 * @returns
 */
tenantService.getUserTenantByID = async ({ userID, tenantID, dbPool }) => {
  try {
    Logger.log("info", {
      message: "tenantService:getUserTenantByID:params",
      params: { userID, tenantID },
    });
    const userTenantRelationships =
      await prisma.tblUsersTenantsRelationship.findFirst({
        where: {
          userID,
          tenantID,
        },
        include: {
          tblTenants: {
            include: {
              tblUsers: true,
            },
          },
        },
      });

    const allRelationshipsOfTenant =
      await prisma.tblUsersTenantsRelationship.findMany({
        where: {
          tenantID,
        },
        include: {
          tblUsers: true,
        },
      });
    let tenantRoles = null,
      tenantDatabaseMetadata = null,
      tenantDashboards = null,
      tenantDatabaseQueries = null,
      tenantDatabaseWidgets = null,
      tenantCronJobs = null,
      tenantAPIKeys = null;

    try {
      tenantRoles = await tenantRoleService.getAllTenantRoles({
        userID: parseInt(userID),
        tenantID: parseInt(tenantID),
      });
      tenantDatabaseMetadata =
        await databaseService.getDatabaseMetadataForTenant({
          userID: parseInt(userID),
          dbPool,
        });
      tenantDashboards =
        await databaseDashboardService.getAllDatabaseDashboards({
          userID: parseInt(userID),
          tenantID: parseInt(tenantID),
        });
      tenantDatabaseQueries = await databaseQueryService.getAllDatabaseQueries({
        userID: parseInt(userID),
        tenantID: parseInt(tenantID),
      });
      tenantDatabaseWidgets = await databaseWidgetService.getAllDatabaseWidgets(
        {
          userID: parseInt(userID),
          tenantID: parseInt(tenantID),
        }
      );
      tenantCronJobs = await cronJobService.getAllCronJobs({
        userID: parseInt(userID),
        tenantID: parseInt(tenantID),
      });
      tenantAPIKeys = await apiKeyService.getAllAPIKeys({
        userID: parseInt(userID),
        tenantID: parseInt(tenantID),
      });
    } catch (error) {
      Logger.log("error", {
        message: "tenantService:getUserTenantByID:catch-1",
        params: { error },
      });
    }

    const tenant = {
      ...userTenantRelationships.tblTenants,
      roles: userTenantRelationships,
      relationships: allRelationshipsOfTenant,
      tenantRolesCount: tenantRoles?.length || 0,
      tenantDatabaseSchemasCount: tenantDatabaseMetadata?.metadata?.length || 0,
      tenantDatabaseTablesCount:
        tenantDatabaseMetadata?.metadata
          ?.map((schema) => (schema.tables ? schema.tables.length : 0))
          .reduce((acc, curr) => acc + curr, 0) || 0,
      tenantDashboardCount: tenantDashboards?.length || 0,
      tenantDatabaseQueryCount: tenantDatabaseQueries?.length || 0,
      tenantCronJobCount: tenantCronJobs?.length || 0,
      tenantAPIKeyCount: tenantAPIKeys?.length || 0,
      tenantWidgetCount: tenantDatabaseWidgets?.length || 0,
    };
    Logger.log("success", {
      message: "tenantService:getUserTenantByID:tenant",
      params: { tenant },
    });
    return tenant;
  } catch (error) {
    Logger.log("error", {
      message: "tenantService:getUserTenantByID:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {Number} param0.tenantID
 * @returns
 */
tenantService.deleteUserTenantByID = async ({ userID, tenantID }) => {
  try {
    Logger.log("info", {
      message: "tenantService:deleteUserTenantByID:params",
      params: { userID, tenantID },
    });

    const tenantDeletionTransaction = await prisma.$transaction([
      prisma.tblDatabaseDashboardChartMappings.deleteMany({
        where: {
          OR: [
            { tblDatabaseCharts: { tenantID: tenantIdToDelete } },
            { tblDatabaseDashboards: { tenantID: tenantIdToDelete } },
          ],
        },
      }),
      prisma.tblDatabaseWidgetQueryMappings.deleteMany({
        where: {
          OR: [
            { tblDatabaseQueries: { tenantID: tenantIdToDelete } },
            { tblDatabaseWidgets: { tenantID: tenantIdToDelete } },
          ],
        },
      }),
      prisma.tblAPIKeyRoleMappings.deleteMany({
        where: {
          OR: [
            { tblAPIKeys: { tenantID: tenantIdToDelete } },
            { tblRoles: { tenantID: tenantIdToDelete } },
          ],
        },
      }),
      prisma.tblRolePermissionMappings.deleteMany({
        where: {
          tblRoles: { tenantID: tenantIdToDelete },
        },
      }),
      prisma.tblUserTenantRoleMappings.deleteMany({
        where: {
          tenantID: tenantIdToDelete,
        },
      }),
      prisma.tblUserNotifications.deleteMany({
        where: {
          tenantID: tenantIdToDelete,
        },
      }),
      prisma.tblUserTenantConfigMap.deleteMany({
        where: {
          tenantID: tenantIdToDelete,
        },
      }),
      prisma.tblUsersTenantsRelationship.deleteMany({
        where: {
          tenantID: tenantIdToDelete,
        },
      }),
      prisma.tblAPIKeys.deleteMany({
        where: {
          tenantID: tenantIdToDelete,
        },
      }),
      prisma.tblDatabaseWidgets.deleteMany({
        where: {
          tenantID: tenantIdToDelete,
        },
      }),
      prisma.tblDatabaseDashboards.deleteMany({
        where: {
          tenantID: tenantIdToDelete,
        },
      }),
      prisma.tblDatabaseNotifications.deleteMany({
        where: {
          tenantID: tenantIdToDelete,
        },
      }),
      prisma.tblDatabaseQueries.deleteMany({
        where: {
          tenantID: tenantIdToDelete,
        },
      }),
      prisma.tblRoles.deleteMany({
        where: {
          tenantID: tenantIdToDelete,
        },
      }),
      prisma.tblTenants.delete({
        where: {
          tenantID: tenantIdToDelete,
        },
      }),
    ]);

    Logger.log("success", {
      message: "tenantService:deleteUserTenantByID:success",
      params: { userID, tenantID },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "tenantService:deleteUserTenantByID:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {Number} param0.userID
 * @returns
 */
tenantService.getAllUserTenants = async ({ userID }) => {
  try {
    Logger.log("info", {
      message: "tenantService:getAllUserTenants:params",
      params: { userID },
    });
    const userTenantRelationship =
      await prisma.tblUsersTenantsRelationship.findMany({
        where: {
          userID,
        },
        include: {
          tblTenants: true,
        },
      });
    const tenantsMap = {};
    for (let i = 0; i < userTenantRelationship.length; i++) {
      if (tenantsMap[userTenantRelationship[i].tenantID]) {
        tenantsMap[userTenantRelationship[i].tenantID].roles.push(
          userTenantRelationship[i].role
        );
      } else if (!userTenantRelationship[i].tblTenants.isDisabled) {
        tenantsMap[userTenantRelationship[i].tenantID] = {
          ...userTenantRelationship[i].tblTenants,
        };
        tenantsMap[userTenantRelationship[i].tenantID].roles = [
          userTenantRelationship[i].role,
        ];
      }
    }
    const tenants = Object.keys(tenantsMap).map((tenantID) => {
      return { ...tenantsMap[tenantID] };
    });
    Logger.log("success", {
      message: "tenantService:getAllUserTenants:tenantsLength",
      params: { tenantsLength: tenants?.length },
    });
    return tenants;
  } catch (error) {
    Logger.log("error", {
      message: "tenantService:getAllUserTenants:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {String} param0.tenantName
 * @param {String} param0.tenantLogoURL
 * @param {String} param0.tenantDBURL
 * @returns
 */
tenantService.createTenant = async ({
  userID,
  tenantName,
  tenantLogoURL,
  tenantDBURL,
  tenantDBType,
}) => {
  try {
    Logger.log("info", {
      message: "tenantService:createTenant:params",
      params: { userID, tenantName, tenantLogoURL, tenantDBURL, tenantDBType },
    });

    const newTenant = await prisma.$transaction(async (tx) => {
      const newTenant = await tx.tblTenants.create({
        data: {
          tenantName,
          tenantLogoURL,
          tenantDBURL,
          creatorID: parseInt(userID),
          tenantDBType,
        },
      });
      // add user config
      const newUserConfig = await tx.tblUserTenantConfigMap.create({
        data: {
          userID: parseInt(userID),
          tenantID: newTenant.tenantID,
          config: {},
        },
      });

      const newUserTenantRelationship =
        await tx.tblUsersTenantsRelationship.createMany({
          data: [
            // the creator as creator
            {
              tenantID: newTenant.tenantID,
              userID,
              role: constants.ROLES.PRIMARY.ADMIN.value,
            },
          ],
        });

      return newTenant;
    });
    await tenantAwarePostgreSQLPoolManager.setTenantDBURL(
      String(newTenant.tenantID),
      tenantDBURL,
      false
    );
    Logger.log("success", {
      message: "tenantService:createTenant:newTenantCreated",
      params: { newTenant },
    });
    return newTenant;
  } catch (error) {
    Logger.log("error", {
      message: "tenantService:createTenant:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {String} param0.tenantDBURL
 * @returns
 */
tenantService.testTenantDatabaseConnection = async ({
  userID,
  tenantDBURL,
}) => {
  try {
    Logger.log("info", {
      message: "tenantService:testTenantDatabaseConnection:params",
      params: { userID, tenantDBURL },
    });

    const client = new Client({
      connectionString: tenantDBURL,
    });

    try {
      // Attempt to connect to the database
      await client.connect();
      Logger.log("info", {
        message: "tenantService:testTenantDatabaseConnection:connected",
        params: { userID, tenantDBURL },
      });

      await client.end();
      Logger.log("info", {
        message: "tenantService:testTenantDatabaseConnection:disconnected",
        params: { userID, tenantDBURL },
      });
    } catch (error) {
      Logger.log("error", {
        message: "tenantService:testTenantDatabaseConnection:catch-2",
        params: { userID, tenantDBURL },
      });
      return false;
    }
    Logger.log("success", {
      message: "tenantService:testTenantDatabaseConnection:success",
      params: { userID, tenantDBURL },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "tenantService:testTenantDatabaseConnection:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {Number} param0.tenantID
 * @param {String} param0.tenantName
 * @param {String} param0.tenantLogoURL
 * @param {String} param0.tenantDBURL
 * @param {String} param0.tenantDBType
 * @returns
 */
tenantService.updateTenant = async ({
  userID,
  tenantID,
  tenantName,
  tenantLogoURL,
  tenantDBURL,
  tenantDBType,
}) => {
  try {
    Logger.log("info", {
      message: "tenantService:updateTenant:params",
      params: { userID, tenantID, tenantName, tenantLogoURL, tenantDBType },
    });

    const updatedTenant = await prisma.tblTenants.update({
      where: {
        tenantID,
      },
      data: {
        tenantName,
        tenantLogoURL,
        tenantDBURL,
        tenantDBType,
      },
    });
    await tenantAwarePostgreSQLPoolManager.setTenantDBURL(
      String(tenantID),
      tenantDBURL,
      false
    );
    Logger.log("success", {
      message: "tenantService:updateTenant:updatedTenant",
      params: { userID, updatedTenant },
    });
    return updatedTenant;
  } catch (error) {
    Logger.log("error", {
      message: "tenantService:updateTenant:catch-1",
      params: { error },
    });
    throw error;
  }
};
/**
 *
 * @param {object} param0
 * @param {Number} param0.userID
 * @returns
 */
tenantService.getUserCreatedTenantCount = async ({ userID }) => {
  try {
    Logger.log("info", {
      message: "tenantService:getUserCreatedTenantCount:params",
      params: { userID },
    });
    const userCreatedTenantCount = await prisma.tblTenants.count({
      where: {
        creatorID: userID,
      },
    });

    Logger.log("success", {
      message: "tenantService:getUserCreatedTenantCount:tenantsLength",
      params: {
        userID,
        userCreatedTenantCount,
      },
    });
    return userCreatedTenantCount;
  } catch (error) {
    Logger.log("error", {
      message: "tenantService:getUserCreatedTenantCount:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {Number} param0.tenantID
 * @returns
 */
tenantService.getAllTenantUsers = async ({ tenantID }) => {
  try {
    Logger.log("info", {
      message: "tenantService:getAllTenantUsers:params",
      params: { tenantID },
    });
    const userTenantRelationships =
      await prisma.tblUsersTenantsRelationship.findMany({
        where: {
          tenantID,
        },
        include: {
          tblUsers: true,
        },
      });

    Logger.log("success", {
      message: "tenantService:getAllTenantUsers:tenantsLength",
      params: {
        userTenantRelationshipsLength: userTenantRelationships?.length,
      },
    });
    return userTenantRelationships;
  } catch (error) {
    Logger.log("error", {
      message: "tenantService:getAllTenantUsers:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {Number} param0.tenantID
 * @returns
 */
tenantService.getTenantUserCount = async ({ tenantID }) => {
  try {
    Logger.log("info", {
      message: "tenantService:getTenantUserCount:params",
      params: { tenantID },
    });
    const userTenantRelationship =
      await prisma.tblUsersTenantsRelationship.findMany({
        where: {
          tenantID,
        },
      });

    Logger.log("success", {
      message: "tenantService:getTenantUserCount:tenantsLength",
      params: { currentTenantUserCount: userTenantRelationship?.length },
    });
    return userTenantRelationship ? userTenantRelationship.length : 0;
  } catch (error) {
    Logger.log("error", {
      message: "tenantService:getTenantUserCount:catch-1",
      params: { error },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {Number} param0.tenantID
 * @returns
 */
tenantService.checkIfUserIsAdmin = async ({ userID, tenantID }) => {
  try {
    Logger.log("info", {
      message: "tenantService:checkIfUserIsAdmin:params",
      params: { userID, tenantID },
    });
    const userTenantRelationship =
      await prisma.tblUsersTenantsRelationship.findFirst({
        where: {
          userID,
          tenantID,
          role: constants.ROLES.PRIMARY.ADMIN.value,
        },
        include: {
          tblUsers: true,
        },
      });

    Logger.log("success", {
      message: "tenantService:checkIfUserIsAdmin:userTenantRelationship",
      params: { userTenantRelationship: userTenantRelationship },
    });
    if (userTenantRelationship) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    Logger.log("error", {
      message: "tenantService:checkIfUserIsAdmin:catch-1",
      params: { error },
    });
    throw error;
  }
};

module.exports = { tenantService };
