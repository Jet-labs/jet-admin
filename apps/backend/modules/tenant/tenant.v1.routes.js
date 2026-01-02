const express = require("express");
const router = express.Router({ mergeParams: true });
const { tenantController } = require("./tenant.controller");
const { tenantMiddleware } = require("./tenant.middleware");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
    createTenantSchema,
    updateTenantSchema,
    tenantIdParamSchema,
} = require("./tenant.validator");

let databaseRouter,
  datasourceRouter,
  dataQueryRouter,
  widgetRouter,
  dashboardRouter,
  userManagementRouter,
  tenantRoleRouter,
  tenantAPIKeyRouter,
  cronjobRouter,
  auditLogRouter,
  aiRouter,
  workflowRouter;
const { isModuleEnabled } = require("../../config/module.config");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { auditLogMiddleware } = require("../audit/audit.middleware");

if (isModuleEnabled(constants.MODULES.DATABASE)) {
  Logger.log("success", {
    message: `${constants.MODULES.DATABASE} module imported`,
  });
  databaseRouter = require("../database/database.v1.routes");
}
if (isModuleEnabled(constants.MODULES.DATASOURCE)) {
  Logger.log("success", {
    message: `${constants.MODULES.DATASOURCE} module imported`,
  });
  datasourceRouter = require("../datasource/datasource.v1.routes");
}
if (isModuleEnabled(constants.MODULES.DATAQUERY)) {
  Logger.log("success", {
    message: `${constants.MODULES.DATAQUERY} module imported`,
  });
  dataQueryRouter = require("../dataQuery/dataQuery.v1.routes");
}
if (isModuleEnabled(constants.MODULES.WORKFLOW)) {
  Logger.log("success", {
    message: `${constants.MODULES.WORKFLOW} module imported`,
  });
  workflowRouter = require("../workflow/workflow.v1.routes");
}
if (isModuleEnabled(constants.MODULES.WIDGET)) {
  Logger.log("success", {
    message: `${constants.MODULES.WIDGET} module imported`,
  });
  widgetRouter = require("../widget/widget.v1.routes");
}
if (isModuleEnabled(constants.MODULES.DASHBOARD)) {
  Logger.log("success", {
    message: `${constants.MODULES.DASHBOARD} module imported`,
  });
  dashboardRouter = require("../dashboard/dashboard.v1.routes");
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
if (isModuleEnabled(constants.MODULES.APIKEY)) {
  Logger.log("success", {
    message: `${constants.MODULES.APIKEY} module imported`,
  });
  tenantAPIKeyRouter = require("../apiKey/apiKey.v1.routes");
}
if (isModuleEnabled(constants.MODULES.CRONJOB)) {
  Logger.log("success", {
    message: `${constants.MODULES.CRONJOB} module imported`,
  });
  cronjobRouter = require("../cronJob/cronJob.v1.routes");
}
if (isModuleEnabled(constants.MODULES.AI)) {
  Logger.log("success", {
    message: `${constants.MODULES.AI} module imported`,
  });
  aiRouter = require("../ai/ai.v1.routes");
}
auditLogRouter = require("../audit/audit.v1.routes");

// Tenant routes
router.use(authMiddleware.authProvider);

router.use(auditLogMiddleware.audit);

router.get("/", tenantController.getAllUserTenants);

router.get(
  "/:tenantID",
    validate(tenantIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:read"]),
  tenantMiddleware.poolProvider,
  tenantController.getUserTenantByID
);

router.delete(
  "/:tenantID",
    validate(tenantIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:delete"]),
  tenantMiddleware.poolProvider,
  tenantController.deleteUserTenantByID
);

router.post(
  "/",
    validate(createTenantSchema, "body"),
  tenantMiddleware.checkTenantCreationLimit,
  tenantController.createNewTenant
);

router.patch("/dbtest", tenantController.testTenantDatabaseConnection);

router.patch(
  "/:tenantID",
    validateAll({
        params: tenantIdParamSchema,
        body: updateTenantSchema,
    }),
  authMiddleware.checkUserPermissions(["tenant:update"]),
  tenantController.updateTenant
);

// Nested AI routes
if (isModuleEnabled(constants.MODULES.AI)) {
  Logger.log("success", { message: `${constants.MODULES.AI} module enabled` });
  router.use(
    "/:tenantID/ai",
      validate(tenantIdParamSchema, "params"),
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
      validate(tenantIdParamSchema, "params"),
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
      validate(tenantIdParamSchema, "params"),
    authMiddleware.checkUserPermissions(["tenant:user"]),
    userManagementRouter
  );
}

// Nested role routes
if (isModuleEnabled(constants.MODULES.ROLE)) {
  Logger.log("success", {
    message: `${constants.MODULES.ROLE} module enabled`,
  });
  router.use(
    "/:tenantID/roles",
      validate(tenantIdParamSchema, "params"),
    authMiddleware.checkUserPermissions(["tenant:role"]),
    tenantRoleRouter
  );
}

// Nested APIKey routes
if (isModuleEnabled(constants.MODULES.APIKEY)) {
  Logger.log("success", {
    message: `${constants.MODULES.APIKEY} module enabled`,
  });
  router.use(
    "/:tenantID/apikeys",
      validate(tenantIdParamSchema, "params"),
    authMiddleware.checkUserPermissions(["tenant:apikey"]),
    tenantAPIKeyRouter
  );
}

// Nested cronjob routes
if (isModuleEnabled(constants.MODULES.CRONJOB)) {
  Logger.log("success", {
    message: `${constants.MODULES.CRONJOB} module enabled`,
  });
  router.use(
    "/:tenantID/cronjobs",
      validate(tenantIdParamSchema, "params"),
    authMiddleware.checkUserPermissions(["tenant:cronjobs"]),
    tenantMiddleware.poolProvider,
    cronjobRouter
  );
}

// Nested datasource routes
if (isModuleEnabled(constants.MODULES.DATASOURCE)) {
  Logger.log("success", {
    message: `${constants.MODULES.DATASOURCE} module enabled`,
  });
  router.use(
    "/:tenantID/datasources",
      validate(tenantIdParamSchema, "params"),
    authMiddleware.checkUserPermissions(["tenant:datasource"]),
    tenantMiddleware.poolProvider,
    datasourceRouter
  );
}

// Nested dataQuery routes
if (isModuleEnabled(constants.MODULES.DATAQUERY)) {
  Logger.log("success", {
    message: `${constants.MODULES.DATAQUERY} module enabled`,
  });
  router.use(
    "/:tenantID/queries",
      validate(tenantIdParamSchema, "params"),
    authMiddleware.checkUserPermissions(["tenant:query"]),
    tenantMiddleware.poolProvider,
    dataQueryRouter
  );
}

// Nested workflow routes
if (isModuleEnabled(constants.MODULES.WORKFLOW)) {
  Logger.log("success", {
    message: `${constants.MODULES.WORKFLOW} module enabled`,
  });
  router.use(
    "/:tenantID/workflows",
      validate(tenantIdParamSchema, "params"),
    authMiddleware.checkUserPermissions(["tenant:workflow"]),
    tenantMiddleware.poolProvider,
    workflowRouter
  );
}

// Nested widget routes
if (isModuleEnabled(constants.MODULES.WIDGET)) {
  Logger.log("success", {
    message: `${constants.MODULES.WIDGET} module enabled`,
  });
  router.use(
    "/:tenantID/widgets",
      validate(tenantIdParamSchema, "params"),
    authMiddleware.checkUserPermissions(["tenant:widget"]),
    tenantMiddleware.poolProvider,
    widgetRouter
  );
}

// Nested dashboard routes
if (isModuleEnabled(constants.MODULES.DASHBOARD)) {
  Logger.log("success", {
    message: `${constants.MODULES.DASHBOARD} module enabled`,
  });
  router.use(
    "/:tenantID/dashboards",
      validate(tenantIdParamSchema, "params"),
    authMiddleware.checkUserPermissions(["tenant:dashboard"]),
    tenantMiddleware.poolProvider,
    dashboardRouter
  );
}

// Nested audit log routes
router.use(
  "/:tenantID/audit",
    validate(tenantIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:audit"]),
  auditLogRouter
);

module.exports = router;
