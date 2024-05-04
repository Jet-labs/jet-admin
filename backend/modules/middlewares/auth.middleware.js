const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const jwt = require("jsonwebtoken");
const environmentVariables = require("../../environment");
const { AuthService } = require("../services/auth.service");
const authMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
authMiddleware.authProvider = async function (req, res, next) {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      let accessToken = req.headers.authorization.split("Bearer ")[1];
      
      const pmUser = await AuthService.verifyAccessToken({ accessToken });

      Logger.log("success", {
        message: "authMiddleware:success",
        params: { pm_user_id: pmUser.pm_user_id },
      });

      req.pmUser = pmUser;
      return next();
    } catch (error) {
      Logger.log("error", {
        message: "authMiddleware:catch-2",
        params: { error },
      });
      return res.json({
        success: false,
        error: constants.ERROR_CODES.USER_AUTH_TOKEN_EXPIRED,
      });
    }
  } else {
    Logger.log("error", {
      message: "authMiddleware:catch-1",
      params: { error: constants.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND },
    });
    return res.send({ error: constants.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND });
  }
};

module.exports = { authMiddleware };
