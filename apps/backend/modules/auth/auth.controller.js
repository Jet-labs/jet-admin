const constants = require("../../constants");
const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
const { AuthService } = require("./auth.service");

const authController = {};
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
authController.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    Logger.log("info", {
      message: "authController:login:init",
      params: { username, password },
    });
    const { accessToken, refreshToken } =
      await AuthService.loginUserWithUsernamePassword({ username, password });
    Logger.log("success", {
      message: "authController:login:success",
      params: { username },
    });

    return res.json({ success: true, accessToken, refreshToken });
  } catch (error) {
    Logger.log("error", {
      message: "authController:login:catch-1",
      params: { error },
    });
    return res.json({
      success: false,
      error: extractError(error),
    });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
authController.refreshAccessToken = async (req, res) => {
  try {
    Logger.log("info", {
      message: "authController:refreshAccessToken:init",
    });
    const refreshToken =
      req.body[constants.STRINGS.REFRESH_TOKEN_COOKIE_STRING];
    Logger.log("info", {
      message: "authController:refreshAccessToken:refreshToken",
      params: { refreshToken },
    });
    const pm_user_id = await AuthService.verifyRefreshToken({ refreshToken });

    Logger.log("info", {
      message: "authController:refreshAccessToken:user",
      params: { pm_user_id: pm_user_id },
    });

    const accessToken = await AuthService.generateAccessToken({ pm_user_id });

    Logger.log("success", {
      message: "authController:refreshAccessToken:success",
      params: { pm_user_id: pm_user_id },
    });
    return res.json({ success: true, accessToken, refreshToken });
  } catch (error) {
    Logger.log("error", {
      message: "authController:refreshAccessToken:catch-1",
      params: { error: constants.ERROR_CODES.USER_REFRESH_TOKEN_EXPIRED },
    });
    return res.json({
      success: false,
      error: extractError(constants.ERROR_CODES.USER_REFRESH_TOKEN_EXPIRED),
    });
  }
};
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
authController.getUser = async (req, res) => {
  try {
    const { pmUser } = req;
    Logger.log("info", {
      message: "authController:getUser:already_exists",
      params: { pmUserID: pmUser.pm_user_id },
    });

    return res.json({
      success: true,
      pmUser: pmUser,
    });
  } catch (error) {
    Logger.log("error", {
      message: "authController:getUser:catch-1",
      params: { error },
    });
    return res.json({
      success: false,
      error: extractError(error),
    });
  }
};

module.exports = authController;
