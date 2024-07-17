const { Prisma } = require("@prisma/client");
const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { GRAPH_PLUGINS_MAP } = require("../../plugins/graphs");
class GraphService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.graphTitle
   * @param {any} param0.graphOptions
   * @returns {any|null}
   */
  static addGraph = async ({ graphTitle, graphOptions }) => {
    Logger.log("info", {
      message: "GraphService:addGraph:params",
      params: {
        graphTitle,
        graphOptions,
      },
    });
    try {
      let newGraph = null;
      newGraph = await prisma.tbl_pm_graphs.create({
        data: {
          graph_title: String(graphTitle),
          graph_options: graphOptions,
        },
      });
      Logger.log("success", {
        message: "GraphService:addGraph:newGraph",
        params: {
          graphTitle,
          newGraph,
        },
      });
      return newGraph;
    } catch (error) {
      Logger.log("error", {
        message: "GraphService:addGraph:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.graphID
   * @param {String} param0.graphTitle
   * @param {any} param0.graphOptions
   * @param {Boolean|Array<Number>} param0.authorizedGraphs
   * @returns {any|null}
   */
  static updateGraph = async ({
    graphID,
    graphTitle,
    graphOptions,
    authorizedGraphs,
  }) => {
    Logger.log("info", {
      message: "GraphService:updateGraph:params",
      params: { graphID, graphTitle, graphOptions },
    });
    try {
      if (authorizedGraphs === true || authorizedGraphs.includes(graphID)) {
        const updatedGraph = await prisma.tbl_pm_graphs.update({
          where: {
            pm_graph_id: graphID,
          },
          data: {
            graph_title: String(graphTitle),
            graph_options: graphOptions,
          },
        });
        Logger.log("success", {
          message: "GraphService:updateGraph:newGraph",
          params: {
            updatedGraph,
          },
        });
        return updatedGraph;
      } else {
        Logger.log("error", {
          message: "GraphService:updateGraph:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "GraphService:updateGraph:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.graphID
   * @param {Boolean|Array<Number>} param0.authorizedGraphs
   * @returns {any|null}
   */
  static getGraphData = async ({ graphID, authorizedGraphs }) => {
    Logger.log("info", {
      message: "GraphService:getGraphData:params",
      params: {
        graphID,
      },
    });
    try {
      if (authorizedGraphs === true || authorizedGraphs.includes(graphID)) {
        const graph = await prisma.tbl_pm_graphs.findUnique({
          where: {
            pm_graph_id: graphID,
          },
        });
        Logger.log("info", {
          message: "GraphService:getGraphData:graph",
          params: {
            graph,
          },
        });
        const graphModel = GRAPH_PLUGINS_MAP[
          graph.graph_options.graph_type
        ].getGraphModel({
          pm_graph_id: graph.pm_graph_id,
          graph_title: graph.graph_title,
          graph_options: graph.graph_options,
        });

        const dataset = await graphModel.getProcessedData();
        Logger.log("success", {
          message: "GraphService:getGraphData:graph",
          params: {
            dataset,
          },
        });
        return { ...graph, dataset };
      } else {
        Logger.log("error", {
          message: "GraphService:getGraphData:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "GraphService:getGraphData:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Boolean|Array<Number>} param0.authorizedGraphs
   * @returns {any|null}
   */
  static getAllGraphs = async ({ authorizedGraphs }) => {
    Logger.log("info", {
      message: "GraphService:getAllGraphs:params",
    });
    try {
      const graphs = await prisma.tbl_pm_graphs.findMany({
        where:
          authorizedGraphs === true
            ? {}
            : {
                pm_graph_id: {
                  in: authorizedGraphs,
                },
              },
      });
      Logger.log("info", {
        message: "GraphService:getAllGraphs:graph",
        params: {
          graphsLength: graphs?.length,
        },
      });
      return graphs;
    } catch (error) {
      Logger.log("error", {
        message: "GraphService:getAllGraphs:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.graphID
   * @param {Boolean|Array<Number>} param0.authorizedGraphs
   * @returns {any|null}
   */
  static deleteGraph = async ({ graphID, authorizedGraphs }) => {
    Logger.log("info", {
      message: "GraphService:deleteGraph:params",
      params: {
        graphID,
      },
    });
    try {
      if (authorizedGraphs === true || authorizedGraphs.includes(graphID)) {
        const graph = await prisma.tbl_pm_graphs.delete({
          where: {
            pm_graph_id: graphID,
          },
        });
        Logger.log("info", {
          message: "GraphService:deleteGraph:graph",
          params: {
            graph,
          },
        });

        return true;
      } else {
        Logger.log("error", {
          message: "GraphService:deleteGraph:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "GraphService:deleteGraph:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { GraphService };
