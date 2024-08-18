const { prisma, dbModel } = require("../../config/prisma");
const constants = require("../../constants");
const { extractError } = require("../../utils/error");
const Logger = require("../../utils/logger");
const {
  policyAuthorizations,
} = require("../../utils/policy-utils/policy-authorization");
const { TableService } = require("./table.services");
const { createObjectCsvStringifier } = require("csv-writer");
const ExcelJS = require("exceljs");

const tableController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tableController.getAllTablesForRead = async (req, res) => {
  try {
    Logger.log("info", {
      message: "tableController:getAllTablesForRead:init",
    });
    const { pmUser, state } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorization_policy = state.authorization_policy;

    Logger.log("info", {
      message: "tableController:getAllTablesForRead:params",
      params: {
        pm_user_id,
      },
    });

    const tables = dbModel.map((table) => {
      return table.name;
    });
    let _authorizedTables = [];
    if (authorization_policy && authorization_policy.tables) {
      if (
        authorization_policy.tables === true ||
        authorization_policy.tables.read === true
      ) {
        _authorizedTables = tables;
      } else {
        Object.keys(authorization_policy.tables).map((tableName) => {
          if (
            authorization_policy.tables[tableName] === true ||
            authorization_policy.tables[tableName].read === true
          ) {
            _authorizedTables.push(tableName);
          }
        });
      }
    }
    Logger.log("info", {
      message: "tableController:getAllTablesForRead:rows",
      params: {
        pm_user_id,
        tables: _authorizedTables,
      },
    });
    return res.json({
      success: true,
      tables: _authorizedTables,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:getAllTablesForRead:catch-1",
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
tableController.getAuthorizedColumnsForRead = async (req, res) => {
  try {
    Logger.log("info", {
      message: "tableController:getAuthorizedColumnsForRead:init",
    });
    const { pmUser, state } = req;
    const pm_user_id = pmUser.pm_user_id;
    const { table_name } = req.params;
    const authorized_columns =
      policyAuthorizations.extractColumnReadAuthorization({
        policyObject: state.authorization_policy,
        tableName: table_name,
      });
    const authorized_include_columns =
      policyAuthorizations.extractIncludeColumnReadAuthorization({
        policyObject: state.authorization_policy,
        tableName: table_name,
      });
    Logger.log("info", {
      message: "tableController:getAuthorizedColumnsForRead:params",
      params: {
        pm_user_id,
        table_name,
        authorized_columns,
        authorized_include_columns,
      },
    });
    const _tableModel = dbModel.find(
      (datamodel) => datamodel.name === table_name
    );
    const _allColumns = _tableModel.fields;
    let _authorizedColumns = [];
    if (authorized_columns === true) {
      _authorizedColumns = _allColumns;
    } else if (typeof authorized_columns === "object") {
      _authorizedColumns = _allColumns.map((column) => {
        if (
          authorized_columns.includes(column.name) ||
          authorized_include_columns.includes(column.name)
        ) {
          _authorizedColumns.push({ ...column });
        }
      });
    }
    Logger.log("info", {
      message: "tableController:getAuthorizedColumnsForRead:params",
      params: {
        pm_user_id,
        table_name,
        _authorizedColumns,
      },
    });
    return res.json({
      success: true,
      columns: _authorizedColumns,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:getAuthorizedColumnsForRead:catch-1",
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
tableController.getAuthorizedColumnsForUpdate = async (req, res) => {
  try {
    Logger.log("info", {
      message: "tableController:getAuthorizedColumnsForUpdate:init",
    });
    const { pmUser, state } = req;
    const pm_user_id = pmUser.pm_user_id;
    const { table_name } = req.params;
    const authorized_columns =
      policyAuthorizations.extractColumnEditAuthorization({
        policyObject: state.authorization_policy,
        tableName: table_name,
      });

    Logger.log("info", {
      message: "tableController:getAuthorizedColumnsForUpdate:params",
      params: {
        pm_user_id,
        table_name,
        authorized_columns,
      },
    });
    const _tableModel = dbModel.find(
      (datamodel) => datamodel.name === table_name
    );
    const _allColumns = _tableModel.fields;
    let _authorizedColumns = [];
    if (authorized_columns === true) {
      _authorizedColumns = _allColumns;
    } else if (typeof authorized_columns === "object") {
      _authorizedColumns = _allColumns.map((column) => {
        if (authorized_columns.includes(column.name)) {
          _authorizedColumns.push({ ...column });
        }
      });
    }
    Logger.log("info", {
      message: "tableController:getAuthorizedColumnsForUpdate:params",
      params: {
        pm_user_id,
        table_name,
        _authorizedColumns,
      },
    });
    return res.json({
      success: true,
      columns: _authorizedColumns,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:getAuthorizedColumnsForUpdate:catch-1",
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
tableController.getAuthorizedColumnsForAdd = async (req, res) => {
  try {
    Logger.log("info", {
      message: "tableController:getAuthorizedColumnsForAdd:init",
    });
    const { pmUser, state } = req;
    const pm_user_id = pmUser.pm_user_id;
    const { table_name } = req.params;

    Logger.log("info", {
      message: "tableController:getAuthorizedColumnsForAdd:params",
      params: {
        pm_user_id,
        table_name,
      },
    });
    const _tableModel = dbModel.find(
      (datamodel) => datamodel.name === table_name
    );
    const _allColumns = _tableModel.fields;

    Logger.log("info", {
      message: "tableController:getAuthorizedColumnsForAdd:params",
      params: {
        pm_user_id,
        table_name,
        _allColumns,
      },
    });
    return res.json({
      success: true,
      columns: _allColumns,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:getAuthorizedColumnsForAdd:catch-1",
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
    const authorized_columns = state?.authorized_columns;
    const authorized_include_columns = state?.authorized_include_columns;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const { table_name } = req.params;
    const { page, page_size, q, sort } = req.query;
    let qJSON = q && q !== "" ? JSON.parse(q) : null;
    let sortJSON = sort && sort !== "" ? JSON.parse(sort) : null;

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
        sort,
        qJSON,
        sortJSON,
        table_name,
        authorized_rows,
        authorized_columns,
        authorized_include_columns,
        skip,
        take,
      },
    });

    const rows = await TableService.getTableRows({
      table_name,
      authorized_rows,
      authorized_columns,
      authorized_include_columns,
      qJSON,
      sortJSON,
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
    let qJSON = q && q !== "" ? JSON.parse(q) : null;

    Logger.log("info", {
      message: "tableController:getTableStatistics:params",
      params: {
        pm_user_id,
        q,
        qJSON,
        table_name,
        authorized_rows,
        authorized_columns,
      },
    });

    const { rowCount } = await TableService.getTableStatistics({
      table_name,
      authorized_rows,
      qJSON,
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
tableController.getRowByID = async (req, res) => {
  try {
    const { pmUser, state } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const { table_name, query } = req.params;
    const authorized_rows = state?.authorized_rows;
    const authorized_columns = state?.authorized_columns;
    const authorized_include_columns = state?.authorized_include_columns;

    Logger.log("info", {
      message: "tableController:getRowByID:params",
      params: { pm_user_id, table_name, query },
    });

    const row = await TableService.getTableRowByID({
      table_name,
      query: JSON.parse(query),
      authorized_rows,
      authorized_columns,
      authorized_include_columns,
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
    const authorized_rows = state?.authorized_rows;
    const authorized_columns = state?.authorized_columns;

    Logger.log("info", {
      message: "tableController:updateRowByID:params",
      params: { pm_user_id, table_name, query, body },
    });

    const updatedRow = await TableService.updateTableRowByID({
      table_name,
      query: JSON.parse(query),
      data: body,
      authorized_rows,
      authorized_columns,
    });

    Logger.log("info", {
      message: "tableController:updateRowByID:updatedRow",
      params: { pm_user_id, updatedRow },
    });

    return res.json({
      success: true,
      row: updatedRow,
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
tableController.addRowByID = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const { table_name } = req.params;

    Logger.log("info", {
      message: "tableController:addRowByID:params",
      params: { pm_user_id, table_name, body },
    });

    const addedRow = await TableService.addTableRow({ table_name, data: body });

    Logger.log("success", {
      message: "tableController:addRowByID:success",
      params: { pm_user_id, addedRow },
    });

    return res.json({
      success: true,
      row: addedRow,
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
      table_name,
      query: JSON.parse(query),
      authorized_rows,
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
      table_name,
      query: query,
      authorized_rows,
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
      table_name,
      query: query,
      authorized_rows,
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
