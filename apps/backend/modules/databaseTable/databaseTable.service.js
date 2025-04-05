const Logger = require("../../utils/logger");
const { postgreSQLQueryUtil } = require("../../utils/postgresql.util");
const {
  TenantAwarePostgreSQLPoolManager,
} = require("../../config/tenant-aware-pgpool-manager.config");
const { DatabaseTableConstraint } = require("./models/databaseTableContraint");
const { DatabaseTableColumn } = require("./models/databaseTableColumn");
const { DatabaseTable } = require("./models/databaseTable");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const databaseTableService = {};

/**
 * Retrieves all database tables in a schema.
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {object} param0.dbPool
 * @param {String} param0.databaseSchemaName
 * @returns {Promise<Array>}
 */
databaseTableService.getAllDatabaseTables = async ({
  userID,
  dbPool,
  databaseSchemaName,
}) => {
  Logger.log("info", {
    message: "databaseTableService:getAllDatabaseTables:params",
    params: { userID, databaseSchemaName },
  });

  try {
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.getAllDatabaseTables({ databaseSchemaName })
        );
      }
    );

    const databaseTables = result.rows[0]?.metadata || [];

    Logger.log("success", {
      message: "databaseTableService:getAllDatabaseTables:databaseTables",
      params: { userID, databaseSchemaName },
    });

    return databaseTables;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableService:getAllDatabaseTables:catch-1",
      params: { userID, databaseSchemaName, error: error.message },
    });
    throw error;
  }
};

/**
 * Retrieves all database tables in a schema.
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {object} param0.dbPool
 * @param {String} param0.databaseSchemaName
 * @param {String} param0.databaseTableName
 * @returns {Promise<Array>}
 */
databaseTableService.getDatabaseTableColumns = async ({
  userID,
  dbPool,
  databaseSchemaName,
  databaseTableName,
}) => {
  Logger.log("info", {
    message: "databaseTableService:getDatabaseTableColumns:params",
    params: { userID, databaseSchemaName, databaseTableName },
  });

  try {
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.getDatabaseTableColumnsQuery({
            databaseSchemaName,
            databaseTableName,
          })
        );
      }
    );

    const databaseTableColumns = result.rows[0]?.columns || [];

    Logger.log("success", {
      message:
        "databaseTableService:getDatabaseTableColumns:databaseTableColumns",
      params: { userID, databaseSchemaName, r: result.rows },
    });

    return databaseTableColumns;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableService:getDatabaseTableColumns:catch-1",
      params: { userID, databaseSchemaName, error: error.message },
    });
    throw error;
  }
};

/**
 * Retrieves a specific database table by name.
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {object} param0.dbPool
 * @param {String} param0.databaseSchemaName
 * @param {String} param0.databaseTableName
 * @returns {Promise<object>}
 */
databaseTableService.getDatabaseTableByName = async ({
  userID,
  dbPool,
  databaseSchemaName,
  databaseTableName,
}) => {
  Logger.log("info", {
    message: "databaseTableService:getDatabaseTableByName:params",
    params: { userID, databaseSchemaName, databaseTableName },
  });

  try {
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.getDatabaseTableByName({
            databaseSchemaName,
            databaseTableName,
          })
        );
      }
    );

    const databaseTable = result.rows[0]?.metadata?.[0] || null;

    Logger.log("success", {
      message: "databaseTableService:getDatabaseTableByName:databaseTable",
      params: { userID, databaseSchemaName, databaseTableName },
    });

    return databaseTable;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableService:getDatabaseTableByName:catch-1",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 * Retrieves rows from a database table with filtering, ordering, and pagination.
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {object} param0.dbPool
 * @param {String} param0.databaseSchemaName
 * @param {String} param0.databaseTableName
 * @param {JSON} param0.filter
 * @param {JSON} param0.orderBy
 * @param {Number} param0.skip
 * @param {Number} param0.take
 * @returns {Promise<Array>}
 */
databaseTableService.getDatabaseTableRows = async ({
  userID,
  dbPool,
  databaseSchemaName,
  databaseTableName,
  filter,
  orderBy,
  skip,
  take,
}) => {
  Logger.log("info", {
    message: "databaseTableService:getDatabaseTableRows:params",
    params: {
      userID,
      databaseSchemaName,
      databaseTableName,
      filter,
      orderBy,
      skip,
      take,
    },
  });

  try {
    const generatedQuery = postgreSQLQueryUtil.getDatabaseTableRows({
      databaseSchemaName,
      databaseTableName,
      filter,
      orderBy,
      skip,
      limit: take,
    });
    Logger.log("warning", {
      message: "databaseTableService:getDatabaseTableRows:databaseTableRows",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        filter,
        orderBy,
        skip,
        take,
        generatedQuery,
      },
    });
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(generatedQuery);
      }
    );

    const databaseTableRows = result.rows;

    Logger.log("success", {
      message: "databaseTableService:getDatabaseTableRows:databaseTableRows",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        filter,
        orderBy,
        skip,
        take,
        databaseTableRowsLength: databaseTableRows.length,
      },
    });

    return databaseTableRows;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableService:getDatabaseTableRows:catch-1",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        filter,
        orderBy,
        skip,
        take,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 * Retrieves statistics for a database table.
 * @param {object} param0
 * @param {Number} param0.userID
 * @param {object} param0.dbPool
 * @param {String} param0.databaseSchemaName
 * @param {String} param0.databaseTableName
 * @param {JSON} param0.filter
 * @returns {Promise<object>}
 */
databaseTableService.getDatabaseTableStatistics = async ({
  userID,
  dbPool,
  databaseSchemaName,
  databaseTableName,
  filter,
}) => {
  Logger.log("info", {
    message: "databaseTableService:getDatabaseTableStatistics:params",
    params: {
      userID,
      databaseSchemaName,
      databaseTableName,
      filter,
    },
  });

  try {
    const result = await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.getDatabaseTableStatistics({
            databaseSchemaName,
            databaseTableName,
            filter,
          })
        );
      }
    );

    const databaseTableRowCount = result.rows[0]?.count || 0;

    Logger.log("success", {
      message:
        "databaseTableService:getDatabaseTableStatistics:databaseTableRowCount",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        filter,
        databaseTableRowCount,
      },
    });

    return { databaseTableRowCount };
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableService:getDatabaseTableStatistics:catch-1",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        filter,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 * Performs bulk row updates in a single transaction.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.databaseTableName
 * @param {Array} param0.databaseTableRowData
 * @returns {Promise<boolean>}
 */
databaseTableService.databaseTableBulkRowAddition = async ({
  userID,
  dbPool,
  databaseSchemaName,
  databaseTableName,
  databaseTableRowData,
}) => {
  Logger.log("info", {
    message: "databaseTableService:databaseTableBulkRowAddition:params",
    params: {
      userID,
      databaseSchemaName,
      databaseTableName,
    },
  });

  try {
    const databaseTable = await databaseTableService.getDatabaseTableByName({
      userID,
      dbPool,
      databaseSchemaName,
      databaseTableName,
    });
    const _databaseTableO = new DatabaseTable(databaseTable);
    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        // Start the transaction
        await client.query("BEGIN");

        // Generate the update queries
        const rowAdditionQuery =
          postgreSQLQueryUtil.databaseTableBulkRowAddition({
            databaseSchemaName,
            databaseTableName,
            databaseTableColumns: _databaseTableO.databaseTableColumns,
            databaseTableRowData,
          });

        Logger.log("warning", {
          message: "databaseTableService:databaseTableBulkRowAddition:warning",
          params: {
            userID,
            databaseSchemaName,
            databaseTableName,
            databaseTableRowData,
            rowAdditionQuery: String(rowAdditionQuery),
          },
        });

        await client.query(rowAdditionQuery);

        // Commit the transaction
        await client.query("COMMIT");
      }
    );
    Logger.log("success", {
      message: "databaseTableService:databaseTableBulkRowAddition:success",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        addedRowCount: databaseTableRowData.length,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableService:databaseTableBulkRowAddition:failure",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 * Performs bulk row updates in a single transaction.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.databaseTableName
 * @param {Array} param0.databaseTableRowData
 * @returns {Promise<boolean>}
 */
databaseTableService.databaseTableBulkRowUpdate = async ({
  userID,
  dbPool,
  databaseSchemaName,
  databaseTableName,
  databaseTableRowData,
}) => {
  Logger.log("info", {
    message: "databaseTableService:databaseTableBulkRowUpdate:params",
    params: {
      userID,
      databaseSchemaName,
      databaseTableName,
    },
  });

  try {
    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        // Start the transaction
        await client.query("BEGIN");

        // Generate the update queries
        const updateQueries = postgreSQLQueryUtil.databaseTableBulkRowUpdate({
          databaseSchemaName,
          databaseTableName,
          databaseTableRowData,
        });

        Logger.log("warning", {
          message: "databaseTableService:databaseTableBulkRowUpdate:warning",
          params: {
            userID,
            databaseSchemaName,
            databaseTableName,
            databaseTableRowData,
            updateQueries: String(updateQueries),
          },
        });

        // Execute each query within the transaction
        for (const query of updateQueries) {
          await client.query(query);
        }

        // Commit the transaction
        await client.query("COMMIT");
      }
    );
    Logger.log("success", {
      message: "databaseTableService:databaseTableBulkRowUpdate:success",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        updatedRowCount: databaseTableRowData.length,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableService:databaseTableBulkRowUpdate:failure",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 * Performs bulk row updates in a single transaction.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.databaseTableName
 * @param {string} param0.query
 * @returns {Promise<boolean>}
 */
databaseTableService.databaseTableBulkRowDelete = async ({
  userID,
  dbPool,
  databaseSchemaName,
  databaseTableName,
  query,
}) => {
  Logger.log("info", {
    message: "databaseTableService:databaseTableBulkRowDelete:params",
    params: {
      userID,
      databaseSchemaName,
      databaseTableName,
      query,
    },
  });

  try {
    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        // Start the transaction
        await client.query("BEGIN");

        // Generate the update queries
        const rowDeletionQuery = postgreSQLQueryUtil.databaseTableBulkRowDelete(
          {
            databaseSchemaName,
            databaseTableName,
            query,
          }
        );
        await client.query(rowDeletionQuery);

        // Commit the transaction
        await client.query("COMMIT");
      }
    );
    Logger.log("success", {
      message: "databaseTableService:databaseTableBulkRowDelete:success",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        query,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableService:databaseTableBulkRowDelete:failure",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 * Performs bulk row updates in a single transaction.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName
 * @param {string} param0.databaseTableName
 * @param {string} param0.query
 * @param {string} param0.exportFormat
 * @returns {Promise<boolean>}
 */
databaseTableService.databaseTableBulkRowExport = async ({
  userID,
  dbPool,
  databaseSchemaName,
  databaseTableName,
  query,
  exportFormat,
}) => {
  Logger.log("info", {
    message: "databaseTableService:databaseTableBulkRowExport:params",
    params: {
      userID,
      databaseSchemaName,
      databaseTableName,
      query,
      exportFormat,
    },
  });

  try {
    const exportedRows =
      await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
        dbPool,
        async (client) => {
          return await client.query(
            postgreSQLQueryUtil.databaseTableBulkRowExport({
              databaseSchemaName,
              databaseTableName,
              query,
            })
          );
        }
      );
    Logger.log("success", {
      message: "databaseTableService:databaseTableBulkRowExport:success",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        query,
        exportFormat,
      },
    });
    // Transform the data based on the export format
    switch (exportFormat) {
      case "json":
        return JSON.stringify(exportedRows.rows, null, 2); // Pretty-print JSON

      case "csv":
        const json2csvParser = new Parser();
        return json2csvParser.parse(exportedRows.rows);

      case "xlsx":
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Exported Data");

        // Add headers
        if (exportedRows.rows.length > 0) {
          const headers = Object.keys(exportedRows.rows[0]);
          worksheet.addRow(headers);

          // Add rows
          exportedRows.rows.forEach((row) => {
            worksheet.addRow(Object.values(row));
          });
        }

        // Write to buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;

      default:
        throw new Error(`Unsupported export format: ${exportFormat}`);
    }
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableService:databaseTableBulkRowExport:failure",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 * Creates a new table.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName - The schema name (default: "public").
 * @param {object} param0.databaseTableData
 * @returns {Promise<boolean>} - True if the table was created successfully.
 */
databaseTableService.createDatabaseTable = async ({
  userID,
  dbPool,
  databaseSchemaName = "public",
  databaseTableData,
}) => {
  Logger.log("info", {
    message: "databaseTableService:createDatabaseTable:params",
    params: {
      userID,
      databaseSchemaName,
      databaseTableData,
    },
  });
  try {
    Logger.log("warning", {
      message: "databaseTableService:createDatabaseTable:query",
      params: {
        userID,
        q: postgreSQLQueryUtil.createDatabaseTableQuery({
          databaseSchemaName,
          databaseTableData,
        }),
      },
    });
    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.createDatabaseTableQuery({
            databaseSchemaName,
            databaseTableData,
          })
        );
      }
    );
    Logger.log("success", {
      message: "databaseTableService:createDatabaseTable:success",
      params: { userID, databaseSchemaName, databaseTableData },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableService:createDatabaseTable:catch-1",
      params: {
        userID,
        databaseSchemaName,
        databaseTableData,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 * Update table.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName - The schema name (default: "public").
 * @param {string} param0.databaseTableName - The schema name (default: "public").
 * @param {object} param0.updatedTableData
 * @returns {Promise<boolean>} - True if the table was created successfully.
 */
databaseTableService.updateDatabaseTableByName = async ({
  userID,
  dbPool,
  databaseSchemaName = "public",
  databaseTableName,
  updatedTableData,
}) => {
  Logger.log("info", {
    message: "databaseTableService:updateDatabaseTableByName:params",
    params: { userID, databaseSchemaName, databaseTableName, updatedTableData },
  });

  try {
    // Fetch current table data
    const _currentTableData = await databaseTableService.getDatabaseTableByName(
      {
        userID,
        dbPool,
        databaseSchemaName,
        databaseTableName,
      }
    );
    // tranform raw current table
    const currentTableData = {
      databaseTableName: _currentTableData.databaseTableName,
      databaseTableColumns:
        _currentTableData.databaseTableColumns?.map(
          (column) => new DatabaseTableColumn(column)
        ) || [],
      databaseTableConstraints: {
        foreignKeys:
          _currentTableData.databaseTableConstraints
            ?.filter(
              (constraint) => constraint.constraintType === "FOREIGN KEY"
            )
            .map((constraint) => new DatabaseTableConstraint(constraint)) || [],
      },
    };
    Logger.log("warning", {
      message:
        "databaseTableService:updateDatabaseTableByName:currentTableData",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        updatedTableData,
        currentTableData,
      },
    });
    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        // Generate SQL statements for updating the table
        const sqlStatements =
          postgreSQLQueryUtil.updateDatabaseTableByNameQuery({
            databaseSchemaName,
            currentTableData,
            updatedTableData,
          });

        // Execute each SQL statement
        for (const sql of sqlStatements) {
          await client.query(sql);
        }
      }
    );

    Logger.log("success", {
      message: "databaseTableService:updateDatabaseTableByName:success",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        updatedTableData,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableService:updateDatabaseTableByName:catch-1",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        updatedTableData,
        error: error.message,
      },
    });
    throw error;
  }
};

/**
 * Creates a new table.
 * @param {object} param0
 * @param {number} param0.userID
 * @param {object} param0.dbPool
 * @param {string} param0.databaseSchemaName - The schema name (default: "public").
 * @param {object} param0.databaseTableName
 * @returns {Promise<boolean>} - True if the table was created successfully.
 */
databaseTableService.deleteDatabaseTable = async ({
  userID,
  dbPool,
  databaseSchemaName = "public",
  databaseTableName,
}) => {
  Logger.log("info", {
    message: "databaseTableService:deleteDatabaseTable:params",
    params: {
      userID,
      databaseSchemaName,
      databaseTableName,
    },
  });
  try {
    await TenantAwarePostgreSQLPoolManager.withDatabaseClient(
      dbPool,
      async (client) => {
        return await client.query(
          postgreSQLQueryUtil.deleteDatabaseTableQuery({
            databaseSchemaName,
            databaseTableName,
            cascade: false,
            ifExists: true,
          })
        );
      }
    );
    Logger.log("success", {
      message: "databaseTableService:deleteDatabaseTable:success",
      params: { userID, databaseSchemaName, databaseTableName },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableService:deleteDatabaseTable:catch-1",
      params: {
        userID,
        databaseSchemaName,
        databaseTableName,
        error: error.message,
      },
    });
    throw error;
  }
};



module.exports = { databaseTableService };
