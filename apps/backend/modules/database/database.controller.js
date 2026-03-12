const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { dataQueryService } = require("../dataQuery/dataQuery.service");
const { databaseService } = require("./database.service");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

const databaseController = {};

/**
 * Retrieves database metadata.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseController.getDatabaseMetadata = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const authContext = getServiceAuthContext(req);

    Logger.log("info", {
      message: "databaseController:getDatabaseMetadata:params",
      params: { userID: user.userID, authContext },
    });

    const databaseMetadata = await databaseService.getDatabaseMetadata({
      userID: user.userID,
      dbPool,
      authContext,
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

module.exports = { databaseController };
