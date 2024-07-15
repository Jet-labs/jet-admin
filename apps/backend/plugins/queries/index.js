const { PostgreSQL } = require("./postgresql/models");
const { getProcessedPostgreSQLQuery } = require("./postgresql/parsers");

const QUERY_PLUGINS_MAP = {
  REST_API: {
    name: "Rest API",
    value: "REST_API",
    getQueryModel: ({ pmQuery }) => new PostgreSQL(pmQuery),
    getEvaluatedQuery: async ({ pmQuery }) => {
      const r = await getProcessedPostgreSQLQuery({
        rawQuery: pmQuery.raw_query,
      });
      return { ...pmQuery, ...r };
    },
  },
  POSTGRE_QUERY: {
    name: "Postgre query",
    value: "POSTGRE_QUERY",
    getQueryModel: ({ pmQuery }) => new PostgreSQL(pmQuery),
    getEvaluatedQuery: async ({ pmQuery }) => {
      return await getProcessedPostgreSQLQuery({
        rawQuery: pmQuery.raw_query,
      });
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
  return QUERY_PLUGINS_MAP[pmQueryType].getQueryModel({ pmQuery });
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
module.exports = { QUERY_PLUGINS_MAP, getQueryObject, getEvaluatedQuery };
