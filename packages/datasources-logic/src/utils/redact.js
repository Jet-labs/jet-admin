/**
 * Credential redaction for datasource-package logs.
 *
 * The backend Logger has its own redactor, but datasources are bundled with
 * this package's logger and must not depend on the app. Keep the sensitive-key
 * list in sync with apps/backend/utils/sensitive.js.
 */

const SENSITIVE_KEYS = new Set([
  "password",
  "passwd",
  "passphrase",
  "pwd",
  "secret",
  "clientsecret",
  "client_secret",
  "token",
  "github_token",
  "gitlab_token",
  "influx_token",
  "privatetoken",
  "accesstoken",
  "access_token",
  "refreshtoken",
  "refresh_token",
  "bearertoken",
  "bearer_token",
  "apikey",
  "api_key",
  "apikeyhash",
  "authorization",
  "privatekey",
  "private_key",
  "privatetoken",
  "private_token",
  "apitoken",
  "api_token",
  "oauth",
  "oauthtoken",
  "oauth_token",
  "secretaccesskey",
  "secret_access_key",
  "accesskeyid",
  "access_key_id",
  "connectionstring",
  "connection_string",
  "bearer",
  "credentials",
]);

export const REDACTED = "[REDACTED]";

export function redactString(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/\b([a-z][a-z0-9+.-]*:\/\/)([^/\s@]+)@/gi, "$1[REDACTED]@")
    .replace(
      /\b(password|passwd|pwd|secret|token|api[_-]?key|authorization)\s*[=:]\s*("?)([^"\s,;]+)\2/gi,
      "$1=[REDACTED]"
    )
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 [REDACTED]");
}

export function redact(value, depth = 0) {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return redactString(value);
  if (typeof value !== "object") return value;
  if (depth > 10) return REDACTED;

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1));
  }

  const result = {};
  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = REDACTED;
    } else if (typeof entry === "string") {
      result[key] = redactString(entry);
    } else if (typeof entry === "object" && entry !== null) {
      result[key] = redact(entry, depth + 1);
    } else {
      result[key] = entry;
    }
  }
  return result;
}
