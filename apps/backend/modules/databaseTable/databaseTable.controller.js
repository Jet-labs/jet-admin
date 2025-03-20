const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { postgreSQLParserUtil } = require("../../utils/postgresql.util");
const { databaseTableService } = require("./databaseTable.service");

const databaseTableController = {};

/**
 * Helper function to parse query parameters for pagination, filtering, and ordering.
 * @param {object} query - Request query object.
 * @returns {object} - Parsed parameters.
 */
const parseDatabaseTableGetRowsQueryParams = (query) => {
  const { page, pageSize, q, order } = query;

  const filter =
    q && q !== "" && q !== "null" && q !== "undefined"
      ? postgreSQLParserUtil.generateFilterQuery(JSON.parse(q))
      : null;

  const orderBy =
    order && order !== "" && order !== "null" && order !== "undefined"
      ? String(order)
      : null;

  const take = pageSize ? parseInt(pageSize) : constants.ROW_PAGE_SIZE;
  const skip =
    page && parseInt(page) > 0 ? (parseInt(page) - 1) * take : undefined;

  return { filter, orderBy, skip, take };
};

/**
 * Retrieves all database tables in a schema.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTableController.getAllDatabaseTables = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName } = req.params;

    if (!databaseSchemaName || typeof databaseSchemaName !== "string") {
      throw new Error("Invalid or missing databaseSchemaName.");
    }

    Logger.log("info", {
      message: "databaseTableController:getAllDatabaseTables:params",
      params: { userID: user.userID, databaseSchemaName },
    });

    const databaseTables = await databaseTableService.getAllDatabaseTables({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
    });

    Logger.log("success", {
      message: "databaseTableController:getAllDatabaseTables:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTablesLength: databaseTables.length,
      },
    });

    return expressUtils.sendResponse(res, true, { databaseTables });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableController:getAllDatabaseTables:catch-1",
      params: { userID: req.user?.userID, error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Retrieves a specific database table by name.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTableController.getDatabaseTableByName = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, databaseTableName } = req.params;

    if (
      !databaseSchemaName ||
      !databaseTableName ||
      typeof databaseSchemaName !== "string" ||
      typeof databaseTableName !== "string"
    ) {
      throw new Error(
        "Invalid or missing databaseSchemaName or databaseTableName."
      );
    }

    Logger.log("info", {
      message: "databaseTableController:getDatabaseTableByName:params",
      params: { userID: user.userID, databaseSchemaName, databaseTableName },
    });

    const databaseTable = await databaseTableService.getDatabaseTableByName({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
      databaseTableName,
    });

    Logger.log("success", {
      message: "databaseTableController:getDatabaseTableByName:success",
      params: { userID: user.userID, databaseSchemaName, databaseTableName },
    });

    return expressUtils.sendResponse(res, true, { databaseTable });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableController:getDatabaseTableByName:catch-1",
      params: { userID: req.user?.userID, error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Retrieves rows from a database table with filtering, ordering, and pagination.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTableController.getDatabaseTableRows = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, databaseTableName } = req.params;
    const { filter, orderBy, skip, take } =
      parseDatabaseTableGetRowsQueryParams(req.query);

    if (
      !databaseSchemaName ||
      !databaseTableName ||
      typeof databaseSchemaName !== "string" ||
      typeof databaseTableName !== "string"
    ) {
      throw new Error(
        "Invalid or missing databaseSchemaName or databaseTableName."
      );
    }

    Logger.log("info", {
      message: "databaseTableController:getDatabaseTableRows:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        filter,
        orderBy,
        skip,
        take,
      },
    });

    const databaseTableRows = await databaseTableService.getDatabaseTableRows({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
      databaseTableName,
      filter,
      orderBy,
      skip,
      take,
    });

    Logger.log("success", {
      message: "databaseTableController:getDatabaseTableRows:success",
      params: { userID: user.userID, databaseSchemaName, databaseTableName },
    });

    return expressUtils.sendResponse(res, true, {
      databaseTableRows,
      nextPage:
        databaseTableRows?.length < take
          ? null
          : Math.floor((skip + take) / take) + 1,
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableController:getDatabaseTableRows:catch-1",
      params: { userID: req.user?.userID, error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Retrieves statistics for a database table.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTableController.getDatabaseTableStatistics = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, databaseTableName } = req.params;
    const { filter } = parseDatabaseTableGetRowsQueryParams(req.query);

    if (
      !databaseSchemaName ||
      !databaseTableName ||
      typeof databaseSchemaName !== "string" ||
      typeof databaseTableName !== "string"
    ) {
      throw new Error(
        "Invalid or missing databaseSchemaName or databaseTableName."
      );
    }

    Logger.log("info", {
      message: "databaseTableController:getDatabaseTableStatistics:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        filter,
      },
    });

    const { databaseTableRowCount } =
      await databaseTableService.getDatabaseTableStatistics({
        userID: parseInt(user.userID),
        dbPool,
        databaseSchemaName,
        databaseTableName,
        filter,
      });

    Logger.log("success", {
      message: "databaseTableController:getDatabaseTableStatistics:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        databaseTableRowCount,
      },
    });

    return expressUtils.sendResponse(res, true, {
      databaseTableStatistics: { databaseTableRowCount },
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableController:getDatabaseTableStatistics:catch-1",
      params: { userID: req.user?.userID, error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Performs bulk row updates in a single transaction.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTableController.databaseTableBulkRowAddition = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, databaseTableName } = req.params;
    const { databaseTableRowData } = req.body;
    console.log({ databaseTableRowData });
    // Validate required parameters
    if (
      !databaseSchemaName ||
      typeof databaseSchemaName !== "string" ||
      !databaseTableName ||
      typeof databaseTableName !== "string" ||
      !Array.isArray(databaseTableRowData) ||
      databaseTableRowData.length === 0
    ) {
      throw new Error("Invalid or missing parameters.");
    }

    Logger.log("info", {
      message: "databaseTableController:databaseTableBulkRowAddition:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        databaseTableRowDataLength: databaseTableRowData.length,
      },
    });

    // Perform the bulk row update
    await databaseTableService.databaseTableBulkRowAddition({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
      databaseTableName,
      databaseTableRowData,
    });

    Logger.log("success", {
      message: "databaseTableController:databaseTableBulkRowAddition:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        updatedRowCount: databaseTableRowData.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Bulk row update completed successfully.",
      updatedRowCount: databaseTableRowData.length,
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableController:databaseTableBulkRowAddition:catch-1",
      params: {
        userID: req.user?.userID,
        databaseSchemaName: req.params?.databaseSchemaName,
        databaseTableName: req.params?.databaseTableName,
        error,
      },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Performs bulk row updates in a single transaction.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTableController.databaseTableBulkRowUpdate = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, databaseTableName } = req.params;
    const { databaseTableRowData } = req.body;
    console.log({ databaseTableRowData });
    // Validate required parameters
    if (
      !databaseSchemaName ||
      typeof databaseSchemaName !== "string" ||
      !databaseTableName ||
      typeof databaseTableName !== "string" ||
      !Array.isArray(databaseTableRowData) ||
      databaseTableRowData.length === 0
    ) {
      throw new Error("Invalid or missing parameters.");
    }

    Logger.log("info", {
      message: "databaseTableController:databaseTableBulkRowUpdate:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        databaseTableRowDataLength: databaseTableRowData.length,
      },
    });

    // Perform the bulk row update
    await databaseTableService.databaseTableBulkRowUpdate({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
      databaseTableName,
      databaseTableRowData,
    });

    Logger.log("success", {
      message: "databaseTableController:databaseTableBulkRowUpdate:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        updatedRowCount: databaseTableRowData.length,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Bulk row update completed successfully.",
      updatedRowCount: databaseTableRowData.length,
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableController:databaseTableBulkRowUpdate:catch-1",
      params: {
        userID: req.user?.userID,
        databaseSchemaName: req.params?.databaseSchemaName,
        databaseTableName: req.params?.databaseTableName,
        error,
      },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Performs bulk row updates in a single transaction.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTableController.databaseTableBulkRowDelete = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, databaseTableName } = req.params;
    const { query } = req.body;
    // Validate required parameters
    if (
      !databaseSchemaName ||
      typeof databaseSchemaName !== "string" ||
      !databaseTableName ||
      typeof databaseTableName !== "string"
    ) {
      throw new Error("Invalid or missing parameters.");
    }

    Logger.log("info", {
      message: "databaseTableController:databaseTableBulkRowDelete:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        query,
      },
    });

    // Perform the bulk row update
    await databaseTableService.databaseTableBulkRowDelete({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
      databaseTableName,
      query,
    });

    Logger.log("success", {
      message: "databaseTableController:databaseTableBulkRowDelete:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        query,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Bulk row delete completed successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableController:databaseTableBulkRowDelete:catch-1",
      params: {
        userID: req.user?.userID,
        databaseSchemaName: req.params?.databaseSchemaName,
        databaseTableName: req.params?.databaseTableName,
        error,
      },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Performs bulk row updates in a single transaction.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTableController.databaseTableBulkRowExport = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName, databaseTableName } = req.params;
    const { query, exportFormat } = req.body;
    // Validate required parameters
    if (
      !databaseSchemaName ||
      typeof databaseSchemaName !== "string" ||
      !databaseTableName ||
      typeof databaseTableName !== "string"
    ) {
      throw new Error("Invalid or missing parameters.");
    }

    Logger.log("info", {
      message: "databaseTableController:databaseTableBulkRowExport:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        query,
        exportFormat,
      },
    });

    // Perform the bulk row update
    const exportedData = await databaseTableService.databaseTableBulkRowExport({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
      databaseTableName,
      query,
      exportFormat,
    });

    Logger.log("success", {
      message: "databaseTableController:databaseTableBulkRowExport:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        query,
      },
    });

    // Set response headers based on the export format
    let contentType, fileName;
    switch (exportFormat) {
      case "json":
        contentType = "application/json";
        fileName = "export.json";
        break;
      case "csv":
        contentType = "text/csv";
        fileName = "export.csv";
        break;
      case "xlsx":
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        fileName = "export.xlsx";
        break;
      default:
        throw new Error(`Unsupported export format: ${exportFormat}`);
    }

    // Send the response
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.send(exportedData);

  } catch (error) {
    Logger.log("error", {
      message: "databaseTableController:databaseTableBulkRowExport:catch-1",
      params: {
        userID: req.user?.userID,
        databaseSchemaName: req.params?.databaseSchemaName,
        databaseTableName: req.params?.databaseTableName,
        error,
      },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Creates a new trigger.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTableController.createDatabaseTable = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName = "public" } = req.params; // Default schema is "public"
    const databaseTableData = req.body;

    Logger.log("info", {
      message: "databaseTableController:createDatabaseTable:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableData,
      },
    });

    const result = await databaseTableService.createDatabaseTable({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
      databaseTableData,
    });

    Logger.log("success", {
      message: "databaseTableController:createDatabaseTable:success",
      params: { userID: user.userID, databaseSchemaName, databaseTableData },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Table created successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableController:createDatabaseTable:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Creates a new trigger.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTableController.updateDatabaseTableByName = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName = "public", databaseTableName } = req.params;
    const updatedTableData = req.body;

    Logger.log("info", {
      message: "databaseTableController:updateDatabaseTableByName:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        updatedTableData,
      },
    });

    const result = await databaseTableService.updateDatabaseTableByName({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
      databaseTableName,
      updatedTableData,
    });

    Logger.log("success", {
      message: "databaseTableController:updateDatabaseTableByName:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
        updatedTableData,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Table updated successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableController:updateDatabaseTableByName:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Creates a new trigger.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
databaseTableController.deleteDatabaseTableByName = async (req, res) => {
  try {
    const { user, dbPool } = req;
    const { databaseSchemaName = "public", databaseTableName } = req.params;

    Logger.log("info", {
      message: "databaseTableController:deleteDatabaseTableByName:params",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
      },
    });

    const result = await databaseTableService.deleteDatabaseTable({
      userID: parseInt(user.userID),
      dbPool,
      databaseSchemaName,
      databaseTableName,
    });

    Logger.log("success", {
      message: "databaseTableController:deleteDatabaseTableByName:success",
      params: {
        userID: user.userID,
        databaseSchemaName,
        databaseTableName,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "Table deleted successfully.",
    });
  } catch (error) {
    Logger.log("error", {
      message: "databaseTableController:deleteDatabaseTableByName:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};
module.exports = { databaseTableController };
