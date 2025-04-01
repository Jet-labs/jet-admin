const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { databaseService } = require("./database.service");

const databaseController = {};

/**
 * Retrieves database metadata.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseController.getDatabaseMetadata = async (req, res) => {
  try {
    const { user, dbPool } = req;

    Logger.log("info", {
      message: "databaseController:getDatabaseMetadata:params",
      params: { userID: user.userID },
    });

    const databaseMetadata = await databaseService.getDatabaseMetadata({
      userID: parseInt(user.userID),
      dbPool,
    });

    Logger.log("success", {
      message: "databaseController:getDatabaseMetadata:success",
      params: { userID: user.userID },
    });

    return expressUtils.sendResponse(res, true, { databaseMetadata });
  } catch (error) {
    Logger.log("error", {
      message: "databaseController:getDatabaseMetadata:catch-1",
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
databaseController.createDatabaseSchema = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName } = req.body;

    if (!databaseSchemaName || typeof databaseSchemaName !== "string") {
      throw new Error("Invalid or missing databaseSchemaName.");
    }

    Logger.log("info", {
      message: "databaseController:createDatabaseSchema:params",
      params: { userID: user.userID, databaseSchemaName },
    });

    const databaseSchema = await databaseService.createDatabaseSchema({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
    });

    Logger.log("success", {
      message: "databaseController:createDatabaseSchema:success",
      params: { userID: user.userID, databaseSchemaName },
    });

    return expressUtils.sendResponse(res, true, { databaseSchema });
  } catch (error) {
    Logger.log("error", {
      message: "databaseController:createDatabaseSchema:catch-1",
      params: { userID: req.user?.userID, error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Executes a raw SQL query.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseController.executeRawSQLQuery = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { sqlQuery } = req.body;
    
    Logger.log("info", {
      message: "databaseController:executeRawSQLQuery:params",
      params: { userID: user.userID, sqlQuery },
    });

    if (!sqlQuery || typeof sqlQuery !== 'string') {
      return expressUtils.sendResponse(res, false, {}, "Invalid SQL query provided");
    }

    const result = await databaseService.executeRawSQLQuery({
      userID: parseInt(user.userID),
      dbPool,
      sqlQuery,
    });

    Logger.log("success", {
      message: "databaseController:executeRawSQLQuery:success",
      params: { userID: user.userID, rowCount: result.rowCount },
    });

    return expressUtils.sendResponse(res, true, { 
      result: result.rows,
      rowCount: result.rowCount,
      message: "SQL query executed successfully."
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseController:executeRawSQLQuery:catch-1",
      params: { userID: req.user?.userID, error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { databaseController };
