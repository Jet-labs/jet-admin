const constants = require("../../constants");
const { extractError } = require("../../utils/error.util");
const Logger = require("../../utils/logger");
const { TableService } = require("./table.services");
const { createObjectCsvStringifier } = require("csv-writer");
const ExcelJS = require("exceljs");
const {
  generateFilterQuery,
  generateOrderByQuery,
} = require("../../utils/postgres-utils/parsers");

const tableController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tableController.getTables = async (req, res) => {
  try {
    Logger.log("info", {
      message: "tableController:getTables:init",
    });
    const { pmUser, state } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorizationPolicy = state.authorization_policy;
    const authorizedTables = await TableService.getAuthorizedTables({
      authorizationPolicy,
      schema: "public",
    });
    Logger.log("info", {
      message: "tableController:getTables:rows",
      params: {
        pm_user_id,
        authorizedTables,
      },
    });
    return res.json({
      success: true,
      tables: authorizedTables,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:getTables:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tableController.getTableColumns = async (req, res) => {
  try {
    Logger.log("info", {
      message: "tableController:getTableColumns:init",
    });
    const { pmUser, state } = req;
    const pm_user_id = pmUser.pm_user_id;
    const { table_name } = req.params;
    const columns = await TableService.getTableColumns({
      tableName: table_name,
    });
    Logger.log("info", {
      message: "tableController:getTableColumns:params",
      params: {
        pm_user_id,
        table_name,
        columns,
      },
    });
    return res.json({
      success: true,
      columns,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:getTableColumns:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tableController.getTablePrimaryKey = async (req, res) => {
  try {
    Logger.log("info", {
      message: "tableController:getTablePrimaryKey:init",
    });
    const { pmUser, state } = req;
    const pm_user_id = pmUser.pm_user_id;
    const { table_name } = req.params;
    const primaryKey = await TableService.getTablePrimaryKey({
      tableName: table_name,
    });
    Logger.log("info", {
      message: "tableController:getTablePrimaryKey:params",
      params: {
        pm_user_id,
        table_name,
        primaryKey,
      },
    });
    return res.json({
      success: true,
      primaryKey,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:getTablePrimaryKey:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tableController.getTableStatistics = async (req, res) => {
  try {
    Logger.log("info", {
      message: "tableController:getAllRows:init",
    });
    const { pmUser, state } = req;
    const authorized_rows = state?.authorized_rows;
    const authorized_columns = state?.authorized_columns;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const { table_name } = req.params;
    const { q } = req.query;
    let filter =
      q && q !== "" && q != "null" ? generateFilterQuery(JSON.parse(q)) : null;

    Logger.log("info", {
      message: "tableController:getTableStatistics:params",
      params: {
        pm_user_id,
        q,
        filter,
        table_name,
        authorized_rows,
        authorized_columns,
      },
    });

    const { rowCount } = await TableService.getTableStatistics({
      tableName: table_name,
      authorizedRows: authorized_rows,
      filter,
    });

    Logger.log("info", {
      message: "tableController:getTableStatistics:statistics",
      params: {
        pm_user_id,
        rowCount,
      },
    });

    return res.json({
      success: true,
      statistics: {
        authorized_rows,
        authorized_columns,
        rowCount,
      },
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:getTableStatistics:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tableController.addRowByID = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const { table_name } = req.params;
    Logger.log("info", {
      message: "tableController:addRowByID:params",
      params: { pm_user_id, table_name, body },
    });
    await TableService.addTableRow({ tableName: table_name, data: body });
    Logger.log("success", {
      message: "tableController:addRowByID:success",
      params: { pm_user_id },
    });
    return res.json({
      success: true,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:addRowByID:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tableController.getAllRows = async (req, res) => {
  try {
    Logger.log("info", {
      message: "tableController:getAllRows:init",
    });
    const { pmUser, state } = req;
    const authorized_rows = state?.authorized_rows;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const { table_name } = req.params;
    const { page, page_size, q, order } = req.query;
    let filter =
      q && q !== "" && q != "null" ? generateFilterQuery(JSON.parse(q)) : null;
    let orderBy =
      order && order !== "" && order != "null"
        ? generateOrderByQuery(JSON.parse(order))
        : null;
    let skip = 0;
    let take = page_size ? parseInt(page_size) : constants.ROW_PAGE_SIZE;
    if (parseInt(page) >= 0) {
      skip = (parseInt(page) - 1) * take;
    } else {
      skip = undefined;
      take = undefined;
    }
    Logger.log("info", {
      message: "tableController:getAllRows:params",
      params: {
        pm_user_id,
        page,
        page_size,
        q,
        order,
        filter,
        orderBy,
        table_name,
        authorized_rows,
        skip,
        take,
      },
    });

    const rows = await TableService.getTableRows({
      tableName: table_name,
      authorizedRows: authorized_rows,
      filter,
      orderBy,
      skip,
      take,
    });
    Logger.log("info", {
      message: "tableController:getAllRows:rows",
      params: {
        pm_user_id,
        rowsLength: rows?.length,
      },
    });
    return res.json({
      success: true,
      rows,
      nextPage: rows?.length < take ? null : parseInt(page) + 1,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:getAllRows:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tableController.getRowByID = async (req, res) => {
  try {
    const { pmUser, state } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const { table_name, query } = req.params;
    const authorizedRows = state?.authorized_rows;
    Logger.log("info", {
      message: "tableController:getRowByID:params",
      params: { pm_user_id, table_name, query },
    });
    const row = await TableService.getTableRowByID({
      tableName: table_name,
      query: JSON.parse(query).query,
      authorizedRows,
    });
    Logger.log("success", {
      message: "tableController:getRowByID:params",
      params: { pm_user_id, table_name, query },
    });
    return res.json({
      success: true,
      row,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:getRowByID:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tableController.updateRowByID = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const { table_name, query } = req.params;
    const authorizedRows = state?.authorized_rows;
    Logger.log("info", {
      message: "tableController:updateRowByID:params",
      params: { pm_user_id, table_name, query, body, authorizedRows },
    });
    await TableService.updateTableRowByID({
      tableName: table_name,
      query: JSON.parse(query).query,
      data: body,
      authorizedRows,
    });
    Logger.log("success", {
      message: "tableController:updateRowByID:success",
      params: { pm_user_id },
    });
    return res.json({
      success: true,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:updateRowByID:catch-1",
      params: { error },
    });

    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tableController.deleteRowByID = async (req, res) => {
  try {
    const { pmUser, state } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const { table_name, query } = req.params;
    const authorized_rows = state?.authorized_rows;

    Logger.log("info", {
      message: "tableController:deleteRowByID:params",
      params: { pm_user_id, table_name, query, authorized_rows },
    });

    await TableService.deleteTableRowByID({
      tableName: table_name,
      query: JSON.parse(query).query,
      authorizedRows: authorized_rows,
    });

    Logger.log("success", {
      message: "tableController:deleteRowByID:success",
      params: { pm_user_id, table_name, query },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:deleteRowByID:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tableController.deleteRowByMultipleIDs = async (req, res) => {
  try {
    const { pmUser, state } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const { table_name } = req.params;
    const { query } = req.body;
    const authorized_rows = state?.authorized_rows;

    Logger.log("info", {
      message: "tableController:deleteRowByMultipleIDs:params",
      params: { pm_user_id, table_name, query, authorized_rows },
    });

    await TableService.deleteTableRowByMultipleIDs({
      tableName: table_name,
      query: JSON.parse(query).query,
      authorizedRows: authorized_rows,
    });

    Logger.log("success", {
      message: "tableController:deleteRowByMultipleIDs:success",
      params: { pm_user_id, table_name, query },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:deleteRowByMultipleIDs:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tableController.exportRowByMultipleIDs = async (req, res) => {
  try {
    const { pmUser, state } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const { table_name } = req.params;
    const { query, format } = req.body;
    const authorized_rows = state?.authorized_rows;

    Logger.log("info", {
      message: "tableController:exportRowByMultipleIDs:params",
      params: { pm_user_id, table_name, query, authorized_rows },
    });

    const rows = await TableService.exportTableRowByMultipleIDs({
      tableName: table_name,
      query: query,
      authorizedRows: authorized_rows,
    });
    console.log({ rows });

    if (format === "csv") {
      res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');
      res.setHeader("Content-Type", "text/csv");

      const csvStringifier = createObjectCsvStringifier({
        header: Object.keys(rows[0] || {}).map((key) => ({
          id: key,
          title: key,
        })),
      });

      res.write(csvStringifier.getHeaderString());
      res.write(csvStringifier.stringifyRecords(rows));
      res.end();
      return;
    } else if (format === "xlsx") {
      res.setHeader("Content-Disposition", 'attachment; filename="data.xlsx"');
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data");

      worksheet.columns = Object.keys(rows[0] || {}).map((key) => ({
        header: key,
        key,
      }));

      rows.forEach((row) => {
        worksheet.addRow(row);
      });

      workbook.xlsx.write(res).then(() => res.end());
      return;
    } else {
      res.setHeader("Content-Disposition", 'attachment; filename="data.json"');
      res.setHeader("Content-Type", "application/json");
      return res.send(JSON.stringify(rows, null, 2));
    }
  } catch (error) {
    Logger.log("error", {
      message: "tableController:exportRowByMultipleIDs:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = tableController;
