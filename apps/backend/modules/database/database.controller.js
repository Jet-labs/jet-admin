const {
  TenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");
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
      userID: user.userID,
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
 * Retrieves database metadata for a specific schema.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseController.getDatabaseMetadataBySchema = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName } = req.params;

    Logger.log("info", {
      message: "databaseController:getDatabaseMetadataBySchema:params",
      params: { userID: user.userID, databaseSchemaName },
    });

    const schemaMetadata = await databaseService.getDatabaseMetadataBySchema({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
    });

    Logger.log("success", {
      message: "databaseController:getDatabaseMetadataBySchema:success",
      params: { userID: user.userID, databaseSchemaName },
    });

    return expressUtils.sendResponse(res, true, { schemaMetadata });
  } catch (error) {
    Logger.log("error", {
      message: "databaseController:getDatabaseMetadataBySchema:catch-1",
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
      userID: user.userID,
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
    const { query } = req.body;

    Logger.log("info", {
      message: "databaseController:executeRawSQLQuery:params",
      params: { userID: user.userID, query },
    });

    if (!query || typeof query !== "string") {
      return expressUtils.sendResponse(
        res,
        false,
        {},
        "Invalid SQL query provided"
      );
    }

    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(query);
      }
    );

    Logger.log("success", {
      message: "databaseController:executeRawSQLQuery:success",
      params: {
        userID: user.userID,
        rowCount: result.rowCount,
      },
    });

    return expressUtils.sendResponse(res, true, {
      result: result.rows,
      rowCount: result.rowCount,
      message: "SQL query executed successfully.",
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
