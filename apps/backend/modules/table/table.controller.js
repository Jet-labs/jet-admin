const { prisma, dbModel } = require("../../config/prisma");
const constants = require("../../constants");
const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
const { policyUtils } = require("../../utils/policy.utils");
const { TableService } = require("./table.services");

const tableController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
tableController.runSchemaQuery = async (req, res) => {
  try {
    Logger.log("info", {
      message: "tableController:runSchemaQuery:init",
    });
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorization_policy = state.authorization_policy;

    Logger.log("info", {
      message: "tableController:runSchemaQuery:params",
      params: {
        pm_user_id,
      },
    });
    const result = await TableService.runSchemaQuery({
      schemaQuery: body.schema_query,
    });
    Logger.log("info", {
      message: "tableController:runSchemaQuery:rows",
      params: {
        pm_user_id,
      },
    });
    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:runSchemaQuery:catch-1",
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
      policyUtils.extractAuthorizedColumnsForReadFromPolicyObject({
        policyObject: state.authorization_policy,
        tableName: table_name,
      });
    const authorized_include_columns =
      policyUtils.extractAuthorizedIncludeColumnsForReadFromPolicyObject({
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
      policyUtils.extractAuthorizedColumnsForEditFromPolicyObject({
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
tableController.downloadData = async () => {
  Logger.log("info", { message: "tableController:downloadData:start" });
  try {
    const { pmUser, state } = req;
    const authorized_rows = state?.authorized_rows;
    const authorized_columns = state?.authorized_columns;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const { table_name } = req.params;
    const { max_records, q } = req.query;
    let qJSON = q && q !== "" ? JSON.parse(q) : null;
    let take = parseInt(max_records);

    Logger.log("info", {
      message: "tableController:getAllRows:params",
      params: {
        pm_user_id,
        take,
        q,
        qJSON,
        table_name,
        authorized_rows,
        authorized_columns,
      },
    });

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
      message: "tableController:getAllRows:calculated",
      params: {
        pm_user_id,
        authorized_rows,
        columns,
      },
    });
    switch (table_name) {
      default:
        rows = qJSON
          ? await prisma[table_name].findMany({
              where:
                authorized_rows === true
                  ? qJSON
                  : authorized_rows === false
                  ? {}
                  : {
                      AND: [{ ...qJSON }, authorized_rows],
                    },
              skip: 0,
              take: take,

              select: authorized_columns == true ? null : columns,
            })
          : await prisma[table_name].findMany({
              where:
                authorized_rows === true
                  ? {}
                  : authorized_rows === false
                  ? {}
                  : authorized_rows,
              skip: 0,
              take: take,

              select: authorized_columns == true ? null : columns,
            });
    }

    const invoice = await ReportService.generateInvoiceFromMasterID({
      masterID: parseInt(master_id),
      userID: parseInt(user.user_id),
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${master_id}_invoice.pdf`
    );
    invoice.pipe(res);
  } catch (error) {
    Logger.log("error", {
      message: "tableController:downloadData:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = tableController;
