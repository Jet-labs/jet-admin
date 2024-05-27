const { Prisma } = require("@prisma/client");
const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
class GraphService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.title
   * @param {any} param0.graphOptions
   * @returns {any|null}
   */
  static addGraph = async ({ title, graphOptions }) => {
    Logger.log("info", {
      message: "GraphService:addGraph:params",
      params: {
        title,
        graphOptions,
      },
    });
    try {
      let newGraph = null;
      newGraph = await prisma.tbl_pm_graphs.create({
        data: {
          title: String(title),
          graph_options: graphOptions,
        },
      });
      Logger.log("success", {
        message: "GraphService:addGraph:newGraph",
        params: {
          title,
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
   * @param {String} param0.title
   * @param {any} param0.graphOptions
   * @param {Boolean|Array<Number>} param0.authorizedGraphs
   * @returns {any|null}
   */
  static updateGraph = async ({
    graphID,
    title,
    graphOptions,
    authorizedGraphs,
  }) => {
    Logger.log("info", {
      message: "GraphService:updateGraph:params",
      params: { graphID, title, graphOptions },
    });
    try {
      const updatedGraph = await prisma.tbl_pm_graphs.update({
        where:
          authorizedGraphs === true
            ? {
                pm_graph_id: graphID,
              }
            : {
                AND: [
                  { pm_graph_id: graphID },
                  { pm_graph_id: { in: authorizedGraphs } },
                ],
              },
        data: {
          title: String(title),
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
   * @returns {any|null}
   */
  static getGraphData = async ({ graphID }) => {
    Logger.log("info", {
      message: "GraphService:getGraphData:params",
      params: {
        graphID,
      },
    });
    try {
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
      let dataset = { labels: null, datasets: [] };

      if (
        graph.graph_options.graph_type == constants.GRAPH_TYPES.LINE.value ||
        graph.graph_options.graph_type == constants.GRAPH_TYPES.BAR.value ||
        graph.graph_options.graph_type == constants.GRAPH_TYPES.PIE.value ||
        graph.graph_options.graph_type == constants.GRAPH_TYPES.DOUGHNUT.value
      ) {
        let _labels = {};

        const queryArray = Array.from(graph.graph_options.query_array);
        const results = queryArray.map(async (queryItem) => {
          const result = await prisma.$queryRaw`${Prisma.raw(queryItem.query)}`;

          const _y = [];
          console.log({ queryItem });
          result.forEach((_r) => {
            _labels[_r[queryItem.x_axis]] = true;
            _y.push(
              typeof _r[queryItem.y_axis] === "bigint"
                ? Number(_r[queryItem.y_axis])
                : _r[queryItem.y_axis]
            );
          });

          dataset.datasets.push({
            label: queryItem.dataset_title,
            borderColor: queryItem.color,
            backgroundColor: `${queryItem.color}80`,
            data: _y,
          });
        });
        await Promise.all(results);
        dataset.labels = Object.keys(_labels).map((key) => key);
      }
      Logger.log("success", {
        message: "GraphService:getGraphData:dataset",
        params: {
          graph,
          dataset,
        },
      });
      graph.dataset = dataset;

      return graph;
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
            ? null
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
}

module.exports = { GraphService };
