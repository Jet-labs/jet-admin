const { PostgreSQL } = require("./postgresql/models");

const QUERY_PLUGINS_MAP = {
  REST_API: {
    name: "Rest API",
    value: "REST_API",
    getQueryModel: ({ pmQuery }) => new PostgreSQL(pmQuery),
  },
  POSTGRE_QUERY: {
    name: "Postgre query",
    value: "POSTGRE_QUERY",
    getQueryModel: ({ pmQuery }) => new PostgreSQL(pmQuery),
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
module.exports = { QUERY_PLUGINS_MAP, getQueryObject };
