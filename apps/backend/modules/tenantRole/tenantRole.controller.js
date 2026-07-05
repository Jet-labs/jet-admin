const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { tenantRoleService } =require("./tenantRole.service");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

const tenantRoleController = {};

/**
 * Create a new role.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
tenantRoleController.createRole = async (req, res) => {
  try {
    const { tenantID } = req.params;
    const { roleTitle, roleDescription, permissionIDs, assetPermissions } = req.body;
    Logger.log("info", {
      message: "tenantRoleController:createRole:params",
      params: { tenantID, roleTitle, roleDescription, permissionIDs, assetPermissions },
    });

    await tenantRoleService.createRole({
      tenantID: tenantID,
      roleTitle,
      roleDescription,
      permissionIDs,
      assetPermissions,
    });

    Logger.log("success", {
      message: "tenantRoleController:createRole:success",
      params: { tenantID, tenantID, roleTitle, roleDescription, permissionIDs },
    });

    return expressUtils.sendResponse(res, true, {}, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleController:createRole:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get all roles.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
tenantRoleController.getAllTenantRoles = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const authContext = getServiceAuthContext(req);
    Logger.log("info", {
      message: "tenantRoleController:getAllTenantRoles:params",
      params: { userID: user.userID, tenantID, authContext },
    });
    const roles = await tenantRoleService.getAllTenantRoles({
      userID: user.userID,
      tenantID: tenantID,
      authContext,
    });

    Logger.log("success", {
      message: "tenantRoleController:getAllTenantRoles:success",
      params: { rolesLength: roles?.length },
    });

    return expressUtils.sendResponse(res, true, { roles }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleController:getAllTenantRoles:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get all permissions.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
tenantRoleController.getAllTenantPermissions = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "tenantRoleController:getAllTenantPermissions:params",
      params: { userID: user.userID, tenantID },
    });
    const permissions = await tenantRoleService.getAllTenantPermissions({
      userID: user.userID,
      tenantID: tenantID,
    });

    Logger.log("success", {
      message: "tenantRoleController:getAllTenantPermissions:success",
      params: { permissionsLength: permissions?.length },
    });

    return expressUtils.sendResponse(res, true, { permissions }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleController:getAllTenantPermissions:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Get a role by ID.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
tenantRoleController.getTenantRoleByID = async (req, res) => {
  try {
    const { roleID } = req.params;

    Logger.log("info", {
      message: "tenantRoleController:getTenantRoleByID:params",
      params: { roleID },
    });

    const role = await tenantRoleService.getTenantRoleByID(roleID);

    if (!role) {
      return expressUtils.sendResponse(res, false, {}, "Role not found", constants.HTTP_STATUS.BAD_REQUEST);
    }

    Logger.log("success", {
      message: "tenantRoleController:getTenantRoleByID:success",
      params: { roleID },
    });

    return expressUtils.sendResponse(res, true, { role }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleController:getTenantRoleByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Update a role.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
tenantRoleController.updateTenantRoleByID = async (req, res) => {
  try {
    const { tenantID, roleID } = req.params;
    const { roleTitle, roleDescription, permissionIDs, assetPermissions } = req.body;

    Logger.log("info", {
      message: "tenantRoleController:updateTenantRoleByID:params",
      params: { tenantID, roleID, roleTitle, roleDescription, permissionIDs, assetPermissions },
    });

    await tenantRoleService.updateTenantRoleByID({
      tenantID: tenantID,
      roleID: roleID,
      roleTitle,
      roleDescription,
      permissionIDs,
      assetPermissions,
    });

    Logger.log("success", {
      message: "tenantRoleController:updateTenantRoleByID:success",
      params: { tenantID, roleID },
    });

    return expressUtils.sendResponse(res, true, {}, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleController:updateTenantRoleByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Delete a role.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<void>}
 */
tenantRoleController.deleteTenantRoleByID = async (req, res) => {
  try {
    const { tenantID, roleID } = req.params;

    Logger.log("info", {
      message: "tenantRoleController:deleteTenantRoleByID:params",
      params: { roleID },
    });

    const deletedRole = await tenantRoleService.deleteTenantRoleByID({
      tenantID: tenantID,
      roleID: roleID,
    });

    if (!deletedRole) {
      return expressUtils.sendResponse(res, false, {}, "Role not found", constants.HTTP_STATUS.BAD_REQUEST);
    }

    Logger.log("success", {
      message: "tenantRoleController:deleteTenantRoleByID:success",
      params: { roleID },
    });

    return expressUtils.sendResponse(res, true, { role: deletedRole }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleController:deleteTenantRoleByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Re-sync all Casbin policies for all roles.
 * Useful after PERMISSION_MAP changes or if the casbin_rule table gets stale.
 *
 * POST /api/v1/tenants/:tenantID/roles/sync-policies
 */
tenantRoleController.syncPolicies = async (req, res) => {
  try {
    const { tenantID } = req.params;
    Logger.log("info", {
      message: "tenantRoleController:syncPolicies:params",
      params: { tenantID },
    });

    await tenantRoleService.syncAllRolePolicies();

    Logger.log("success", {
      message: "tenantRoleController:syncPolicies:success",
      params: { tenantID },
    });

    return expressUtils.sendResponse(res, true, { message: "Casbin policies re-synced successfully." }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleController:syncPolicies:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = {tenantRoleController}
