const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { datasourceService } = require("./datasource.service");

const datasourceController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.getAllDatasources = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "datasourceController:getAllDatasources:params",
      params: {
        userID: user.userID,
        tenantID,
      },
    });

    const datasources = await datasourceService.getAllDatasources({
      userID: user.userID,
      tenantID,
    });

    Logger.log("success", {
      message: "datasourceController:getAllDatasources:success",
      params: {
        datasources,
      },
    });

    return expressUtils.sendResponse(res, true, {
      datasources,
      message: "Datasources fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:getAllDatasources:error",
      params: {
        error,
      },
    });

    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.testDatasourceConnection = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { datasourceType, datasourceOptions } = req.body;

    Logger.log("info", {
      message: "datasourceController:testDatasourceConnection:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceType,
        datasourceOptions,
      },
    });

    const connectionResult = await datasourceService.testDatasourceConnection({
      userID: user.userID,
      tenantID,
      datasourceType,
      datasourceOptions,
    });

    Logger.log("success", {
      message: "datasourceController:testDatasourceConnection:success",
      params: {
        connectionResult,
      },
    });
    return expressUtils.sendResponse(res, true, {
      connectionResult,
      message: "Datasource connection tested successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:testDatasourceConnection:error",
      params: {
        error,
      },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.getDatasourceByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, datasourceID } = req.params;

    Logger.log("info", {
      message: "datasourceController:getDatasourceByID:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
      },
    });

    const datasource = await datasourceService.getDatasourceByID({
      userID: user.userID,
      tenantID,
      datasourceID,
    });

    Logger.log("success", {
      message: "datasourceController:getDatasourceByID:success",
      params: {
        datasource,
      },
    });

    return expressUtils.sendResponse(res, true, {
      datasource,
      message: "Datasource fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:getDatasourceByID:error",
      params: {
        error,
      },
    });

    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.createDatasource = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const {
      datasourceTitle,
      datasourceDescription,
      datasourceType,
      datasourceOptions,
      datasourceTags,
    } = req.body;

    Logger.log("info", {
      message: "datasourceController:createDatasource:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceTitle,
        datasourceDescription,
        datasourceType,
        datasourceOptions,
        datasourceTags,
      },
    });

    const datasource = await datasourceService.createDatasource({
      userID: user.userID,
      tenantID,
      datasourceTitle,
      datasourceDescription,
      datasourceType,
      datasourceOptions,
      datasourceTags,
    });

    Logger.log("success", {
      message: "datasourceController:createDatasource:success",
      params: {
        datasource,
      },
    });

    return expressUtils.sendResponse(res, true, {
      datasource,
      message: "Datasource created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:createDatasource:error",
      params: {
        error,
      },
    });

    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.updateDatasourceByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, datasourceID } = req.params;
    const {
      datasourceTitle,
      datasourceDescription,
      datasourceType,
      datasourceOptions,
      datasourceTags,
    } = req.body;

    Logger.log("info", {
      message: "datasourceController:updateDatasourceByID:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
        datasourceTitle,
        datasourceDescription,
        datasourceType,
        datasourceOptions,
        datasourceTags,
      },
    });

    const datasource = await datasourceService.updateDatasourceByID({
      userID: user.userID,
      tenantID,
      datasourceID,
      datasourceTitle,
      datasourceDescription,
      datasourceType,
      datasourceOptions,
      datasourceTags,
    });

    Logger.log("success", {
      message: "datasourceController:updateDatasourceByID:success",
      params: {
        datasource,
      },
    });

    return expressUtils.sendResponse(res, true, {
      datasource,
      message: "Datasource updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:updateDatasourceByID:error",
      params: {
        error,
      },
    });

    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.deleteDatasourceByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, datasourceID } = req.params;

    Logger.log("info", {
      message: "datasourceController:deleteDatasourceByID:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
      },
    });

    await datasourceService.deleteDatasourceByID({
      userID: user.userID,
      tenantID,
      datasourceID,
    });

    Logger.log("success", {
      message: "datasourceController:deleteDatasourceByID:success",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Datasource deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:deleteDatasourceByID:error",
      params: {
        error,
      },
    });

    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
datasourceController.cloneDatasourceByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, datasourceID } = req.params;

    Logger.log("info", {
      message: "datasourceController:cloneDatasourceByID:params",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
      },
    });

    await datasourceService.cloneDatasourceByID({
      userID: user.userID,
      tenantID,
      datasourceID,
    });

    Logger.log("success", {
      message: "datasourceController:cloneDatasourceByID:success",
      params: {
        userID: user.userID,
        tenantID,
        datasourceID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Datasource cloned successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "datasourceController:cloneDatasourceByID:error",
      params: {
        error,
      },
    });

    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = {
  datasourceController,
};
