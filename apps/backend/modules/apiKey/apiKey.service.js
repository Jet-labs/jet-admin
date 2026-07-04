const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { generateAPIKey, hashAPIKey } = require("../../utils/crypto.util");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
const { addRoleForUser, removeRoleForUser, getRolesForUser, reloadPolicies } = require("../../config/casbin.config");

const apiKeyService = {};

/**
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
apiKeyService.getAllAPIKeys = async ({ userID, tenantID }) => {
  Logger.log("info", {
    message: "apiKeyService:getAllAPIKeys:params",
    params: { userID, tenantID },
  });

  try {
    const apiKeys = await prisma.tblAPIKeys.findMany({
      where: {
        tenantID: tenantID,
      },
    });

    const sanitizedApiKeys = apiKeys.map(({ apiKeyHash, ...rest }) => rest);

    Logger.log("success", {
      message: "apiKeyService:getAllAPIKeys:success",
      params: { userID, count: sanitizedApiKeys.length },
    });

    return sanitizedApiKeys;
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyService:getAllAPIKeys:failure",
      params: { userID, errorMessage: error.message },
    });
    throw error;
  }
};

/**
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {Array<number>} param0.roleIDs
 * @param {string} param0.apiKeyTitle
 * @returns {Promise<object>}
 */
apiKeyService.createAPIKey = async ({
  userID,
  tenantID,
  roleIDs,
  apiKeyTitle,
  authContext,
}) => {
  Logger.log("info", {
    message: "apiKeyService:createAPIKey:params",
    params: { userID, tenantID, apiKeyTitle },
  });

  try {
    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const rawKey = generateAPIKey();
    const { prefix, hash } = hashAPIKey(rawKey);

    const createdAPIKey = await prisma.$transaction(async (tx) => {
      const apiKey = await tx.tblAPIKeys.create({
        data: {
          tenantID: tenantID,
          creatorID,
          createdByApiKeyID,
          apiKeyTitle,
          apiKeyHash: hash,
          apiKeyPrefix: prefix,
          isDisabled: false,
        },
      });

      const apiKeyRoleMappings = roleIDs.map((roleID) => ({
        roleID: roleID,
        apiKeyID: apiKey.apiKeyID,
      }));

      await tx.tblAPIKeyRoleMappings.createMany({
        data: apiKeyRoleMappings,
      });

      return apiKey;
    });

    Logger.log("success", {
      message: "apiKeyService:createAPIKey:success",
      params: { userID, apiKeyID: createdAPIKey?.apiKeyID, apiKeyTitle },
    });

    if (roleIDs && roleIDs.length > 0) {
      for (const roleID of roleIDs) {
        await addRoleForUser(createdAPIKey.apiKeyID, `role:${roleID}`, tenantID);
      }
    }

    return { apiKey: rawKey };
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyService:createAPIKey:failure",
      params: { userID, errorMessage: error.message },
    });
    throw error;
  }
};

/**
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.apiKeyID
 * @returns {Promise<object>}
 */
apiKeyService.getAPIKeyByID = async ({ userID, tenantID, apiKeyID }) => {
  Logger.log("info", {
    message: "apiKeyService:getAPIKeyByID:params",
    params: { userID, tenantID, apiKeyID },
  });

  try {
    const apiKey = await prisma.tblAPIKeys.findFirst({
      where: {
        apiKeyID: apiKeyID,
        tenantID: tenantID,
      },
      include: {
        tblAPIKeyRoleMappings: true,
      },
    });

    if (!apiKey) {
      throw new Error("APIKey not found");
    }

    const { apiKeyHash, ...sanitizedAPIKey } = apiKey;

    Logger.log("success", {
      message: "apiKeyService:getAPIKeyByID:success",
      params: { userID, apiKeyID },
    });

    return sanitizedAPIKey;
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyService:getAPIKeyByID:failure",
      params: { userID, errorMessage: error.message },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {string} param0.tenantID
 * @param {number} param0.apiKeyID
 * @param {string} param0.apiKeyTitle
 * @param {Array<number>} param0.roleIDs
 * @param {Boolean} param0.isDisabled
 * @returns {Promise<boolean>}
 */
apiKeyService.updateAPIKeyByID = async ({
  userID,
  tenantID,
  apiKeyID,
  apiKeyTitle,
  roleIDs,
  isDisabled,
}) => {
  Logger.log("info", {
    message: "apiKeyService:updateAPIKeyByID:params",
    params: {
      userID,
      tenantID,
      apiKeyID,
      apiKeyTitle,
      isDisabled,
      roleIDs,
    },
  });

  try {
    const updatedAPIKey = await prisma.$transaction(async (tx) => {
      const existingAPIKey = await tx.tblAPIKeys.findFirst({
        where: { apiKeyID, tenantID },
      });
      if (!existingAPIKey) {
        throw new Error(`API Key with ID ${apiKeyID} not found in this tenant`);
      }

      const apiKeyUpdateData = {
        ...(apiKeyTitle && { apiKeyTitle }),
        ...(isDisabled !== undefined && { isDisabled }),
      };

      const updatedAPIKey = await tx.tblAPIKeys.update({
        where: { apiKeyID },
        data: apiKeyUpdateData,
      });

      if (roleIDs !== undefined) {
        await tx.tblAPIKeyRoleMappings.deleteMany({
          where: { apiKeyID },
        });

        if (roleIDs.length > 0) {
          const newMappings = roleIDs.map((roleID) => ({
            roleID: roleID,
            apiKeyID,
          }));

          await tx.tblAPIKeyRoleMappings.createMany({
            data: newMappings,
          });
        }
      }

      return updatedAPIKey;
    });

    Logger.log("success", {
      message: "apiKeyService:updateAPIKeyByID:success",
      params: {
        userID,
        tenantID,
        apiKeyID,
        apiKeyTitle,
        roleIDs,
      },
    });

    if (roleIDs !== undefined) {
      const existingRoles = await getRolesForUser(apiKeyID, tenantID);
      await Promise.allSettled(
        existingRoles.map((role) => removeRoleForUser(apiKeyID, role, tenantID))
      );
      if (roleIDs.length > 0) {
        await Promise.allSettled(
          roleIDs.map((roleID) => addRoleForUser(apiKeyID, `role:${roleID}`, tenantID))
        );
      }
    }

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyService:updateAPIKeyByID:failure",
      params: {
        userID,
        tenantID,
        apiKeyID,
        errorMessage: error.message,
      },
    });
    throw error;
  }
};

/**
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.apiKeyID
 * @returns {Promise<boolean>}
 */
apiKeyService.deleteAPIKeyByID = async ({ userID, tenantID, apiKeyID }) => {
  Logger.log("info", {
    message: "apiKeyService:deleteAPIKeyByID:params",
    params: { userID, tenantID, apiKeyID },
  });

  try {
    const existingRoles = await getRolesForUser(apiKeyID, tenantID);

    await prisma.$transaction(async (tx) => {
      const existingAPIKey = await tx.tblAPIKeys.findFirst({
        where: { apiKeyID, tenantID },
      });
      if (!existingAPIKey) {
        throw new Error(`API key with ID ${apiKeyID} not found in this tenant`);
      }
      await tx.tblAPIKeyRoleMappings.deleteMany({
        where: { apiKeyID },
      });

      await tx.tblAPIKeys.delete({
        where: {
          apiKeyID,
        },
      });

      return true;
    });

    await Promise.allSettled(
      existingRoles.map((role) => removeRoleForUser(apiKeyID, role, tenantID))
    );

    Logger.log("success", {
      message: "apiKeyService:deleteAPIKeyByID:success",
      params: { userID, apiKeyID },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyService:deleteAPIKeyByID:failure",
      params: { userID, errorMessage: error.message },
    });
    throw error;
  }
};

/**
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.apiKeyID
 * @returns {Promise<object>}
 */
apiKeyService.cloneAPIKey = async ({ userID, tenantID, apiKeyID, authContext }) => {
  Logger.log("info", {
    message: "apiKeyService:cloneAPIKey:params",
    params: { userID, tenantID, apiKeyID },
  });

  try {
    const existing = await prisma.tblAPIKeys.findFirst({
      where: { apiKeyID, tenantID },
      include: {
        tblAPIKeyRoleMappings: true,
      },
    });

    if (!existing) {
      throw new Error("API Key not found in this tenant");
    }

    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const rawKey = generateAPIKey();
    const { prefix, hash } = hashAPIKey(rawKey);

    const clonedAPIKey = await prisma.$transaction(async (tx) => {
      const apiKey = await tx.tblAPIKeys.create({
        data: {
          tenantID: tenantID,
          creatorID,
          createdByApiKeyID,
          apiKeyTitle: existing.apiKeyTitle + " (Copy)",
          apiKeyHash: hash,
          apiKeyPrefix: prefix,
          isDisabled: true,
        },
      });

      const apiKeyRoleMappings = existing.tblAPIKeyRoleMappings.map((mapping) => ({
        roleID: mapping.roleID,
        apiKeyID: apiKey.apiKeyID,
      }));

      if (apiKeyRoleMappings.length > 0) {
        await tx.tblAPIKeyRoleMappings.createMany({
          data: apiKeyRoleMappings,
        });
      }

      return apiKey;
    });

    Logger.log("success", {
      message: "apiKeyService:cloneAPIKey:success",
      params: { userID, apiKeyID: clonedAPIKey?.apiKeyID, cloneOfApiKeyID: apiKeyID },
    });

    const existingMappings = existing.tblAPIKeyRoleMappings;
    if (existingMappings && existingMappings.length > 0) {
      await Promise.allSettled(
        existingMappings.map((mapping) =>
          addRoleForUser(clonedAPIKey.apiKeyID, `role:${mapping.roleID}`, tenantID)
        )
      );
    }

    return { apiKey: rawKey };
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyService:cloneAPIKey:failure",
      params: { userID, errorMessage: error.message },
    });
    throw error;
  }
};

/**
 * Re-syncs all Casbin g (group) rules for every API key from tblAPIKeyRoleMappings.
 * Call this on startup alongside syncAllRolePolicies() to recover g-rules lost
 * after a casbin_rule table wipe, DB migration, or server restart.
 */
apiKeyService.syncAllApiKeyRolePolicies = async () => {
  Logger.log("info", { message: "apiKeyService:syncAllApiKeyRolePolicies:start" });

  try {
    const allMappings = await prisma.tblAPIKeyRoleMappings.findMany({
      include: {
        tblAPIKeys: {
          select: { apiKeyID: true, tenantID: true },
        },
      },
    });

    for (const mapping of allMappings) {
      const { apiKeyID, tenantID } = mapping.tblAPIKeys;
      const roleID = mapping.roleID;
      try {
        await addRoleForUser(apiKeyID, `role:${roleID}`, tenantID);
      } catch (err) {
        Logger.log("warning", {
          message: "apiKeyService:syncAllApiKeyRolePolicies:rowSkipped",
          params: { apiKeyID, roleID, error: err.message },
        });
      }
    }

    await reloadPolicies();

    Logger.log("success", {
      message: "apiKeyService:syncAllApiKeyRolePolicies:done",
      params: { mappingsCount: allMappings.length },
    });
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyService:syncAllApiKeyRolePolicies:error",
      params: { error: error.message },
    });
    throw error;
  }
};

module.exports = { apiKeyService };
