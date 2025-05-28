const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { generateAPIKey } = require("../../utils/crypto.util");

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
        tenantID: parseInt(tenantID),
      },
    });

    Logger.log("success", {
      message: "apiKeyService:getAllAPIKeys:success",
      params: { userID, apiKeys },
    });

    return apiKeys;
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyService:getAllAPIKeys:failure",
      params: { userID, error },
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
 * @returns {Promise<boolean>}
 */
apiKeyService.createAPIKey = async ({
  userID,
  tenantID,
  roleIDs,
  apiKeyTitle,
}) => {
  Logger.log("info", {
    message: "apiKeyService:createAPIKey:params",
    params: { userID, tenantID, apiKeyTitle },
  });

  try {
    // Use a transaction for atomicity
    const createdAPIKey = await prisma.$transaction(async (tx) => {
      // Create the role
      const apiKey = await prisma.tblAPIKeys.create({
        data: {
          tenantID: parseInt(tenantID),
          creatorID: parseInt(userID),
          apiKeyTitle,
          apiKey: generateAPIKey(),
          isDisabled: false,
        },
      });

      // Create permission mappings
      const apiKeyRoleMappings = roleIDs.map((roleID) => ({
        roleID: parseInt(roleID),
        apiKeyID: parseInt(apiKey.apiKeyID),
      }));

      await tx.tblAPIKeyRoleMappings.createMany({
        data: apiKeyRoleMappings,
      });

      return apiKey;
    });

    Logger.log("success", {
      message: "apiKeyService:createAPIKey:success",
      params: { userID, createdAPIKey },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyService:createAPIKey:failure",
      params: { userID, error },
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
        apiKeyID: parseInt(apiKeyID),
        tenantID: parseInt(tenantID),
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
      params: { userID, apiKey },
    });

    return apiKey;
  } catch (error) {
    Logger.log("error", {
      message: "apiKeyService:getAPIKeyByID:failure",
      params: { userID, error },
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
 * @param {string} param0.apiKeyDescription
 * @param {JSON} param0.apiKey
 * @param {Boolean} param0.runOnLoad
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
      // Check if role exists
      const existingAPIKey = await tx.tblAPIKeys.findUnique({
        where: { apiKeyID },
      });
      if (!existingAPIKey) {
        throw new Error(`API Key with ID ${apiKeyID} not found`);
      }
      if (existingAPIKey.tenantID !== tenantID) {
        throw new Error(
          `API Key with ID ${roleID} does not belong to tenant with ID ${tenantID}`
        );
      }

      // Update role details
      const apiKeyUpdateData = {
        ...(apiKeyTitle && { apiKeyTitle }),
        ...(isDisabled && { isDisabled }),
      };

      const updatedAPIKey = await tx.tblAPIKeys.update({
        where: { apiKeyID },
        data: apiKeyUpdateData,
      });

      // Update permissions if provided
      if (roleIDs !== undefined) {
        // Delete existing mappings
        await tx.tblAPIKeyRoleMappings.deleteMany({
          where: { apiKeyID },
        });

        // Create new mappings
        if (roleIDs.length > 0) {
          const newMappings = roleIDs.map((roleID) => ({
            roleID: parseInt(roleID),
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
        updatedAPIKey,
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
        error,
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
      // Check if role exists
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
      params: { userID, error },
    });
    throw error;
  }
};

module.exports = { apiKeyService };