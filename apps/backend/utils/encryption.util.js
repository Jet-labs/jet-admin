const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

const getKey = () => {
  const keyHex = process.env.VAULT_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error("VAULT_ENCRYPTION_KEY environment variable is not defined");
  }
  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) {
    throw new Error("VAULT_ENCRYPTION_KEY must be a 32-byte hex string (64 characters)");
  }
  return key;
};

/**
 * Encrypts a plain text string using aes-256-gcm.
 * @param {string} text - The plain text to encrypt.
 * @returns {object} - The JSON object containing iv, data, and authTag (hex encoded).
 */
const encrypt = (text) => {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return {
    iv: iv.toString("hex"),
    data: encrypted,
    authTag: authTag,
  };
};

/**
 * Decrypts an encrypted object back to plain text string.
 * @param {object} encryptedObj - The object containing iv, data, and authTag.
 * @returns {string} - The decrypted plain text.
 */
const decrypt = (encryptedObj) => {
  if (!encryptedObj || !encryptedObj.iv || !encryptedObj.data || !encryptedObj.authTag) {
    throw new Error("Invalid encrypted object format");
  }
  const iv = Buffer.from(encryptedObj.iv, "hex");
  const authTag = Buffer.from(encryptedObj.authTag, "hex");
  const encryptedText = Buffer.from(encryptedObj.data, "hex");
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

module.exports = {
  encrypt,
  decrypt,
};
