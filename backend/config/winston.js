const winston = require("winston");
require("winston-daily-rotate-file");
require("winston-syslog").Syslog;
const SlackHook = require("winston-slack-webhook-transport");
const constants = require("../constants");
const environment = require("../environment");
// winston.add(new winston.transports.Syslog(options));
// winston.add(new winston.transports.Syslog());
const appLogLevels = {
  levels: {
    revert: 0,
    error: 2,
    warning: 3,
    success: 4,
    http: 5,
    info: 6,
  },
  colors: {
    revert: "yellow",
    error: "red",
    warning: "yellow",
    success: "green",
    http: "magenta",
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
      label: constants.BACKEND_NODE_ID,
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
    // new winston.transports.Syslog({
    //   level: "info",
    // }),
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: `logs/errors/${constants.BACKEND_NODE_ID}-%DATE%.log`,
      level: "error",
      maxSize: "1m",
      maxFiles: "5d",
    }),
    new SlackHook({
      webhookUrl: environment.SLACK_ERROR_NOTIFICATION_HOOK,
      level: "error",
    }),
  ],
});

// winstonLogger.stream = {
//     write: function (message, encoding) {
//         winstonLogger.http(message);
//     }
// };

module.exports = { winstonLogger };
