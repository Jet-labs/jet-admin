const express = require("express");
const router = express.Router({mergeParams:true});
const { widgetController } = require("./widget.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");
// Database widget routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:widget:list"]),
  widgetController.getAllWidgets
);
router.post(
  "/",
  body("widgetName").notEmpty().withMessage("widgetName is required"),
  body("widgetDescription")
    .optional()
    .isString()
    .withMessage("widgetDescription must be a string"),
  body("widgetType").notEmpty().withMessage("widgetType is required"),
  body("widgetConfig").notEmpty().withMessage("widgetConfig is required"),
  body("dataQueries").notEmpty().withMessage("dataQueries is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:widget:create"]),
  widgetController.createWidget
);

router.get(
  "/:widgetID",
  param("widgetID").isNumeric().withMessage("widgetID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:widget:read"]),
  widgetController.getWidgetByID
);

router.post(
  "/:widgetID/clone",
  param("widgetID").isNumeric().withMessage("widgetID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:widget:clone"]),
  widgetController.cloneWidgetByID
);

router.get(
  "/:widgetID/data",
  param("widgetID")
    .exists()
    .isNumeric()
    .withMessage("widgetID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:widget:test"]),
  widgetController.getWidgetDataByID
);

router.post(
  "/:widgetID/data",
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:widget:test"]),
  widgetController.getWidgetDataUsingWidget
);
router.patch(
  "/:widgetID",
  param("widgetID").isNumeric().withMessage("widgetID must be a number"),
  body("widgetName").notEmpty().withMessage("widgetName is required"),
  body("widgetDescription")
    .optional()
    .isString()
    .withMessage("widgetDescription must be a string"),
  body("widgetType").notEmpty().withMessage("widgetType is required"),
  body("widgetConfig").notEmpty().withMessage("widgetConfig is required"),
  body("dataQueries").notEmpty().withMessage("dataQueries is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:widget:update"]),
  widgetController.updateWidgetByID
);
router.delete(
  "/:widgetID",
  param("widgetID").isNumeric().withMessage("widgetID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:widget:delete"]),
  widgetController.deleteWidgetByID
);

module.exports = router;
