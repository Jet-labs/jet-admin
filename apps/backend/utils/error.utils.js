const constants = require("../constants");

const extractError = (error) => {
  if (error && error.name && error.meta) {
    return { code: "DB_ERROR", message: error.meta.message };
  } else if (error && error.code && error.message) {
    return error;
  } else {
    return constants.ERROR_CODES.SERVER_ERROR;
  }
};

module.exports = { extractError };
