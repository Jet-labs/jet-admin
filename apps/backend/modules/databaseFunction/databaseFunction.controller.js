const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { databaseFunctionService } = require("./databaseFunction.service");

const databaseFunctionController = {};

/**
 * Retrieves all functions in a database schema.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseFunctionController.getAllFunctions = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName } = req.params;

    Logger.log("info", {
      message: "databaseFunctionController:getAllFunctions:params",
      params: { userID: user.userID, databaseSchemaName },
    });

    const functions = await databaseFunctionService.getAllFunctions({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
    });

    Logger.log("success", {
      message: "databaseFunctionController:getAllFunctions:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        functionsLength: functions.length,
      },
    });

    return expressUtils.sendResponse(res, true, { functions });
  } catch (error) {
    Logger.log("error", {
      message: "databaseFunctionController:getAllFunctions:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Retrieves a specific function by name.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseFunctionController.getFunctionByName = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, functionName } = req.params;

    Logger.log("info", {
      message: "databaseFunctionController:getFunctionByName:params",
      params: { userID: user.userID, databaseSchemaName, functionName },
    });

    const func = await databaseFunctionService.getFunctionByName({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      functionName,
    });

    Logger.log("success", {
      message: "databaseFunctionController:getFunctionByName:success",
      params: { userID: user.userID, databaseSchemaName, functionName },
    });

    return expressUtils.sendResponse(res, true, { function: func });
  } catch (error) {
    Logger.log("error", {
      message: "databaseFunctionController:getFunctionByName:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Executes a function.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseFunctionController.executeFunction = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, functionName } = req.params;
    const { args = [] } = req.body;

    Logger.log("info", {
      message: "databaseFunctionController:executeFunction:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        functionName,
        argsLength: args.length,
      },
    });

    const result = await databaseFunctionService.executeFunction({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      functionName,
      args,
    });

    Logger.log("success", {
      message: "databaseFunctionController:executeFunction:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        functionName,
        rowCount: result.rowCount,
      },
    });

    return expressUtils.sendResponse(res, true, { result });
  } catch (error) {
    Logger.log("error", {
      message: "databaseFunctionController:executeFunction:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Creates a new function.
 */
databaseFunctionController.createFunction = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName } = req.params;
    const { 
      functionName, 
      parameters, 
      returnType, 
      language, 
      body, 
      volatility, 
      securityDefiner, 
      strict, 
      orReplace,
      returnsSet 
    } = req.body;

    Logger.log("info", {
      message: "databaseFunctionController:createFunction:params",
      params: { userID: user.userID, databaseSchemaName, functionName },
    });

    const result = await databaseFunctionService.createFunction({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      functionName,
      parameters,
      returnType,
      language,
      body,
      volatility,
      securityDefiner,
      strict,
      orReplace,
      returnsSet,
    });

    Logger.log("success", {
      message: "databaseFunctionController:createFunction:success",
      params: { userID: user.userID, databaseSchemaName, functionName },
    });

    return expressUtils.sendResponse(res, true, result);
  } catch (error) {
    Logger.log("error", {
      message: "databaseFunctionController:createFunction:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Updates an existing function.
 */
databaseFunctionController.updateFunction = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, functionName } = req.params;
    const { parameters, returnType, language, body, volatility, securityDefiner, strict, returnsSet } = req.body;

    Logger.log("info", {
      message: "databaseFunctionController:updateFunction:params",
      params: { userID: user.userID, databaseSchemaName, functionName },
    });

    const result = await databaseFunctionService.updateFunction({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      functionName,
      parameters,
      returnType,
      language,
      body,
      volatility,
      securityDefiner,
      strict,
      returnsSet,
    });

    Logger.log("success", {
      message: "databaseFunctionController:updateFunction:success",
      params: { userID: user.userID, databaseSchemaName, functionName },
    });

    return expressUtils.sendResponse(res, true, result);
  } catch (error) {
    Logger.log("error", {
      message: "databaseFunctionController:updateFunction:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Deletes a function.
 */
databaseFunctionController.deleteFunction = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, functionName } = req.params;
    const { argumentTypes, cascade } = req.body;

    Logger.log("info", {
      message: "databaseFunctionController:deleteFunction:params",
      params: { userID: user.userID, databaseSchemaName, functionName },
    });

    const result = await databaseFunctionService.deleteFunction({
      userID: user.userID,
      dbPool,
      databaseSchemaName,
      functionName,
      argumentTypes,
      cascade,
    });

    Logger.log("success", {
      message: "databaseFunctionController:deleteFunction:success",
      params: { userID: user.userID, databaseSchemaName, functionName },
    });

    return expressUtils.sendResponse(res, true, result);
  } catch (error) {
    Logger.log("error", {
      message: "databaseFunctionController:deleteFunction:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { databaseFunctionController };
