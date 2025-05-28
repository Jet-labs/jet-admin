const express = require("express");
const router = express.Router({ mergeParams: true });
const { tenantController } = require("./tenant.controller");
const { tenantMiddleware } = require("./tenant.middleware");
const { authMiddleware } = require("../auth/auth.middleware");
const databaseRouter = require("../database/database.v1.routes");
const datasourceRouter = require("../datasource/datasource.v1.routes");
const dataQueryRouter = require("../dataQuery/dataQuery.v1.routes");
const widgetRouter = require("../widget/widget.v1.routes");
const databaseDashboardRouter = require("../databaseDashboard/databaseDashboard.v1.routes");
const userManagementRouter = require("../userManagement/userManagement.v1.route");
const tenantRoleRouter = require("../tenantRole/tenantRole.v1.route");
const tenantAPIKeyRouter = require("../apiKey/apiKey.v1.routes");
const cronjobRouter = require("../cronJob/cronJob.v1.routes");
const auditLogRouter = require("../audit/audit.v1.routes");
const { param, body } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");
const constants = require("../../constants");
const { auditLogMiddleware } = require("../audit/audit.middleware");

// Tenant routes
router.use(authMiddleware.authProvider);

router.use(auditLogMiddleware.audit);

router.get("/", tenantController.getAllUserTenants);

router.get(
  "/:tenantID",
  param("tenantID").isNumeric().withMessage("tenantID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:read"]),
  tenantMiddleware.poolProvider,
  tenantController.getUserTenantByID
);

router.delete(
  "/:tenantID",
  param("tenantID").isNumeric().withMessage("tenantID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:delete"]),
  tenantMiddleware.poolProvider,
  tenantController.deleteUserTenantByID
);

router.post(
  "/",
  body("tenantName").notEmpty().withMessage("tenantName is required"),
  body("tenantDBURL").notEmpty().withMessage("tenantDBURL is required"),
  body("tenantDBType")
    .isIn(Object.keys(constants.SUPPORTED_DATABASES))
    .withMessage(
      `tenantDBType must be one of: ${Object.keys(
        constants.SUPPORTED_DATABASES
      ).join(", ")}`
    ),
  expressUtils.validationChecker,
  tenantMiddleware.checkTenantCreationLimit,
  tenantController.createNewTenant
);

router.patch("/dbtest", tenantController.testTenantDatabaseConnection);

router.patch(
  "/:tenantID",
  param("tenantID").isNumeric().withMessage("tenantID must be a number"),
  body("tenantName").notEmpty().withMessage("tenantName is required"),
  body("tenantDBURL").notEmpty().withMessage("tenantDBURL is required"),
  body("tenantDBType")
    .isIn(Object.keys(constants.SUPPORTED_DATABASES))
    .withMessage(
      `tenantDBType must be one of: ${Object.keys(
        constants.SUPPORTED_DATABASES
      ).join(", ")}`
    ),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:update"]),
  tenantController.updateTenant
);

// Nested database routes
router.use(
  "/:tenantID/database",
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:database"]),
  tenantMiddleware.poolProvider,
  databaseRouter
);

// Nested user management routes
router.use(
  "/:tenantID/users",
  authMiddleware.checkUserPermissions(["tenant:user"]),
  userManagementRouter
);

// Nested user management routes
router.use(
  "/:tenantID/roles",
  authMiddleware.checkUserPermissions(["tenant:role"]),
  tenantRoleRouter
);

// Nested APIKey routes
router.use(
  "/:tenantID/apikeys",
  authMiddleware.checkUserPermissions(["tenant:apikey"]),
  tenantAPIKeyRouter
);

router.use(
  "/:tenantID/cronjobs",
  authMiddleware.checkUserPermissions(["tenant:cronjobs"]),
  tenantMiddleware.poolProvider,
  cronjobRouter
);

router.use(
  "/:tenantID/datasources",
  authMiddleware.checkUserPermissions(["tenant:datasource"]),
  tenantMiddleware.poolProvider,
  datasourceRouter
);

router.use(
  "/:tenantID/queries",
  authMiddleware.checkUserPermissions(["tenant:query"]),
  tenantMiddleware.poolProvider,
  dataQueryRouter
);

router.use(
  "/:tenantID/widgets",
  authMiddleware.checkUserPermissions(["tenant:widget"]),
  tenantMiddleware.poolProvider,
  widgetRouter
);

router.use(
  "/:tenantID/dashboards",
  authMiddleware.checkUserPermissions(["tenant:dashboard"]),
  tenantMiddleware.poolProvider,
  databaseDashboardRouter
);

router.use(
  "/:tenantID/audit",
  authMiddleware.checkUserPermissions(["tenant:audit"]),
  auditLogRouter
);


module.exports = router;
