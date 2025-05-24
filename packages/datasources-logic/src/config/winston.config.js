const winston = require("winston");
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

export const winstonLogger = winston.createLogger({
  levels: appLogLevels.levels,

  format: winston.format.combine(
    winston.format.colorize({
      all: true,
    }),
    winston.format.label({
      label: 'package:datasources',
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
    new winston.transports.Console(),
  ],
});

