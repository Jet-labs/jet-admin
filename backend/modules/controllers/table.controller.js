const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
const { TableService } = require("../services/table.services");

const tableController = {};

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
    const { page, q, sort } = req.query;
    let qJSON = q && q !== "" ? JSON.parse(q) : null;
    let sortJSON = sort && sort !== "" ? JSON.parse(sort) : null;

    let skip = 0;
    let take = constants.ROW_PAGE_SIZE;
    if (parseInt(page) >= 0) {
      skip = (parseInt(page) - 1) * constants.ROW_PAGE_SIZE;
      take = constants.ROW_PAGE_SIZE;
    } else {
      skip = undefined;
      take = undefined;
    }
    Logger.log("info", {
      message: "tableController:getAllRows:params",
      params: {
        pm_user_id,
        page,
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
        rowsLength: rows.length,
      },
    });
    return res.json({
      success: true,
      rows,
      nextPage:
        rows?.length < constants.ROW_PAGE_SIZE ? null : parseInt(page) + 1,
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
