const dotenv = require("dotenv");
const path = require("path");
const p = path.resolve(__dirname, `${process.env.NODE_ENV}.env`);
console.log("setting path for environment...", p);
console.log("setting up environment variables...");
dotenv.config({
  path: p,
});

const environmentVariables = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 8080,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  SYSLOG_HOST: process.env.SYSLOG_HOST,
  SYSLOG_PORT: process.env.SYSLOG_PORT,
  SYSLOG_PROTOCOL: process.env.SYSLOG_PROTOCOL,
  LOG_RETENTION: process.env.LOG_RETENTION,
  SYSLOG_LEVEL: process.env.SYSLOG_LEVEL,
  LOG_LEVEL: process.env.LOG_LEVEL,
  LOG_FILE_SIZE: process.env.LOG_FILE_SIZE,
};
console.log("environment variables set-----------------------------");
console.log(environmentVariables);
module.exports = environmentVariables;
