const constants = require("../../constants");
const { PostgreSQL } = require("./postgresql/models");

/**
 *
 * @param {object} param0
 * @param {String} param0.pmQueryType
 * @param {object} param0.pmQuery
 */
const getQueryObject = ({ pmQueryType, pmQuery }) => {
  switch (pmQueryType) {
    case constants.QUERY_TYPE.POSTGRE_QUERY.value: {
      return new PostgreSQL(pmQuery);
    }
    default: {
      return new PostgreSQL(pmQuery);
    }
  }
};
module.exports = { getQueryObject };
