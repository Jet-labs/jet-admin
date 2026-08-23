const { auditService } = require("./audit.service");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const constants = require("../../constants");

const auditController = {};

auditController.getAuditLogsByTenantID = async (req, res) => {
  try {
    const { tenantID } = req.params;
    const { page = 1, pageSize = 20, dateFrom, dateTo } = req.query; // Get pagination & filters from query params
    const take = pageSize ? parseInt(pageSize) : constants.ROW_PAGE_SIZE;
    const skip =
      page && parseInt(page) > 0 ? (parseInt(page) - 1) * take : undefined;
    Logger.log("info", {
      message: "auditController:getAuditLogsByTenantID:params",
      params: { tenantID, page, pageSize, dateFrom, dateTo },
    });
    const {auditLogs, auditLogsCount } = await auditService.getAuditLogsByTenantID({
      tenantID,
      skip,
      take,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    Logger.log("info", {
      message: "auditController:getAuditLogsByTenantID:auditLogs",
      auditLogs,
      auditLogsCount,
    });
    return expressUtils.sendResponse(res, true, {
      auditLogs,
      nextPage:
        auditLogs?.length < take ? null : Math.floor((skip + take) / take) + 1,
      auditLogsCount,
    }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "auditController:getAuditLogsByTenantID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

auditController.exportAuditLogsCSV = async (req, res) => {
  try {
    const { tenantID } = req.params;
    const { dateFrom, dateTo } = req.query;
    Logger.log("info", {
      message: "auditController:exportAuditLogsCSV:params",
      params: { tenantID, dateFrom, dateTo },
    });

    const csv = await auditService.exportAuditLogsCSV({
      tenantID: parseInt(tenantID),
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `audit-logs-${tenantID}-${timestamp}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (error) {
    Logger.log("error", {
      message: "auditController:exportAuditLogsCSV:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = { auditController };

