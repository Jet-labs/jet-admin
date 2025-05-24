import { winstonLogger } from "../config/winston.config";

const logLevels = Object.freeze({
  info: "info",
  error: "error",
  success: "success",
  warning: "warning",
});

export class Logger {
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
      const statusArray = String(status).split(":");

      statusArray.forEach((s) => {
        if (s === logLevels.error) {
          console.log(s, message, params);
        }
        switch (s.toLowerCase()) {
          case logLevels.info: {
            winstonLogger.info(message, { data: params });
            break;
          }
          case logLevels.success: {
            winstonLogger.success(message, { data: params });
            break;
          }
          case logLevels.warning: {
            winstonLogger.warning(message, { data: params });
            break;
          }
          case logLevels.error: {
            winstonLogger.error(message, { data: params });
            break;
          }

          default: {
            winstonLogger.error("log level error", {
              data: { s, message, ...params },
            });
            break;
          }
        }
      });
    } catch (error) {}
  };
}

