const Logger = require("../../../../utils/logger");
const { runQuery } = require("../../../query/processors/postgresql");
const { QueryService } = require("../../../query/query.services");
const { BaseGraph } = require("../baseGraph");

class PolarGraph extends BaseGraph {
  constructor({ pm_graph_id, pm_graph_title, pm_graph_options }) {
    super({ pm_graph_id, pm_graph_title, pm_graph_options });
  }
  /**
   *
   * @param {object} param0
   * @param {Array<Array<any>>} param0.results
   */
  transformData = ({ results }) => {
    try {
      Logger.log("info", {
        message: "PolarGraph:transformData:init",
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
        message: "PolarGraph:transformData:catch-1",
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
          message: "PolarGraph:runQueries:init",
        });
        const queryArray = Array.from(this.pm_graph_options.query_array);

        const resultPromises = queryArray.map(async (queryItem) => {
          const query = await QueryService.getQueryByID({
            pmQueryID: queryItem.pm_query_id,
            authorizedQueries: true,
          });
          const result = await runQuery({
            pmQueryID: query.pm_query_id,
            pmQueryType: query.pm_query_type,
            pmQuery: JSON.parse(query.pm_query),
          });

          return { ...queryItem, result };
        });
        const results = await Promise.all(resultPromises);
        Logger.log("info", {
          message: "PolarGraph:runQueries:results",
          params: {
            resultsLength: results?.length,
          },
        });
        return results;
      }
    } catch (error) {
      Logger.log("info", {
        message: "PolarGraph:runQueries:catch-1",
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
module.exports = { PolarGraph };
