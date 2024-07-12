const constants = require("../constants");
const { PostgreSQL } = require("./postgresql");

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
