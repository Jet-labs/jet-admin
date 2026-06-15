const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { appPageService } = require("./appPage.service");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

const appPageController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
appPageController.getAllAppPages = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { search, page, pageSize } = req.query;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "appPageController:getAllAppPages:params",
      params: {
        userID: user.userID,
        tenantID,
        search,
        page,
        pageSize,
        authContext,
      },
    });

    const result = await appPageService.getAllAppPages({
      userID: user.userID,
      tenantID,
      search,
      page,
      pageSize,
      authContext,
    });

    Logger.log("success", {
      message: "appPageController:getAllAppPages:success",
      params: {
        userID: user.userID,
        tenantID,
        appPagesLength: result.appPages.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      appPages: result.appPages,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      page: result.page,
      pageSize: result.pageSize,
      message: "App pages fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "appPageController:getAllAppPages:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
appPageController.createAppPage = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const authContext = getServiceAuthContext(req);
    const { appPageTitle, appPageDescription, appPageConfig } = req.body;

    Logger.log("info", {
      message: "appPageController:createAppPage:params",
      params: {
        userID: user.userID,
        tenantID,
        appPageTitle,
        appPageDescription,
        appPageConfig,
        authContext,
      },
    });

    const result = await appPageService.createAppPage({
      userID: user.userID,
      tenantID,
      appPageTitle,
      appPageDescription,
      appPageConfig,
      authContext,
    });

    Logger.log("success", {
      message: "appPageController:createAppPage:success",
      params: {
        userID: user.userID,
        tenantID,
        appPageTitle,
        appPageDescription,
        appPageConfig,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "App page created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "appPageController:createAppPage:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
appPageController.getAppPageByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, appPageID } = req.params;
    Logger.log("info", {
      message: "appPageController:getAppPageByID:params",
      params: {
        userID: user.userID,
        tenantID,
        appPageID,
      },
    });

    const appPage = await appPageService.getAppPageByID({
      userID: user.userID,
      tenantID,
      appPageID,
    });

    Logger.log("success", {
      message: "appPageController:getAppPageByID:success",
      params: {
        userID: user.userID,
        tenantID,
        appPageID,
        appPage,
      },
    });

    return expressUtils.sendResponse(res, true, {
      appPage,
      message: "App page fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "appPageController:getAppPageByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
appPageController.cloneAppPageByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, appPageID } = req.params;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "appPageController:cloneAppPageByID:params",
      params: {
        userID: user.userID,
        tenantID,
        appPageID,
        authContext,
      },
    });

    await appPageService.cloneAppPageByID({
      userID: user.userID,
      tenantID,
      appPageID,
      authContext,
    });

    Logger.log("success", {
      message: "appPageController:cloneAppPageByID:success",
      params: {
        userID: user.userID,
        tenantID,
        appPageID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "App page cloned successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "appPageController:cloneAppPageByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
appPageController.updateAppPageByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, appPageID } = req.params;
    const { appPageConfig, appPageDescription, appPageTitle } = req.body;

    Logger.log("info", {
      message: "appPageController:updateAppPageByID:params",
      params: {
        userID: user.userID,
        tenantID,
        appPageID,
        appPageConfig,
        appPageDescription,
        appPageTitle,
      },
    });

    const result = await appPageService.updateAppPageByID({
      userID: user.userID,
      tenantID,
      appPageID,
      appPageConfig,
      appPageDescription,
      appPageTitle,
    });

    Logger.log("success", {
      message: "appPageController:updateAppPageByID:success",
      params: {
        userID: user.userID,
        tenantID,
        appPageID,
        appPageConfig,
        appPageDescription,
        appPageTitle,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "App page updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "appPageController:updateAppPageByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
appPageController.deleteAppPageByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, appPageID } = req.params;

    Logger.log("info", {
      message: "appPageController:deleteAppPageByID:params",
      params: {
        userID: user.userID,
        tenantID,
        appPageID,
      },
    });

    const result = await appPageService.deleteAppPageByID({
      userID: user.userID,
      tenantID,
      appPageID,
    });

    Logger.log("success", {
      message: "appPageController:deleteAppPageByID:success",
      params: {
        userID: user.userID,
        tenantID,
        appPageID,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "App page deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "appPageController:deleteAppPageByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { appPageController };
