const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { encrypt, decrypt } = require("../../utils/encryption.util");
const environment = require("../../environment");

const vaultService = {};

/**
 * Stores a credential securely in the Vault.
 * @param {object} param0
 * @param {string} param0.tenantID - The tenant UUID.
 * @param {string} param0.provider - The provider name (e.g. "google").
 * @param {string} param0.name - Human readable name for the credential.
 * @param {object|string} param0.data - The plain-text credential data (object or string).
 * @returns {Promise<object>} - The stored credential metadata (without decrypted sensitive data).
 */
vaultService.storeCredential = async ({ tenantID, provider, name, data, creatorID, createdByApiKeyID }) => {
  Logger.log("info", {
    message: "vaultService:storeCredential:params",
    params: { tenantID, provider, name, creatorID, createdByApiKeyID },
  });

  if (!creatorID && !createdByApiKeyID) {
    throw new Error("Creator ID or Created By API Key ID is required");
  }

  try {
    const stringifiedData = typeof data === "string" ? data : JSON.stringify(data);
    const encrypted = encrypt(stringifiedData);

    const credential = await prisma.tblVaultCredentials.create({
      data: {
        tenantID: tenantID,
        provider: provider,
        name: name,
        encryptedData: encrypted,
        creatorID: creatorID || null,
        createdByApiKeyID: createdByApiKeyID || null,
      },
    });

    Logger.log("success", {
      message: "vaultService:storeCredential:success",
      params: { tenantID, vaultCredentialID: credential.vaultCredentialID },
    });

    return {
      vaultCredentialID: credential.vaultCredentialID,
      tenantID: credential.tenantID,
      name: credential.name,
      provider: credential.provider,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  } catch (error) {
    Logger.log("error", {
      message: "vaultService:storeCredential:failure",
      params: { tenantID, errorMessage: error.message },
    });
    throw error;
  }
};

/**
 * Retrieves and decrypts a credential from the Vault.
 * @param {object} param0
 * @param {string} param0.tenantID - The tenant UUID.
 * @param {string} param0.vaultCredentialID - The credential UUID.
 * @returns {Promise<object>} - The decrypted credential data as an object/string.
 */
vaultService.getCredential = async ({ tenantID, vaultCredentialID }) => {
  Logger.log("info", {
    message: "vaultService:getCredential:params",
    params: { tenantID, vaultCredentialID },
  });

  try {
    const credential = await prisma.tblVaultCredentials.findUnique({
      where: {
        vaultCredentialID: vaultCredentialID,
      },
    });

    if (!credential) {
      throw new Error("Credential not found in Vault");
    }

    if (credential.tenantID !== tenantID) {
      throw new Error("Unauthorized access to credential");
    }

    const decryptedText = decrypt(credential.encryptedData);
    let decryptedData;
    try {
      decryptedData = JSON.parse(decryptedText);
    } catch {
      decryptedData = decryptedText;
    }

    Logger.log("success", {
      message: "vaultService:getCredential:success",
      params: { tenantID, vaultCredentialID },
    });

    return decryptedData;
  } catch (error) {
    Logger.log("error", {
      message: "vaultService:getCredential:failure",
      params: { tenantID, vaultCredentialID, errorMessage: error.message },
    });
    throw error;
  }
};

/**
 * Retrieves and decrypts a credential from the Vault by provider name.
 * @param {object} param0
 * @param {string} param0.tenantID - The tenant UUID.
 * @param {string} param0.provider - The provider name (e.g. "ai_config").
 * @returns {Promise<object>} - The decrypted credential data as an object/string, or null if not found.
 */
vaultService.getCredentialByProvider = async ({ tenantID, provider }) => {
  Logger.log("info", {
    message: "vaultService:getCredentialByProvider:params",
    params: { tenantID, provider },
  });

  try {
    const credential = await prisma.tblVaultCredentials.findFirst({
      where: {
        tenantID: tenantID,
        provider: provider,
      },
    });

    if (!credential) {
      return null;
    }

    const decryptedText = decrypt(credential.encryptedData);
    let decryptedData;
    try {
      decryptedData = JSON.parse(decryptedText);
    } catch {
      decryptedData = decryptedText;
    }

    Logger.log("success", {
      message: "vaultService:getCredentialByProvider:success",
      params: { tenantID, provider, vaultCredentialID: credential.vaultCredentialID },
    });

    return decryptedData;
  } catch (error) {
    Logger.log("error", {
      message: "vaultService:getCredentialByProvider:failure",
      params: { tenantID, provider, errorMessage: error.message },
    });
    throw error;
  }
};

/**
 * Stores or updates a credential securely in the Vault for a specific provider.
 * @param {object} param0
 * @param {string} param0.tenantID - The tenant UUID.
 * @param {string} param0.provider - The provider name (e.g. "ai_config").
 * @param {string} param0.name - Human readable name for the credential.
 * @param {object|string} param0.data - The plain-text credential data (object or string).
 * @param {string} [param0.creatorID] - The user ID.
 * @param {string} [param0.createdByApiKeyID] - The API key ID.
 * @returns {Promise<object>} - The stored credential metadata.
 */
vaultService.upsertCredentialByProvider = async ({ tenantID, provider, name, data, creatorID, createdByApiKeyID }) => {
  Logger.log("info", {
    message: "vaultService:upsertCredentialByProvider:params",
    params: { tenantID, provider, name },
  });

  try {
    const existing = await prisma.tblVaultCredentials.findFirst({
      where: {
        tenantID: tenantID,
        provider: provider,
      },
    });

    const stringifiedData = typeof data === "string" ? data : JSON.stringify(data);
    const encrypted = encrypt(stringifiedData);

    let credential;
    if (existing) {
      credential = await prisma.tblVaultCredentials.update({
        where: { vaultCredentialID: existing.vaultCredentialID },
        data: {
          name: name,
          encryptedData: encrypted,
        },
      });
    } else {
      credential = await prisma.tblVaultCredentials.create({
        data: {
          tenantID: tenantID,
          provider: provider,
          name: name,
          encryptedData: encrypted,
          creatorID: creatorID || null,
          createdByApiKeyID: createdByApiKeyID || null,
        },
      });
    }

    Logger.log("success", {
      message: "vaultService:upsertCredentialByProvider:success",
      params: { tenantID, provider, vaultCredentialID: credential.vaultCredentialID },
    });

    return {
      vaultCredentialID: credential.vaultCredentialID,
      tenantID: credential.tenantID,
      name: credential.name,
      provider: credential.provider,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  } catch (error) {
    Logger.log("error", {
      message: "vaultService:upsertCredentialByProvider:failure",
      params: { tenantID, provider, errorMessage: error.message },
    });
    throw error;
  }
};

/**
 * Retrieves the Google Client configuration (Client ID and Secret) from the server's environment.
 * @returns {{clientId: string, clientSecret: string}} - The Google client ID and secret.
 */
vaultService.getGoogleClientConfig = () => {
  return {
    clientId: environment.GOOGLE_CLIENT_ID,
    clientSecret: environment.GOOGLE_CLIENT_SECRET,
  };
};

module.exports = { vaultService };
