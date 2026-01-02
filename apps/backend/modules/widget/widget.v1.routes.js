const express = require("express");
const router = express.Router({ mergeParams: true });
const { widgetController } = require("./widget.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
  createWidgetSchema,
  updateWidgetSchema,
  widgetIdParamSchema,
} = require("./widget.validator");

// Database widget routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:widget:list"]),
  widgetController.getAllWidgets
);

router.post(
  "/",
  validate(createWidgetSchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:widget:create"]),
  widgetController.createWidget
);

router.get(
  "/:widgetID",
  validate(widgetIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:widget:read"]),
  widgetController.getWidgetByID
);

router.post(
  "/:widgetID/clone",
  validate(widgetIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:widget:clone"]),
  widgetController.cloneWidgetByID
);

router.get(
  "/:widgetID/data",
  validate(widgetIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:widget:test"]),
  widgetController.getWidgetDataByID
);

router.post(
  "/data",
  authMiddleware.checkUserPermissions(["tenant:widget:test"]),
  widgetController.getWidgetDataUsingWidget
);

router.patch(
  "/:widgetID",
  validateAll({
    params: widgetIdParamSchema,
    body: updateWidgetSchema,
  }),
  authMiddleware.checkUserPermissions(["tenant:widget:update"]),
  widgetController.updateWidgetByID
);

router.delete(
  "/:widgetID",
  validate(widgetIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:widget:delete"]),
  widgetController.deleteWidgetByID
);

module.exports = router;
