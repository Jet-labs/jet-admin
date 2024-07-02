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
      params: { pm_user_id, queries },
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
    const { title, description, query_type, query } = body;
    const pm_user_id = parseInt(pmUser.pm_user_id);

    Logger.log("info", {
      message: "queryController:addQuery:params",
      params: { pm_user_id, query },
    });

    let newMasterQuery = null;
    switch (query_type) {
      case constants.QUERY_TYPE.POSTGRE_QUERY.value: {
        newMasterQuery = await QueryService.addPGQuery({
          queryTitle: title,
          queryDescription: description,
          query,
        });
        break;
      }
      default: {
        newMasterQuery = await QueryService.addPGQuery({
          queryTitle: title,
          queryDescription: description,
          query,
        });
        break;
      }
    }

    Logger.log("success", {
      message: "queryController:addQuery:success",
      params: { pm_user_id, newMasterQuery },
    });

    return res.json({
      success: true,
      query: newMasterQuery,
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
queryController.runPGQuery = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const { query } = body;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_queries = state.authorized_queries;

    Logger.log("info", {
      message: "queryController:runPGQuery:params",
      params: { pm_user_id, query },
    });

    const data = await QueryService.runPGQuery({
      query,
    });

    Logger.log("success", {
      message: "queryController:runPGQuery:success",
      params: { pm_user_id, data },
    });

    return res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    Logger.log("error", {
      message: "queryController:runPGQuery:catch-1",
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
queryController.getQueryByID = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const query_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_queries = state.authorized_queries;

    Logger.log("info", {
      message: "queryController:getQueryByID:params",
      params: { pm_user_id, query_id },
    });

    const query = await QueryService.getQueryByID({
      queryID: query_id,
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

// /**
//  *
//  * @param {import("express").Request} req
//  * @param {import("express").Response} res
//  * @returns
//  */
// queryController.addQuery = async (req, res) => {
//   try {
//     const { pmUser, state, body } = req;
//     const pm_user_id = parseInt(pmUser.pm_user_id);

//     Logger.log("info", {
//       message: "queryController:addQuery:params",
//       params: { pm_user_id, body },
//     });

//     const query = await QueryService.addQuery({
//       queryTitle: body.query_title,
//       queryDescription: body.query_description,
//       queryOptions: body.query_options,
//     });

//     Logger.log("success", {
//       message: "queryController:addQuery:success",
//       params: { pm_user_id, query },
//     });

//     return res.json({
//       success: true,
//       query,
//     });
//   } catch (error) {
//     Logger.log("error", {
//       message: "queryController:addQuery:catch-1",
//       params: { error },
//     });
//     return res.json({ success: false, error: extractError(error) });
//   }
// };

// /**
//  *
//  * @param {import("express").Request} req
//  * @param {import("express").Response} res
//  * @returns
//  */
// queryController.updateQuery = async (req, res) => {
//   try {
//     const { pmUser, state, body } = req;
//     const pm_user_id = parseInt(pmUser.pm_user_id);
//     const authorized_queries = state.authorized_queries;

//     Logger.log("info", {
//       message: "queryController:updateQuery:params",
//       params: { pm_user_id, body },
//     });

//     const query = await QueryService.updateQuery({
//       queryID: parseInt(body.pm_query_id),
//       queryTitle: body.query_title,
//       queryDescription: body.query_description,
//       queryOptions: body.query_options,
//       authorizedQueries: authorized_queries,
//     });

//     Logger.log("success", {
//       message: "queryController:updateQuery:success",
//       params: { pm_user_id, query },
//     });

//     return res.json({
//       success: true,
//       query,
//     });
//   } catch (error) {
//     Logger.log("error", {
//       message: "queryController:updateQuery:catch-1",
//       params: { error },
//     });
//     return res.json({ success: false, error: extractError(error) });
//   }
// };

// /**
//  *
//  * @param {import("express").Request} req
//  * @param {import("express").Response} res
//  * @returns
//  */
// queryController.deleteQuery = async (req, res) => {
//   try {
//     const { pmUser, state, params } = req;
//     const pm_query_id = parseInt(params.id);
//     const pm_user_id = parseInt(pmUser.pm_user_id);
//     const authorized_queries = state.authorized_queries;

//     Logger.log("info", {
//       message: "queryController:deleteQuery:params",
//       params: { pm_user_id, pm_query_id },
//     });

//     await QueryService.deleteQuery({
//       queryID: pm_query_id,
//       authorizedQueries: authorized_queries,
//     });

//     Logger.log("success", {
//       message: "queryController:deleteQuery:success",
//       params: { pm_user_id },
//     });

//     return res.json({
//       success: true,
//     });
//   } catch (error) {
//     Logger.log("error", {
//       message: "queryController:deleteQuery:catch-1",
//       params: { error },
//     });
//     return res.json({ success: false, error: extractError(error) });
//   }
// };

module.exports = { queryController };
