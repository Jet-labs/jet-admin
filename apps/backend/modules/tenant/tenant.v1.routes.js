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

const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});


let 
  datasourceRouter,
  dataQueryRouter,
  widgetRouter,
  appPageRouter,
  userManagementRouter,
  tenantRoleRouter,
  tenantAPIKeyRouter,
  cronjobRouter,
  auditLogRouter,
  aiRouter,
  workflowRouter,
  listenerRouter;
const { isModuleEnabled } = require("../../config/module.config");
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { auditLogMiddleware } = require("../audit/audit.middleware");
const { P } = require("../../config/permissions");

if (isModuleEnabled(constants.MODULES.DATASOURCE)) {
  Logger.log("success", {
    message: `${constants.MODULES.DATASOURCE} module imported`,
  });
  datasourceRouter = require("../datasource/datasource.v1.routes");
}

if (isModuleEnabled(constants.MODULES.LISTENER)) {
  Logger.log("success", {
    message: `${constants.MODULES.LISTENER} module imported`,
  });
  listenerRouter = require("../listener/listener.v1.routes");
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
if (isModuleEnabled(constants.MODULES.APP_PAGE)) {
  Logger.log("success", {
    message: `${constants.MODULES.APP_PAGE} module imported`,
  });
  appPageRouter = require("../appPage/appPage.v1.routes");
}
if (isModuleEnabled(constants.MODULES.USERMANAGEMENT)) {
  Logger.log("success", {
    message: `${constants.MODULES.USERMANAGEMENT} module imported`,
  });
  userManagementRouter = require("../userManagement/userManagement.v1.routes");
}
if (isModuleEnabled(constants.MODULES.ROLE)) {
  Logger.log("success", {
    message: `${constants.MODULES.ROLE} module imported`,
  });
  tenantRoleRouter = require("../tenantRole/tenantRole.v1.routes");
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

auditLogRouter = require("../audit/audit.v1.routes");

// Tenant routes
router.use(authMiddleware.authProvider);

router.use(auditLogMiddleware.audit);

router.get("/", tenantController.getAllUserTenants);

router.post(
  "/upload-logo",
  upload.single("file"),
  tenantController.uploadLogo
);

router.get(
  "/:tenantID",
    validate(tenantIdParamSchema, "params"),
  authMiddleware.authorize(P.tenant.read),
  tenantController.getUserTenantByID
);

router.delete(
  "/:tenantID",
    validate(tenantIdParamSchema, "params"),
  authMiddleware.authorize(P.tenant.delete),
  tenantController.deleteUserTenantByID
);

router.post(
  "/",
    validate(createTenantSchema, "body"),
  tenantMiddleware.checkTenantCreationLimit,
  tenantController.createNewTenant
);

router.get(
  "/:tenantID/ai-config",
  validate(tenantIdParamSchema, "params"),
  authMiddleware.authorize(P.tenant.read),
  tenantController.getTenantAIConfig
);

router.post(
  "/:tenantID/ai-config",
  validate(tenantIdParamSchema, "params"),
  authMiddleware.authorize(P.tenant.update),
  tenantController.updateTenantAIConfig
);


router.patch(
  "/:tenantID",
    validateAll({
        params: tenantIdParamSchema,
        body: updateTenantSchema,
    }),
  authMiddleware.authorize(P.tenant.update),
  tenantController.updateTenant
);

// Nested user management routes
if (isModuleEnabled(constants.MODULES.USERMANAGEMENT)) {
  Logger.log("success", {
    message: `${constants.MODULES.USERMANAGEMENT} module enabled`,
  });
  router.use(
    "/:tenantID/users",
      validate(tenantIdParamSchema, "params"),
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
    datasourceRouter
  );
}

// Nested listener routes (unified listener system)
if (isModuleEnabled(constants.MODULES.LISTENER)) {
  Logger.log("success", {
    message: `${constants.MODULES.LISTENER} module enabled`,
  });
  router.use(
    "/:tenantID/listeners",
    validate(tenantIdParamSchema, "params"),
    listenerRouter
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
    widgetRouter
  );
}

// Nested app page routes
if (isModuleEnabled(constants.MODULES.APP_PAGE)) {
  Logger.log("success", {
    message: `${constants.MODULES.APP_PAGE} module enabled`,
  });
  router.use(
    "/:tenantID/app-pages",
      validate(tenantIdParamSchema, "params"),
    appPageRouter
  );
}

// Nested audit log routes
router.use(
  "/:tenantID/audit",
    validate(tenantIdParamSchema, "params"),
  auditLogRouter
);

module.exports = router;
