const { validationResult } = require("express-validator");
const { errorUtils } = require("./error.util");
const constants = require("../constants");

const expressUtils = {};
/**
 * Helper function to standardize responses.
 * @param {import("express").Response} res - Express response object.
 * @param {boolean} success - Whether the operation was successful.
 * @param {object} data - Data to include in the response.
 * @param {object} error - Error details (optional).
 */
expressUtils.sendResponse = (res, success, data = {}, error = null, statusCode = constants.HTTP_STATUS.OK) => {
  let code = statusCode;
  if (!success && statusCode === constants.HTTP_STATUS.OK) {
    code = constants.HTTP_STATUS.BAD_REQUEST; // Default to 400 Bad Request
    if (error) {
      const errObj = errorUtils.extractError(error);
      if (errObj.code === constants.ERROR_CODES.PERMISSION_DENIED.code) {
        code = constants.HTTP_STATUS.FORBIDDEN;
      } else if (
        errObj.code === constants.ERROR_CODES.INVALID_API_KEY.code ||
        errObj.code === constants.ERROR_CODES.USER_AUTH_TOKEN_EXPIRED.code ||
        errObj.code === constants.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND.code ||
        errObj.code === constants.ERROR_CODES.INVALID_LOGIN.code
      ) {
        code = constants.HTTP_STATUS.UNAUTHORIZED;
      } else if (errObj.code === constants.ERROR_CODES.SERVER_ERROR.code) {
        code = constants.HTTP_STATUS.INTERNAL_SERVER_ERROR;
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
    return expressUtils.sendError(res, constants.HTTP_STATUS.BAD_REQUEST, errors.array());
  }
  next();
};

module.exports = { expressUtils };
