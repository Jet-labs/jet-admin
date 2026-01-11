const Logger = require("../../utils/logger");
const {
  TenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");

const databaseViewService = {};

/**
 * Retrieves all views in a database schema.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @returns {Promise<Array>} - Array of views.
 */
databaseViewService.getAllDatabaseViews = async ({
  userID,
  dbPool,
  databaseSchemaName,
}) => {
  Logger.log("info", {
    message: "databaseViewService:getAllDatabaseViews:params",
    params: { userID, databaseSchemaName },
  });
  try {
    const query = {
      text: `
        SELECT 
          v.table_name AS view_name,
          v.view_definition,
          v.is_updatable,
          v.is_insertable_into,
          obj_description((v.table_schema || '.' || v.table_name)::regclass, 'pg_class') AS description
        FROM information_schema.views v
        WHERE v.table_schema = $1
        ORDER BY v.table_name
      `,
      values: [databaseSchemaName],
    };

    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(query.text, query.values);
      }
    );
    const databaseViews = result.rows;
    Logger.log("success", {
      message: "databaseViewService:getAllDatabaseViews:success",
      params: {
        userID,
        databaseSchemaName,
        databaseViewsLength: databaseViews.length,
      },
    });
    return databaseViews;
  } catch (error) {
    Logger.log("error", {
      message: "databaseViewService:getAllDatabaseViews:catch-1",
      params: { userID, databaseSchemaName, error },
    });
    throw error;
  }
};

/**
 * Retrieves a specific view by name including its columns.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.databaseViewName
 * @returns {Promise<object>} - The view details with columns.
 */
databaseViewService.getDatabaseViewByName = async ({
  userID,
  dbPool,
  databaseSchemaName,
  databaseViewName,
}) => {
  Logger.log("info", {
    message: "databaseViewService:getDatabaseViewByName:params",
    params: { userID, databaseSchemaName, databaseViewName },
  });
  try {
    // Get view definition
    const viewQuery = {
      text: `
        SELECT 
          v.table_name AS view_name,
          v.view_definition,
          v.is_updatable,
          v.is_insertable_into,
          obj_description((v.table_schema || '.' || v.table_name)::regclass, 'pg_class') AS description
        FROM information_schema.views v
        WHERE v.table_schema = $1 AND v.table_name = $2
      `,
      values: [databaseSchemaName, databaseViewName],
    };

    // Get columns for the view
    const columnsQuery = {
      text: `
        SELECT 
          column_name,
          data_type,
          udt_name,
          is_nullable,
          column_default,
          ordinal_position
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position
      `,
      values: [databaseSchemaName, databaseViewName],
    };

    const [viewResult, columnsResult] = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        const view = await client.query(viewQuery.text, viewQuery.values);
        const columns = await client.query(columnsQuery.text, columnsQuery.values);
        return [view, columns];
      }
    );

    const databaseView = viewResult.rows[0];
    if (!databaseView) {
      throw new Error(`View not found: ${databaseViewName}`);
    }

    databaseView.columns = columnsResult.rows;

    Logger.log("success", {
      message: "databaseViewService:getDatabaseViewByName:success",
      params: { userID, databaseSchemaName, databaseViewName },
    });
    return databaseView;
  } catch (error) {
    Logger.log("error", {
      message: "databaseViewService:getDatabaseViewByName:catch-1",
      params: {
        userID,
        databaseSchemaName,
        databaseViewName,
        error,
      },
    });
    throw error;
  }
};

/**
 * Queries data from a view with optional limit.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.databaseViewName
 * @param {number} param0.limit
 * @param {number} param0.offset
 * @returns {Promise<object>} - Query results with rows and metadata.
 */
databaseViewService.queryDatabaseView = async ({
  userID,
  dbPool,
  databaseSchemaName,
  databaseViewName,
  limit = 100,
  offset = 0,
}) => {
  Logger.log("info", {
    message: "databaseViewService:queryDatabaseView:params",
    params: { userID, databaseSchemaName, databaseViewName, limit, offset },
  });
  try {
    // Sanitize identifiers to prevent SQL injection
    const schemaRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!schemaRegex.test(databaseSchemaName) || !schemaRegex.test(databaseViewName)) {
      throw new Error("Invalid schema or view name");
    }

    const query = {
      text: `SELECT * FROM "${databaseSchemaName}"."${databaseViewName}" LIMIT $1 OFFSET $2`,
      values: [limit, offset],
    };

    const countQuery = {
      text: `SELECT COUNT(*) as total FROM "${databaseSchemaName}"."${databaseViewName}"`,
      values: [],
    };

    const [dataResult, countResult] = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        const data = await client.query(query.text, query.values);
        const count = await client.query(countQuery.text);
        return [data, count];
      }
    );

    Logger.log("success", {
      message: "databaseViewService:queryDatabaseView:success",
      params: {
        userID,
        databaseSchemaName,
        databaseViewName,
        rowCount: dataResult.rowCount,
      },
    });

    return {
      rows: dataResult.rows,
      fields: dataResult.fields,
      rowCount: dataResult.rowCount,
      totalCount: parseInt(countResult.rows[0].total, 10),
    };
  } catch (error) {
    Logger.log("error", {
      message: "databaseViewService:queryDatabaseView:catch-1",
      params: {
        userID,
        databaseSchemaName,
        databaseViewName,
        error,
      },
    });
    throw error;
  }
};

/**
 * Creates a new database view.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.viewName
 * @param {string} param0.selectQuery - The SELECT statement for the view
 * @param {boolean} param0.orReplace - Whether to use CREATE OR REPLACE
 * @param {boolean} param0.materialized - Whether to create a materialized view
 * @param {Array} param0.columns - Optional column names
 * @param {string} param0.checkOption - CHECK OPTION: 'LOCAL', 'CASCADED', or null
 * @returns {Promise<object>} - Result of creation.
 */
databaseViewService.createDatabaseView = async ({
  userID,
  dbPool,
  databaseSchemaName,
  viewName,
  selectQuery,
  orReplace = false,
  materialized = false,
  columns = [],
  checkOption = null,
}) => {
  Logger.log("info", {
    message: "databaseViewService:createDatabaseView:params",
    params: { userID, databaseSchemaName, viewName, orReplace, materialized },
  });
  try {
    // Validate identifiers
    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!identifierRegex.test(databaseSchemaName) || !identifierRegex.test(viewName)) {
      throw new Error("Invalid schema or view name");
    }

    // Build the CREATE VIEW statement
    let sql = "";
    if (materialized) {
      sql = `CREATE MATERIALIZED VIEW "${databaseSchemaName}"."${viewName}"`;
    } else {
      sql = orReplace 
        ? `CREATE OR REPLACE VIEW "${databaseSchemaName}"."${viewName}"`
        : `CREATE VIEW "${databaseSchemaName}"."${viewName}"`;
    }

    // Add column names if provided
    if (columns && columns.length > 0) {
      const validColumns = columns.every(c => identifierRegex.test(c));
      if (!validColumns) {
        throw new Error("Invalid column name");
      }
      sql += ` (${columns.map(c => `"${c}"`).join(", ")})`;
    }

    sql += ` AS ${selectQuery}`;

    // Add check option for non-materialized views
    if (!materialized && checkOption) {
      sql += ` WITH ${checkOption} CHECK OPTION`;
    }

    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(sql);
      }
    );

    Logger.log("success", {
      message: "databaseViewService:createDatabaseView:success",
      params: { userID, databaseSchemaName, viewName },
    });

    return { success: true, viewName };
  } catch (error) {
    Logger.log("error", {
      message: "databaseViewService:createDatabaseView:catch-1",
      params: { userID, databaseSchemaName, viewName, error },
    });
    throw error;
  }
};

/**
 * Updates a database view (drops and recreates).
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.viewName
 * @param {string} param0.selectQuery
 * @param {Array} param0.columns
 * @param {string} param0.checkOption
 * @returns {Promise<object>} - Result of update.
 */
databaseViewService.updateDatabaseView = async ({
  userID,
  dbPool,
  databaseSchemaName,
  viewName,
  selectQuery,
  columns = [],
  checkOption = null,
}) => {
  Logger.log("info", {
    message: "databaseViewService:updateDatabaseView:params",
    params: { userID, databaseSchemaName, viewName },
  });
  try {
    // Use CREATE OR REPLACE VIEW
    return await databaseViewService.createDatabaseView({
      userID,
      dbPool,
      databaseSchemaName,
      viewName,
      selectQuery,
      orReplace: true,
      materialized: false,
      columns,
      checkOption,
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseViewService:updateDatabaseView:catch-1",
      params: { userID, databaseSchemaName, viewName, error },
    });
    throw error;
  }
};

/**
 * Deletes a database view.
 * @param {object} param0
 * @param {string} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.viewName
 * @param {boolean} param0.cascade - Whether to use CASCADE
 * @param {boolean} param0.materialized - Whether it's a materialized view
 * @returns {Promise<object>} - Result of deletion.
 */
databaseViewService.deleteDatabaseView = async ({
  userID,
  dbPool,
  databaseSchemaName,
  viewName,
  cascade = false,
  materialized = false,
}) => {
  Logger.log("info", {
    message: "databaseViewService:deleteDatabaseView:params",
    params: { userID, databaseSchemaName, viewName, cascade, materialized },
  });
  try {
    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!identifierRegex.test(databaseSchemaName) || !identifierRegex.test(viewName)) {
      throw new Error("Invalid schema or view name");
    }

    const viewType = materialized ? "MATERIALIZED VIEW" : "VIEW";
    const cascadeClause = cascade ? " CASCADE" : "";
    const sql = `DROP ${viewType} IF EXISTS "${databaseSchemaName}"."${viewName}"${cascadeClause}`;

    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(sql);
      }
    );

    Logger.log("success", {
      message: "databaseViewService:deleteDatabaseView:success",
      params: { userID, databaseSchemaName, viewName },
    });

    return { success: true, viewName };
  } catch (error) {
    Logger.log("error", {
      message: "databaseViewService:deleteDatabaseView:catch-1",
      params: { userID, databaseSchemaName, viewName, error },
    });
    throw error;
  }
};

module.exports = { databaseViewService };
