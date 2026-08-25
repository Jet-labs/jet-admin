/**
 * OperatorAuth Controller
 */
const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { operatorAuthService } = require("./operatorAuth.service");

const operatorAuthController = {};

/**
 * Login with email + password → session token.
 *
 * POST /api/v1/operator/auth/login
 */
operatorAuthController.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    Logger.log("info", {
      message: "operatorAuthController:login:params",
      params: { email },
    });

    const result = await operatorAuthService.login({
      email,
      password,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    return expressUtils.sendResponse(res, true, result, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "operatorAuthController:login:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(
      res,
      false,
      {},
      error,
      constants.HTTP_STATUS.UNAUTHORIZED
    );
  }
};

/**
 * Revoke the current session.
 *
 * POST /api/v1/operator/auth/logout
 */
operatorAuthController.logout = async (req, res) => {
  try {
    await operatorAuthService.logout({ token: req.operatorToken });
    return expressUtils.sendResponse(res, true, {}, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "operatorAuthController:logout:catch-1",
      params: { error },
    });
    // Logout is best-effort; never block the client on it.
    return expressUtils.sendResponse(res, true, {}, null, constants.HTTP_STATUS.OK);
  }
};

/**
 * Current operator profile.
 *
 * GET /api/v1/operator/auth/me
 */
operatorAuthController.me = async (req, res) => {
  try {
    const { operatorID, email, operatorTitle } = req.operator;
    return expressUtils.sendResponse(
      res,
      true,
      { operator: { operatorID, email, operatorTitle } },
      null,
      constants.HTTP_STATUS.OK
    );
  } catch (error) {
    Logger.log("error", {
      message: "operatorAuthController:me:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = { operatorAuthController };
