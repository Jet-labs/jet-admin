const Logger = require("../../utils/logger");
const { postgreSQLQueryUtil } = require("../../utils/postgresql.util");
const {
  TenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");

const databaseService = {};

/**
 * Retrieves database metadata.
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {object} param0.dbPool
 * @returns {Promise<object>}
 */
databaseService.getDatabaseMetadata = async ({ userID, dbPool }) => {
  Logger.log("info", {
    message: "databaseService:getDatabaseMetadata:params",
    params: { userID },
  });

  try {
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.getDatabaseMetadataQuery()
        );
      }
    );

    Logger.log("success", {
      message: "databaseService:getDatabaseMetadata:result",
      params: { userID },
    });

    return result.rows[0];
  } catch (error) {
    Logger.log("error", {
      message: "databaseService:getDatabaseMetadata:catch1",
      params: { userID, error: error.message },
    });
    throw error;
  }
};

/**
 * Retrieves database metadata.
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {object} param0.dbPool
 * @returns {Promise<object>}
 */
databaseService.getDatabaseMetadataForTenant = async ({ userID, dbPool }) => {
  Logger.log("info", {
    message: "databaseService:getDatabaseMetadataForTenant:params",
    params: { userID },
  });

  try {
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.getDatabaseMetadataForTenantQuery()
        );
      }
    );

    Logger.log("success", {
      message: "databaseService:getDatabaseMetadataForTenant:result",
      params: { userID },
    });

    return result.rows[0];
  } catch (error) {
    Logger.log("error", {
      message: "databaseService:getDatabaseMetadataForTenant:catch1",
      params: { userID, error: error.message },
    });
    throw error;
  }
};

databaseService.getDatabaseSchemaForAI = async ({
  userID,
  tenantID,
  dbPool,
}) => {
  Logger.log("info", {
    message: "databaseService:getDatabaseSchemaForAI:params",
    params: { userID, tenantID },
  });

  try {
    const { rows } = await dbPool.query(
      postgreSQLQueryUtil.getDatabaseMetadataForAIQuery()
    );

    Logger.log("info", {
      message: "databaseService:getDatabaseSchemaForAI:rows",
      params: { userID, tenantID, rowsLength: rows?.length },
    });

    // Group data by schema and then by object type (table/view)
    const schemas = {};

    for (const row of rows) {
      const schemaName = row.schema_name; // Changed from table_schema
      if (!schemaName) continue; // Should not happen based on query filters

      if (!schemas[schemaName]) {
        schemas[schemaName] = { tables: {}, views: {} };
      }

      const currentSchema = schemas[schemaName];

      if (row.item_type === "column") {
        const tableName = row.object_name;
        if (!currentSchema.tables[tableName]) {
          currentSchema.tables[tableName] = {
            columns: [],
            constraints: [],
            foreign_keys: [],
          };
        }
        currentSchema.tables[tableName].columns.push({
          name: row.column_name,
          type: row.data_type, // Corrected field
          is_nullable: row.is_nullable,
          default: row.column_default,
          is_pk: row.is_primary_key,
        });
      } else if (row.item_type === "constraint") {
        const tableName = row.object_name;
        if (!currentSchema.tables[tableName]) {
          currentSchema.tables[tableName] = {
            columns: [],
            constraints: [],
            foreign_keys: [],
          };
        }
        currentSchema.tables[tableName].constraints.push({
          name: row.constraint_name,
          type: row.constraint_type,
          unique_columns: row.constraint_columns, // Corrected field
          check_clause: row.check_clause,
        });
      } else if (row.item_type === "foreign_key") {
        const tableName = row.object_name;
        if (!currentSchema.tables[tableName]) {
          currentSchema.tables[tableName] = {
            columns: [],
            constraints: [],
            foreign_keys: [],
          };
        }
        currentSchema.tables[tableName].foreign_keys.push({
          name: row.constraint_name,
          columns: row.columns,
          foreign_schema: row.foreign_schema, // Corrected field
          foreign_table: row.foreign_table, // Corrected field
          foreign_columns: row.foreign_columns,
        });
      } else if (row.item_type === "view") {
        const viewName = row.object_name;
        if (!currentSchema.views[viewName]) {
          currentSchema.views[viewName] = {};
        }
        currentSchema.views[viewName] = {
          definition: row.view_definition,
        };
      }
    }

    Logger.log("info", {
      message: "databaseService:getDatabaseSchemaForAI:schemas",
      params: { userID, tenantID },
    });

    // Format the grouped data into a string for the AI
    let schemaDescription = "Database Schema:\n";
    for (const schemaName in schemas) {
      schemaDescription += `\nSCHEMA: ${schemaName}\n`;
      const currentSchema = schemas[schemaName];

      // Format Tables
      for (const tableName in currentSchema.tables) {
        schemaDescription += `  TABLE: ${tableName}\n`;
        const table = currentSchema.tables[tableName];

        // Sort columns by PK status then name (or use ordinal_position if kept)
        table.columns.sort((a, b) => {
          if (a.is_pk !== b.is_pk) return a.is_pk ? -1 : 1;
          return a.name.localeCompare(b.name);
        });

        for (const col of table.columns) {
          let colDesc = `    Column: ${col.name} (${col.type})`;
          if (col.is_pk) colDesc += " PRIMARY KEY";
          if (!col.is_nullable) colDesc += " NOT NULL";
          if (col.default) colDesc += ` DEFAULT ${col.default}`;
          schemaDescription += colDesc + "\n";
        }

        // Format Constraints (Unique/Check)
        if (table.constraints.length > 0) {
          schemaDescription += `    CONSTRAINTS:\n`;
          for (const con of table.constraints) {
            if (con.type === "UNIQUE") {
              schemaDescription += `      UNIQUE (${con.unique_columns.join(
                ", "
              )})${con.name ? ` Name: ${con.name}` : ""}\n`;
            } else if (con.type === "CHECK") {
              schemaDescription += `      CHECK (${con.check_clause})${
                con.name ? ` Name: ${con.name}` : ""
              }\n`;
            }
          }
        }

        // Format Foreign Keys
        if (table.foreign_keys.length > 0) {
          schemaDescription += `    FOREIGN KEYS:\n`;
          for (const fk of table.foreign_keys) {
            if (!fk.columns || !fk.foreign_columns) continue;
            schemaDescription += `      (${fk.columns.join(", ")}) REFERENCES ${
              fk.foreign_schema
            }.${fk.foreign_table}(${fk.foreign_columns.join(", ")})${
              fk.name ? ` Name: ${fk.name}` : ""
            }\n`;
          }
        }
        schemaDescription += "\n"; // Spacer after table info
      }

      // Format Views
      for (const viewName in currentSchema.views) {
        schemaDescription += `  VIEW: ${viewName}\n`;
        // Indent definition for clarity
        const definition = currentSchema.views[viewName].definition.replace(
          /^/gm,
          "    "
        );
        schemaDescription += `    Definition:\n${definition}\n\n`;
      }
    }
    Logger.log("success", {
      message: "databaseService:getDatabaseSchemaForAI:result",
      params: { userID, tenantID },
    });

    return schemaDescription.trim();
  } catch (error) {
    // Log the detailed error from the database driver or processing
    console.error("Detailed error inside getDatabaseSchemaForAI:", error);
    // Optionally log to your Logger as well
    Logger.log("error", {
      userID,
      tenantID,
      message: "getDatabaseSchemaForAI internal failure",
      specificError: error.message,
      errorCode: error.code, // PG error code can be helpful
      stack: error.stack,
    });
    // Throw the generic error for the outer function to catch
    throw new Error("Failed to retrieve database schema information.");
  }
};
/**
 * Creates a new database schema.
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {object} param0.dbPool
 * @param {String} param0.databaseSchemaName
 * @returns {Promise<object>}
 */
databaseService.createDatabaseSchema = async ({
  userID,
  dbPool,
  databaseSchemaName,
}) => {
  Logger.log("info", {
    message: "databaseService:createDatabaseSchema:params",
    params: { userID, databaseSchemaName },
  });

  try {
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.createDatabaseSchemaQuery({ databaseSchemaName })
        );
      }
    );

    Logger.log("success", {
      message: "databaseService:createDatabaseSchema:result",
      params: { userID, databaseSchemaName, result },
    });

    return result.rows[0];
  } catch (error) {
    Logger.log("error", {
      message: "databaseService:createDatabaseSchema:catch1",
      params: { userID, databaseSchemaName, error: error.message },
    });
    throw error;
  }
};


module.exports = { databaseService };
