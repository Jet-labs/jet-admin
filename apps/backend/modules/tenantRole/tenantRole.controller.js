const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { tenantRoleService } =require("./tenantRole.service");

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
    const { roleTitle, roleDescription, permissionIDs } = req.body;
    Logger.log("info", {
      message: "tenantRoleController:createRole:params",
      params: { tenantID, roleTitle, roleDescription, permissionIDs },
    });

    await tenantRoleService.createRole({
      tenantID: parseInt(tenantID),
      roleTitle,
      roleDescription,
      permissionIDs,
    });

    Logger.log("success", {
      message: "tenantRoleController:createRole:success",
      params: { tenantID, tenantID, roleTitle, roleDescription, permissionIDs },
    });

    return expressUtils.sendResponse(res, true, {});
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleController:createRole:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
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
    Logger.log("info", {
      message: "tenantRoleController:getAllTenantRoles:params",
      params: { userID: user.userID, tenantID },
    });
    const roles = await tenantRoleService.getAllTenantRoles({
      userID: parseInt(user.userID),
      tenantID: parseInt(tenantID),
    });

    Logger.log("success", {
      message: "tenantRoleController:getAllTenantRoles:success",
      params: { rolesLength: roles?.length },
    });

    return expressUtils.sendResponse(res, true, { roles });
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleController:getAllTenantRoles:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
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
      userID: parseInt(user.userID),
      tenantID: parseInt(tenantID),
    });

    Logger.log("success", {
      message: "tenantRoleController:getAllTenantPermissions:success",
      params: { permissionsLength: permissions?.length },
    });

    return expressUtils.sendResponse(res, true, { permissions });
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleController:getAllTenantPermissions:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
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

    const role = await tenantRoleService.getTenantRoleByID(parseInt(roleID));

    if (!role) {
      return expressUtils.sendResponse(res, false, {}, "Role not found");
    }

    Logger.log("success", {
      message: "tenantRoleController:getTenantRoleByID:success",
      params: { roleID },
    });

    return expressUtils.sendResponse(res, true, { role });
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleController:getTenantRoleByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
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
    const { roleTitle, roleDescription, permissionIDs } = req.body;

    Logger.log("info", {
      message: "tenantRoleController:updateTenantRoleByID:params",
      params: { tenantID, roleID, roleTitle, roleDescription, permissionIDs },
    });

    await tenantRoleService.updateTenantRoleByID({
      tenantID: parseInt(tenantID),
      roleID: parseInt(roleID),
      roleTitle,
      roleDescription,
      permissionIDs,
    });

    Logger.log("success", {
      message: "tenantRoleController:updateTenantRoleByID:success",
      params: { tenantID, roleID },
    });

    return expressUtils.sendResponse(res, true, {});
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleController:updateTenantRoleByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
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
      tenantID: parseInt(tenantID),
      roleID: parseInt(roleID),
    });

    if (!deletedRole) {
      return expressUtils.sendResponse(res, false, {}, "Role not found");
    }

    Logger.log("success", {
      message: "tenantRoleController:deleteTenantRoleByID:success",
      params: { roleID },
    });

    return expressUtils.sendResponse(res, true, { role: deletedRole });
  } catch (error) {
    Logger.log("error", {
      message: "tenantRoleController:deleteTenantRoleByID:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = {tenantRoleController}
