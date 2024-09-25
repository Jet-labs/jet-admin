const constants = require("../constants");

const generateFilterQuery = (filterModel) => {
  if (!filterModel) return null;
  if (typeof filterModel !== "object" || filterModel === null) {
    console.warn("Invalid filterModel format.");
    return null;
  }

  const operator = Object.keys(filterModel)[0];
  const value = filterModel[operator];

  switch (operator) {
    case "AND":
      return "(" + value.map(generateFilterQuery).join(" AND ") + ")";
    case "OR":
      return "(" + value.map(generateFilterQuery).join(" OR ") + ")";
    case "NOT":
      return "NOT (" + generateFilterQuery(value) + ")";
    default:
      // Here, assume the operator is a field name with some filterModel
      const field = operator;
      const filterModelKey = Object.keys(value)[0];
      const filterModelValue = value[filterModelKey];
      const query = constants.TABLE_FILTERS[
        String(filterModelKey).toUpperCase()
      ](field, filterModelValue);
      return query;
  }
};

module.exports = { generateFilterQuery };
