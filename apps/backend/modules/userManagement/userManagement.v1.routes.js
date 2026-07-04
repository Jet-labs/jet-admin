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
const { P } = require("../../config/permissions");

// User management routes
router.get(
  "/",
  authMiddleware.authorize(P.user.list),
  userManagementController.getAllTenantUsers
);

router.get(
  "/:tenantUserID",
    validate(tenantUserIdParamSchema, "params"),
  authMiddleware.authorize({ ...P.user.read, paramKey: "tenantUserID" }),
  userManagementController.getTenantUserByID
);

router.delete(
  "/:tenantUserID",
    validate(tenantUserIdParamSchema, "params"),
  authMiddleware.authorize({ ...P.user.delete, paramKey: "tenantUserID" }),
  userManagementController.removeTenantUserFromTenantByID
);

router.patch(
  "/:tenantUserID/roles",
    validateAll({
        params: tenantUserIdParamSchema,
        body: updateUserRolesSchema,
    }),
  authMiddleware.authorize({ ...P.user.update, paramKey: "tenantUserID" }),
  userManagementController.updateTenantUserRolesByID
);

router.post(
  "/",
    validate(addUserToTenantSchema, "body"),
  authMiddleware.authorize(P.user.create),
  userManagementMiddleware.checkTenantUserAdditionLimit,
  userManagementController.addUserToTenant
);

module.exports = router;
