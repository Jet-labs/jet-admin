const { Prisma } = require("@prisma/client");
const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
class TableService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.table_name
   * @param {Array<any>} param0.authorized_rows
   * @param {Array<String>} param0.authorized_columns
   * @param {Array<String>} param0.authorized_include_columns
   * @param {JSON} param0.qJSON
   * @param {JSON} param0.sortJSON
   * @param {Number} param0.skip
   * @param {Number} param0.take
   * @returns {Array<any>|null}
   */
  static getTableRows = async ({
    table_name,
    authorized_rows,
    authorized_columns,
    authorized_include_columns,
    qJSON,
    sortJSON,
    skip,
    take,
  }) => {
    Logger.log("info", {
      message: "TableService:getTableRows:params",
      params: {
        table_name,
        authorized_rows,
        authorized_columns,
        authorized_include_columns,
        qJSON,
        sortJSON,
        skip,
        take,
      },
    });

    try {
      let rows = null;
      let columns = {};
      if (authorized_columns === true) {
        columns = null;
      } else if (Array.isArray(authorized_columns)) {
        Array.isArray(authorized_columns) &&
          authorized_columns.forEach((column) => {
            columns[column] = true;
          });
      } else {
        columns = null;
      }
      Logger.log("info", {
        message: "TableService:getTableRows:columns",
        params: { columns },
      });

      rows =
        authorized_rows === false
          ? null
          : qJSON
          ? await prisma[table_name].findMany({
              where:
                authorized_rows === true
                  ? qJSON
                  : {
                      AND: [{ ...qJSON }, authorized_rows],
                    },
              skip: skip,
              take: take,
              orderBy: sortJSON
                ? { [sortJSON.field]: sortJSON.order }
                : undefined,
              select: authorized_columns == true ? null : columns,
              include: columns
                ? null
                : authorized_include_columns
                ? authorized_include_columns
                : null,
            })
          : await prisma[table_name].findMany({
              where: authorized_rows === true ? {} : authorized_rows,
              skip: skip,
              take: take,
              orderBy: sortJSON
                ? { [sortJSON.field]: sortJSON.order }
                : undefined,
              select: authorized_columns == true ? null : columns,
              include: columns
                ? null
                : authorized_include_columns
                ? authorized_include_columns
                : null,
            });
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
   * @param {JSON} param0.schemaQuery
   * @returns {any|null}
   */
  static runSchemaQuery = async ({ schemaQuery }) => {
    Logger.log("info", {
      message: "TableService:runSchemaQuery:params",
      params: { schemaQuery },
    });
    try {
      const result = await prisma.$queryRaw`${Prisma.raw(
        schemaQuery.raw_query
      )}`;

      Logger.log("info", {
        message: "TableService:runSchemaQuery:query",
        params: {
          result,
        },
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "TableService:runSchemaQuery:catch-1",
        params: { error },
      });
      throw error;
    }
  };
  /**
   *
   * @param {object} param0
   * @param {String} param0.table_name
   * @param {Array<any>} param0.authorized_rows
   * @param {JSON} param0.qJSON
   * @returns {object}
   */
  static getTableStatistics = async ({
    table_name,
    authorized_rows,
    qJSON,
  }) => {
    Logger.log("info", {
      message: "TableService:getTableStatistics:params",
      params: {
        table_name,
        authorized_rows,
        qJSON,
      },
    });
    try {
      let rowCount = 0;

      rowCount =
        authorized_rows === false
          ? null
          : qJSON
          ? await prisma[table_name].count({
              where:
                authorized_rows === true
                  ? qJSON
                  : {
                      AND: [{ ...qJSON }, authorized_rows],
                    },
            })
          : await prisma[table_name].count({
              where: authorized_rows === true ? {} : authorized_rows,
            });
      Logger.log("success", {
        message: "TableService:getTableStatistics:rowCount",
        params: {
          table_name,
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
   * @param {String} param0.table_name
   * @param {any} param0.query
   * @param {Array<any>} param0.authorized_rows
   * @param {Array<String>} param0.authorized_columns
   * @param {Array<String>} param0.authorized_include_columns
   * @returns {any|null}
   */
  static getTableRowByID = async ({
    table_name,
    query,
    authorized_rows,
    authorized_columns,
    authorized_include_columns,
  }) => {
    Logger.log("info", {
      message: "TableService:getTableRowByID:params",
      params: {
        table_name,
        authorized_rows,
      },
    });
    try {
      let row = null;
      let columns = {};
      if (authorized_columns === true) {
        columns = null;
      } else if (Array.isArray(authorized_columns)) {
        Array.isArray(authorized_columns) &&
          authorized_columns.forEach((column) => {
            columns[column] = true;
          });
      } else {
        columns = null;
      }
      Logger.log("info", {
        message: "TableService:getTableRowByID:columns",
        params: { columns },
      });

      row =
        authorized_rows === false
          ? null
          : await prisma[table_name].findUnique({
              where:
                authorized_rows === true
                  ? {
                      ...query,
                    }
                  : {
                      ...query,
                      ...authorized_rows,
                    },
              select: authorized_columns == true ? null : columns,
              include: columns
                ? null
                : authorized_include_columns
                ? authorized_include_columns
                : null,
            });
      Logger.log("success", {
        message: "TableService:getTableRowByID:row",
        params: { row },
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
   * @param {String} param0.table_name
   * @param {any} param0.query
   * @param {any} param0.data
   * @param {Array<any>} param0.authorized_rows
   * @param {Array<String>} param0.authorized_columns
   * @returns {any|null}
   */
  static updateTableRowByID = async ({
    table_name,
    query,
    data,
    authorized_rows,
    authorized_columns,
  }) => {
    Logger.log("info", {
      message: "TableService:updateTableRowByID:params",
      params: {
        table_name,
        query,
        data,
        authorized_rows,
        authorized_columns,
      },
    });
    try {
      let row = null;

      const checkedRow =
        authorized_rows === false
          ? null
          : await prisma[table_name].findUnique({
              where:
                authorized_rows === true
                  ? {
                      ...query,
                    }
                  : {
                      ...query,
                      ...authorized_rows,
                    },
            });
      Logger.log("info", {
        message: "TableService:updateTableRowByID:checkedRow",
        params: { checkedRow },
      });
      if (!checkedRow) {
        Logger.log("error", {
          message: "TableService:updateTableRowByID:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      } else {
        row = await prisma[table_name].update({
          where:
            authorized_rows === true
              ? {
                  ...query,
                }
              : { AND: [authorized_rows, { ...query }] },
          data: {
            ...data,
          },
        });
        Logger.log("success", {
          message: "TableService:updateTableRowByID:catch-2",
          params: { row },
        });
        return row;
      }
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
   * @param {String} param0.table_name
   * @param {any} param0.data
   * @returns {any|null}
   */
  static addTableRow = async ({ table_name, data }) => {
    Logger.log("info", {
      message: "TableService:addTableRow:params",
      params: {
        table_name,
        data,
      },
    });
    try {
      let row = null;
      row = await prisma[table_name].create({
        data: {
          ...data,
        },
      });
      Logger.log("success", {
        message: "TableService:addTableRow:row",
        params: {
          row,
        },
      });
      return row;
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
   * @param {String} param0.table_name
   * @param {any} param0.query
   * @param {Array<any>} param0.authorized_rows
   * @returns {any|null}
   */
  static deleteTableRowByID = async ({
    table_name,
    query,
    authorized_rows,
  }) => {
    Logger.log("info", {
      message: "TableService:deleteTableRowByID:params",
      params: {
        table_name,
        query,
        authorized_rows,
      },
    });
    try {
      const checkedRow =
        authorized_rows === false
          ? null
          : await prisma[table_name].findUnique({
              where:
                authorized_rows === true
                  ? {
                      ...query,
                    }
                  : {
                      ...query,
                      ...authorized_rows,
                    },
            });
      Logger.log("info", {
        message: "TableService:deleteTableRowByID:checkedRow",
        params: { checkedRow },
      });
      let row = null;
      if (!checkedRow) {
        Logger.log("error", {
          message: "TableService:deleteTableRowByID:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      } else {
        row =
          authorized_rows === false
            ? null
            : await prisma[table_name].delete({
                where:
                  authorized_rows === true
                    ? {
                        ...query,
                      }
                    : { AND: [authorized_rows, { ...query }] },
              });
        Logger.log("success", {
          message: "TableService:deleteTableRowByID:deleted",
        });
      }
      return row;
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
   * @param {String} param0.table_name
   * @param {any} param0.query
   * @param {Array<any>} param0.authorized_rows
   * @returns {any|null}
   */
  static deleteTableRowByMultipleIDs = async ({
    table_name,
    query,
    authorized_rows,
  }) => {
    Logger.log("info", {
      message: "TableService:deleteTableRowByMultipleIDs:params",
      params: {
        table_name,
        query,
        authorized_rows,
      },
    });
    try {
      const deletedRows =
        authorized_rows === false
          ? null
          : await prisma[table_name].deleteMany({
              where:
                authorized_rows === true
                  ? {
                      ...query,
                    }
                  : { AND: [authorized_rows, { ...query }] },
            });
      Logger.log("success", {
        message: "TableService:deleteTableRowByMultipleIDs:deleted",
      });
      return deletedRows;
    } catch (error) {
      Logger.log("error", {
        message: "TableService:deleteTableRowByMultipleIDs:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { TableService };
