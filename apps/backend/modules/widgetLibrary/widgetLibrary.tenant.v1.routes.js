/**
 * Widget Library Tenant Routes (v1)
 *
 * The REGISTRY is deployment-scoped (one shared table), but every route is
 * mounted under /tenants/:tenantID because the Casbin authorize middleware
 * requires a tenant domain context.
 *
 * GET    /widget-library                      — list published widgets
 * POST   /widget-library                      — publish a widget bundle
 * DELETE /widget-library/:entryID             — unpublish
 * POST   /widget-library/:entryID/preview     — dry-run install against the tenant
 * POST   /widget-library/:entryID/install     — clone the published widget bundle
 */
const express = require("express");
const { widgetLibraryController } = require("./widgetLibrary.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
  publishWidgetSchema,
  libraryEntryIdParamSchema,
  installWidgetSchema,
  listWidgetsQuerySchema,
} = require("./widgetLibrary.validator");

const { P } = require("../../config/permissions");

const router = express.Router({ mergeParams: true });

router.get(
  "/",
  validate(listWidgetsQuerySchema, "query"),
  authMiddleware.authorize(P.widgetLibrary.list),
  widgetLibraryController.listPublishedWidgets
);

router.post(
  "/",
  validate(publishWidgetSchema, "body"),
  authMiddleware.authorize(P.widgetLibrary.publish),
  widgetLibraryController.publishWidget
);

router.post(
  "/:libraryEntryID/preview",
  validate(libraryEntryIdParamSchema, "params"),
  authMiddleware.authorize(P.widgetLibrary.install),
  widgetLibraryController.previewInstall
);

router.post(
  "/:libraryEntryID/install",
  validateAll({
    params: libraryEntryIdParamSchema,
    body: installWidgetSchema,
  }),
  authMiddleware.authorize(P.widgetLibrary.install),
  widgetLibraryController.installWidget
);

router.delete(
  "/:libraryEntryID",
  validate(libraryEntryIdParamSchema, "params"),
  authMiddleware.authorize(P.widgetLibrary.unpublish),
  widgetLibraryController.unpublishWidget
);

module.exports = router;
