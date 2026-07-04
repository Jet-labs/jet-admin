/**
 * Canonical sensitive-field definitions for the Jet Admin backend.
 *
 * All redaction helpers across the codebase (logger, audit middleware,
 * datasource response masking) MUST import from here so that adding a new
 * sensitive field in one place covers every code path automatically.
 *
 * Keys are stored lowercase. Comparison is always done with `key.toLowerCase()`
 * so camelCase / PascalCase / snake_case variants are all caught correctly.
 */

/**
 * The sentinel placeholder written into API responses by mask() to hide
 * sensitive credential values. Datasource services that receive an update
 * payload should treat this value as "unchanged — restore from DB".
 *
 * @type {string}
 */
const MASK_PLACEHOLDER = "●●●●●●●●";

/**
 * Exact-match sensitive key names (compared after toLowerCase()).
 * Use this list for log redaction where precision matters — we don't want to
 * accidentally redact unrelated fields whose names merely *contain* these words.
 *
 * @type {ReadonlyArray<string>}
 */
const SENSITIVE_KEYS = Object.freeze([
  // API credentials
  "apikey",         // catches apiKey, api_key handled separately below
  "api_key",
  "apikeyhash",
  "privatekey",     // catches privateKey, private_key handled separately
  "private_key",
  "client_secret",
  "clientsecret",
  "webhooksecret",
  "webhook_secret",

  // Tokens
  "token",
  "bearertoken",
  "accesstoken",
  "refreshtoken",
  "idtoken",

  // Passwords / encryption material
  "password",
  "passphrase",
  "secret",
  "credential",

  // Connection strings (may embed username:password)
  "connectionstring",
  "connection_string",
  "connectionurl",
  "connection_url",
  "databaseurl",
  "database_url",

  // HTTP / auth headers
  "authorization",
  "cookie",
  "x-api-key",
]);

/**
 * Substring-match sensitive key patterns (compared after toLowerCase()).
 * Used when the exact field name is not known — e.g. a datasource might store
 * credentials as "googleApiKey", "notionToken", "awsSecretAccessKey", etc.
 *
 * Masking API *responses* (datasource.controller) should use this broader set
 * so credential fields of any name are hidden from external callers.
 *
 * @type {ReadonlyArray<string>}
 */
const SENSITIVE_KEY_PATTERNS = Object.freeze([
  "apikey",
  "api_key",
  "privatekey",
  "private_key",
  "password",
  "secret",
  "token",
  "passphrase",
  "credential",
  "connectionstring",
  "connection_string",
  "connectionurl",
  "key",             // intentionally broad for response masking (e.g. "encryptionKey")
]);

/**
 * Recursively redact sensitive fields in an object for safe logging.
 * Uses exact-match SENSITIVE_KEYS (not the broader patterns) to avoid
 * accidentally redacting unrelated fields.
 *
 * @param {*}      obj
 * @param {number} [depth=0]
 * @returns {*}  A new object with sensitive values replaced by "[REDACTED]"
 */
const redact = (obj, depth = 0) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (depth > 10) return "[REDACTED: max depth]";

  if (Array.isArray(obj)) {
    return obj.map((item) => redact(item, depth + 1));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      result[key] = redact(value, depth + 1);
    } else {
      result[key] = value;
    }
  }
  return result;
};

/**
 * Recursively mask sensitive fields in an object for API responses.
 * Uses substring matching (SENSITIVE_KEY_PATTERNS) to catch all credential-like
 * field names regardless of naming convention.
 *
 * @param {*}      obj
 * @param {number} [depth=0]
 * @param {string} [placeholder="●●●●●●●●"]  Replacement value shown to callers
 * @returns {*}  A new object with sensitive values replaced by the placeholder
 */
const mask = (obj, depth = 0, placeholder = "●●●●●●●●") => {
  if (!obj || typeof obj !== "object") return obj;
  if (depth > 10) return placeholder;

  if (Array.isArray(obj)) {
    return obj.map((item) => mask(item, depth + 1, placeholder));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const lk = key.toLowerCase();
    if (SENSITIVE_KEY_PATTERNS.some((pattern) => lk.includes(pattern))) {
      result[key] = placeholder;
    } else if (typeof value === "object" && value !== null) {
      result[key] = mask(value, depth + 1, placeholder);
    } else {
      result[key] = value;
    }
  }
  return result;
};

module.exports = { SENSITIVE_KEYS, SENSITIVE_KEY_PATTERNS, MASK_PLACEHOLDER, redact, mask };
