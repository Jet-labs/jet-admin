const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { storedProcedureService } = require("./storedProcedure.service");

const storedProcedureController = {};

/**
 * Retrieves all stored procedures in a database schema.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
storedProcedureController.getAllStoredProcedures = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName } = req.params;

    Logger.log("info", {
      message: "storedProcedureController:getAllStoredProcedures:params",
      params: { userID: user.userID, databaseSchemaName },
    });

    const storedProcedures = await storedProcedureService.getAllStoredProcedures({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
    });

    Logger.log("success", {
      message: "storedProcedureController:getAllStoredProcedures:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        storedProceduresLength: storedProcedures.length,
      },
    });

    return expressUtils.sendResponse(res, true, { storedProcedures });
  } catch (error) {
    Logger.log("error", {
      message: "storedProcedureController:getAllStoredProcedures:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Retrieves a specific stored procedure by name.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
storedProcedureController.getStoredProcedureByName = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, procedureName } = req.params;

    Logger.log("info", {
      message: "storedProcedureController:getStoredProcedureByName:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        procedureName,
      },
    });

    const storedProcedure = await storedProcedureService.getStoredProcedureByName({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      procedureName,
    });

    Logger.log("success", {
      message: "storedProcedureController:getStoredProcedureByName:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        procedureName,
      },
    });

    return expressUtils.sendResponse(res, true, { storedProcedure });
  } catch (error) {
    Logger.log("error", {
      message: "storedProcedureController:getStoredProcedureByName:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Executes a stored procedure using CALL.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
storedProcedureController.executeStoredProcedure = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, procedureName } = req.params;
    const { args = [] } = req.body;

    Logger.log("info", {
      message: "storedProcedureController:executeStoredProcedure:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        procedureName,
        argsLength: args.length,
      },
    });

    const result = await storedProcedureService.executeStoredProcedure({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      procedureName,
      args,
    });

    Logger.log("success", {
      message: "storedProcedureController:executeStoredProcedure:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        procedureName,
      },
    });

    return expressUtils.sendResponse(res, true, { result });
  } catch (error) {
    Logger.log("error", {
      message: "storedProcedureController:executeStoredProcedure:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Creates a new stored procedure.
 */
storedProcedureController.createStoredProcedure = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName } = req.params;
    const { 
      procedureName, 
      parameters, 
      language, 
      body, 
      securityDefiner, 
      orReplace
    } = req.body;

    Logger.log("info", {
      message: "storedProcedureController:createStoredProcedure:params",
      params: { userID: user.userID, databaseSchemaName, procedureName },
    });

    const result = await storedProcedureService.createStoredProcedure({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      procedureName,
      parameters,
      language,
      body,
      securityDefiner,
      orReplace,
    });

    Logger.log("success", {
      message: "storedProcedureController:createStoredProcedure:success",
      params: { userID: user.userID, databaseSchemaName, procedureName },
    });

    return expressUtils.sendResponse(res, true, result);
  } catch (error) {
    Logger.log("error", {
      message: "storedProcedureController:createStoredProcedure:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Updates an existing stored procedure.
 */
storedProcedureController.updateStoredProcedure = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, procedureName } = req.params;
    const { parameters, language, body, securityDefiner } = req.body;

    Logger.log("info", {
      message: "storedProcedureController:updateStoredProcedure:params",
      params: { userID: user.userID, databaseSchemaName, procedureName },
    });

    const result = await storedProcedureService.updateStoredProcedure({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      procedureName,
      parameters,
      language,
      body,
      securityDefiner,
    });

    Logger.log("success", {
      message: "storedProcedureController:updateStoredProcedure:success",
      params: { userID: user.userID, databaseSchemaName, procedureName },
    });

    return expressUtils.sendResponse(res, true, result);
  } catch (error) {
    Logger.log("error", {
      message: "storedProcedureController:updateStoredProcedure:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Deletes a stored procedure.
 */
storedProcedureController.deleteStoredProcedure = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, procedureName } = req.params;
    const { argumentTypes, cascade } = req.body;

    Logger.log("info", {
      message: "storedProcedureController:deleteStoredProcedure:params",
      params: { userID: user.userID, databaseSchemaName, procedureName },
    });

    const result = await storedProcedureService.deleteStoredProcedure({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      procedureName,
      argumentTypes,
      cascade,
    });

    Logger.log("success", {
      message: "storedProcedureController:deleteStoredProcedure:success",
      params: { userID: user.userID, databaseSchemaName, procedureName },
    });

    return expressUtils.sendResponse(res, true, result);
  } catch (error) {
    Logger.log("error", {
      message: "storedProcedureController:deleteStoredProcedure:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { storedProcedureController };
