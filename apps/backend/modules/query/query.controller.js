const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
const { QueryService } = require("./query.services");

const queryController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
queryController.getAllQueries = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_queries = state.authorized_queries;

    Logger.log("info", {
      message: "queryController:getAllQueries:params",
      params: { pm_user_id },
    });

    const queries = await QueryService.getAllQueries({
      authorizedQueries: authorized_queries,
    });

    Logger.log("success", {
      message: "queryController:getAllQueries:success",
      params: { pm_user_id, queriesLength: queries?.length },
    });

    return res.json({
      success: true,
      queries: queries,
    });
  } catch (error) {
    Logger.log("error", {
      message: "queryController:getAllQueries:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
queryController.addQuery = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const { pm_query_title, pm_query_description, pm_query_type, pm_query } =
      body;
    const pm_user_id = parseInt(pmUser.pm_user_id);

    Logger.log("info", {
      message: "queryController:addQuery:params",
      params: { pm_user_id, pm_query },
    });

    let newQuery = await QueryService.addQuery({
      pmQueryTitle: pm_query_title,
      pmQueryType: pm_query_type,
      pmQueryDescription: pm_query_description,
      pmQuery: pm_query,
    });

    Logger.log("success", {
      message: "queryController:addQuery:success",
      params: { pm_user_id, newQuery },
    });

    return res.json({
      success: true,
      query: newQuery,
    });
  } catch (error) {
    Logger.log("error", {
      message: "queryController:addQuery:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
queryController.duplicateQuery = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const { pm_query_id } = body;
    const pm_user_id = parseInt(pmUser.pm_user_id);

    Logger.log("info", {
      message: "queryController:duplicateQuery:params",
      params: { pm_user_id, pm_query_id },
    });

    let newDuplicateQuery = await QueryService.duplicateQuery({
      pmQueryID: parseInt(pm_query_id),
    });

    Logger.log("success", {
      message: "queryController:duplicateQuery:success",
      params: { pm_user_id, newDuplicateQuery },
    });

    return res.json({
      success: true,
      query: newDuplicateQuery,
    });
  } catch (error) {
    Logger.log("error", {
      message: "queryController:duplicateQuery:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
queryController.updateQuery = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const { pm_query_id, pm_query_title, pm_query_description, pm_query } =
      body;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_queries = state.authorized_queries;

    Logger.log("info", {
      message: "queryController:updateQuery:params",
      params: {
        pm_user_id,
        pm_query_title,
        pm_query_description,
        pm_query_id,
        pm_query,
      },
    });

    const updatedQuery = await QueryService.updateQuery({
      pmQueryID: parseInt(pm_query_id),
      pmQueryTitle: pm_query_title,
      pmQueryDescription: pm_query_description,
      pmQuery: pm_query,
      authorizedQueries: authorized_queries,
    });

    Logger.log("success", {
      message: "queryController:updateQuery:success",
      params: { pm_user_id, updatedQuery },
    });

    return res.json({
      success: true,
      query: updatedQuery,
    });
  } catch (error) {
    Logger.log("error", {
      message: "queryController:updateQuery:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
queryController.runQuery = async (req, res) => {
  try {
    BigInt.prototype.toJSON = function () {
      const int = Number.parseInt(this.toString());
      return int ?? this.toString();
    };
    const { pmUser, state, body } = req;
    const { pm_query_type, pm_query } = body;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_queries = state.authorized_queries;

    Logger.log("info", {
      message: "queryController:runQuery:params",
      params: { pm_user_id, pm_query, pm_query_type },
    });

    const data = await QueryService.runQuery({
      pmQuery: pm_query,
      pmQueryType: pm_query_type,
    });

    Logger.log("success", {
      message: "queryController:runQuery:success",
      params: { pm_user_id, data },
    });

    return res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    Logger.log("error", {
      message: "queryController:runQuery:catch-1",
      params: { error: error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
queryController.getQueryByID = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_query_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_queries = state.authorized_queries;

    Logger.log("info", {
      message: "queryController:getQueryByID:params",
      params: { pm_user_id, pm_query_id },
    });

    const query = await QueryService.getQueryByID({
      pmQueryID: parseInt(pm_query_id),
      authorizedQueries: authorized_queries,
    });

    Logger.log("success", {
      message: "queryController:getQueryByID:success",
      params: { pm_user_id, query },
    });

    return res.json({
      success: true,
      query: query,
    });
  } catch (error) {
    Logger.log("error", {
      message: "queryController:getQueryByID:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
queryController.deleteQuery = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_query_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_queries = state.authorized_queries;

    Logger.log("info", {
      message: "queryController:deleteQuery:params",
      params: { pm_user_id, pm_query_id },
    });

    await QueryService.deleteQuery({
      pmQueryID: parseInt(pm_query_id),
      authorizedQueries: authorized_queries,
    });

    Logger.log("success", {
      message: "queryController:deleteQuery:success",
      params: { pm_user_id },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    Logger.log("error", {
      message: "queryController:deleteQuery:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = { queryController };
