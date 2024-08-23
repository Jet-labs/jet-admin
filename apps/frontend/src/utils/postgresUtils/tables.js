import { LOCAL_CONSTANTS } from "../../constants";
import { Buffer } from "buffer";
export const combinePrimaryKeyToWhereClause = (tablePrimaryKey, keyValues) => {
  // Initialize an array to hold the conditions
  const conditions = tablePrimaryKey.map((key) => {
    // Check if the key exists in the keyValues object
    if (key in keyValues) {
      // Construct the condition string for this key
      return `${key} = ${
        typeof keyValues[key] === "string"
          ? `'${keyValues[key]}'`
          : keyValues[key]
      }`;
    } else {
      throw new Error(`Key ${key} not found in keyValues object.`);
    }
  });

  // Join the conditions with 'AND' to form the final WHERE clause
  return `${conditions.join(" AND ")}`;
};

export const generateOrderByQuery = (sortModel) => {
  return `${sortModel.field} ${sortModel.order}`;
};

export const generateFilterQuery = (filterModel) => {
  if (typeof filterModel !== "object" || filterModel === null) {
    throw new Error("Invalid filterModel format.");
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
      const query = LOCAL_CONSTANTS.TABLE_FILTERS[
        String(filterModelKey).toUpperCase()
      ](field, filterModelValue);
      return Buffer.from(query).toString("base64");
  }
};
