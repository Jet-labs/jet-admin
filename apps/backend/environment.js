const dotenv = require("dotenv");
const path = require("path");
const p = path.resolve(__dirname, `${process.env.NODE_ENV}.env`);
console.log("setting path for environment...", p);
console.log("setting up environment variables...");
dotenv.config({
  path: p,
});
const env = process.env.NODE_ENV || "development";
const environmentVariables = {
  NODE_ENV: env,
  NODE_ID: env ? "dev_node_1" : "prod_node_1",
  PORT: process.env.PORT || 8080,
  DATABASE_URL: process.env.DATABASE_URL,
  SYSLOG_HOST: process.env.SYSLOG_HOST,
  SYSLOG_PORT: process.env.SYSLOG_PORT,
  SYSLOG_PROTOCOL: process.env.SYSLOG_PROTOCOL,
  LOG_RETENTION: process.env.LOG_RETENTION,
  SYSLOG_LEVEL: process.env.SYSLOG_LEVEL,
  LOG_LEVEL: process.env.LOG_LEVEL,
  LOG_FILE_SIZE: process.env.LOG_FILE_SIZE,
  EXPRESS_REQUEST_SIZE_LIMIT: process.env.EXPRESS_REQUEST_SIZE_LIMIT,
  CORS_WHITELIST: process.env.CORS_WHITELIST.split(","),
};
console.log("environment variables set-----------------------------");
console.log(environmentVariables);
module.exports = environmentVariables;
