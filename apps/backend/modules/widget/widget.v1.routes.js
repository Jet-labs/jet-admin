const express = require("express");
const router = express.Router({ mergeParams: true });
const { widgetController } = require("./widget.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll, schemas, z } = require("../../utils/validation.utils");
const {
  createWidgetSchema,
  updateWidgetSchema,
  widgetIdParamSchema,
  listWidgetsQuerySchema,
} = require("./widget.validator");
const { P } = require("../../config/permissions");

const serveFileQuerySchema = z.object({
  path: z.string().trim().min(1, "Path parameter is required"),
}).passthrough();

const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Database widget routes

// ============================================================
// Schemas
// ============================================================

router.get(
  "/schemas",
  authMiddleware.authorize(P.widget.list),
  widgetController.getWidgetSchemas
);

router.get(
  "/",
  validate(listWidgetsQuerySchema, "query"),
  authMiddleware.authorize(P.widget.list),
  widgetController.getAllWidgets
);

router.post(
  "/",
  validate(createWidgetSchema, "body"),
  authMiddleware.authorize(P.widget.create),
  widgetController.createWidget
);

router.post(
  "/upload",
  validate(schemas.tenantIdParamSchema, "params"),
  authMiddleware.authorize(P.widget.create),
  upload.single("file"),
  widgetController.uploadFile
);

router.get(
  "/files",
  validate(schemas.tenantIdParamSchema, "params"),
  validate(serveFileQuerySchema, "query"),
  authMiddleware.authorize(P.widget.read),
  widgetController.serveFile
);

router.get(
  "/:widgetID",
  validate(widgetIdParamSchema, "params"),
  authMiddleware.authorize({ ...P.widget.read, paramKey: "widgetID" }),
  widgetController.getWidgetByID
);

router.post(
  "/:widgetID/clone",
  validate(widgetIdParamSchema, "params"),
  authMiddleware.authorize([
    P.widget.create,
    { ...P.widget.read, paramKey: "widgetID" }
  ]),
  widgetController.cloneWidgetByID
);

router.patch(
  "/:widgetID",
  validateAll({
    params: widgetIdParamSchema,
    body: updateWidgetSchema,
  }),
  authMiddleware.authorize({
    ...P.widget.update,
    paramKey: "widgetID",
  }),
  widgetController.updateWidgetByID
);

router.delete(
  "/:widgetID",
  validate(widgetIdParamSchema, "params"),
  authMiddleware.authorize({
    ...P.widget.delete,
    paramKey: "widgetID",
  }),
  widgetController.deleteWidgetByID
);

module.exports = router;
