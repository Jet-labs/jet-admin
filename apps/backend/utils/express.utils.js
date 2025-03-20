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

module.exports = { expressUtils };
