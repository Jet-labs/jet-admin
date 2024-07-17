const Logger = require("../../utils/logger");

const {
  getProcessedPostgreSQLQuery,
  runPostgreSQLEvaluatedQuery,
} = require("./postgresql");

const QUERY_PLUGINS_MAP = {
  POSTGRE_QUERY: {
    name: "Postgre query",
    value: "POSTGRE_QUERY",
    getEvaluatedQuery: async ({ pmQuery }) => {
      const r = await getProcessedPostgreSQLQuery({
        rawQuery: pmQuery.raw_query,
      });
      return { ...pmQuery, ...r };
      // {processedQuery:"some query"}
    },
    run: async ({ options }) => {
      return await runPostgreSQLEvaluatedQuery({ options });
    },
  },
  REST_API: {
    name: "Rest API",
    value: "REST_API",
    getEvaluatedQuery: async ({ pmQuery }) => {
      const r = await getProcessedPostgreSQLQuery({
        rawQuery: pmQuery.raw_query,
      });
      return { ...pmQuery, ...r };
      // {processedQuery:"some query"}
    },
    run: async ({ options }) => {
      return await runPostgreSQLEvaluatedQuery({ options });
    },
  },
};

/**
 *
 * @param {object} param0
 * @param {String} param0.pmQueryType
 * @param {object} param0.pmQuery
 */
const getQueryObject = ({ pmQueryType, pmQuery }) => {
  return null;
};
/**
 *
 * @param {object} param0
 * @param {String} param0.pmQueryType
 * @param {object} param0.pmQuery
 */
const getEvaluatedQuery = ({ pmQueryType, pmQuery }) => {
  return QUERY_PLUGINS_MAP[pmQueryType].getEvaluatedQuery({ pmQuery });
};

/**
 *
 * @param {object} param0
 * @param {Number} param0.pmQueryID
 * @param {JSON} param0.pmQuery
 * @param {String} param0.pmQueryType
 * @returns {any|null}
 */
const runQuery = async ({ pmQueryID, pmQuery, pmQueryType }) => {
  try {
    // {processedQuery:"some query"}
    const evaluatedQuery = await QUERY_PLUGINS_MAP[
      pmQueryType
    ].getEvaluatedQuery({
      pmQueryType,
      pmQuery,
    });
    Logger.log("info", {
      message: "runQuery:evaluatedQuery",
      params: {
        evaluatedQuery,
      },
    });
    return await QUERY_PLUGINS_MAP[pmQueryType].run({
      options: { ...evaluatedQuery, pmQueryType, pmQueryID },
    });
  } catch (error) {
    Logger.log("error", {
      message: "runQuery:catch-1",
      params: { error },
    });
    return { pmQueryID, result: null };
  }
};

module.exports = {
  QUERY_PLUGINS_MAP,
  getQueryObject,
  getEvaluatedQuery,
  runQuery,
};
