const express = require("express");
const router = express.Router({ mergeParams: true });
const { tenantRoleController } = require("./tenantRole.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// Role management routes
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:role:list"]),
  tenantRoleController.getAllTenantRoles
);
router.post(
  "/",
  body("roleTitle").notEmpty().withMessage("roleTitle is required"),
  body("roleDescription").notEmpty().withMessage("roleDescription is required"),
  body("permissionIDs")
    .optional()
    .isArray()
    .withMessage("permissionIDs must be an array"),
  expressUtils.validationChecker,
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
  param("roleID").isNumeric().withMessage("roleID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:role:read"]),
  tenantRoleController.getTenantRoleByID
);
router.patch(
  "/:roleID",
  param("roleID").isNumeric().withMessage("roleID must be a number"),
  body("permissionIDs")
    .optional()
    .isArray()
    .withMessage("permissionIDs must be an array"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:role:update"]),
  tenantRoleController.updateTenantRoleByID
);
router.delete(
  "/:roleID",
  param("roleID").isNumeric().withMessage("roleID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:role:delete"]),
  tenantRoleController.deleteTenantRoleByID
);

module.exports = router;
