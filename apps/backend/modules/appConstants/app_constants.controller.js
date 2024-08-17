const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
const { AppConstantService } = require("./app_constants.services");

const appConstantController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
appConstantController.getAllAppConstants = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_app_constants = state.authorized_app_constants;

    Logger.log("info", {
      message: "appConstantController:getAllAppConstants:params",
      params: { pm_user_id, authorized_app_constants },
    });

    const appConstants = await AppConstantService.getAllAppConstants({
      authorizedAppConstants: authorized_app_constants,
    });

    Logger.log("success", {
      message: "appConstantController:getAllAppConstants:success",
      params: { pm_user_id, appConstants },
    });

    return res.json({
      success: true,
      appConstants: appConstants,
    });
  } catch (error) {
    Logger.log("error", {
      message: "appConstantController:getAllAppConstants:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
appConstantController.getAllInternalAppConstants = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_app_constants = state.authorized_app_constants;

    Logger.log("info", {
      message: "appConstantController:getAllInternalAppConstants:params",
      params: { pm_user_id },
    });

    const appConstants = await AppConstantService.getAllInternalAppConstants({
      authorizedAppConstants: authorized_app_constants,
    });

    Logger.log("success", {
      message: "appConstantController:getAllInternalAppConstants:success",
      params: { pm_user_id, appConstants },
    });

    return res.json({
      success: true,
      appConstants: appConstants,
    });
  } catch (error) {
    Logger.log("error", {
      message: "appConstantController:getAllInternalAppConstants:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
appConstantController.getAppConstantByID = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_app_constant_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_app_constants = state.authorized_app_constants;

    Logger.log("info", {
      message: "appConstantController:getAppConstantByID:params",
      params: { pm_user_id, pm_app_constant_id },
    });

    const appConstant = await AppConstantService.getAppConstantByID({
      appConstantID: pm_app_constant_id,
      authorizedAppConstants: authorized_app_constants,
    });

    Logger.log("success", {
      message: "appConstantController:getAppConstantByID:success",
      params: { pm_user_id, appConstant },
    });

    return res.json({
      success: true,
      appConstant: appConstant,
    });
  } catch (error) {
    Logger.log("error", {
      message: "appConstantController:getAppConstantByID:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
appConstantController.addAppConstant = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);

    Logger.log("info", {
      message: "appConstantController:addAppConstant:params",
      params: { pm_user_id, body },
    });

    const appConstant = await AppConstantService.addAppConstant({
      appConstantTitle: body.pm_app_constant_title,
      appConstantValue: body.pm_app_constant_value,
      isInternal: body.is_internal,
    });

    Logger.log("success", {
      message: "appConstantController:addAppConstant:success",
      params: { pm_user_id, appConstant },
    });

    return res.json({
      success: true,
      appConstant,
    });
  } catch (error) {
    Logger.log("error", {
      message: "appConstantController:addAppConstant:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
appConstantController.updateAppConstant = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_app_constants = state.authorized_app_constants;

    Logger.log("info", {
      message: "appConstantController:updateAppConstant:params",
      params: { pm_user_id, body },
    });

    const appConstant = await AppConstantService.updateAppConstant({
      appConstantID: parseInt(body.pm_app_constant_id),
      appConstantTitle: body.pm_app_constant_title,
      appConstantValue: body.pm_app_constant_value,
      isInternal: body.is_internal,
      authorizedAppConstants: authorized_app_constants,
    });

    Logger.log("success", {
      message: "appConstantController:updateAppConstant:success",
      params: { pm_user_id, appConstant },
    });

    return res.json({
      success: true,
      appConstant,
    });
  } catch (error) {
    Logger.log("error", {
      message: "appConstantController:updateAppConstant:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
appConstantController.deleteAppConstant = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_app_constant_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_app_constants = state.authorized_app_constants;

    Logger.log("info", {
      message: "appConstantController:deleteAppConstant:params",
      params: { pm_user_id, pm_app_constant_id },
    });

    await AppConstantService.deleteAppConstant({
      appConstantID: pm_app_constant_id,
      authorizedAppConstants: authorized_app_constants,
    });

    Logger.log("success", {
      message: "appConstantController:deleteAppConstant:success",
      params: { pm_user_id },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    Logger.log("error", {
      message: "appConstantController:deleteAppConstant:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = { appConstantController };
