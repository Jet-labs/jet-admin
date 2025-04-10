const express = require("express");
const router = express.Router({ mergeParams: true });
const { tenantController } = require("./tenant.controller");
const { tenantMiddleware } = require("./tenant.middleware");
const { authMiddleware } = require("../auth/auth.middleware");
const databaseRouter = require("../database/database.v1.routes");
const databaseQueryRouter = require("../databaseQuery/databaseQuery.v1.routes");
const databaseChartRouter = require("../databaseChart/databaseChart.v1.routes");
const databaseWidgetRouter = require("../databaseWidget/databaseWidget.v1.routes");
const databaseDashboardRouter = require("../databaseDashboard/databaseDashboard.v1.routes");
const userManagementRouter = require("../userManagement/userManagement.v1.route");
const tenantRoleRouter = require("../tenantRole/tenantRole.v1.route");
const tenantAPIKeyRouter = require("../apiKey/apiKey.v1.routes");
const { param, body } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// Tenant routes
router.use(authMiddleware.authProvider);
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
  body("tenantLogoURL").notEmpty().withMessage("tenantLogoURL is required"),
  body("tenantDBURL").notEmpty().withMessage("tenantDBURL is required"),
  expressUtils.validationChecker,
  tenantMiddleware.checkTenantCreationLimit,
  tenantController.createNewTenant
);
router.patch("/dbtest", tenantController.testTenantDatabaseConnection);
router.patch(
  "/:tenantID",
  param("tenantID").isNumeric().withMessage("tenantID must be a number"),
  body("tenantName").notEmpty().withMessage("tenantName is required"),
  body("tenantLogoURL").notEmpty().withMessage("tenantLogoURL is required"),
  body("tenantDBURL").notEmpty().withMessage("tenantDBURL is required"),
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
  "/:tenantID/queries",
  authMiddleware.checkUserPermissions(["tenant:query"]),
  tenantMiddleware.poolProvider,
  databaseQueryRouter
);
router.use(
  "/:tenantID/charts",
  authMiddleware.checkUserPermissions(["tenant:chart"]),
  tenantMiddleware.poolProvider,
  databaseChartRouter
);
router.use(
  "/:tenantID/widgets",
  authMiddleware.checkUserPermissions(["tenant:widget"]),
  tenantMiddleware.poolProvider,
  databaseWidgetRouter
);
router.use(
  "/:tenantID/dashboards",
  authMiddleware.checkUserPermissions(["tenant:dashboard"]),
  tenantMiddleware.poolProvider,
  databaseDashboardRouter
);
module.exports = router;
