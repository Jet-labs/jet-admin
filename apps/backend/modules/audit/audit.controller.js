const { auditService } = require("./audit.service");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");

const auditController = {};

auditController.getAuditLogsByTenantID = async (req, res) => {
  try {
    const { tenantID } = req.params;
    const { page = 1, pageSize = 20 } = req.query; // Get pagination from query params
    const take = pageSize ? parseInt(pageSize) : constants.ROW_PAGE_SIZE;
    const skip =
      page && parseInt(page) > 0 ? (parseInt(page) - 1) * take : undefined;
    Logger.log("info", {
      message: "auditController:getAuditLogsByTenantID:params",
      params: { tenantID, page, pageSize },
    });
    const {auditLogs, auditLogsCount } = await auditService.getAuditLogsByTenantID({
      tenantID,
      skip,
      take,
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
    });
  } catch (error) {
    Logger.log("error", {
      message: "auditController:getAuditLogsByTenantID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { auditController };

