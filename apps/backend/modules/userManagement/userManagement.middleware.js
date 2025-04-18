const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { tenantService } = require("../tenant/tenant.service");

const userManagementMiddleware = {};
// TODO: create middleware to check if the member to be promoted to owner is already a member of tenant
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
userManagementMiddleware.checkTenantUserAdditionLimit = async (
  req,
  res,
  next
) => {
  const userPlan = constants.SAMPLE_PLAN;
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "userManagementMiddleware:checkTenantUserAdditionLimit:params",
      params: { userID: user.userID, tenantID },
    });
    const currentTenantUserCount = await tenantService.getTenantUserCount({
      tenantID: parseInt(tenantID),
    });
    if (userPlan.maxMembersPerTenant > currentTenantUserCount) {
      Logger.log("success", {
        message:
          "userManagementMiddleware:checkTenantUserAdditionLimit:success",
        params: { userID: user.userID, tenantID, currentTenantUserCount },
      });
      return next();
    } else {
      Logger.log("error", {
        message: "userManagementMiddleware:checkTenantUserAdditionLimit:catch2",
        params: {
          tenantID,
          currentTenantUserCount,
          error: constants.ERROR_CODES.MEMBER_ADDITION_LIMIT_EXCEED,
        },
      });
      return res.json({
        error: constants.ERROR_CODES.MEMBER_ADDITION_LIMIT_EXCEED,
      });
    }
  } catch (error) {
    Logger.log("error", {
      message: "userManagementMiddleware:checkTenantUserAdditionLimit:catch-1",
      params: {
        error,
      },
    });
    return res.json({
      error,
    });
  }
};

module.exports = { userManagementMiddleware };
