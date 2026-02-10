const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { databaseViewService } = require("./databaseView.service");

const databaseViewController = {};

/**
 * Retrieves all views in a database schema.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseViewController.getAllDatabaseViews = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName } = req.params;

    Logger.log("info", {
      message: "databaseViewController:getAllDatabaseViews:params",
      params: { userID: user.userID, databaseSchemaName },
    });

    const databaseViews = await databaseViewService.getAllDatabaseViews({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
    });

    Logger.log("success", {
      message: "databaseViewController:getAllDatabaseViews:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseViewsLength: databaseViews.length,
      },
    });

    return expressUtils.sendResponse(res, true, { databaseViews });
  } catch (error) {
    Logger.log("error", {
      message: "databaseViewController:getAllDatabaseViews:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Retrieves a specific view by name.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseViewController.getDatabaseViewByName = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, databaseViewName } = req.params;

    Logger.log("info", {
      message: "databaseViewController:getDatabaseViewByName:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseViewName,
      },
    });

    const databaseView = await databaseViewService.getDatabaseViewByName({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      databaseViewName,
    });

    Logger.log("success", {
      message: "databaseViewController:getDatabaseViewByName:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseViewName,
      },
    });

    return expressUtils.sendResponse(res, true, { databaseView });
  } catch (error) {
    Logger.log("error", {
      message: "databaseViewController:getDatabaseViewByName:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Queries data from a view.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseViewController.queryDatabaseView = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, databaseViewName } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    Logger.log("info", {
      message: "databaseViewController:queryDatabaseView:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseViewName,
        limit,
        offset,
      },
    });

    const result = await databaseViewService.queryDatabaseView({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      databaseViewName,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    Logger.log("success", {
      message: "databaseViewController:queryDatabaseView:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseViewName,
        rowCount: result.rowCount,
      },
    });

    return expressUtils.sendResponse(res, true, { result });
  } catch (error) {
    Logger.log("error", {
      message: "databaseViewController:queryDatabaseView:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Creates a new database view.
 */
databaseViewController.createDatabaseView = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName } = req.params;
    const { viewName, selectQuery, orReplace, materialized, columns, checkOption } = req.body;

    Logger.log("info", {
      message: "databaseViewController:createDatabaseView:params",
      params: { userID: user.userID, databaseSchemaName, viewName },
    });

    const result = await databaseViewService.createDatabaseView({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      viewName,
      selectQuery,
      orReplace,
      materialized,
      columns,
      checkOption,
    });

    Logger.log("success", {
      message: "databaseViewController:createDatabaseView:success",
      params: { userID: user.userID, databaseSchemaName, viewName },
    });

    return expressUtils.sendResponse(res, true, result);
  } catch (error) {
    Logger.log("error", {
      message: "databaseViewController:createDatabaseView:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Updates an existing database view.
 */
databaseViewController.updateDatabaseView = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, databaseViewName } = req.params;
    const { selectQuery, columns, checkOption } = req.body;

    Logger.log("info", {
      message: "databaseViewController:updateDatabaseView:params",
      params: { userID: user.userID, databaseSchemaName, databaseViewName },
    });

    const result = await databaseViewService.updateDatabaseView({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      viewName: databaseViewName,
      selectQuery,
      columns,
      checkOption,
    });

    Logger.log("success", {
      message: "databaseViewController:updateDatabaseView:success",
      params: { userID: user.userID, databaseSchemaName, databaseViewName },
    });

    return expressUtils.sendResponse(res, true, result);
  } catch (error) {
    Logger.log("error", {
      message: "databaseViewController:updateDatabaseView:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Deletes a database view.
 */
databaseViewController.deleteDatabaseView = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, databaseViewName } = req.params;
    const { cascade, materialized } = req.body;

    Logger.log("info", {
      message: "databaseViewController:deleteDatabaseView:params",
      params: { userID: user.userID, databaseSchemaName, databaseViewName },
    });

    const result = await databaseViewService.deleteDatabaseView({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      viewName: databaseViewName,
      cascade,
      materialized,
    });

    Logger.log("success", {
      message: "databaseViewController:deleteDatabaseView:success",
      params: { userID: user.userID, databaseSchemaName, databaseViewName },
    });

    return expressUtils.sendResponse(res, true, result);
  } catch (error) {
    Logger.log("error", {
      message: "databaseViewController:deleteDatabaseView:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { databaseViewController };
