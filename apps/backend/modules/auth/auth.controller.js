
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { authService } = require("./auth.service");

const authController = {};
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
authController.getUserInfo = async (req, res) => {
  try {
    const { user, firebaseUser } = req;
    if (user) {
      Logger.log("info", {
        message: "userController:getUserInfo:userAlreadyExists",
        params: { user },
      });
      return res.json({
        success: true,
        user,
      });
    } else {
      Logger.log("info", {
        message: "userController:getUserInfo:create",
        params: { firebaseUser },
      });
      const newUser = await authService.createUser({
        email: firebaseUser.email,
        firebaseID: firebaseUser.uid,
      });
      Logger.log("success", {
        message: "userController:getUserInfo:createdNewUser",
        params: { newUser },
      });
      return res.json({ success: true, user: newUser });
    }
  } catch (error) {
    Logger.log("error", {
      message: "userController:getUserInfo:catch1",
      params: { error },
    });
    return res.json({
      success: false,
      error: constants.ERROR_CODES.SERVER_ERROR,
    });
  }
};

module.exports = { authController };
