const constants = require("../constants");
const Logger = require("./logger");

const extractError = (error) => {
  if (error && error.code && error.message) {
    return {
      code: error.code,
      message: error.message,
    };
  } else if (
    error &&
    error.code &&
    constants.POSTGRES_ERROR_CODES[error.code]
  ) {
    return {
      code: "DB_ERROR",
      message: constants.POSTGRES_ERROR_CODES[error.code],
    };
  } else if (error.error) {
    return JSON.stringify(error.error);
  } else {
    return constants.ERROR_CODES.SERVER_ERROR;
  }
};

module.exports = { extractError };
