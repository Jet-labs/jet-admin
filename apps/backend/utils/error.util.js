const constants = require("../constants");
const environmentVariables = require("../environment");
const Logger = require("./logger");

const errorUtils = {};

const formatValidationIssue = (issue = {}) => {
  const path = Array.isArray(issue.path)
    ? issue.path.join(".")
    : issue.path || issue.param || "";
  const message = issue.message || issue.msg || "Validation failed";

  return path ? `${path}: ${message}` : message;
};

errorUtils.extractError = (error) => {
  let errorResponse = { ...constants.ERROR_CODES.SERVER_ERROR };

  try {
    if (!error) return errorResponse;

    if (Array.isArray(error)) {
      errorResponse = {
        code: constants.ERROR_CODES.VALIDATION_ERROR.code,
        message: error.map(formatValidationIssue).join("; "),
        details: {
          issues: error,
        },
      };
    }

    // Handle JavaScript errors (TypeError, ReferenceError, etc.)
    else if (error instanceof Error) {
      errorResponse = {
        code: error.code || constants.ERROR_CODES.INTERNAL_ERROR.code,
        message: error.message,
        details: {
          name: error.name,
          ...(environmentVariables.NODE_ENV === constants.ENVIRONMENTS.DEVELOPMENT && { stack: error.stack }),
          ...error.details,
        },
      };
    }
    // Handle PostgreSQL-specific errors using predefined codes
    else if (error.code && constants.POSTGRES_ERROR_CODES && constants.POSTGRES_ERROR_CODES[error.code]) {
      errorResponse = {
        code: constants.ERROR_CODES.DB_ERROR.code,
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
        code: constants.ERROR_CODES.UNKNOWN_ERROR.code,
        message: error.toString(),
      };
    }
  } catch (handlingError) {
    Logger.log("error", {
      message: "Error handling failed:",
      params: {
        message: handlingError?.message || String(handlingError),
        stack: handlingError?.stack,
      },
    });
    return constants.ERROR_CODES.SERVER_ERROR;
  }

  // Log unhandled server errors for debugging
  if (errorResponse.code === constants.ERROR_CODES.SERVER_ERROR.code) {
    Logger.log("error", { message: "Unhandled error:", params: error });
  }

  return errorResponse;
};

module.exports = { errorUtils };
