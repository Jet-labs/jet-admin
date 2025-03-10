const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { databaseTriggerService } = require("./databaseTrigger.service");

const databaseTriggerController = {};


/**
 * Retrieves all triggers in a database schema.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTriggerController.getAllDatabaseTriggers = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName } = req.params;

    Logger.log("info", {
      message: "databaseTriggerController:getAllDatabaseTriggers:params",
      params: { userID: user.userID, databaseSchemaName },
    });

    const databaseTriggers = await databaseTriggerService.getAllDatabaseTriggers({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
    });

    Logger.log("success", {
      message: "databaseTriggerController:getAllDatabaseTriggers:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTriggersLength: databaseTriggers.length,
      },
    });

    return expressUtils.sendResponse(res, true, { databaseTriggers });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTriggerController:getAllDatabaseTriggers:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Retrieves a specific trigger by name.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTriggerController.getDatabaseTriggerByName = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, databaseTableName, databaseTriggerName } =
      req.params;

    Logger.log("info", {
      message: "databaseTriggerController:getDatabaseTriggerByName:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        databaseTriggerName,
      },
    });

    const databaseTrigger = await databaseTriggerService.getDatabaseTriggerByName({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
      databaseTableName,
      databaseTriggerName,
    });

    Logger.log("success", {
      message: "databaseTriggerController:getDatabaseTriggerByName:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        databaseTriggerName,
      },
    });

    return expressUtils.sendResponse(res, true, { databaseTrigger });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTriggerController:getDatabaseTriggerByName:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Deletes a trigger by name.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTriggerController.deleteDatabaseTriggerByName = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, databaseTableName, databaseTriggerName } =
      req.params;

    Logger.log("info", {
      message: "databaseTriggerController:deleteDatabaseTriggerByName:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        databaseTriggerName,
      },
    });

    const result = await databaseTriggerService.deleteDatabaseTriggerByName({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
      databaseTableName,
      databaseTriggerName,
    });

    Logger.log("success", {
      message: "databaseTriggerController:deleteDatabaseTriggerByName:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        databaseTriggerName,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Trigger deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTriggerController:deleteDatabaseTriggerByName:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};
/**
 * Creates a new trigger.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTriggerController.createDatabaseTrigger = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName = "public" } = req.params; // Default schema is "public"
    const {
      databaseTriggerName,
      databaseTableName,
      triggerTiming = "AFTER",
      triggerEvents = ["INSERT"],
      triggerFunctionName,
      forEach = "ROW",
      whenCondition = null,
      referencingOld = null,
      referencingNew = null,
      deferrable = false,
      initiallyDeferred = false,
    } = req.body;

    Logger.log("info", {
      message: "databaseTriggerController:createDatabaseTrigger:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        databaseTriggerName,
        triggerTiming,
        triggerEvents,
        triggerFunctionName,
        forEach,
        whenCondition,
        referencingOld,
        referencingNew,
        deferrable,
        initiallyDeferred,
      },
    });

    const result = await databaseTriggerService.createDatabaseTrigger({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
      databaseTableName,
      databaseTriggerName,
      triggerTiming,
      triggerEvents,
      triggerFunctionName,
      forEach,
      whenCondition,
      referencingOld,
      referencingNew,
      deferrable,
      initiallyDeferred,
    });

    Logger.log("success", {
      message: "databaseTriggerController:createDatabaseTrigger:success",
      params: { userID: user.userID, databaseSchemaName, databaseTriggerName },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Trigger created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTriggerController:createDatabaseTrigger:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { databaseTriggerController };
