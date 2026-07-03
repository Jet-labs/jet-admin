const { validationResult } = require("express-validator");
const { errorUtils } = require("./error.util");

const expressUtils = {};
/**
 * Helper function to standardize responses.
 * @param {import("express").Response} res - Express response object.
 * @param {boolean} success - Whether the operation was successful.
 * @param {object} data - Data to include in the response.
 * @param {object} error - Error details (optional).
 */
expressUtils.sendResponse = (res, success, data = {}, error = null, statusCode = 200) => {
  let code = statusCode;
  if (!success && statusCode === 200) {
    code = 400; // Default to 400 Bad Request
    if (error) {
      const errObj = errorUtils.extractError(error);
      if (errObj.code === "PERMISSION_DENIED") {
        code = 403;
      } else if (
        errObj.code === "INVALID_API_KEY" ||
        errObj.code === "USER_AUTH_TOKEN_EXPIRED" ||
        errObj.code === "USER_AUTH_TOKEN_NOT_FOUND" ||
        errObj.code === "INVALID_LOGIN"
      ) {
        code = 401;
      } else if (errObj.code === "SERVER_ERROR") {
        code = 500;
      }
    }
  }
  return res.status(code).json({
    success,
    ...data,
    ...(error && { error: errorUtils.extractError(error) }), // Extract only relevant error details
  });
};

expressUtils.sendError = (res, errorCode, error) => {
  return res.status(errorCode).json({
    success: false,
    error: errorUtils.extractError(error),
  });
};

expressUtils.asyncWrapper = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

expressUtils.validationChecker = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return expressUtils.sendError(res, 400, errors.array());
  }
  next();
};

module.exports = { expressUtils };
