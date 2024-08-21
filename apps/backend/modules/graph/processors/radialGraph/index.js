const { prisma } = require("../../../../db/prisma");
const Logger = require("../../../../utils/logger");
const { runQuery } = require("../../../query/processors/postgresql");
const { BaseGraph } = require("../baseGraph");

class RadialGraph extends BaseGraph {
  constructor({ pm_graph_id, graph_title, graph_options }) {
    super({ pm_graph_id, graph_title, graph_options });
  }
  /**
   *
   * @param {object} param0
   * @param {Array<Array<any>>} param0.results
   */
  transformData = ({ results }) => {
    try {
      Logger.log("info", {
        message: "RadialGraph:transformData:init",
      });
      let dataset = { labels: null, datasets: [] };
      let _labels = {};

      results.map(async (result) => {
        const _y = [];
        result.result.result.forEach((_r) => {
          _labels[_r[result.value]] = true;
          _y.push(
            typeof _r[result.label] === "bigint"
              ? Number(_r[result.label])
              : _r[result.label]
          );
        });
        dataset.datasets.push({
          label: result.dataset_title,
          borderColor: result.color,
          backgroundColor: `${result.color}80`,
          data: _y,
        });
      });
      dataset.labels = Object.keys(_labels).map((key) => key);
      return dataset;
    } catch (error) {
      Logger.log("info", {
        message: "RadialGraph:transformData:catch-1",
        params: {
          error,
        },
      });
    }
  };
  runQueries = async () => {
    try {
      {
        Logger.log("info", {
          message: "RadialGraph:runQueries:init",
        });
        const queryArray = Array.from(this.graph_options.query_array);

        const resultPromises = queryArray.map(async (queryItem) => {
          const query = await prisma.tbl_pm_queries.findUnique({
            where: {
              pm_query_id: parseInt(queryItem.pm_query_id),
            },
          });
          const result = await runQuery({
            pmQueryID: query.pm_query_id,
            pmQueryType: query.pm_query_type,
            pmQuery: query.pm_query,
          });

          return { ...queryItem, result };
        });
        const results = await Promise.all(resultPromises);
        Logger.log("info", {
          message: "RadialGraph:runQueries:results",
          params: {
            resultsLength: results?.length,
          },
        });
        return results;
      }
    } catch (error) {
      Logger.log("info", {
        message: "RadialGraph:runQueries:catch-1",
        params: {
          error,
        },
      });
    }
  };
  getProcessedData = async () => {
    try {
      {
        const results = await this.runQueries();
        return this.transformData({ results });
      }
    } catch (error) {}
  };
}
module.exports = { RadialGraph };
