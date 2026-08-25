/**
 * OperatorAdmin Routes (v1)
 *
 * Control-plane surface for the platform admin console, mounted at
 * /api/v1/operator. Roles, permissions and the widget library are treated
 * as deployment-global registries — no tenant domain in any path. Every
 * route requires a valid operator session; there is deliberately NO Casbin
 * enforcement here — operator status is the grant.
 *
 * GET    /roles                          — full role registry
 * POST   /roles                          — create a global role
 * PATCH  /roles/:roleID                  — update any role
 * DELETE /roles/:roleID                  — delete any role
 * GET    /permissions                    — permission registry
 * POST   /permissions                    — register a permission manually
 * GET    /widget-library                 — list published widgets
 * POST   /widget-library                 — publish a widget bundle
 * DELETE /widget-library/:libraryEntryID — unpublish
 */
const express = require("express");
const { operatorAdminController } = require("./operatorAdmin.controller");
const { operatorAuthMiddleware } = require("../operatorAuth/operatorAuth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
  createRoleSchema,
  updateRoleSchema,
  roleIdParamSchema,
  createPermissionSchema,
} = require("../tenantRole/tenantRole.validator");
const {
  publishWidgetSchema,
  libraryEntryIdParamSchema,
  listWidgetsQuerySchema,
} = require("../widgetLibrary/widgetLibrary.validator");

const router = express.Router();

// Every route below requires an operator session.
router.use(operatorAuthMiddleware.requireOperator);

// ─── Roles & Permissions ──────────────────────────────────────────────────

router.get("/roles", operatorAdminController.listRoles);

router.post(
  "/roles",
  validate(createRoleSchema, "body"),
  operatorAdminController.createRole
);

router.patch(
  "/roles/:roleID",
  validateAll({
    params: roleIdParamSchema,
    body: updateRoleSchema,
  }),
  operatorAdminController.updateRole
);

router.delete(
  "/roles/:roleID",
  validate(roleIdParamSchema, "params"),
  operatorAdminController.deleteRole
);

router.get("/permissions", operatorAdminController.listPermissions);

router.post(
  "/permissions",
  validate(createPermissionSchema, "body"),
  operatorAdminController.createPermission
);

// ─── Shared Widget Library ───────────────────────────────────────────────

router.get(
  "/widget-library",
  validate(listWidgetsQuerySchema, "query"),
  operatorAdminController.listLibraryWidgets
);

router.post(
  "/widget-library",
  validate(publishWidgetSchema, "body"),
  operatorAdminController.publishWidget
);

router.delete(
  "/widget-library/:libraryEntryID",
  validate(libraryEntryIdParamSchema, "params"),
  operatorAdminController.unpublishWidget
);

module.exports = router;
