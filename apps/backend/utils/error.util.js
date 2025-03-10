const constants = require("../constants");
const Logger = require("./logger");

const errorUtils = {};

errorUtils.extractError = (error) => {
  let errorResponse = { ...constants.ERROR_CODES.SERVER_ERROR };

  try {
    if (!error) return errorResponse;

    // Handle JavaScript errors (TypeError, ReferenceError, etc.)
    if (error instanceof Error) {
      errorResponse = {
        code: error.code || "INTERNAL_ERROR",
        message: error.message,
        details: {
          name: error.name,
          stack: error.stack,
          ...error.details,
        },
      };
    }
    // Handle PostgreSQL-specific errors using predefined codes
    else if (error.code && constants.POSTGRES_ERROR_CODES[error.code]) {
      errorResponse = {
        code: "DB_ERROR",
        message: constants.POSTGRES_ERROR_CODES[error.code],
        details: {
          postgres_code: error.code,
          detail: error.detail,
          hint: error.hint,
          ...error.details,
        },
      };
    }
    // Handle other errors with a code (e.g., Node.js system errors)
    else if (error.code) {
      errorResponse = {
        code: error.code,
        message: error.message || "An error occurred",
        details: { ...error },
      };
    }
    // Handle nested errors (e.g., { error: ... })
    else if (error.error) {
      errorResponse = errorUtils.extractError(error.error);
    }
    // Handle generic objects with error details
    else if (typeof error === "object") {
      errorResponse = {
        code: error.code || errorResponse.code,
        message: error.message || errorResponse.message,
        details: { ...error },
      };
    }
    // Handle primitive error values (strings, numbers)
    else {
      errorResponse = {
        code: "UNKNOWN_ERROR",
        message: error.toString(),
      };
    }
  } catch (handlingError) {
    Logger.log("error", {
      message: "Error handling failed:",
      params: handlingError,
    });
    return constants.ERROR_CODES.SERVER_ERROR;
  }

  // Log unhandled server errors for debugging
  if (errorResponse.code === "SERVER_ERROR") {
    Logger.log("error", { message: "Unhandled error:", params: error });
  }

  return errorResponse;
};

module.exports = { errorUtils };
