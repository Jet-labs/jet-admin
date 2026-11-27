const { prisma } = require("../../config/prisma.config");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { tenantRoleService } = require("../tenantRole/tenantRole.service");
const { appPageService } = require("../appPage/appPage.service");
const { dataQueryService } = require("../dataQuery/dataQuery.service");
const { cronJobService } = require("../cronJob/cronJob.service");
const { apiKeyService } = require("../apiKey/apiKey.service");
const { widgetService } = require("../widget/widget.service");
const { datasourceService } = require("../datasource/datasource.service");
const { workflowService } = require("../workflow/workflow.service");
const { listenerService } = require("../listener/listener.service");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");

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
    let tenantRoles = null,
      tenantDatabaseMetadata = null,
      tenantAppPages = null,
      tenantDataQueries = null,
      tenantWidgets = null,
      tenantCronJobs = null,
      tenantAPIKeys = null,
      tenantDatasources = null,
      tenantWorkflows = null,
      tenantListeners = null;

    try {
      [
        tenantRoles,
        tenantAppPages,
        tenantDataQueries,
        tenantWidgets,
        tenantCronJobs,
        tenantAPIKeys,
        tenantDatasources,
        tenantWorkflows,
        tenantListeners,
      ] = await Promise.all([
        tenantRoleService.getAllTenantRoles({ userID, tenantID }).catch(() => null),
        appPageService.getAllAppPages({ userID, tenantID }).catch(() => null),
        dataQueryService.getAllDataQueries({ userID, tenantID }).catch(() => null),
        widgetService.getAllWidgets({ userID, tenantID }).catch(() => null),
        cronJobService.getAllCronJobs({ userID, tenantID }).catch(() => null),
        apiKeyService.getAllAPIKeys({ userID, tenantID }).catch(() => null),
        datasourceService.getAllDatasources({ userID, tenantID }).catch(() => null),
        workflowService.getAllWorkflows({ userID, tenantID }).catch(() => null),
        listenerService.getAllListeners({ tenantID }).catch(() => null),
      ]);
    } catch (error) {
      Logger.log("error", {
        message: "tenantService:getUserTenantByID:catch-1",
        params: { error },
      });
    }

    const getCount = (res) => {
      if (!res) return 0;
      if (typeof res.totalCount === "number") return res.totalCount;
      if (Array.isArray(res)) return res.length;
      return 0;
    };

    const tenant = {
      ...userTenantRelationships.tblTenants,
      roles: userTenantRelationships,
      relationships: allRelationshipsOfTenant,
      tenantRolesCount: getCount(tenantRoles),
      tenantDatabaseSchemasCount: tenantDatabaseMetadata?.metadata?.length || 0,
      tenantDatabaseTablesCount:
        tenantDatabaseMetadata?.metadata
          ?.map((schema) => (schema.tables ? schema.tables.length : 0))
          .reduce((acc, curr) => acc + curr, 0) || 0,
      tenantAppPageCount: getCount(tenantAppPages),
      tenantDataQueryCount: getCount(tenantDataQueries),
      tenantCronJobCount: getCount(tenantCronJobs),
      tenantAPIKeyCount: getCount(tenantAPIKeys),
      tenantWidgetCount: getCount(tenantWidgets),
      tenantDatasourceCount: getCount(tenantDatasources),
      tenantWorkflowCount: getCount(tenantWorkflows),
      tenantListenerCount: getCount(tenantListeners),
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

    // Tenant-scoped rows are spread across many tables, and several foreign
    // keys are "NoAction" rather than "Cascade", so the delete order matters.
    // Keep this list in dependency order: children before parents.
    await prisma.$transaction(async (tx) => {
      // Workflow runtime data (logs/data collection requests cascade from
      // instances; instances must go before workflows because their FK is
      // NoAction).
      await tx.tblWorkflowDataCollectionRequests.deleteMany({
        where: { tblWorkflowInstances: { tenantID } },
      });
      await tx.tblWorkflowInstanceLogs.deleteMany({
        where: { tblWorkflowInstances: { tenantID } },
      });
      await tx.tblWorkflowInstances.deleteMany({ where: { tenantID } });

      // Cron jobs must be removed before their workflows, and history before
      // the jobs themselves.
      await tx.tblCronJobHistory.deleteMany({
        where: { tblCronJobs: { tenantID } },
      });
      await tx.tblCronJobs.deleteMany({ where: { tenantID } });

      // Listener actions/events cascade from listeners; delete listeners
      // explicitly before their datasources.
      await tx.tblListenerActions.deleteMany({
        where: { tblListeners: { tenantID } },
      });
      await tx.tblListenerEvents.deleteMany({ where: { tenantID } });
      await tx.tblListeners.deleteMany({ where: { tenantID } });

      // Workflow graph rows cascade from the workflow, but remove them
      // explicitly so the operation is obvious and order-safe.
      await tx.tblWorkflowEdge.deleteMany({
        where: { tblWorkflows: { tenantID } },
      });
      await tx.tblWorkflowNodes.deleteMany({
        where: { tblWorkflows: { tenantID } },
      });
      await tx.tblWorkflows.deleteMany({ where: { tenantID } });

      // App-page versions have no FK to app pages in the schema, so they
      // must be removed by tenant explicitly.
      await tx.tblAppPageEditorHistory.deleteMany({ where: { tenantID } });
      await tx.tblAppPages.deleteMany({ where: { tenantID } });

      await tx.tblDataQueries.deleteMany({ where: { tenantID } });
      await tx.tblDatasources.deleteMany({ where: { tenantID } });
      await tx.tblWidgets.deleteMany({ where: { tenantID } });

      // Vault entries reference API keys/roles with NoAction.
      await tx.tblVaultCredentials.deleteMany({ where: { tenantID } });

      await tx.tblAPIKeyRoleMappings.deleteMany({
        where: {
          OR: [
            { tblAPIKeys: { tenantID } },
            { tblRoles: { tenantID } },
          ],
        },
      });
      await tx.tblRolePermissionMappings.deleteMany({
        where: { tblRoles: { tenantID } },
      });
      await tx.tblUserTenantRoleMappings.deleteMany({ where: { tenantID } });
      await tx.tblUserNotifications.deleteMany({ where: { tenantID } });
      await tx.tblUserTenantConfigMap.deleteMany({ where: { tenantID } });
      await tx.tblUsersTenantsRelationship.deleteMany({ where: { tenantID } });

      // API keys and roles must go after everything that references them.
      await tx.tblAPIKeys.deleteMany({ where: { tenantID } });
      await tx.tblRoles.deleteMany({ where: { tenantID } });

      // Folders last: widgets, queries, pages, workflows, etc. reference them.
      await tx.tblFolders.deleteMany({ where: { tenantID } });

      // Not represented by tenant relations in the Prisma schema, but still
      // tenant-scoped. Published widget-library entries are deployment-wide
      // and intentionally retained (their sourceTenantID is advisory only).
      await tx.tblTenantConfig.deleteMany({ where: { tenantID } });

      // Remove Casbin policies for this tenant domain (v1 = tenantID).
      await tx.$executeRawUnsafe(
        `DELETE FROM casbin_rule WHERE v1 = $1`,
        tenantID
      );

      await tx.tblTenants.delete({ where: { tenantID } });
    }, { timeout: 60000 });

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
 * @param {String} param0.tenantTitle
 * @param {String} param0.tenantLogoURL
 * @returns
 */
tenantService.createTenant = async ({
  userID,
  tenantTitle,
  tenantLogoURL,
  authContext,
}) => {
  try {
    Logger.log("info", {
      message: "tenantService:createTenant:params",
      params: { userID, tenantTitle, tenantLogoURL, authContext },
    });

    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const newTenant = await prisma.$transaction(async (tx) => {
      const newTenant = await tx.tblTenants.create({
        data: {
          tenantTitle,
          tenantLogoURL,
          creatorID,
          createdByApiKeyID,
        },
      });
      // add user config
      const newUserConfig = await tx.tblUserTenantConfigMap.create({
        data: {
          userID: userID,
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

    // Grant creator admin wildcard via Casbin (so authorize:user:list etc. pass)
    try {
      const { addPolicy } = require("../../config/casbin.config");
      // user creator
      if (userID && newTenant.tenantID) {
        await addPolicy(userID, newTenant.tenantID, "*", "*", "allow");
        Logger.log("success", { message: "tenantService:createTenant:casbinAdminGranted", params: { userID, tenantID: newTenant.tenantID } });
      }
      const apiKeyCreator = createdByApiKeyID;
      if (apiKeyCreator && newTenant.tenantID) {
        const { addPolicy: addPolicy2 } = require("../../config/casbin.config");
        await addPolicy2(apiKeyCreator, newTenant.tenantID, "*", "*", "allow");
      }
    } catch (casbinErr) {
      Logger.log("warning", { message: "tenantService:createTenant:casbinFailed", params: { error: casbinErr.message } });
      // don't fail tenant creation if casbin fails
    }

    // Global roles are seeded with tenantID=null; their Casbin policies must
    // exist in the new tenant domain immediately. Previously this only
    // happened after a manual sync/restart, so a brand-new ADMIN API key got
    // 403 on every protected route.
    try {
      await tenantRoleService.syncGlobalRolesForTenant(newTenant.tenantID);
    } catch (policyErr) {
      Logger.log("warning", {
        message: "tenantService:createTenant:globalRolePolicySyncFailed",
        params: { error: policyErr.message, tenantID: newTenant.tenantID },
      });
      // don't fail tenant creation if policy sync fails
    }

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
 * @param {Number} param0.tenantID
 * @param {String} param0.tenantTitle
 * @param {String} param0.tenantLogoURL
 * @returns
 */
tenantService.updateTenant = async ({
  userID,
  tenantID,
  tenantTitle,
  tenantLogoURL,
}) => {
  try {
    Logger.log("info", {
      message: "tenantService:updateTenant:params",
      params: { userID, tenantID, tenantTitle, tenantLogoURL },
    });

    const updatedTenant = await prisma.tblTenants.update({
      where: {
        tenantID,
      },
      data: {
        tenantTitle,
        tenantLogoURL,
      },
    });

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
