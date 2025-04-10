const express = require("express");
const router = express.Router({ mergeParams: true });
const { userManagementController } = require("./userManagement.controller");
const { userManagementMiddleware } = require("./userManagement.middleware");
const { authMiddleware } = require("../auth/auth.middleware");
const { param, body } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// User management routes
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:user:list"]),
  userManagementController.getAllTenantUsers
);
router.get(
  "/:tenantUserID",
  param("tenantUserID")
    .isNumeric()
    .withMessage("tenantUserID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:user:read"]),
  userManagementController.getTenantUserByID
);
router.delete(
  "/:tenantUserID",
  param("tenantUserID")
    .isNumeric()
    .withMessage("tenantUserID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:user:delete"]),
  userManagementController.removeTenantUserFromTenantByID
);
router.patch(
  "/:tenantUserID/roles",
  param("tenantUserID")
    .isNumeric()
    .withMessage("tenantUserID must be a number"),
  body("roleIDs").isArray().withMessage("roleIDs must be an array"),
  body("userTenantRelationship")
    .optional()
    .isString()
    .withMessage("userTenantRelationship must be a string"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:user:update"]),
  userManagementController.updateTenantUserRolesByID
);
router.post(
  "/",
  body("tenantUserEmail").notEmpty().withMessage("tenantUserEmail is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:user:create"]),
  userManagementMiddleware.checkTenantUserAdditionLimit,
  userManagementController.addUserToTenant
);

module.exports = router;
