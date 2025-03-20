const express = require("express");
const router = express.Router({ mergeParams: true });
const { userManagementController } = require("./userManagement.controller");
const { userManagementMiddleware } = require("./userManagement.middleware");
const { authMiddleware } = require("../auth/auth.middleware");

// User management routes
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:user:list"]),
  userManagementController.getAllTenantUsers
);
router.get(
  "/:tenantUserID",
  authMiddleware.checkUserPermissions(["tenant:user:read"]),
  userManagementController.getTenantUserByID
);
router.delete(
  "/:tenantUserID",
  authMiddleware.checkUserPermissions(["tenant:user:delete"]),
  userManagementController.removeTenantUserFromTenantByID
);
router.patch(
  "/:tenantUserID/roles",
  authMiddleware.checkUserPermissions(["tenant:user:update"]),
  userManagementController.updateTenantUserRolesByID
);
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:user:create"]),
  userManagementMiddleware.checkTenantUserAdditionLimit,
  userManagementController.addUserToTenant
);

module.exports = router;
