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

router.get(
  "/",
  validate(listAppPagesQuerySchema, "query"),
  authMiddleware.authorize("appPage", "list"),
  appPageController.getAllAppPages
);

router.post(
  "/",
  validate(createAppPageSchema, "body"),
  appPageMiddleware.extractAppPageConfigAssetIDs,
  authMiddleware.authorize([
    {
      resource: "appPage",
      action: "create",
    },
    { resource: "dataquery", action: "execute", reqKey: "dataQueryIDs", skipIfMissing: true },
    { resource: "workflow", action: "execute", reqKey: "workflowIDs", skipIfMissing: true },
    { resource: "listener", action: "execute", reqKey: "listenerIDs", skipIfMissing: true },
    { resource: "widget", action: "execute", reqKey: "widgetIDs", skipIfMissing: true }
  ]),
  appPageController.createAppPage
);

router.get(
  "/:appPageID",
  validate(appPageIdParamSchema, "params"),
  authMiddleware.authorize("appPage", "read", { paramKey: "appPageID" }),
  appPageController.getAppPageByID
);

router.post(
  "/:appPageID/clone",
  validate(appPageIdParamSchema, "params"),
  appPageMiddleware.resolveAppPageCloneAssetIDsFromDB,
  authMiddleware.authorize([
    { resource: "appPage", action: "create" },
    { resource: "appPage", action: "read", paramKey: "appPageID" },
    { resource: "dataquery", action: "execute", reqKey: "dataQueryIDs", skipIfMissing: true },
    { resource: "workflow", action: "execute", reqKey: "workflowIDs", skipIfMissing: true },
    { resource: "listener", action: "execute", reqKey: "listenerIDs", skipIfMissing: true },
    { resource: "widget", action: "execute", reqKey: "widgetIDs", skipIfMissing: true }
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
    {
      resource: "appPage",
      action: "update",
      paramKey: "appPageID",
    },
    { resource: "dataquery", action: "execute", reqKey: "dataQueryIDs", skipIfMissing: true },
    { resource: "workflow", action: "execute", reqKey: "workflowIDs", skipIfMissing: true },
    { resource: "listener", action: "execute", reqKey: "listenerIDs", skipIfMissing: true },
    { resource: "widget", action: "execute", reqKey: "widgetIDs", skipIfMissing: true }
  ]),
  appPageController.updateAppPageByID
);

router.delete(
  "/:appPageID",
  validate(appPageIdParamSchema, "params"),
  authMiddleware.authorize("appPage", "delete", { paramKey: "appPageID" }),
  appPageController.deleteAppPageByID
);

module.exports = router;

