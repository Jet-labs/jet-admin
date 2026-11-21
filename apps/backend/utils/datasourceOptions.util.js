/**
 * Lightweight datasource option encryption helpers.
 *
 * Kept separate from modules/datasource/datasource.service so bundle
 * export/import and maintenance scripts do not eagerly load every native
 * connector binding just to encrypt or decrypt a JSON payload.
 */
const Logger = require("./logger");
const { encrypt, decrypt } = require("./encryption.util");

function encryptOptions(options) {
  if (!options) return options;
  if (options.__encrypted) return options;
  return { __encrypted: true, ...encrypt(JSON.stringify(options)) };
}

function decryptOptions(options) {
  if (!options) return options;
  if (!options.__encrypted) return options;
  try {
    return JSON.parse(
      decrypt({ iv: options.iv, data: options.data, authTag: options.authTag })
    );
  } catch (error) {
    Logger.log("error", {
      message: "datasourceOptions:decryptOptions:error",
      params: { error: error.message },
    });
    return options;
  }
}

module.exports = { encryptOptions, decryptOptions };
