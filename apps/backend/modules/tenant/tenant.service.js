const { Client } = require("pg");
const { prisma } = require("../../config/prisma.config");
const {
  tenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");
const constants = require("../../constants");
const environmentVariables = require("../../environment");
const Logger = require("../../utils/logger");

const tenantService = {};

/**
 *
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {Number} param0.tenantID
 * @returns
 */
tenantService.getUserTenantByID = async ({ userID, tenantID }) => {
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
    const tenant = {
      ...userTenantRelationships.tblTenants,
      roles: userTenantRelationships,
      relationships: allRelationshipsOfTenant,
    };
    Logger.log("success", {
      message: "tenantService:getUserTenantByID:tenant",
      params: { tenant },
    });
    return tenant;
  } catch (error) {
    Logger.log("error", {
      message: "tenantService:getUserTenantByID:catch1",
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
      message: "tenantService:getAllUserTenants:catch1",
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
}) => {
  try {
    Logger.log("info", {
      message: "tenantService:createTenant:params",
      params: { userID, tenantName, tenantLogoURL, tenantDBURL },
    });

    const newTenant = await prisma.$transaction(async (tx) => {
      const newTenant = await tx.tblTenants.create({
        data: {
          tenantName,
          tenantLogoURL,
          tenantDBURL,
          creatorID: userID,
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
    Logger.log("success", {
      message: "tenantService:createTenant:newTenantCreated",
      params: { newTenant },
    });
    return newTenant;
  } catch (error) {
    Logger.log("error", {
      message: "tenantService:createTenant:catch1",
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
 * @returns
 */
tenantService.updateTenant = async ({
  userID,
  tenantID,
  tenantName,
  tenantLogoURL,
  tenantDBURL,
}) => {
  try {
    Logger.log("info", {
      message: "tenantService:updateTenant:params",
      params: { userID, tenantID, tenantName, tenantLogoURL },
    });

    const updatedTenant = await prisma.tblTenants.update({
      where: {
        tenantID,
      },
      data: {
        tenantName,
        tenantLogoURL,
        tenantDBURL,
      },
    });
    await tenantAwarePostgreSQLPoolManager.setTenantDBURL(
      String(tenantID),
      tenantDBURL,
      true
    );
    Logger.log("success", {
      message: "tenantService:updateTenant:updatedTenant",
      params: { userID, updatedTenant },
    });
    return updatedTenant;
  } catch (error) {
    Logger.log("error", {
      message: "tenantService:updateTenant:catch1",
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
      message: "tenantService:getUserCreatedTenantCount:catch1",
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
      message: "tenantService:getAllTenantUsers:catch1",
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
      message: "tenantService:getTenantUserCount:catch1",
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
      message: "tenantService:checkIfUserIsAdmin:catch1",
      params: { error },
    });
    throw error;
  }
};

module.exports = { tenantService };
