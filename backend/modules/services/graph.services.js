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
        graph.graph_options.graph_type == constants.GRAPH_TYPES.BAR.value
      ) {
        let _labels = {};

        const queryArray = Array.from(graph.graph_options.query_array);
        const results = queryArray.map(async (queryItem) => {
          const result = await prisma.$queryRaw`${Prisma.raw(queryItem.query)}`;

          const _y = [];
          result.forEach((_r) => {
            _labels[_r[graph.graph_options.x_axis]] = true;
            _y.push(
              typeof _r[graph.graph_options.y_axis] === "bigint"
                ? Number(_r[graph.graph_options.y_axis])
                : _r[graph.graph_options.y_axis]
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
}

module.exports = { GraphService };
