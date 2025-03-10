const express = require("express");
const router = express.Router({ mergeParams: true });
const { tenantRoleController } = require("./tenantRole.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// Role management routes
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:role:create"]),
  tenantRoleController.createRole
);
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:role:list"]),
  tenantRoleController.getAllTenantRoles
);
router.get(
  "/permissions",
  authMiddleware.checkUserPermissions(["tenant:permissions:list"]),
  tenantRoleController.getAllTenantPermissions
);
router.get(
  "/:roleID",
  authMiddleware.checkUserPermissions(["tenant:role:read"]),
  tenantRoleController.getTenantRoleByID
);
router.patch(
  "/:roleID",
  authMiddleware.checkUserPermissions(["tenant:role:update"]),
  tenantRoleController.updateTenantRoleByID
);
router.delete(
  "/:roleID",
  authMiddleware.checkUserPermissions(["tenant:role:delete"]),
  tenantRoleController.deleteTenantRoleByID
);

module.exports = router;
