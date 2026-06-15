const express = require("express");
const router = express.Router({ mergeParams: true });
const { widgetController } = require("./widget.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
  createWidgetSchema,
  updateWidgetSchema,
  widgetIdParamSchema,
  listWidgetsQuerySchema,
} = require("./widget.validator");

const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Database widget routes

router.get(
  "/",
  validate(listWidgetsQuerySchema, "query"),
  authMiddleware.authorize("widget", "list"),
  widgetController.getAllWidgets
);

router.post(
  "/",
  validate(createWidgetSchema, "body"),
  authMiddleware.authorize("widget", "create"),
  widgetController.createWidget
);

router.post(
  "/upload",
  authMiddleware.authorize("widget", "create"),
  upload.single("file"),
  widgetController.uploadFile
);

router.get(
  "/files",
  widgetController.serveFile
);

router.get(
  "/:widgetID",
  validate(widgetIdParamSchema, "params"),
  authMiddleware.authorize("widget", "read"),
  widgetController.getWidgetByID
);

router.post(
  "/:widgetID/clone",
  validate(widgetIdParamSchema, "params"),
  authMiddleware.authorize([
    { resource: "widget", action: "create" },
    { resource: "widget", action: "read", paramKey: "widgetID" }
  ]),
  widgetController.cloneWidgetByID
);

router.patch(
  "/:widgetID",
  validateAll({
    params: widgetIdParamSchema,
    body: updateWidgetSchema,
  }),
  authMiddleware.authorize("widget", "update", {
    paramKey: "widgetID",
  }),
  widgetController.updateWidgetByID
);

router.delete(
  "/:widgetID",
  validate(widgetIdParamSchema, "params"),
  authMiddleware.authorize("widget", "delete", {
    paramKey: "widgetID",
  }),
  widgetController.deleteWidgetByID
);

module.exports = router;
