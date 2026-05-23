const { winstonLogger } = require("../config/winston.config");

const logLevels = Object.freeze({
  info: "info",
  error: "error",
  success: "success",
  warning: "warning",
});

const SENSITIVE_KEYS = [
  "apiKey", "api_key", "apikeyhash",
  "token", "bearertoken", "accesstoken", "refreshtoken",
  "password", "secret", "authorization",
];

const redactSensitive = (obj, depth = 0) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (depth > 10) return "[REDACTED: max depth]";

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitive(item, depth + 1));
  }

  const redacted = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      redacted[key] = redactSensitive(value, depth + 1);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
};

class Logger {
  static pageLogger = (page, obj) => {
    obj
      ? console.log(`-----> : ${page} |=====|`, obj)
      : console.log(`-----> : ${page}`);
  };

  /**
   *
   * @param {('info'|'error'|'success'|'warning')} status
   * @param {*} param1
   */
  static log = (status = "info", { message, params }) => {
    try {
      const safeParams = redactSensitive(params);
      const statusArray = String(status).split(":");

      statusArray.forEach((s) => {
        if (s === logLevels.error) {
          console.log(s, message, safeParams);
        }
        switch (s.toLowerCase()) {
          case logLevels.info: {
            winstonLogger.info(message, { data: safeParams });
            break;
          }
          case logLevels.success: {
            winstonLogger.success(message, { data: safeParams });
            break;
          }
          case logLevels.warning: {
            winstonLogger.warning(message, { data: safeParams });
            break;
          }
          case logLevels.error: {
            winstonLogger.error(message, { data: safeParams });
            break;
          }

          default: {
            winstonLogger.error("log level error", {
              data: { s, message, ...safeParams },
            });
            break;
          }
        }
      });
    } catch (error) {}
  };
}

module.exports = Logger;
