/**
 * Operator auth middleware.
 *
 * Guards the /api/v1/operator/* control-plane surface. Completely disjoint
 * from authMiddleware.authProvider (Firebase users / API keys): only
 * tblOperators sessions issued by operatorAuthService.login pass here, and
 * no Casbin enforcement is involved — operator status itself is the grant.
 */
const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { operatorAuthService } = require("./operatorAuth.service");

const operatorAuthMiddleware = {};

/**
 * Requires a valid operator bearer session. Attaches req.operator on success.
 */
operatorAuthMiddleware.requireOperator = async function (req, res, next) {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith(constants.AUTH_PREFIXES.BEARER)
  ) {
    return expressUtils.sendResponse(
      res,
      false,
      {},
      constants.ERROR_CODES.OPERATOR_SESSION_INVALID,
      constants.HTTP_STATUS.UNAUTHORIZED
    );
  }

  const token = req.headers.authorization.split(constants.AUTH_PREFIXES.BEARER)[1];
  if (!token) {
    return expressUtils.sendResponse(
      res,
      false,
      {},
      constants.ERROR_CODES.OPERATOR_SESSION_INVALID,
      constants.HTTP_STATUS.UNAUTHORIZED
    );
  }

  try {
    req.operator = await operatorAuthService.getOperatorFromToken({ token });
    req.operatorToken = token;
    Logger.log("info", {
      message: "operatorAuthMiddleware:requireOperator:success",
      params: { operatorID: req.operator.operatorID },
    });
    return next();
  } catch (error) {
    Logger.log("warning", {
      message: "operatorAuthMiddleware:requireOperator:rejected",
      params: { error: error?.message || String(error) },
    });
    return expressUtils.sendResponse(
      res,
      false,
      {},
      constants.ERROR_CODES.OPERATOR_SESSION_INVALID,
      constants.HTTP_STATUS.UNAUTHORIZED
    );
  }
};

module.exports = { operatorAuthMiddleware };
