const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { GRAPH_PLUGINS_MAP } = require("./processors");
const { graphQueryUtils } = require("../../utils/postgres-utils/graph-queries");
const { sqliteDB } = require("../../db/sqlite");

class GraphService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.pmGraphTitle
   * @param {any} param0.pmGraphOptions
   * @returns {any|null}
   */
  static addGraph = async ({ pmGraphTitle, pmGraphOptions }) => {
    Logger.log("info", {
      message: "GraphService:addGraph:params",
      params: {
        pmGraphTitle,
        pmGraphOptions,
      },
    });
    try {
      const addGraphQuery = sqliteDB.prepare(graphQueryUtils.addGraph());
      addGraphQuery.run(String(pmGraphTitle), JSON.stringify(pmGraphOptions));
      Logger.log("success", {
        message: "GraphService:addGraph:success",
        params: {
          pmGraphTitle,
        },
      });
      return true;
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
   * @param {Number} param0.pmGraphID
   * @param {String} param0.pmGraphTitle
   * @param {any} param0.pmGraphOptions
   * @param {Boolean|Array<Number>} param0.authorizedGraphs
   * @returns {any|null}
   */
  static updateGraph = async ({
    pmGraphID,
    pmGraphTitle,
    pmGraphOptions,
    authorizedGraphs,
  }) => {
    Logger.log("info", {
      message: "GraphService:updateGraph:params",
      params: { pmGraphID, pmGraphTitle, pmGraphOptions },
    });
    try {
      if (authorizedGraphs === true || authorizedGraphs.includes(pmGraphID)) {
        const updateGraphQuery = sqliteDB.prepare(
          graphQueryUtils.updateGraph()
        );
        updateGraphQuery.run(
          String(pmGraphTitle),
          JSON.stringify(pmGraphOptions),
          pmGraphID
        );
        Logger.log("success", {
          message: "GraphService:updateGraph:success",
        });
        return true;
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
   * @param {Number} param0.pmGraphID
   * @param {Boolean|Array<Number>} param0.authorizedGraphs
   * @returns {any|null}
   */
  static getGraphByID = async ({ pmGraphID, authorizedGraphs }) => {
    Logger.log("info", {
      message: "GraphService:getGraphByID:params",
      params: {
        pmGraphID,
      },
    });
    try {
      if (authorizedGraphs === true || authorizedGraphs.includes(pmGraphID)) {
        const getGraphByIDQuery = sqliteDB.prepare(
          graphQueryUtils.getGraphByID()
        );
        const graph = getGraphByIDQuery.get(pmGraphID);
        Logger.log("info", {
          message: "GraphService:getGraphByID:graph",
          params: {
            graph,
          },
        });
        return graph;
      } else {
        Logger.log("error", {
          message: "GraphService:getGraphByID:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "GraphService:getGraphByID:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmGraphID
   * @param {Boolean|Array<Number>} param0.authorizedGraphs
   * @returns {any|null}
   */
  static getGraphData = async ({ pmGraphID, authorizedGraphs }) => {
    Logger.log("info", {
      message: "GraphService:getGraphData:params",
      params: {
        pmGraphID,
      },
    });
    try {
      if (authorizedGraphs === true || authorizedGraphs.includes(pmGraphID)) {
        const getGraphByIDQuery = sqliteDB.prepare(
          graphQueryUtils.getGraphByID()
        );
        const graph = getGraphByIDQuery.get(pmGraphID);
        Logger.log("info", {
          message: "GraphService:getGraphData:graph",
          params: {
            graph,
          },
        });
        const graphModel = GRAPH_PLUGINS_MAP[
          JSON.parse(graph.pm_graph_options).graph_type
        ].getGraphModel({
          pm_graph_id: graph.pm_graph_id,
          pm_graph_title: graph.pm_graph_title,
          pm_graph_options: JSON.parse(graph.pm_graph_options),
        });

        const dataset = await graphModel.getProcessedData();
        Logger.log("success", {
          message: "GraphService:getGraphData:graph",
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
      let graphs;
      if (authorizedGraphs === true) {
        // Fetch all graphs if authorizedGraphs is true
        const getAllGraphsQuery = sqliteDB.prepare(
          graphQueryUtils.getAllGraphs()
        );
        graphs = getAllGraphsQuery.all();
      } else {
        // Fetch graphs where pm_graph_id is in the authorizedGraphs array
        const getAllGraphsQuery = sqliteDB.prepare(
          graphQueryUtils.getAllGraphs(authorizedGraphs)
        );
        graphs = getAllGraphsQuery.all(...authorizedGraphs);
      }
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
   * @param {Number} param0.pmGraphID
   * @param {Boolean|Array<Number>} param0.authorizedGraphs
   * @returns {any|null}
   */
  static deleteGraph = async ({ pmGraphID, authorizedGraphs }) => {
    Logger.log("info", {
      message: "GraphService:deleteGraph:params",
      params: {
        pmGraphID,
      },
    });
    try {
      if (authorizedGraphs === true || authorizedGraphs.includes(pmGraphID)) {
        const deleteGraphQuery = sqliteDB.prepare(
          graphQueryUtils.deleteGraph()
        );
        // Execute the delete
        deleteGraphQuery.run(pmGraphID);
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
