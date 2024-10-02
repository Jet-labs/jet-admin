const winston = require("winston");
require("winston-daily-rotate-file");
require("winston-syslog").Syslog;
const SlackHook = require("winston-slack-webhook-transport");
const environment = require("../environment");

const NODE_ID =
  environment.NODE_ENV === "development" ? "dev_node_1" : "prod_node_1";
const appLogLevels = {
  levels: {
    error: 2,
    warning: 3,
    success: 4,
    info: 5,
  },
  colors: {
    error: "red",
    warning: "yellow",
    success: "green",
    info: "cyan",
  },
};

winston.addColors(appLogLevels.colors);
const logFormatLogFormat = winston.format((info) => {
  const { message } = info;
  if (info.data) {
    info.message = `${message} |====| ${JSON.stringify(info.data)}`;
    delete info.data;
  }
  return info;
})();

const winstonLogger = winston.createLogger({
  levels: appLogLevels.levels,

  format: winston.format.combine(
    winston.format.colorize({
      all: true,
    }),
    winston.format.label({
      label: NODE_ID,
    }),
    winston.format.timestamp({
      format: "DD-MM-YYYY HH:mm:ss",
    }),
    logFormatLogFormat,
    winston.format.printf(
      (info) =>
        `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Syslog({
      level: environment.SYSLOG_LEVEL,
      host: environment.SYSLOG_HOST,
      port: environment.SYSLOG_PORT,
      protocol: environment.SYSLOG_PROTOCOL,
    }),
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: `logs/${NODE_ID}-%DATE%.log`,
      level: environment.LOG_LEVEL,
      maxSize: `${environment.LOG_FILE_SIZE}m`,
      maxFiles: `${environment.LOG_RETENTION}d`,
    }),
    new SlackHook({
      webhookUrl: environment.SLACK_ERROR_NOTIFICATION_HOOK,
      level: "error",
    }),
  ],
});


module.exports = { winstonLogger };
