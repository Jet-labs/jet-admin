const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { authService } = require("../auth/auth.service");
const { userManagementService } = require("./userManagement.service");

const userManagementController = {};

/**
 * Helper function to parse query parameters for pagination, filtering, and ordering.
 * @param {object} query - Request query object.
 * @returns {object} - Parsed parameters.
 */
const parseUserManagementQueryParams = (query) => {
  const { page = 1, pageSize = 10, q, order } = query;

  //   const filter =
  //     q && q !== "" && q !== "null" && q !== "undefined"
  //       ? postgreSQLParserUtil.generateFilterQuery(JSON.parse(q))
  //       : null;

  const orderBy =
    order && order !== "" && order !== "null" && order !== "undefined"
      ? String(order)
      : null;

  const take = !(
    pageSize == null ||
    pageSize == undefined ||
    pageSize == "null" ||
    pageSize == "undefined"
  )
    ? parseInt(pageSize)
    : constants.ROW_PAGE_SIZE;
  const skip =
    !(
      page == null ||
      page == undefined ||
      page == "null" ||
      page == "undefined"
    ) && parseInt(page) > 0
      ? (parseInt(page) - 1) * take
      : 0;

  return { skip, take };
};
/**
 * Retrieves a target user's details by their ID, scoped to a specific tenant.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
userManagementController.getAllTenantUsers = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { skip, take } = parseUserManagementQueryParams(req.query);

    Logger.log("info", {
      message: "userManagementController:getAllTenantUsers:params",
      params: { userID: user.userID, tenantID, skip, take },
    });

    const users = await userManagementService.getAllTenantUsers({
      userID: parseInt(user.userID),
      tenantID: parseInt(tenantID),
      skip,
      take,
    });

    Logger.log("success", {
      message: "userManagementController:getAllTenantUsers:success",
      params: { userID: user.userID, tenantID },
    });

    return expressUtils.sendResponse(res, true, {
      users,
      nextPage:
        users?.length < take ? null : Math.floor((skip + take) / take) + 1,
    });
  } catch (error) {
    Logger.log("error", {
      message: "userManagementController:getAllTenantUsers:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Retrieves a target user's details by their ID, scoped to a specific tenant.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
userManagementController.getTenantUserByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, tenantUserID } = req.params;

    Logger.log("info", {
      message: "userManagementController:getTenantUserByID:params",
      params: { userID: user.userID, tenantID, tenantUserID },
    });

    const userDetails = await userManagementService.getTenantUserByID({
      userID: parseInt(user.userID),
      tenantUserID: parseInt(tenantUserID),
      tenantID: parseInt(tenantID),
    });

    Logger.log("success", {
      message: "userManagementController:getTenantUserByID:success",
      params: { userID: user.userID, tenantID, tenantUserID },
    });

    return expressUtils.sendResponse(res, true, {
      user: userDetails,
    });
  } catch (error) {
    Logger.log("error", {
      message: "userManagementController:getTenantUserByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
userManagementController.addUserToTenant = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { tenantUserEmail } = req.body;
    Logger.log("info", {
      message: "userManagementController:addUserToTenant:params",
      params: { userID: user.userID, tenantID, tenantUserEmail },
    });
    const tenantUser = await authService.getUserFromEmailID({
      email: tenantUserEmail,
    });
    const newUserTenantRelationship =
      await userManagementService.addUserToTenant({
        userID: parseInt(user.userID),
        tenantID: parseInt(tenantID),
        tenantUserID: tenantUser.userID,
      });
    Logger.log("success", {
      message:
        "userManagementController:addUserToTenant:newUserTenantRelationship",
      params: {
        userID: user.userID,
        tenantID,
        tenantUserEmail,
        newUserTenantRelationship,
      },
    });
    return expressUtils.sendResponse(res, true, {});
  } catch (error) {
    Logger.log("error", {
      message: "userManagementController:addUserToTenant:catch1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Updates a user's roles and details within a specific tenant.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
userManagementController.updateTenantUserRolesByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, tenantUserID } = req.params;
    const { roleIDs, userTenantRelationship } = req.body;

    Logger.log("info", {
      message: "userManagementController:updateTenantUserRolesByID:params",
      params: {
        userID: user.userID,
        tenantID,
        tenantUserID,
        roleIDs,
        userTenantRelationship,
      },
    });

    await userManagementService.updateTenantUserRolesByID({
      userID: parseInt(user.userID),
      tenantUserID: parseInt(tenantUserID),
      tenantID: parseInt(tenantID),
      roleIDs: roleIDs.map((id) => parseInt(id)),
      userTenantRelationship,
    });

    Logger.log("success", {
      message: "userManagementController:updateTenantUserRolesByID:success",
      params: {
        userID: user.userID,
        tenantID,
        tenantUserID,
        userTenantRelationship,
      },
    });

    return expressUtils.sendResponse(res, true, {
      message: "User roles and details updated successfully",
    });
  } catch (error) {
    Logger.log("error", {
      message: "userManagementController:updateTenantUserRolesByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

/**
 * Updates a user's roles and details within a specific tenant.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
userManagementController.removeTenantUserFromTenantByID = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID, tenantUserID } = req.params;

    Logger.log("info", {
      message: "userManagementController:removeTenantUserFromTenantByID:params",
      params: {
        userID: user.userID,
        tenantID,
        tenantUserID,
      },
    });

    await userManagementService.removeTenantUserFromTenantByID({
      userID: parseInt(user.userID),
      tenantUserID: parseInt(tenantUserID),
      tenantID: parseInt(tenantID),
    });

    Logger.log("success", {
      message:
        "userManagementController:removeTenantUserFromTenantByID:success",
      params: { userID: user.userID, tenantID, tenantUserID },
    });

    return expressUtils.sendResponse(res, true, {
      message: "User roles and details updated successfully",
    });
  } catch (error) {
    Logger.log("error", {
      message:
        "userManagementController:removeTenantUserFromTenantByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = {userManagementController}