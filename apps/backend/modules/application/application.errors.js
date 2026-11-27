function applicationError(code, message, statusCode = 400, details) {
  return Object.assign(new Error(message), { code, statusCode, ...(details ? { details } : {}) });
}
module.exports = { applicationError };
