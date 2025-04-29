import moment from "moment";
import { CONSTANTS } from "../constants";

export class PostgreSQLUtils {
  constructor() {}

  static generatePostgresCreateTableSQL = (formData) => {
    const {
      table_name,
      if_not_exists,
      temporary,
      unlogged,
      global,
      local,
      of_type,
      databaseTableColumns,
      databaseTableConstraints,
      partition_by,
      partitions,
      inherits,
      storage_options,
      on_commit,
    } = formData;

    // Initialize the table creation statement
    let sql = "CREATE";

    // Add modifiers for temporary/unlogged tables
    if (temporary) sql += " TEMPORARY";
    if (unlogged) sql += " UNLOGGED";
    if (global) sql += " GLOBAL";
    if (local) sql += " LOCAL";

    // Add table keyword
    sql += " TABLE";

    // Add "IF NOT EXISTS" if the option is checked
    if (if_not_exists) sql += " IF NOT EXISTS";

    // Add table name
    sql += ` ${table_name}`;

    // Add "OF type_name" if provided
    if (of_type) sql += ` OF ${of_type}`;

    // Start column definitions
    let columnDefinitions = databaseTableColumns
      .map((column) => {
        let colSQL = `"${column.column_name}" ${column.data_type}`;

        // Add databaseTableConstraints for the column
        if (column.not_null) colSQL += " NOT NULL";
        if (column.unique) colSQL += " UNIQUE";
        if (column.primary_key) colSQL += " PRIMARY KEY";
        if (column.default) colSQL += ` DEFAULT ${column.default}`;
        if (column.collation) colSQL += ` COLLATE ${column.collation}`;
        if (column.check) colSQL += ` CHECK(${column.check})`;

        // Add storage option
        if (column.storage && column.storage !== "DEFAULT")
          colSQL += ` STORAGE ${column.storage}`;

        return colSQL;
      })
      .join(", ");

    sql += ` (${columnDefinitions}`;

    // Add table databaseTableConstraints
    if (databaseTableConstraints.primary_key.length) {
      sql += `, PRIMARY KEY (${databaseTableConstraints.primary_key.join(
        ", "
      )})`;
    }
    if (databaseTableConstraints.unique.length) {
      databaseTableConstraints.unique.forEach((uniqueColumns) => {
        sql += `, UNIQUE (${uniqueColumns.join(", ")})`;
      });
    }
    if (databaseTableConstraints.check) {
      sql += `, CHECK (${databaseTableConstraints.check})`;
    }
    if (databaseTableConstraints.foreign_keys.length) {
      databaseTableConstraints.foreign_keys.forEach((fk) => {
        sql += `, FOREIGN KEY (${fk.databaseTableColumns.join(
          ", "
        )}) REFERENCES ${fk.ref_table}(${fk.ref_columns.join(", ")})`;

        // Add ON DELETE and ON UPDATE actions if provided
        if (fk.on_delete) sql += ` ON DELETE ${fk.on_delete}`;
        if (fk.on_update) sql += ` ON UPDATE ${fk.on_update}`;
      });
    }

    sql += `)`;

    // Add partitioning if provided
    if (partition_by) {
      sql += ` PARTITION BY ${partition_by}`;
      if (partitions.length) {
        sql += " (";
        sql += partitions
          .map(
            (partition) =>
              `${partition.column} ${
                partition.expression ? `USING (${partition.expression})` : ""
              }${partition.opclass ? ` ${partition.opclass}` : ""}${
                partition.collation ? ` COLLATE ${partition.collation}` : ""
              }`
          )
          .join(", ");
        sql += ")";
      }
    }

    // Add inheritance if provided
    if (inherits.length) {
      sql += ` INHERITS (${inherits.join(", ")})`;
    }

    // Add storage options
    if (storage_options.tablespace) {
      sql += ` TABLESPACE ${storage_options.tablespace}`;
    }
    if (storage_options.storage_parameters.length) {
      sql += ` WITH (${storage_options.storage_parameters.join(", ")})`;
    }

    // Add WITHOUT OIDS if selected
    if (storage_options.without_oids) {
      sql += " WITHOUT OIDS";
    }

    // Add ON COMMIT options for temporary tables
    if (on_commit) {
      sql += ` ON COMMIT ${on_commit}`;
    }

    // End the SQL statement with a semicolon
    sql += ";";

    return sql;
  };

  static combinePrimaryKeyToWhereClause = (tablePrimaryKey, keyValues) => {
    // Initialize an array to hold the conditions
    if (Array.isArray(tablePrimaryKey)) {
      const conditions = tablePrimaryKey.map((key) => {
        // Check if the key exists in the keyValues object
        if (key in keyValues) {
          // Construct the condition string for this key
          return `"${key}" = ${
            typeof keyValues[key] === "string"
              ? `'${keyValues[key]}'`
              : keyValues[key]
          }`;
        } else {
          console.warn(`Key ${key} not found in keyValues object.`);
        }
      });

      // Join the conditions with 'AND' to form the final WHERE clause
      return `${conditions.join(" AND ")}`;
    } else {
      if (tablePrimaryKey in keyValues) {
        // Construct the condition string for this key
        return `"${tablePrimaryKey}" = ${
          typeof keyValues[tablePrimaryKey] === "string"
            ? `'${keyValues[tablePrimaryKey]}'`
            : keyValues[tablePrimaryKey]
        }`;
      } else {
        console.warn(`Key ${tablePrimaryKey} not found in keyValues object.`);
      }
    }
    
  };

  static generateFilterQuery = (filterModel) => {
    if (!filterModel) return null;
    if (typeof filterModel !== "object" || filterModel === null) {
      console.warn("Invalid filterModel format.");
      return null;
    }

    const operator = Object.keys(filterModel)[0];
    const value = filterModel[operator];

    switch (operator) {
      case "AND":
        return "(" + value.map(PostgreSQLUtils.generateFilterQuery).join(" AND ") + ")";
      case "OR":
        return (
          "(" +
          value.map(PostgreSQLUtils.generateFilterQuery).join(" OR ") +
          ")"
        );
      case "NOT":
        return "NOT (" + PostgreSQLUtils.generateFilterQuery(value) + ")";
      default:
        // Here, assume the operator is a field name with some filterModel
        {
          const field = operator;
          const filterModelKey = Object.keys(value)[0];
          const filterModelValue = value[filterModelKey];
          const query = CONSTANTS.TABLE_FILTERS[
            String(filterModelKey).toUpperCase()
          ](field, filterModelValue);
          return query;
        }
    }
  };

  static generateOrderByQuery = (databaseTableColumnSortModel) => {
    return `"${databaseTableColumnSortModel.field}" ${databaseTableColumnSortModel.order}`;
  };

  static processFilterValueAccordingToFieldType = ({ type, value }) => {
    let convertedValue = "";
    switch (type) {
      case CONSTANTS.JS_DATA_TYPES.STRING:
        convertedValue = `${value}`;
        break;
      case CONSTANTS.JS_DATA_TYPES.BOOLEAN:
        if (value === "true" || value === "false") {
          convertedValue = value === "true";
        } else {
          convertedValue = null;
        }
        break;
      case CONSTANTS.JS_DATA_TYPES.DATE:
        convertedValue = value ? moment(value).toDate() : null;
        break;
      case CONSTANTS.JS_DATA_TYPES.NUMBER: {
        if (value && !isNaN(value) && value.toString().indexOf(".") != -1) {
          convertedValue = parseFloat(value);
        } else if (value && !isNaN(value)) {
          convertedValue = parseInt(value);
        } else {
          convertedValue = null;
        }
        break;
      }
      case CONSTANTS.JS_DATA_TYPES.OBJECT: {
        convertedValue = value ? JSON.parse(JSON.stringify(value)) : null;
        break;
      }

      default:
        convertedValue = `'${value}'`;
    }

    return convertedValue;
  };

  static processFilteredValueToTextType = ({ udtType, value }) => {
    const convertedType =
      CONSTANTS.POSTGRE_SQL_DATA_TYPES[udtType]?.normalizedType ||
      CONSTANTS.DATA_TYPES.JSON;
    let convertedValue = "";
    switch (convertedType) {
      case CONSTANTS.DATA_TYPES.STRING:
        convertedValue = value;
        break;
      case CONSTANTS.DATA_TYPES.BOOLEAN:
        convertedValue = value ? "true" : "false";
        break;
      case CONSTANTS.DATA_TYPES.DATETIME:
        convertedValue = value;
        break;
      case CONSTANTS.DATA_TYPES.INT:
        convertedValue = parseInt(value);
        break;
      case CONSTANTS.DATA_TYPES.FLOAT:
        convertedValue = parseFloat(value);
        break;
      default:
        convertedValue = `'${value}'`;
    }
    return convertedValue;
  };
}
