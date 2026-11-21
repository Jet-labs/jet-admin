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
  "privatetoken",
  "private_token",
  "apitoken",
  "api_token",
  "oauth",
  "oauthtoken",
  "oauth_token",
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
  "github_token",
  "gitlab_token",
  "influx_token",
  "privatetoken",

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
/**
 * Sanitize credentials embedded in free-form strings (errors, URLs, shell
 * output) where there is no key to match. This complements key-based
 * redaction and prevents connection strings from reaching logs.
 */
const redactString = (value) => {
  if (typeof value !== "string") return value;
  return value
    .replace(/\b([a-z][a-z0-9+.-]*:\/\/)([^/\s@]+)@/gi, "$1[REDACTED]@")
    .replace(
      /\b(password|passwd|pwd|secret|token|api[_-]?key|authorization)\s*[=:]\s*("?)([^"\s,;]+)\2/gi,
      "$1=[REDACTED]"
    )
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 [REDACTED]");
};

const redact = (obj, depth = 0) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return redactString(obj);
  if (typeof obj !== "object") return obj;
  if (depth > 10) return "[REDACTED: max depth]";

  if (Array.isArray(obj)) {
    return obj.map((item) => redact(item, depth + 1));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "string") {
      result[key] = redactString(value);
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

/**
 * Datasource-option masking.
 *
 * The generic mask() treats every key containing "key" as sensitive, which
 * would also hide structural fields such as a header's `key` or a Kafka
 * `partitionKey`. Datasource options need a narrower key-name list plus
 * special handling for key/value pair arrays.
 */
const DATASOURCE_SECRET_PATTERNS = Object.freeze([
  "apikey",
  "api_key",
  "privatekey",
  "private_key",
  "secret",
  "token",
  "password",
  "passphrase",
  "credential",
  "connectionstring",
  "connection_string",
  "connectionurl",
  "connection_url",
  "accesskeyid",
  "access_key_id",
  "serviceaccountkey",
  "service_account_key",
  "accountkey",
  "encryptionkey",
  "clientkey",
]);

const isSecretPropertyName = (name) => {
  if (typeof name !== "string") return false;
  const lower = name.toLowerCase();
  return DATASOURCE_SECRET_PATTERNS.some((pattern) => lower.includes(pattern));
};

const isSensitiveHeaderName = (name) => {
  if (typeof name !== "string") return false;
  const lower = name.toLowerCase();
  return (
    lower === "authorization" ||
    lower === "proxy-authorization" ||
    lower === "cookie" ||
    lower === "set-cookie" ||
    lower === "x-api-key" ||
    isSecretPropertyName(lower)
  );
};

/**
 * Mask a secret field while preserving its JSON shape. Replacing a whole
 * object with a string placeholder breaks JSON-Forms editors that expect
 * `serviceAccountKey`/OAuth blocks to remain objects.
 */
function maskSecretValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => maskSecretValue(item));
  }
  if (value && typeof value === "object") {
    const masked = {};
    for (const [key, child] of Object.entries(value)) {
      masked[key] = typeof child === "string" ? MASK_PLACEHOLDER : maskSecretValue(child);
    }
    return masked;
  }
  return MASK_PLACEHOLDER;
}

function maskDatasourceOptions(options, depth = 0) {
  if (options === null || options === undefined) return options;
  if (depth > 12) return MASK_PLACEHOLDER;
  if (typeof options !== "object") return options;

  if (Array.isArray(options)) {
    return options.map((item) => maskDatasourceOptions(item, depth + 1));
  }

  const result = {};
  for (const [key, value] of Object.entries(options)) {
    const lower = key.toLowerCase();

    // Header/query-param arrays are { key, value } pairs. Mask the value only
    // when the pair name is credential-like; the pair's `key` is a name, not
    // a secret.
    if ((lower === "headers" || lower === "queryparams") && Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          return {
            ...item,
            ...(item.key && isSensitiveHeaderName(item.key)
              ? { value: MASK_PLACEHOLDER }
              : {}),
          };
        }
        return maskDatasourceOptions(item, depth + 1);
      });
      continue;
    }

    if (isSecretPropertyName(key)) {
      result[key] = maskSecretValue(value);
    } else if (value && typeof value === "object") {
      result[key] = maskDatasourceOptions(value, depth + 1);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function maskDatasource(datasource) {
  if (!datasource || typeof datasource !== "object") return datasource;
  return {
    ...datasource,
    datasourceOptions: maskDatasourceOptions(datasource.datasourceOptions),
  };
}

/**
 * Restore masked values from the stored object.
 *
 * Any field whose value equals MASK_PLACEHOLDER is treated as "unchanged";
 * the stored value is copied back. Recurses into objects and arrays so nested
 * credentials (OAuth blocks, header lists) survive a partial update.
 */
function mergeAndRestoreMaskedOptions(incomingOptions, existingOptions) {
  if (incomingOptions === undefined || incomingOptions === null) {
    return existingOptions;
  }

  if (Array.isArray(incomingOptions)) {
    if (!Array.isArray(existingOptions)) return incomingOptions;
    return incomingOptions.map((item, index) =>
      mergeAndRestoreMaskedOptions(item, existingOptions[index])
    );
  }

  if (typeof incomingOptions !== "object") {
    return incomingOptions === MASK_PLACEHOLDER ? existingOptions : incomingOptions;
  }

  // Start from the stored object so a partial update/test-by-ID payload does
  // not drop nested credentials that were not included in the request.
  const base = existingOptions && typeof existingOptions === "object" && !Array.isArray(existingOptions)
    ? existingOptions
    : {};
  const merged = { ...base, ...incomingOptions };
  for (const key of Object.keys(incomingOptions)) {
    if (incomingOptions[key] === MASK_PLACEHOLDER) {
      if (existingOptions && existingOptions[key] !== undefined) {
        merged[key] = existingOptions[key];
      }
    } else if (
      incomingOptions[key] &&
      typeof incomingOptions[key] === "object" &&
      existingOptions &&
      existingOptions[key] &&
      typeof existingOptions[key] === "object"
    ) {
      merged[key] = mergeAndRestoreMaskedOptions(incomingOptions[key], existingOptions[key]);
    }
  }
  return merged;
}

module.exports = {
  SENSITIVE_KEYS,
  SENSITIVE_KEY_PATTERNS,
  MASK_PLACEHOLDER,
  redact,
  mask,
  maskDatasourceOptions,
  maskDatasource,
  mergeAndRestoreMaskedOptions,
};
