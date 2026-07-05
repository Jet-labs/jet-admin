const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { dataQueryService } = require("./dataQuery.service");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

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
    const { search, page, pageSize } = req.query;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "dataQueryController:getAllDataQueries:params",
      params: {
        userID: user.userID,
        tenantID,
        search,
        page,
        pageSize,
        authContext,
      },
    });

    const result = await dataQueryService.getAllDataQueries({
      userID: user.userID,
      tenantID,
      search,
      page,
      pageSize,
      authContext,
    });

    Logger.log("success", {
      message: "dataQueryController:getAllDataQueries:success",
      params: {
        userID: user.userID,
        tenantID,
        dataQueriesLength: result.dataQueries.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      dataQueries: result.dataQueries,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      page: result.page,
      pageSize: result.pageSize,
      message: "Queries fetched successfully.",
    }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:getAllDataQueries:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
    const authContext = getServiceAuthContext(req);
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
        authContext,
      },
    });

    const result = await dataQueryService.createDataQuery({
      userID: user.userID,
      tenantID,
      dataQueryTitle,
      dataQueryOptions,
      datasourceID,
      datasourceType,
      runOnLoad,
      authContext,
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
      dataQuery: result,
      message: "Query created successfully.",
    }, null, constants.HTTP_STATUS.CREATED);
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:createDataQuery:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
    const authContext = getServiceAuthContext(req);

    Logger.log("info", {
      message: "dataQueryController:createBulkDataQuery:params",
      params: {
        userID: user.userID,
        tenantID,
        dataQueriesData,
        authContext,
      },
    });

    const dataQueries = await dataQueryService.createBulkDataQuery({
      userID: user.userID,
      tenantID,
      dataQueriesData,
      authContext,
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
    }, null, constants.HTTP_STATUS.CREATED);
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:createBulkDataQuery:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Creates a new database schema.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
dataQueryController.runDataQueryByID = async (req, res) => {
  try {
    const { user } = req;
    const { inputValues } = req.body;
    const { dataQueryID, tenantID } = req.params;
    Logger.log("info", {
      message: "dataQueryController:runDataQueryByID:params",
      params: { userID: user.userID, tenantID, dataQueryID, inputValues },
    });

    const dataQueryResult = await dataQueryService.runDataQueryByID({
      userID: user.userID,
      tenantID,
      dataQueryID,
      inputValues,
      executionCtx: req.executionCtx,
    });

    Logger.log("success", {
      message: "dataQueryController:runDataQueryByID:success",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryID,
      },
    });

    return expressUtils.sendResponse(res, true, { dataQueryResult }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:runDataQueryByID:catch-1",
      params: { userID: req.user?.userID, error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Creates a new database schema.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
dataQueryController.runDataQueryByData = async (req, res) => {
  try {
    const { user } = req;
    const { inputValues, dataQuery } = req.body;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "dataQueryController:runDataQueryByData:params",
      params: { userID: user.userID, tenantID, dataQuery, inputValues, body: req.body },
    });

    const dataQueryResult = await dataQueryService.runDataQueryByData({
      userID: user.userID,
      tenantID,
      dataQuery,
      inputValues,
      executionCtx: req.executionCtx,
    });

    Logger.log("success", {
      message: "dataQueryController:runDataQueryByData:success",
      params: {
        userID: user.userID,
        tenantID,
        dataQuery,
      },
    });

    return expressUtils.sendResponse(res, true, { dataQueryResult }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:runDataQueryByData:catch-1",
      params: { userID: req.user?.userID, error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
      userID: user.userID,
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
    }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:getDataQueryByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "dataQueryController:cloneDataQueryByID:params",
      params: {
        userID: user.userID,
        tenantID,
        dataQueryID,
        authContext,
      },
    });

    await dataQueryService.cloneDataQueryByID({
      userID: user.userID,
      tenantID,
      dataQueryID,
      authContext,
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
    }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:cloneDataQueryByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
      userID: user.userID,
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
    }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:updateDataQueryByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
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
      userID: user.userID,
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
    }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "dataQueryController:deleteDataQueryByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = { dataQueryController };
