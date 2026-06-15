const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { DATASOURCE_LOGIC_COMPONENTS } = require("@jet-admin/datasources-logic");
const fileStorageUtil = require("../../utils/fileStorage.util");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
const { vaultService } = require("../vault/vault.service");
const { grantCreatorAccess, removePoliciesForResource } = require("../../config/casbin.config");

const datasourceService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
datasourceService.getAllDatasources = async ({ userID, tenantID, search, page, pageSize }) => {
  Logger.log("info", {
    message: "datasourceService:getAllDatasources:params",
    params: {
      userID,
      tenantID,
      search,
      page,
      pageSize,
    },
  });
  try {
    const where = {
      tenantID: tenantID,
    };

    if (search) {
      where.OR = [
        {
          datasourceTitle: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          datasourceType: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const findManyOptions = {
      where,
      orderBy: {
        createdAt: "desc",
      },
    };

    if (page && pageSize) {
      findManyOptions.skip = (page - 1) * pageSize;
      findManyOptions.take = pageSize;
    }

    const [datasources, totalCount] = await Promise.all([
      prisma.tblDatasources.findMany(findManyOptions),
      prisma.tblDatasources.count({ where }),
    ]);

    Logger.log("success", {
      message: "datasourceService:getAllDatasources:success",
      params: {
        userID,
        datasourcesLength: datasources?.length,
        totalCount,
      },
    });

    return {
      datasources,
      totalCount,
      page: page || 1,
      pageSize: pageSize || datasources.length,
      totalPages: pageSize ? Math.ceil(totalCount / pageSize) : 1,
    };
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:getAllDatasources:error",
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
 * @param {string} param0.datasourceType
 * @param {object} param0.datasourceOptions
 * @returns {Promise<boolean>}
 */
datasourceService.testDatasourceConnection = async ({
  userID,
  tenantID,
  datasourceType,
  datasourceOptions,
}) => {
  Logger.log("info", {
    message: "datasourceService:testDatasourceConnection:params",
    params: {
      userID,
      tenantID,
      datasourceType,
      datasourceOptions,
    },
  });
  try {
    const connectionResult = await DATASOURCE_LOGIC_COMPONENTS[
      datasourceType
    ].testConnection({
      datasourceOptions,
      helpers: {
        fileStorage: fileStorageUtil,
        getCredential: async (vaultCredentialID) => {
          return await vaultService.getCredential({
            tenantID,
            vaultCredentialID,
          });
        },
        getGoogleClientConfig: () => {
          return vaultService.getGoogleClientConfig();
        },
      },
    });

    if (!connectionResult.ok) {
      Logger.log("error", {
        message: "datasourceService:testDatasourceConnection:error",
        params: {
          userID,
          connectionResult,
        },
      });
      throw new Error(connectionResult.error || "Connection test failed");
    }

    Logger.log("success", {
      message: "datasourceService:testDatasourceConnection:success",
      params: {
        userID,
        connectionResult,
      },
    });
    return connectionResult;
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:testDatasourceConnection:error",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 * @param {Object} param0
 * @param {number} param0.tenantID
 * @param {string} param0.datasourceTitle
 * @param {object} param0.datasourceOptions
 * @param {string} param0.datasourceType
 * @param {Array<string>} param0.datasourceTags
 * @param {number} param0.userID
 */
datasourceService.createDatasource = async ({
  userID,
  tenantID,
  datasourceTitle,
  datasourceType,
  datasourceOptions,
  datasourceTags,
  authContext,
}) => {
  Logger.log("info", {
    message: "datasourceService:createDatasource:params",
    params: {
      userID,
      tenantID,
      datasourceTitle,
      datasourceType,
      datasourceOptions,
      datasourceTags,
      authContext,
    },
  });
  try {
    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const finalCreatorID = creatorID || userID;
    if (!finalCreatorID && !createdByApiKeyID) {
      throw new Error("Creator ID or Created By API Key ID is required");
    }
    const newDatasource = await prisma.tblDatasources.create({
      data: {
        tenantID: tenantID,
        datasourceTitle,
        datasourceType,
        datasourceOptions,
        creatorID,
        createdByApiKeyID,
        datasourceTags,
      },
    });

    await grantCreatorAccess(tenantID, "datasource", newDatasource.datasourceID, authContext, finalCreatorID);

    Logger.log("success", {
      message: "datasourceService:createDatasource:success",
      params: {
        tenantID,
        userID,
        newDatasource,
      },
    });
    return newDatasource;
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:createDatasource:error",
      params: {
        tenantID,
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
 * @param {number} param0.datasourceID
 * @returns {Promise<boolean>}
 */
datasourceService.deleteDatasourceByID = async ({
  userID,
  tenantID,
  datasourceID,
}) => {
  Logger.log("info", {
    message: "datasourceService:deleteDatasourceByID:params",
    params: {
      userID,
      tenantID,
      datasourceID,
    },
  });
  try {
    // Prisma will cascade delete database tables based on the schema relation (onDelete: Cascade)
    await prisma.tblDatasources.delete({
      where: {
        datasourceID: datasourceID,
        tenantID: tenantID,
      },
    });

    await removePoliciesForResource(tenantID, `datasource:${datasourceID}`);

    Logger.log("success", {
      message: "datasourceService:deleteDatasourceByID:success",
      params: {
        userID,
        datasourceID,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:deleteDatasourceByID:error",
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
 * @param {number} param0.datasourceID
 * @returns {Promise<boolean>}
 */
datasourceService.getDatasourceByID = async ({
  userID,
  tenantID,
  datasourceID,
}) => {
  Logger.log("info", {
    message: "datasourceService:getDatasourceByID:params",
    params: {
      userID,
      tenantID,
      datasourceID,
    },
  });
  try {
    const datasource = await prisma.tblDatasources.findUnique({
      where: {
        datasourceID: datasourceID,
        tenantID: tenantID,
      },
    });
    Logger.log("success", {
      message: "datasourceService:getDatasourceByID:success",
      params: {
        userID,
        datasource,
      },
    });
    return datasource;
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:getDatasourceByID:error",
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
 * @param {number} param0.datasourceID
 * @param {string} param0.datasourceTitle
 * @param {string} param0.datasourceType
 * @param {object} param0.datasourceOptions
 * @param {Array<string>} param0.datasourceTags
 * @returns {Promise<boolean>}
 */
datasourceService.updateDatasourceByID = async ({
  userID,
  tenantID,
  datasourceID,
  datasourceTitle,
  datasourceType,
  datasourceOptions,
  datasourceTags,
}) => {
  Logger.log("info", {
    message: "datasourceService:updateDatasourceByID:params",
    params: {
      userID,
      tenantID,
      datasourceID,
      datasourceTitle,
      datasourceType,
      datasourceOptions,
      datasourceTags,
    },
  });
  try {
    await prisma.tblDatasources.update({
      where: {
        datasourceID: datasourceID,
        tenantID: tenantID,
      },
      data: {
        ...(datasourceTitle != undefined && { datasourceTitle }),
        ...(datasourceType != undefined && { datasourceType }),
        ...(datasourceOptions != undefined && { datasourceOptions }),
        ...(datasourceTags != undefined && { datasourceTags }),
        updatedAt: new Date(),
      },
    });
    Logger.log("success", {
      message: "datasourceService:updateDatasourceByID:success",
      params: {
        userID,
        datasourceID,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:updateDatasourceByID:error",
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
 * @param {number} param0.datasourceID
 * @returns {Promise<boolean>}
 */
datasourceService.cloneDatasourceByID = async ({
  userID,
  tenantID,
  datasourceID,
  authContext,
}) => {
  Logger.log("info", {
    message: "datasourceService:cloneDatasourceByID:params",
    params: {
      userID,
      tenantID,
      datasourceID,
      authContext,
    },
  });
  try {
    const datasource = await prisma.tblDatasources.findUnique({
      where: {
        datasourceID: datasourceID,
        tenantID: tenantID,
      },
    });
    if (!datasource) {
      throw new Error("Datasource not found");
    }
        const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
        const finalCreatorID = creatorID || userID;
        if (!finalCreatorID && !createdByApiKeyID) {
          throw new Error("Creator ID or Created By API Key ID is required");
        }
        const newDatasource = await prisma.tblDatasources.create({
          data: {
            tenantID: tenantID,
            datasourceTitle: datasource.datasourceTitle + " (Copy)",
            datasourceType: datasource.datasourceType,
            datasourceOptions: datasource.datasourceOptions,
            datasourceTags: datasource.datasourceTags,
            creatorID: creatorID || userID,
            createdByApiKeyID,
          },
        });

        await grantCreatorAccess(tenantID, "datasource", newDatasource.datasourceID, authContext, finalCreatorID);

    Logger.log("success", {
      message: "datasourceService:cloneDatasourceByID:success",
      params: {
        userID,
        datasourceID,
        newDatasourceID: newDatasource.datasourceID,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:cloneDatasourceByID:error",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 * Proxies an action call through an instantiated DataSource class.
 * Loads the datasource from DB, resolves credentials, and dispatches.
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.datasourceID
 * @param {string} param0.action         — Method name on the DataSource class (e.g. "listSpreadsheets")
 * @param {object} param0.params         — Arguments to pass to the action method
 * @returns {Promise<any>}
 */
datasourceService.proxyDatasourceAction = async ({
  userID,
  tenantID,
  datasourceID,
  action,
  params,
}) => {
  Logger.log("info", {
    message: "datasourceService:proxyDatasourceAction:params",
    params: { userID, tenantID, datasourceID, action, params },
  });

  try {
    // 1. Load the datasource from DB
    const datasource = await prisma.tblDatasources.findUnique({
      where: {
        datasourceID: datasourceID,
        tenantID: tenantID,
      },
    });

    if (!datasource) {
      throw new Error(`Datasource ${datasourceID} not found.`);
    }

    // 2. Instantiate the DataSource class via registry
    const { dataSourceRegistry } = require("@jet-admin/datasources-logic");
    const DataSourceClass = dataSourceRegistry.getDataSource(datasource.datasourceType);

    const helpers = {
      fileStorage: fileStorageUtil,
      getCredential: async (vaultCredentialID) => {
        return await vaultService.getCredential({
          tenantID,
          vaultCredentialID,
        });
      },
      getGoogleClientConfig: () => {
        return vaultService.getGoogleClientConfig();
      },
    };

    const dsInstance = new DataSourceClass(
      {
        datasourceID: datasource.datasourceID,
        datasourceType: datasource.datasourceType,
        datasourceOptions: datasource.datasourceOptions,
      },
      helpers
    );

    // 3. Validate the action method exists
    if (typeof dsInstance[action] !== "function") {
      throw new Error(
        `Action '${action}' is not supported by datasource type '${datasource.datasourceType}'.`
      );
    }

    // 4. Execute the action
    const result = await dsInstance[action](params, {}, helpers);

    Logger.log("success", {
      message: "datasourceService:proxyDatasourceAction:success",
      params: { userID, datasourceID, action },
    });

    return result;
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:proxyDatasourceAction:error",
      params: { userID, datasourceID, action, error: error.message || error },
    });
    throw error;
  }
};



module.exports = {datasourceService};

