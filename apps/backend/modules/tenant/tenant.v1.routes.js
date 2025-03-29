const express = require("express");
const router = express.Router();
const { tenantController } = require("./tenant.controller");
const { tenantMiddleware } = require("./tenant.middleware");
const { authMiddleware } = require("../auth/auth.middleware");
const { databaseMiddleware } = require("../database/database.middleware");
const databaseRouter = require("../database/database.v1.routes");
const userManagementRouter = require("../userManagement/userManagement.v1.route");
const tenantRoleRouter = require("../tenantRole/tenantRole.v1.route");
const tenantAPIKeyRouter = require("../apiKey/apiKey.v1.routes");

// Apply common middleware at the router level
router.use(authMiddleware.authProvider);

// Tenant routes
router.get("/", tenantController.getAllUserTenants);
router.get(
  "/:tenantID",
  authMiddleware.checkUserPermissions(["tenant:read"]),
  tenantController.getUserTenantByID
);
router.post(
  "/",
  tenantMiddleware.checkTenantCreationLimit,
  tenantController.createNewTenant
);
router.patch("/dbtest", tenantController.testTenantDatabaseConnection);
router.patch(
  "/:tenantID",
  authMiddleware.checkUserPermissions(["tenant:update"]),
  tenantController.updateTenant
);

// Nested database routes
router.use(
  "/:tenantID/database",
  databaseMiddleware.poolProvider,
  databaseRouter
);

// Nested user management routes
router.use("/:tenantID/users", userManagementRouter);

// Nested user management routes
router.use("/:tenantID/roles", tenantRoleRouter);

// Nested APIKey routes
router.use("/:tenantID/apikeys", tenantAPIKeyRouter);

module.exports = router;
