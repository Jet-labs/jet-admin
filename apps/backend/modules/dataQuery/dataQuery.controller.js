const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { dataQueryService } = require("./dataQuery.service");

const dataQueryController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
dataQueryController.getAllDataQueries = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "dataQueryController:getAllDataQueries:params",
      params: {
        userID: user.userID,
        tenantID,
      },
    });

    const dataQueries = await dataQueryService.getAllDataQueries({
      userID: parseInt(user.userID),
      tenantID,
    });

    Logger.log("success", {
      message: "dataQueryController:getAllDataQueries:success",
      params: {
        userID: user.userID,
        tenantID,
        dataQueriesLength: dataQueries.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      dataQueries,
      message: "Query created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:getAllDataQueries:catch-1",
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
dataQueryController.createDataQuery = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const {
      dataQueryTitle,
      dataQueryOptions,
      datasourceID,
      datasourceType,
      runOnLoad,
    } = req.body;

    Logger.log("info", {
      message: "dataQueryController:createDataQuery:params",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryTitle,
        dataQueryOptions,
        datasourceID,
        datasourceType,
        runOnLoad,
      },
    });

    const result = await dataQueryService.createDataQuery({
      userID: parseInt(user.userID),
      tenantID,
      dataQueryTitle,
      dataQueryOptions,
      datasourceID,
      datasourceType,
      runOnLoad,
    });

    Logger.log("success", {
      message: "dataQueryController:createDataQuery:success",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryTitle,
        dataQueryOptions,
        datasourceID,
        datasourceType,
        runOnLoad,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Query created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:createDataQuery:catch-1",
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
dataQueryController.createBulkDataQuery = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { dataQueriesData } = req.body;

    Logger.log("info", {
      message: "dataQueryController:createBulkDataQuery:params",
      params: {
        userID: user.userID,
        tenantID,
        dataQueriesData,
      },
    });

    const dataQueries = await dataQueryService.createBulkDataQuery({
      userID: parseInt(user.userID),
      tenantID,
      dataQueriesData,
    });

    Logger.log("success", {
      message: "dataQueryController:createBulkDataQuery:success",
      params: {
        userID: user.userID,
        tenantID,
        dataQueriesData,
        dataQueriesLength: dataQueries.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      dataQueries,
      message: "Queries created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:createBulkDataQuery:catch-1",
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
dataQueryController.generateAIPromptBasedQuery = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { tenantID } = req.params;
    const { aiPrompt } = req.body;
    Logger.log("info", {
      message: "dataQueryController:generateAIPromptBasedQuery:params",
      params: {
        userID: user.userID,
        tenantID,
        aiPrompt,
      },
    });

    const dataQuery = await dataQueryService.generateAIPromptBasedQuery(
      {
        userID: parseInt(user.userID),
        tenantID,
        aiPrompt,
        dbPool,
      }
    );

    Logger.log("success", {
      message: "dataQueryController:generateAIPromptBasedQuery:success",
      params: {
        userID: user.userID,
        tenantID,
        aiPrompt,
        dataQuery,
      },
    });

    return expressUtils.sendResponse(res, true, { dataQuery });
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:generateAIPromptBasedQuery:catch-1",
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
dataQueryController.runDataQueryByID = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { dataQueryID, tenantID } = req.params;
    Logger.log("info", {
      message: "dataQueryController:runDataQueryByID:params",
      params: { userID: user.userID, tenantID, dataQueryID },
    });

    const dataQueryResult = await dataQueryService.runDataQueryByID({
      userID: parseInt(user.userID),
      tenantID,
      dataQueryID,
    });

    Logger.log("success", {
      message: "dataQueryController:runDataQueryByID:success",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryID,
      },
    });

    return expressUtils.sendResponse(res, true, { dataQueryResult });
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:runDataQueryByID:catch-1",
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
dataQueryController.runDataQuery = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { tenantID } = req.params;
    const { dataQueryOptions, dataQueryID } = req.body;
    Logger.log("info", {
      message: "dataQueryController:runDataQuery:params",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryID,
        dataQueryOptions,
      },
    });

    const dataQueriesResult = await dataQueryService.runDataQueries({
      userID: parseInt(user.userID),
      dbPool,
      tenantID,
      dataQueries: [
        {
          dataQueryID,
          dataQueryOptions,
        },
      ],
    });

    const dataQueryResult = dataQueriesResult[0];

    Logger.log("success", {
      message: "dataQueryController:runDataQuery:success",
      params: { userID: user.userID, dataQueryID },
    });

    return expressUtils.sendResponse(res, true, { dataQueryResult });
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:runDataQuery:catch-1",
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
dataQueryController.getDataQueryByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, dataQueryID } = req.params;
    Logger.log("info", {
      message: "dataQueryController:getDataQueryByID:params",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryID,
      },
    });

    const dataQuery = await dataQueryService.getDataQueryByID({
      userID: parseInt(user.userID),
      tenantID,
      dataQueryID,
    });

    Logger.log("success", {
      message: "dataQueryController:getDataQueryByID:success",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryID,
        dataQuery,
      },
    });

    return expressUtils.sendResponse(res, true, {
      dataQuery,
      message: "Query fetched successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:getDataQueryByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
dataQueryController.cloneDataQueryByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, dataQueryID } = req.params;
    Logger.log("info", {
      message: "dataQueryController:cloneDataQueryByID:params",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryID,
      },
    });

    await dataQueryService.cloneDataQueryByID({
      userID: parseInt(user.userID),
      tenantID,
      dataQueryID,
    });

    Logger.log("success", {
      message: "dataQueryController:cloneDataQueryByID:success",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryID,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Query cloned successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:cloneDataQueryByID:catch-1",
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
dataQueryController.updateDataQueryByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, dataQueryID } = req.params; // Assuming `dataQueryID` identifies the query to update
    const {
      dataQueryTitle,
      dataQueryOptions,
      datasourceID,
      datasourceType,
      runOnLoad,
    } = req.body;

    Logger.log("info", {
      message: "dataQueryController:updateDataQueryByID:params",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryID,
        dataQueryTitle,
        dataQueryOptions,
        datasourceID,
        datasourceType,
        runOnLoad,
      },
    });

    const result = await dataQueryService.updateDataQueryByID({
      userID: parseInt(user.userID),
      tenantID,
      dataQueryID,
      dataQueryTitle,
      dataQueryOptions,
      datasourceID,
      datasourceType,
      runOnLoad,
    });

    Logger.log("success", {
      message: "dataQueryController:updateDataQueryByID:success",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryID,
        dataQueryTitle,
        dataQueryOptions,
        datasourceID,
        datasourceType,
        runOnLoad,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Query updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:updateDataQueryByID:catch-1",
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
dataQueryController.deleteDataQueryByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, dataQueryID } = req.params; // Assuming `dataQueryID` identifies the query to update

    Logger.log("info", {
      message: "dataQueryController:deleteDataQueryByID:params",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryID,
      },
    });

    const result = await dataQueryService.deleteDataQueryByID({
      userID: parseInt(user.userID),
      tenantID,
      dataQueryID,
    });

    Logger.log("success", {
      message: "dataQueryController:deleteDataQueryByID:success",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryID,
        result,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Query deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:deleteDataQueryByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { dataQueryController };
