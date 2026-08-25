/**
 * OperatorAdmin Controller
 *
 * Control-plane surface for the platform admin console. Roles, permissions
 * and the widget library are treated as deployment-global registries here —
 * no tenant domain is required (or accepted) on this surface. Delegates to
 * the same domain services the tenant APIs use, guarded by operator sessions
 * instead of Firebase users + Casbin checks. The operator identity is logged
 * on every mutating action for traceability.
 */
const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { tenantRoleService } = require("../tenantRole/tenantRole.service");
const { widgetLibraryService } = require("../widgetLibrary/widgetLibrary.service");

const operatorAdminController = {};

// ─── Roles & Permissions ──────────────────────────────────────────────────

/**
 * GET /api/v1/operator/roles — the full role registry (global + tenant roles).
 */
operatorAdminController.listRoles = async (req, res) => {
  try {
    const roles = await tenantRoleService.getAllTenantRoles({});
    return expressUtils.sendResponse(res, true, { roles }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "operatorAdminController:listRoles:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * POST /api/v1/operator/roles — creates a GLOBAL role.
 */
operatorAdminController.createRole = async (req, res) => {
  try {
    const { roleTitle, roleDescription, permissionIDs, assetPermissions } = req.body;
    Logger.log("info", {
      message: "operatorAdminController:createRole:params",
      params: { operatorID: req.operator.operatorID, roleTitle },
    });

    await tenantRoleService.createRole({
      roleTitle,
      roleDescription,
      permissionIDs,
      assetPermissions,
    });

    return expressUtils.sendResponse(res, true, {}, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "operatorAdminController:createRole:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * PATCH /api/v1/operator/roles/:roleID
 */
operatorAdminController.updateRole = async (req, res) => {
  try {
    const { roleID } = req.params;
    const { roleTitle, roleDescription, permissionIDs, assetPermissions } = req.body;
    Logger.log("info", {
      message: "operatorAdminController:updateRole:params",
      params: { operatorID: req.operator.operatorID, roleID },
    });

    await tenantRoleService.updateTenantRoleByID({
      roleID,
      roleTitle,
      roleDescription,
      permissionIDs,
      assetPermissions,
    });

    return expressUtils.sendResponse(res, true, {}, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "operatorAdminController:updateRole:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * DELETE /api/v1/operator/roles/:roleID
 */
operatorAdminController.deleteRole = async (req, res) => {
  try {
    const { roleID } = req.params;
    Logger.log("info", {
      message: "operatorAdminController:deleteRole:params",
      params: { operatorID: req.operator.operatorID, roleID },
    });

    await tenantRoleService.deleteTenantRoleByID({ roleID });

    return expressUtils.sendResponse(res, true, {}, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "operatorAdminController:deleteRole:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * GET /api/v1/operator/permissions
 */
operatorAdminController.listPermissions = async (req, res) => {
  try {
    const permissions = await tenantRoleService.getAllTenantPermissions({});
    return expressUtils.sendResponse(res, true, { permissions }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "operatorAdminController:listPermissions:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * POST /api/v1/operator/permissions
 *
 * Manually register a permission in tblPermissions (recovery path for
 * missed seeds / future APIs). Optionally maps it onto the global ADMIN
 * role and resyncs Casbin policies.
 */
operatorAdminController.createPermission = async (req, res) => {
  try {
    const { permissionTitle, permissionDescription, mapToAdmin } = req.body;
    Logger.log("info", {
      message: "operatorAdminController:createPermission:params",
      params: { operatorID: req.operator.operatorID, permissionTitle },
    });

    const result = await tenantRoleService.createPermission({
      permissionTitle,
      permissionDescription,
      mapToAdmin,
    });

    return expressUtils.sendResponse(res, true, result, null, constants.HTTP_STATUS.CREATED);
  } catch (error) {
    Logger.log("error", {
      message: "operatorAdminController:createPermission:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

// ─── Shared Widget Library ───────────────────────────────────────────────

/**
 * GET /api/v1/operator/widget-library
 */
operatorAdminController.listLibraryWidgets = async (req, res) => {
  try {
    const { search, page, pageSize } = req.query;
    const { entries } = await widgetLibraryService.listPublishedWidgets({
      search,
      page,
      pageSize,
    });
    return expressUtils.sendResponse(res, true, { entries }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "operatorAdminController:listLibraryWidgets:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * POST /api/v1/operator/widget-library
 *
 * publishedByUserID stays null here — the publisher is an operator, not a
 * user. The operatorID is captured in the logs above.
 */
operatorAdminController.publishWidget = async (req, res) => {
  try {
    const { bundle } = req.body;
    Logger.log("info", {
      message: "operatorAdminController:publishWidget:params",
      params: { operatorID: req.operator.operatorID },
    });

    const entry = await widgetLibraryService.publishWidget({ bundle });

    return expressUtils.sendResponse(
      res,
      true,
      { entry: { libraryEntryID: entry.libraryEntryID } },
      null,
      constants.HTTP_STATUS.CREATED
    );
  } catch (error) {
    Logger.log("error", {
      message: "operatorAdminController:publishWidget:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * DELETE /api/v1/operator/widget-library/:libraryEntryID
 */
operatorAdminController.unpublishWidget = async (req, res) => {
  try {
    const { libraryEntryID } = req.params;
    Logger.log("info", {
      message: "operatorAdminController:unpublishWidget:params",
      params: { operatorID: req.operator.operatorID, libraryEntryID },
    });

    await widgetLibraryService.unpublishWidget({ libraryEntryID });

    return expressUtils.sendResponse(res, true, {}, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "operatorAdminController:unpublishWidget:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = { operatorAdminController };
