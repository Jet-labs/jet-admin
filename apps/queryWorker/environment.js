const dotenv = require("dotenv");
const path = require("path");
const p = path.resolve(__dirname, `.env`);
console.log("setting path for environment...", p);
console.log("setting up environment variables...");
dotenv.config({
  path: p,
});
const env = process.env.NODE_ENV || "development";
const environmentVariables = {
  NODE_ENV: env,
  NODE_ID:
    env == "development"
      ? "dev_query_worker_node_1"
      : "prod_query_worker_node_1",
  PORT: process.env.PORT || 9990,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://jetadmin:password@jetadminpg:5432/jetadmindb?schema=public",
  SYSLOG_HOST: process.env.SYSLOG_HOST || "127.0.0.1",
  SYSLOG_PORT: process.env.SYSLOG_PORT || 514,
  SYSLOG_PROTOCOL: process.env.SYSLOG_PROTOCOL || "udp4",
  LOG_RETENTION: process.env.LOG_RETENTION || 7,
  SYSLOG_LEVEL: process.env.SYSLOG_LEVEL || "warning",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE_SIZE: process.env.LOG_FILE_SIZE || 1,
  EXPRESS_REQUEST_SIZE_LIMIT: process.env.EXPRESS_REQUEST_SIZE_LIMIT || "5mb",
  CORS_WHITELIST: process.env.CORS_WHITELIST?.split(","),
};
console.log("environment variables set-----------------------------");
console.log(environmentVariables);
module.exports = environmentVariables;
