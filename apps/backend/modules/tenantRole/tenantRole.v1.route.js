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
  authMiddleware.checkUserPermissions(["tenant:role:list"]),
  tenantRoleController.getAllTenantRoles
);

router.post(
  "/",
    validate(createRoleSchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:role:create"]),
  tenantRoleController.createRole
);

router.get(
  "/permissions",
  authMiddleware.checkUserPermissions(["tenant:permissions:list"]),
  tenantRoleController.getAllTenantPermissions
);

router.get(
  "/:roleID",
    validate(roleIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:role:read"]),
  tenantRoleController.getTenantRoleByID
);

router.patch(
  "/:roleID",
    validateAll({
        params: roleIdParamSchema,
        body: updateRoleSchema,
    }),
  authMiddleware.checkUserPermissions(["tenant:role:update"]),
  tenantRoleController.updateTenantRoleByID
);

router.delete(
  "/:roleID",
    validate(roleIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:role:delete"]),
  tenantRoleController.deleteTenantRoleByID
);

module.exports = router;
