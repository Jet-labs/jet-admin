const express = require("express");
const router = express.Router({ mergeParams: true });
const { appPageController } = require("./appPage.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { appPageMiddleware } = require("./appPage.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
  createAppPageSchema,
  updateAppPageSchema,
  appPageIdParamSchema,
  listAppPagesQuerySchema,
} = require("./appPage.validator");
const { P } = require("../../config/permissions");
const { bundleController } = require("../bundle/bundle.controller");

// Schemas
router.get(
  "/schemas",
  authMiddleware.authorize(P.appPage.list),
  appPageController.getAppPageSchema
);

router.get(
  "/",
  validate(listAppPagesQuerySchema, "query"),
  authMiddleware.authorize(P.appPage.list),
  appPageController.getAllAppPages
);

router.post(
  "/",
  validate(createAppPageSchema, "body"),
  appPageMiddleware.extractAppPageConfigAssetIDs,
  authMiddleware.authorize([
    P.appPage.create,
    { ...P.dataquery.execute, reqKey: "dataQueryIDs", skipIfMissing: true },
    { ...P.workflow.execute, reqKey: "workflowIDs", skipIfMissing: true },
    { ...P.listener.execute, reqKey: "listenerIDs", skipIfMissing: true },
    { ...P.widget.execute, reqKey: "widgetIDs", skipIfMissing: true }
  ]),
  appPageController.createAppPage
);

router.get(
  "/:appPageID",
  validate(appPageIdParamSchema, "params"),
  authMiddleware.authorize({ ...P.appPage.read, paramKey: "appPageID" }),
  appPageController.getAppPageByID
);

router.get(
  "/:appPageID/export",
  validate(appPageIdParamSchema, "params"),
  authMiddleware.authorize(P.appPage.export),
  bundleController.exportAppPage
);

router.post(
  "/:appPageID/clone",
  validate(appPageIdParamSchema, "params"),
  appPageMiddleware.resolveAppPageCloneAssetIDsFromDB,
  authMiddleware.authorize([
    P.appPage.create,
    { ...P.appPage.read, paramKey: "appPageID" },
    { ...P.dataquery.execute, reqKey: "dataQueryIDs", skipIfMissing: true },
    { ...P.workflow.execute, reqKey: "workflowIDs", skipIfMissing: true },
    { ...P.listener.execute, reqKey: "listenerIDs", skipIfMissing: true },
    { ...P.widget.execute, reqKey: "widgetIDs", skipIfMissing: true }
  ]),
  appPageController.cloneAppPageByID
);

router.patch(
  "/:appPageID",
  validateAll({
    params: appPageIdParamSchema,
    body: updateAppPageSchema,
  }),
  appPageMiddleware.extractAppPageConfigAssetIDs,
  authMiddleware.authorize([
    { ...P.appPage.update, paramKey: "appPageID" },
    { ...P.dataquery.execute, reqKey: "dataQueryIDs", skipIfMissing: true },
    { ...P.workflow.execute, reqKey: "workflowIDs", skipIfMissing: true },
    { ...P.listener.execute, reqKey: "listenerIDs", skipIfMissing: true },
    { ...P.widget.execute, reqKey: "widgetIDs", skipIfMissing: true }
  ]),
  appPageController.updateAppPageByID
);

router.delete(
  "/:appPageID",
  validate(appPageIdParamSchema, "params"),
  authMiddleware.authorize({ ...P.appPage.delete, paramKey: "appPageID" }),
  appPageController.deleteAppPageByID
);

module.exports = router;

