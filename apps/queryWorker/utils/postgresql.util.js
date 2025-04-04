const constants = require("../constants");

const postgreSQLParserUtil = {};

postgreSQLParserUtil.processDatabaseQuery = ({
  databaseQueryString, // Use the destructured name
  databaseQueryArgValues,
}) => {
  // Validate input
  if (typeof databaseQueryString !== "string") {
    throw new TypeError("The 'databaseQueryString' parameter must be a string.");
  }
  if (databaseQueryArgValues && typeof databaseQueryArgValues !== "object") {
    throw new TypeError("The 'databaseQueryArgValues' parameter must be an object or undefined.");
  }

  const paramNames = [];
  const processedQuery = databaseQueryString.replace(/\$\{(\w+)\}/g, (_, name) => {
    // Ensure the placeholder name is valid
    if (!/^\w+$/.test(name)) {
      throw new Error(`Invalid placeholder name: \${${name}}`);
    }
    paramNames.push(name);
    return `$${paramNames.length}`; // Replace with positional parameter
  });

  // Extract values for placeholders
  const values = paramNames.map((name) => {
    if (!databaseQueryArgValues || !Object.prototype.hasOwnProperty.call(databaseQueryArgValues, name)) {
      throw new Error(`Missing value for placeholder: \${${name}}`);
    }
    return databaseQueryArgValues[name];
  });

  return { databaseQueryString: processedQuery, values };
};

module.exports = { postgreSQLParserUtil };
