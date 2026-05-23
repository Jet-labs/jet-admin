const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { generateAPIKey, hashAPIKey } = require("../../utils/crypto.util");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");

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

    Logger.log("success", {
      message: "apiKeyService:getAllAPIKeys:success",
      params: { userID, count: apiKeys.length },
    });

    return apiKeys;
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

    Logger.log("success", {
      message: "apiKeyService:getAPIKeyByID:success",
      params: { userID, apiKeyID },
    });

    return apiKey;
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
      const existingAPIKey = await tx.tblAPIKeys.findUnique({
        where: { apiKeyID },
      });
      if (!existingAPIKey) {
        throw new Error(`API Key with ID ${apiKeyID} not found`);
      }
      if (existingAPIKey.tenantID !== tenantID) {
        throw new Error(
          `API Key with ID ${apiKeyID} does not belong to tenant with ID ${tenantID}`
        );
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
    await prisma.$transaction(async (tx) => {
      const existingAPIKey = await tx.tblAPIKeys.findUnique({
        where: { apiKeyID },
      });
      if (!existingAPIKey) {
        throw new Error(`API key with ID ${apiKeyID} not found`);
      }
      if (existingAPIKey.tenantID !== tenantID) {
        throw new Error(
          `API key with ID ${apiKeyID} does not belong to tenant with ID ${tenantID}`
        );
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
    const existing = await prisma.tblAPIKeys.findUnique({
      where: { apiKeyID },
      include: {
        tblAPIKeyRoleMappings: true,
      },
    });

    if (!existing) {
      throw new Error("API Key not found");
    }

    if (existing.tenantID !== tenantID) {
      throw new Error("API Key does not belong to this tenant");
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

    return { apiKey: rawKey };
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyService:cloneAPIKey:failure",
      params: { userID, errorMessage: error.message },
    });
    throw error;
  }
};

module.exports = { apiKeyService };
