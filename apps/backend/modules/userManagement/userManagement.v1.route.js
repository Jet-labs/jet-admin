const express = require("express");
const router = express.Router({ mergeParams: true });
const { userManagementController } = require("./userManagement.controller");
const { userManagementMiddleware } = require("./userManagement.middleware");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
    addUserToTenantSchema,
    updateUserRolesSchema,
    tenantUserIdParamSchema,
} = require("./userManagement.validator");

// User management routes
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:user:list"]),
  userManagementController.getAllTenantUsers
);

router.get(
  "/:tenantUserID",
    validate(tenantUserIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:user:read"]),
  userManagementController.getTenantUserByID
);

router.delete(
  "/:tenantUserID",
    validate(tenantUserIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:user:delete"]),
  userManagementController.removeTenantUserFromTenantByID
);

router.patch(
  "/:tenantUserID/roles",
    validateAll({
        params: tenantUserIdParamSchema,
        body: updateUserRolesSchema,
    }),
  authMiddleware.checkUserPermissions(["tenant:user:update"]),
  userManagementController.updateTenantUserRolesByID
);

router.post(
  "/",
    validate(addUserToTenantSchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:user:create"]),
  userManagementMiddleware.checkTenantUserAdditionLimit,
  userManagementController.addUserToTenant
);

module.exports = router;
