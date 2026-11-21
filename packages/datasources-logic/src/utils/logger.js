import { winstonLogger } from "../config/winston.config";
import { redact } from "./redact";

const logLevels = Object.freeze({
  info: "info",
  error: "error",
  success: "success",
  warning: "warning",
});

export class Logger {
  static pageLogger = (page, obj) => {
    obj
      ? console.log(`-----> : ${page} |=====|`, redact(obj))
      : console.log(`-----> : ${page}`);
  };

  /**
   *
   * @param {('info'|'error'|'success'|'warning')} status
   * @param {*} param1
   */
  static log = (status = "info", { message, params }) => {
    try {
      const safeParams = redact(params);
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

