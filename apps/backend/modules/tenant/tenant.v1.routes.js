const express = require("express");
const router = express.Router({ mergeParams: true });
const { tenantController } = require("./tenant.controller");
const { tenantMiddleware } = require("./tenant.middleware");
const { authMiddleware } = require("../auth/auth.middleware");
let databaseRouter,
  userManagementRouter,
  tenantRoleRouter,
  auditLogRouter,
  aiRouter;
const { isModuleEnabled } = require("../../config/module.config");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
if (isModuleEnabled(constants.MODULES.DATABASE)) {
  Logger.log("success", {
    message: `${constants.MODULES.DATABASE} module imported`,
  });
  databaseRouter = require("../database/database.v1.routes");
}
if (isModuleEnabled(constants.MODULES.USERMANAGEMENT)) {
  Logger.log("success", {
    message: `${constants.MODULES.USERMANAGEMENT} module imported`,
  });
  userManagementRouter = require("../userManagement/userManagement.v1.route");
}
if (isModuleEnabled(constants.MODULES.ROLE)) {
  Logger.log("success", {
    message: `${constants.MODULES.ROLE} module imported`,
  });
  tenantRoleRouter = require("../tenantRole/tenantRole.v1.route");
}
if (isModuleEnabled(constants.MODULES.AI)) {
  Logger.log("success", {
    message: `${constants.MODULES.AI} module imported`,
  });
  aiRouter = require("../ai/ai.v1.routes");
}
auditLogRouter = require("../audit/audit.v1.routes");

const { param, body } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");
const { auditLogMiddleware } = require("../audit/audit.middleware");

// Tenant routes
router.use(authMiddleware.authProvider);

router.use(auditLogMiddleware.audit);

router.get("/", tenantController.getAllUserTenants);

router.get(
  "/:tenantID",
  param("tenantID").isUUID().withMessage("tenantID must be a uuid"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:read"]),
  tenantMiddleware.poolProvider,
  tenantController.getUserTenantByID
);

router.delete(
  "/:tenantID",
  param("tenantID").isUUID().withMessage("tenantID must be a uuid"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:delete"]),
  tenantMiddleware.poolProvider,
  tenantController.deleteUserTenantByID
);

router.post(
  "/",
  body("tenantTitle").notEmpty().withMessage("tenantTitle is required"),
  body("tenantDBURL").notEmpty().withMessage("tenantDBURL is required"),

  expressUtils.validationChecker,
  tenantMiddleware.checkTenantCreationLimit,
  tenantController.createNewTenant
);

router.patch("/dbtest", tenantController.testTenantDatabaseConnection);

router.patch(
  "/:tenantID",
  param("tenantID").isUUID().withMessage("tenantID must be a uuid"),
  body("tenantTitle").notEmpty().withMessage("tenantTitle is required"),
  body("tenantDBURL").notEmpty().withMessage("tenantDBURL is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:update"]),
  tenantController.updateTenant
);

// Nested AI routes
if (isModuleEnabled(constants.MODULES.AI)) {
  Logger.log("success", { message: `${constants.MODULES.AI} module enabled` });
  router.use(
    "/:tenantID/ai",
    param("tenantID").isUUID().withMessage("tenantID must be a uuid"),
    authMiddleware.checkUserPermissions(["tenant:ai"]),
    tenantMiddleware.poolProvider,
    aiRouter
  );
}

// Nested database routes
if (isModuleEnabled(constants.MODULES.DATABASE)) {
  Logger.log("success", {
    message: `${constants.MODULES.DATABASE} module enabled`,
  });
  router.use(
    "/:tenantID/database",
    param("tenantID").isUUID().withMessage("tenantID must be a uuid"),
    expressUtils.validationChecker,
    authMiddleware.checkUserPermissions(["tenant:database"]),
    tenantMiddleware.poolProvider,
    databaseRouter
  );
}
// Nested user management routes
if (isModuleEnabled(constants.MODULES.USERMANAGEMENT)) {
  Logger.log("success", {
    message: `${constants.MODULES.USERMANAGEMENT} module enabled`,
  });
  router.use(
    "/:tenantID/users",
    param("tenantID").isUUID().withMessage("tenantID must be a uuid"),
    authMiddleware.checkUserPermissions(["tenant:user"]),
    userManagementRouter
  );
}

// Nested user management routes
if (isModuleEnabled(constants.MODULES.ROLE)) {
  Logger.log("success", {
    message: `${constants.MODULES.ROLE} module enabled`,
  });
  router.use(
    "/:tenantID/roles",
    param("tenantID").isUUID().withMessage("tenantID must be a uuid"),
    authMiddleware.checkUserPermissions(["tenant:role"]),
    tenantRoleRouter
  );
}


// Nested audit log routes
router.use(
  "/:tenantID/audit",
  param("tenantID").isUUID().withMessage("tenantID must be a uuid"),
  authMiddleware.checkUserPermissions(["tenant:audit"]),
  auditLogRouter
);


module.exports = router;
