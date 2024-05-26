const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
const { GraphService } = require("../services/graph.services");
const graphController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
graphController.addGraph = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);

    Logger.log("info", {
      message: "graphController:addGraph:params",
      params: { pm_user_id, body },
    });

    const newGraph = await GraphService.addGraph({
      title: body.graph_title,
      graphOptions: body.graph_options,
    });

    Logger.log("success", {
      message: "graphController:addGraph:success",
      params: { pm_user_id, newGraph },
    });

    return res.json({
      success: true,
      row: newGraph,
    });
  } catch (error) {
    Logger.log("error", {
      message: "graphController:addGraph:catch-1",
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
graphController.getGraphData = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const graph_id = parseInt(params.id);

    Logger.log("info", {
      message: "graphController:getGraphData:params",
      params: { pm_user_id, graph_id },
    });

    const graph = await GraphService.getGraphData({
      graphID: graph_id,
    });

    Logger.log("success", {
      message: "graphController:getGraphData:success",
      params: { pm_user_id, graph },
    });

    return res.json({
      success: true,
      graph: graph,
    });
  } catch (error) {
    Logger.log("error", {
      message: "graphController:getGraphData:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = { graphController };
