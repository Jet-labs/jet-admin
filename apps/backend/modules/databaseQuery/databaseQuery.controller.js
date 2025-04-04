const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { databaseQueryService } = require("./databaseQuery.service");

const databaseQueryController = {};


/**
 * 
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseQueryController.getAllDatabaseQueries = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "databaseQueryController:getAllDatabaseQueries:params",
      params: {
        userID: user.userID,
        tenantID,
      },
    });

    const databaseQueries = await databaseQueryService.getAllDatabaseQueries({
      userID: parseInt(user.userID),
      tenantID,
    });

    Logger.log("success", {
      message: "databaseQueryController:getAllDatabaseQueries:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseQueriesLength: databaseQueries.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      databaseQueries,
      message: "Query created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryController:getAllDatabaseQueries:catch-1",
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
databaseQueryController.createDatabaseQuery = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const {
      databaseQueryTitle,
      databaseQueryDescription,
      databaseQueryData,
      runOnLoad,
    } = req.body;

    Logger.log("info", {
      message: "databaseQueryController:createDatabaseQuery:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseQueryTitle,
        databaseQueryDescription,
        databaseQueryData,
        runOnLoad,
      },
    });

    const result = await databaseQueryService.createDatabaseQuery({
      userID: parseInt(user.userID),
      tenantID,
      databaseQueryTitle,
      databaseQueryDescription,
      databaseQueryData,
      runOnLoad,
    });

    Logger.log("success", {
      message: "databaseQueryController:createDatabaseQuery:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseQueryTitle,
        databaseQueryDescription,
        databaseQueryData,
        runOnLoad,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Query created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryController:createDatabaseQuery:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Creates a new database schema.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseQueryController.runDatabaseQueryByID = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseQueryID } = req.params;
    Logger.log("info", {
      message: "databaseQueryController:runDatabaseQueryByID:params",
      params: { userID: user.userID, databaseQueryID },
    });

    const databaseQueryResult = await databaseQueryService.runDatabaseQuery({
      userID: parseInt(user.userID),
      dbPool,
      databaseQueryID,
    });

    Logger.log("success", {
      message: "databaseQueryController:runDatabaseQueryByID:success",
      params: { userID: user.userID, databaseQueryID },
    });

    return expressUtils.sendResponse(res, true, { databaseQueryResult });
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryController:runDatabaseQueryByID:catch-1",
      params: { userID: req.user?.userID, error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Creates a new database schema.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseQueryController.runDatabaseQuery = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseQueryData, databaseQueryID } = req.body;
    Logger.log("info", {
      message: "databaseQueryController:runDatabaseQuery:params",
      params: { userID: user.userID, databaseQueryID, databaseQueryData },
    });

    const databaseQueryResult = await databaseQueryService.runDatabaseQuery({
      userID: parseInt(user.userID),
      dbPool,
      databaseQueryID,
      databaseQueryData,
    });

    Logger.log("success", {
      message: "databaseQueryController:runDatabaseQuery:success",
      params: { userID: user.userID, databaseQueryID },
    });

    return expressUtils.sendResponse(res, true, { databaseQueryResult });
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryController:runDatabaseQuery:catch-1",
      params: { userID: req.user?.userID, error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseQueryController.getDatabaseQueryByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseQueryID } = req.params;
    Logger.log("info", {
      message: "databaseQueryController:getDatabaseQueryByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseQueryID,
      },
    });

    const databaseQuery = await databaseQueryService.getDatabaseQueryByID({
      userID: parseInt(user.userID),
      tenantID,
      databaseQueryID,
    });

    Logger.log("success", {
      message: "databaseQueryController:getDatabaseQueryByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseQueryID,
        databaseQuery,
      },
    });

    return expressUtils.sendResponse(res, true, {
      databaseQuery,
      message: "Query fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryController:getDatabaseQueryByID:catch-1",
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
databaseQueryController.updateDatabaseQueryByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseQueryID } = req.params; // Assuming `databaseQueryID` identifies the query to update
    const {
      databaseQueryTitle,
      databaseQueryDescription,
      databaseQueryData,
      runOnLoad,
    } = req.body;

    Logger.log("info", {
      message: "databaseQueryController:updateDatabaseQueryByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseQueryID,
        databaseQueryTitle,
        databaseQueryDescription,
        databaseQueryData,
        runOnLoad,
      },
    });

    const result = await databaseQueryService.updateDatabaseQueryByID({
      userID: parseInt(user.userID),
      tenantID,
      databaseQueryID,
      databaseQueryTitle,
      databaseQueryDescription,
      databaseQueryData,
      runOnLoad,
    });

    Logger.log("success", {
      message: "databaseQueryController:updateDatabaseQueryByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseQueryID,
        databaseQueryTitle,
        databaseQueryDescription,
        databaseQueryData,
        runOnLoad,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Query updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryController:updateDatabaseQueryByID:catch-1",
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
databaseQueryController.deleteDatabaseQueryByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, databaseQueryID } = req.params; // Assuming `databaseQueryID` identifies the query to update

    Logger.log("info", {
      message: "databaseQueryController:deleteDatabaseQueryByID:params",
      params: {
        userID: user.userID,
        tenantID,
        databaseQueryID,
      },
    });

    const result = await databaseQueryService.deleteDatabaseQueryByID({
      userID: parseInt(user.userID),
      tenantID,
      databaseQueryID,
    });

    Logger.log("success", {
      message: "databaseQueryController:deleteDatabaseQueryByID:success",
      params: {
        userID: user.userID,
        tenantID,
        databaseQueryID,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Query deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseQueryController:deleteDatabaseQueryByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { databaseQueryController };
