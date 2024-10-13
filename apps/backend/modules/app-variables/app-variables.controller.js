const { extractError } = require("../../utils/error.util");
const Logger = require("../../utils/logger");
const { AppVariableService } = require("./app-variables.services");

const appVariableController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
appVariableController.getAllAppVariables = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_app_variables = state.authorized_app_variables;

    Logger.log("info", {
      message: "appVariableController:getAllAppVariables:params",
      params: { pm_user_id, authorized_app_variables },
    });

    const appVariables = await AppVariableService.getAllAppVariables({
      authorizedAppVariables: authorized_app_variables,
    });

    Logger.log("success", {
      message: "appVariableController:getAllAppVariables:success",
      params: { pm_user_id, appVariables },
    });

    return res.json({
      success: true,
      appVariables: appVariables,
    });
  } catch (error) {
    Logger.log("error", {
      message: "appVariableController:getAllAppVariables:catch-1",
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
appVariableController.getAllInternalAppVariables = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_app_variables = state.authorized_app_variables;

    Logger.log("info", {
      message: "appVariableController:getAllInternalAppVariables:params",
      params: { pm_user_id },
    });

    const appVariables = await AppVariableService.getAllInternalAppVariables({
      authorizedAppVariables: authorized_app_variables,
    });

    Logger.log("success", {
      message: "appVariableController:getAllInternalAppVariables:success",
      params: { pm_user_id, appVariables },
    });

    return res.json({
      success: true,
      appVariables: appVariables,
    });
  } catch (error) {
    Logger.log("error", {
      message: "appVariableController:getAllInternalAppVariables:catch-1",
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
appVariableController.getAppVariableByID = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_app_variable_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_app_variables = state.authorized_app_variables;

    Logger.log("info", {
      message: "appVariableController:getAppVariableByID:params",
      params: { pm_user_id, pm_app_variable_id },
    });

    const appVariable = await AppVariableService.getAppVariableByID({
      pmAppVariableID: pm_app_variable_id,
      authorizedAppVariables: authorized_app_variables,
    });

    Logger.log("success", {
      message: "appVariableController:getAppVariableByID:success",
      params: { pm_user_id, appVariable },
    });

    return res.json({
      success: true,
      appVariable: appVariable,
    });
  } catch (error) {
    Logger.log("error", {
      message: "appVariableController:getAppVariableByID:catch-1",
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
appVariableController.addAppVariable = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);

    Logger.log("info", {
      message: "appVariableController:addAppVariable:params",
      params: { pm_user_id, body },
    });

    const appVariable = await AppVariableService.addAppVariable({
      pmAppVariableTitle: body.pm_app_variable_title,
      pmAppVariableValue: body.pm_app_variable_value,
      isInternal: body.is_internal,
    });

    Logger.log("success", {
      message: "appVariableController:addAppVariable:success",
      params: { pm_user_id, appVariable },
    });

    return res.json({
      success: true,
      appVariable,
    });
  } catch (error) {
    Logger.log("error", {
      message: "appVariableController:addAppVariable:catch-1",
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
appVariableController.updateAppVariable = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_app_variables = state.authorized_app_variables;

    Logger.log("info", {
      message: "appVariableController:updateAppVariable:params",
      params: { pm_user_id, body },
    });

    const appVariable = await AppVariableService.updateAppVariable({
      pmAppVariableID: parseInt(body.pm_app_variable_id),
      pmAppVariableTitle: body.pm_app_variable_title,
      pmAppVariableValue: body.pm_app_variable_value,
      isInternal: body.is_internal,
      authorizedAppVariables: authorized_app_variables,
    });

    Logger.log("success", {
      message: "appVariableController:updateAppVariable:success",
      params: { pm_user_id, appVariable },
    });

    return res.json({
      success: true,
      appVariable,
    });
  } catch (error) {
    Logger.log("error", {
      message: "appVariableController:updateAppVariable:catch-1",
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
appVariableController.deleteAppVariable = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_app_variable_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_app_variables = state.authorized_app_variables;

    Logger.log("info", {
      message: "appVariableController:deleteAppVariable:params",
      params: { pm_user_id, pm_app_variable_id },
    });

    await AppVariableService.deleteAppVariable({
      pmAppVariableID: pm_app_variable_id,
      authorizedAppVariables: authorized_app_variables,
    });

    Logger.log("success", {
      message: "appVariableController:deleteAppVariable:success",
      params: { pm_user_id },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    Logger.log("error", {
      message: "appVariableController:deleteAppVariable:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = { appVariableController };
