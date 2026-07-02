const express = require("express");
const router = express.Router({ mergeParams: true });
const { tenantRoleController } = require("./tenantRole.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
    createRoleSchema,
    updateRoleSchema,
    roleIdParamSchema,
} = require("./tenantRole.validator");

// Role management routes
router.get(
  "/",
  authMiddleware.authorize("role", "list"),
  tenantRoleController.getAllTenantRoles
);

router.post(
  "/",
    validate(createRoleSchema, "body"),
  authMiddleware.authorize("role", "create"),
  tenantRoleController.createRole
);

router.get(
  "/permissions",
  authMiddleware.authorize("permission", "list"),
  tenantRoleController.getAllTenantPermissions
);

router.get(
  "/:roleID",
    validate(roleIdParamSchema, "params"),
  authMiddleware.authorize("role", "read", { paramKey: "roleID" }),
  tenantRoleController.getTenantRoleByID
);

router.patch(
  "/:roleID",
    validateAll({
        params: roleIdParamSchema,
        body: updateRoleSchema,
    }),
  authMiddleware.authorize("role", "update", { paramKey: "roleID" }),
  tenantRoleController.updateTenantRoleByID
);

router.delete(
  "/:roleID",
    validate(roleIdParamSchema, "params"),
  authMiddleware.authorize("role", "delete", { paramKey: "roleID" }),
  tenantRoleController.deleteTenantRoleByID
);

// Re-sync all Casbin policies from DB for all roles in this tenant.
// Use after PERMISSION_MAP changes or if casbin_rule table gets stale.
router.post(
  "/sync-policies",
  authMiddleware.authorize("role", "update"),
  tenantRoleController.syncPolicies
);

module.exports = router;
