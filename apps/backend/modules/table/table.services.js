const { prisma } = require("../../db/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { pgPool } = require("../../db/pg");
const { tableQueryUtils } = require("../../utils/postgres-utils/table-queries");
class TableService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {object} param0.authorizationPolicy
   * @param {object} param0.schema
   * @returns {Array<any>|null}
   */
  static getAuthorizedTables = async ({ authorizationPolicy, schema }) => {
    Logger.log("info", {
      message: "TableService:getAuthorizedTables:init",
    });
    try {
      console.log(tableQueryUtils.getAllTables(schema));
      const res = await pgPool.query(tableQueryUtils.getAllTables(schema));
      const tables = res.rows.map((row) => row.table_name);
      let authorizedTables = [];
      if (authorizationPolicy && authorizationPolicy.tables) {
        if (
          authorizationPolicy.tables === true ||
          authorizationPolicy.tables.read === true
        ) {
          authorizedTables = tables;
        } else {
          Object.keys(authorizationPolicy.tables).map((tableName) => {
            if (
              authorizationPolicy.tables[tableName] === true ||
              authorizationPolicy.tables[tableName].read
            ) {
              authorizedTables.push(tableName);
            }
          });
        }
      }
      Logger.log("success", {
        message: "TableService:getAuthorizedTables:authorizedTables",
        params: {
          authorizedTables,
        },
      });
      return authorizedTables;
    } catch (error) {
      Logger.log("error", {
        message: "TableService:getAuthorizedTables:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {String} param0.tableName
   * @returns {Array<any>|null}
   */
  static getTableColumns = async ({ tableName }) => {
    Logger.log("info", {
      message: "TableService:getTableColumns:params",
      params: {
        tableName,
      },
    });
    try {
      const res = await pgPool.query(tableQueryUtils.getTableColumns(), [
        tableName,
      ]);
      const columns = res.rows.map((row) => row.column_schema);

      Logger.log("success", {
        message: "TableService:getTableColumns:columns",
        params: {
          columns,
        },
      });
      return columns;
    } catch (error) {
      Logger.log("error", {
        message: "TableService:getTableColumns:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {String} param0.tableName
   * @returns {Array<any>|null}
   */
  static getTablePrimaryKey = async ({ tableName }) => {
    Logger.log("info", {
      message: "TableService:getTablePrimaryKey:params",
      params: {
        tableName,
      },
    });
    try {
      const res = await pgPool.query(tableQueryUtils.getTablePrimaryKey(), [
        tableName,
      ]);
      const primaryKey = res.rows.map((row) => row.column_name);
      Logger.log("success", {
        message: "TableService:getTablePrimaryKey:primaryKey",
        params: {
          primaryKey,
        },
      });
      return primaryKey;
    } catch (error) {
      Logger.log("error", {
        message: "TableService:getTablePrimaryKey:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {String} param0.tableName
   * @param {Array<any>} param0.authorizedRows
   * @param {JSON} param0.filter
   * @param {JSON} param0.orderBy
   * @param {Number} param0.skip
   * @param {Number} param0.take
   * @returns {Array<any>|null}
   */
  static getTableRows = async ({
    tableName,
    authorizedRows,
    filter,
    orderBy,
    skip,
    take,
  }) => {
    Logger.log("info", {
      message: "TableService:getTableRows:params",
      params: {
        tableName,
        authorizedRows,
        filter,
        orderBy,
        skip,
        take,
      },
    });

    try {
      let rows = null;
      if (!authorizedRows) {
        rows = null;
      } else {
        const res = await pgPool.query(
          tableQueryUtils.getRows({
            tableName,
            authorizedRows,
            orderBy,
            filter,
            limit: take,
            skip,
          })
        );
        rows = res.rows;
      }
      Logger.log("success", {
        message: "TableService:getTableRows:rows",
        params: {
          rowsLength: rows?.length,
        },
      });
      return rows;
    } catch (error) {
      Logger.log("error", {
        message: "TableService:getTableRows:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {String} param0.tableName
   * @param {Array<any>} param0.authorizedRows
   * @param {String} param0.filter
   * @returns {object}
   */
  static getTableStatistics = async ({ tableName, authorizedRows, filter }) => {
    Logger.log("info", {
      message: "TableService:getTableStatistics:params",
      params: {
        tableName,
        authorizedRows,
        filter,
      },
    });
    try {
      let rowCount = 0;
      if (!authorizedRows) {
        rowCount = 0;
      } else {
        const res = await pgPool.query(
          tableQueryUtils.getRowCount({
            tableName,
            authorizedRows,
            filter,
          })
        );
        rowCount = res.rows[0].count;
      }
      Logger.log("success", {
        message: "TableService:getTableStatistics:rows",
        params: {
          rowCount,
        },
      });
      return { rowCount };
    } catch (error) {
      Logger.log("error", {
        message: "TableService:getTableStatistics:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {String} param0.tableName
   * @param {any} param0.query
   * @param {Array<any>} param0.authorizedRows
   * @returns {any|null}
   */
  static getTableRowByID = async ({ tableName, query, authorizedRows }) => {
    Logger.log("info", {
      message: "TableService:getTableRowByID:params",
      params: {
        tableName,
        query,
        authorizedRows,
      },
    });
    try {
      let row = null;
      if (!authorizedRows) {
        row = null;
      } else if (typeof authorizedRows == "boolean" && authorizedRows == true) {
        const res = await pgPool.query(
          tableQueryUtils.getRowByID(tableName, query)
        );
        row = res.rows[0];
      } else {
        const res = await pgPool.query(
          tableQueryUtils.getRowByID(tableName, query, authorizedRows)
        );
        row = res.rows[0];
      }
      Logger.log("success", {
        message: "TableService:getTableRowByID:success",
        params: {
          tableName,
          authorizedRows,
          query,
        },
      });
      return row;
    } catch (error) {
      Logger.log("error", {
        message: "TableService:getTableRowByID:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {String} param0.tableName
   * @param {any} param0.query
   * @param {any} param0.data
   * @param {Array<any>} param0.authorizedRows
   * @returns {any|null}
   */
  static updateTableRowByID = async ({
    tableName,
    query,
    data,
    authorizedRows,
  }) => {
    Logger.log("info", {
      message: "TableService:updateTableRowByID:params",
      params: {
        tableName,
        query,
        data,
        authorizedRows,
      },
    });
    try {
      if (!authorizedRows) {
        row = null;
      } else if (typeof authorizedRows == "boolean" && authorizedRows == true) {
        await pgPool.query(
          tableQueryUtils.updateRowByID(tableName, data, query)
        );
      } else {
        await pgPool.query(
          tableQueryUtils.updateRowByID(tableName, data, query, authorizedRows)
        );
      }
      return true;
    } catch (error) {
      Logger.log("error", {
        message: "TableService:updateTableRowByID:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {String} param0.tableName
   * @param {any} param0.data
   * @returns {any|null}
   */
  static addTableRow = async ({ tableName, data }) => {
    Logger.log("info", {
      message: "TableService:addTableRow:params",
      params: {
        tableName,
        data,
      },
    });
    try {
      await pgPool.query(tableQueryUtils.addRow(tableName, data));
      Logger.log("success", {
        message: "TableService:addTableRow:success",
      });
      return true;
    } catch (error) {
      Logger.log("error", {
        message: "TableService:addTableRow:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {String} param0.tableName
   * @param {any} param0.query
   * @param {Array<any>} param0.authorizedRows
   * @returns {any|null}
   */
  static deleteTableRowByID = async ({ tableName, query, authorizedRows }) => {
    Logger.log("info", {
      message: "TableService:deleteTableRowByID:params",
      params: {
        tableName,
        query,
        authorizedRows,
      },
    });
    try {
      if (!authorizedRows) {
      } else if (typeof authorizedRows == "boolean" && authorizedRows == true) {
        await pgPool.query(tableQueryUtils.deleteRows(tableName, query));
      } else {
        await pgPool.query(
          tableQueryUtils.deleteRows(tableName, query, authorizedRows)
        );
      }
      Logger.log("success", {
        message: "TableService:deleteTableRowByID:success",
        params: {
          tableName,
          query,
          authorizedRows,
        },
      });
      return true;
    } catch (error) {
      Logger.log("error", {
        message: "TableService:deleteTableRowByID:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {String} param0.tableName
   * @param {any} param0.query
   * @param {Array<any>} param0.authorizedRows
   * @returns {any|null}
   */
  static deleteTableRowByMultipleIDs = async ({
    tableName,
    query,
    authorizedRows,
  }) => {
    Logger.log("info", {
      message: "TableService:deleteTableRowByMultipleIDs:params",
      params: {
        tableName,
        query,
        authorizedRows,
      },
    });
    try {
      if (!authorizedRows) {
      } else if (typeof authorizedRows == "boolean" && authorizedRows == true) {
        await pgPool.query(tableQueryUtils.deleteRows(tableName, query));
      } else {
        await pgPool.query(
          tableQueryUtils.deleteRows(tableName, query, authorizedRows)
        );
      }
      Logger.log("success", {
        message: "TableService:deleteTableRowByMultipleIDs:success",
      });
      return true;
    } catch (error) {
      Logger.log("error", {
        message: "TableService:deleteTableRowByMultipleIDs:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {String} param0.tableName
   * @param {any} param0.query
   * @param {Array<any>} param0.authorizedRows
   * @returns {any|null}
   */
  static exportTableRowByMultipleIDs = async ({
    tableName,
    query,
    authorizedRows,
  }) => {
    Logger.log("info", {
      message: "TableService:exportTableRowByMultipleIDs:params",
      params: {
        tableName,
        query,
        authorizedRows,
      },
    });
    try {
      let rows = null;
      if (!authorizedRows) {
        rows = null;
      } else if (typeof authorizedRows == "boolean" && authorizedRows == true) {
        const res = await pgPool.query(
          tableQueryUtils.getRowsByQuery(tableName, query)
        );
        rows = res.rows;
      } else {
        const res = await pgPool.query(
          tableQueryUtils.getRowsByQuery(tableName, query, authorizedRows)
        );
        rows = res.rows;
      }
      Logger.log("success", {
        message: "TableService:exportTableRowByMultipleIDs:success",
      });
      return rows;
    } catch (error) {
      Logger.log("error", {
        message: "TableService:exportTableRowByMultipleIDs:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { TableService };
