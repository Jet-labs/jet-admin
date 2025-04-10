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
expressUtils.sendResponse = (res, success, data = {}, error = null) => {
  return res.json({
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

expressUtils.validationChecker = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return expressUtils.sendError(res, 400, errors.array());
  }
  next();
};

module.exports = { expressUtils };
