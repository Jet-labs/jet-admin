const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { DATASOURCE_LOGIC_COMPONENTS } = require("@jet-admin/datasources-logic");
const fileStorageUtil = require("../../utils/fileStorage.util");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
const { vaultService } = require("../vault/vault.service");
const { grantCreatorAccess, removePoliciesForResource } = require("../../config/casbin.config");
const { encrypt, decrypt } = require("../../utils/encryption.util");
// MASK_PLACEHOLDER is the sentinel written by mask() in sensitive.js.
// Kept here as a safety fallback in mergeAndRestoreMaskedOptions.
const { MASK_PLACEHOLDER } = require("../../utils/sensitive");

function encryptOptions(options) {
  if (!options) return options;
  if (options.__encrypted) return options; // Already encrypted
  const encrypted = encrypt(JSON.stringify(options));
  return {
    __encrypted: true,
    ...encrypted,
  };
}

function decryptOptions(options) {
  if (!options) return options;
  if (!options.__encrypted) return options; // Not encrypted (backwards compatibility)
  try {
    const decryptedStr = decrypt({
      iv: options.iv,
      data: options.data,
      authTag: options.authTag,
    });
    return JSON.parse(decryptedStr);
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:decryptOptions:error",
      params: { error: error.message },
    });
    return options; // Fallback to raw options if decryption fails
  }
}

/**
 * Merge incoming (potentially partially-masked) options with the previously
 * decrypted values stored in the database.
 *
 * Any field whose value equals MASK_PLACEHOLDER was deliberately hidden from
 * the caller by mask() in the API response — they sent it back unchanged,
 * meaning "keep the existing secret". We restore the real value from the DB.
 *
 * This approach is key-name agnostic: it works for any credential field
 * regardless of naming convention, without maintaining a separate list.
 *
 * @param {object} incomingOptions       - Options as received from the API caller
 * @param {object} existingDecryptedOptions - Decrypted options currently in the DB
 * @returns {object} Merged options ready for re-encryption and storage
 */
function mergeAndRestoreMaskedOptions(incomingOptions, existingDecryptedOptions) {
  if (!incomingOptions) return incomingOptions;

  const merged = { ...incomingOptions };

  for (const k of Object.keys(merged)) {
    if (merged[k] === MASK_PLACEHOLDER) {
      // Caller sent back the placeholder — restore the real value from DB
      if (existingDecryptedOptions && existingDecryptedOptions[k] !== undefined) {
        merged[k] = existingDecryptedOptions[k];
      }
    } else if (
      typeof merged[k] === "object" &&
      merged[k] !== null &&
      existingDecryptedOptions &&
      typeof existingDecryptedOptions[k] === "object"
    ) {
      // Recurse into nested objects (e.g. OAuth credential sub-objects)
      merged[k] = mergeAndRestoreMaskedOptions(merged[k], existingDecryptedOptions[k]);
    }
  }

  return merged;
}


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

    const decryptedDatasources = datasources.map((d) => ({
      ...d,
      datasourceOptions: decryptOptions(d.datasourceOptions),
    }));

    Logger.log("success", {
      message: "datasourceService:getAllDatasources:success",
      params: {
        userID,
        datasourcesLength: decryptedDatasources?.length,
        totalCount,
      },
    });

    return {
      datasources: decryptedDatasources,
      totalCount,
      page: page || 1,
      pageSize: pageSize || decryptedDatasources.length,
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
  datasourceID,
}) => {
  Logger.log("info", {
    message: "datasourceService:testDatasourceConnection:params",
    params: {
      userID,
      tenantID,
      datasourceType,
      datasourceID,
    },
  });
  try {
    let finalOptions = datasourceOptions;
    const targetDSID = datasourceID || datasourceOptions?.datasourceID;
    if (targetDSID) {
      const existing = await prisma.tblDatasources.findFirst({
        where: { datasourceID: targetDSID, tenantID },
      });
      const existingDecrypted = existing ? decryptOptions(existing.datasourceOptions) : null;
      finalOptions = mergeAndRestoreMaskedOptions(datasourceOptions, existingDecrypted);
    }

    const component = DATASOURCE_LOGIC_COMPONENTS[datasourceType];
    if (!component || typeof component.testConnection !== "function") {
      throw new Error(`Connection test for datasource type '${datasourceType}' is not supported.`);
    }

    const connectionResult = await component.testConnection({
      datasourceOptions: finalOptions,
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

    if (!connectionResult || (!connectionResult.ok && !connectionResult.success)) {
      Logger.log("error", {
        message: "datasourceService:testDatasourceConnection:error",
        params: {
          userID,
          connectionResult,
        },
      });
      throw new Error(connectionResult?.error || "Connection test failed");
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
        error: error.message || error,
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
    const encryptedOptions = encryptOptions(datasourceOptions);
    const newDatasource = await prisma.tblDatasources.create({
      data: {
        tenantID: tenantID,
        datasourceTitle,
        datasourceType,
        datasourceOptions: encryptedOptions,
        creatorID,
        createdByApiKeyID,
        datasourceTags,
      },
    });

    await grantCreatorAccess(tenantID, "datasource", newDatasource.datasourceID, authContext, finalCreatorID);

    newDatasource.datasourceOptions = decryptOptions(newDatasource.datasourceOptions);

    Logger.log("success", {
      message: "datasourceService:createDatasource:success",
      params: {
        tenantID,
        userID,
        newDatasourceID: newDatasource.datasourceID,
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
    const deleted = await prisma.tblDatasources.deleteMany({
      where: {
        datasourceID: datasourceID,
        tenantID: tenantID,
      },
    });
    if (deleted.count === 0) {
      throw new Error("Datasource not found");
    }

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
    const datasource = await prisma.tblDatasources.findFirst({
      where: {
        datasourceID: datasourceID,
        tenantID: tenantID,
      },
    });
    if (datasource) {
      datasource.datasourceOptions = decryptOptions(datasource.datasourceOptions);
    }
    Logger.log("success", {
      message: "datasourceService:getDatasourceByID:success",
      params: {
        userID,
        datasourceID: datasource?.datasourceID,
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
      datasourceTags,
    },
  });
  try {
    let finalOptions = datasourceOptions;
    if (datasourceOptions !== undefined) {
      const existing = await prisma.tblDatasources.findFirst({
        where: { datasourceID, tenantID },
      });
      const existingDecrypted = existing ? decryptOptions(existing.datasourceOptions) : null;
      finalOptions = encryptOptions(mergeAndRestoreMaskedOptions(datasourceOptions, existingDecrypted));
    }

    const updated = await prisma.tblDatasources.updateMany({
      where: {
        datasourceID: datasourceID,
        tenantID: tenantID,
      },
      data: {
        ...(datasourceTitle != undefined && { datasourceTitle }),
        ...(datasourceType != undefined && { datasourceType }),
        ...(finalOptions != undefined && { datasourceOptions: finalOptions }),
        ...(datasourceTags != undefined && { datasourceTags }),
        updatedAt: new Date(),
      },
    });
    if (updated.count === 0) {
      throw new Error("Datasource not found");
    }
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
    const datasource = await prisma.tblDatasources.findFirst({
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
    const datasource = await prisma.tblDatasources.findFirst({
      where: {
        datasourceID: datasourceID,
        tenantID: tenantID,
      },
    });

    if (!datasource) {
      throw new Error(`Datasource ${datasourceID} not found.`);
    }

    const decryptedOptions = decryptOptions(datasource.datasourceOptions);

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
        datasourceOptions: decryptedOptions,
      },
      helpers
    );

    // 3. Validate the action method against allowlist
    const ALLOWED_ACTIONS = {
      postgres: ["runQuery", "getSchema", "testConnection"],
      mysql: ["runQuery", "getSchema", "testConnection"],
      google_sheets: ["listSpreadsheets", "listSheets", "previewData", "readSheet", "testConnection"],
      excel_csv: ["previewData", "getColumns", "testConnection"],
      rest_api: ["testConnection", "execute"],
    };

    const allowedForType = ALLOWED_ACTIONS[datasource.datasourceType] || [];
    if (!allowedForType.includes(action) || typeof dsInstance[action] !== "function") {
      throw new Error(
        `Action '${action}' is not supported or allowed for datasource type '${datasource.datasourceType}'.`
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



// ─── Schema Introspection ────────────────────────────────────────────────────

/** @type {Record<string, object>|null} — in-process singleton */
let _datasourceFormConfigSchemas = null;

async function loadDatasourceFormConfigSchemas() {
  if (_datasourceFormConfigSchemas) return _datasourceFormConfigSchemas;
  const mod = await import('@jet-admin/datasource-types');
  _datasourceFormConfigSchemas = mod.DATASOURCE_FORM_CONFIG_SCHEMAS;
  return _datasourceFormConfigSchemas;
}

/**
 * Returns datasource connection form config schemas, keyed by datasourceType.
 * If datasourceType is supplied, returns only the form config for that type.
 *
 * @param {object} param0
 * @param {string|undefined} param0.datasourceType
 * @returns {Promise<Record<string, object>|object>}
 */
datasourceService.getDatasourceFormSchemas = async ({ datasourceType } = {}) => {
  Logger.log('info', {
    message: 'datasourceService:getDatasourceFormSchemas:params',
    params: { datasourceType },
  });

  const all = await loadDatasourceFormConfigSchemas();

  if (datasourceType) {
    const schema = all[datasourceType];
    if (!schema) {
      throw Object.assign(new Error(`No form schema found for datasourceType: '${datasourceType}'`), { code: 'SCHEMA_NOT_FOUND' });
    }
    return { [datasourceType]: schema };
  }

  return all;
};

module.exports = { datasourceService, decryptOptions };

