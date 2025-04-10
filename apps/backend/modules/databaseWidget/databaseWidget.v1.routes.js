const express = require("express");
const router = express.Router({mergeParams:true});
const { databaseWidgetController } = require("./databaseWidget.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");
// Database widget routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:widget:list"]),
  databaseWidgetController.getAllDatabaseWidgets
);
router.post(
  "/",
  body("databaseWidgetName")
    .notEmpty()
    .withMessage("databaseWidgetName is required"),
  body("databaseWidgetDescription")
    .optional()
    .isString()
    .withMessage("databaseWidgetDescription must be a string"),
  body("databaseWidgetType")
    .notEmpty()
    .withMessage("databaseWidgetType is required"),
  body("databaseWidgetConfig")
    .notEmpty()
    .withMessage("databaseWidgetConfig is required"),
  body("databaseQueries").notEmpty().withMessage("databaseQueries is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:widget:create"]),
  databaseWidgetController.createDatabaseWidget
);

router.get(
  "/:databaseWidgetID",
  param("databaseWidgetID")
    .isNumeric()
    .withMessage("databaseWidgetID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:widget:read"]),
  databaseWidgetController.getDatabaseWidgetByID
);

router.get(
  "/:databaseWidgetID/data",
  param("databaseWidgetID")
    .isNumeric()
    .withMessage("databaseWidgetID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:widget:test"]),
  databaseWidgetController.getDatabaseWidgetDataByID
);

router.post(
  "/:databaseWidgetID/data",
  param("databaseWidgetID")
    .isNumeric()
    .withMessage("databaseWidgetID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:widget:test"]),
  databaseWidgetController.getDatabaseWidgetDataUsingDatabaseWidget
);
router.patch(
  "/:databaseWidgetID",
  param("databaseWidgetID")
    .isNumeric()
    .withMessage("databaseWidgetID must be a number"),
  body("databaseWidgetName")
    .notEmpty()
    .withMessage("databaseWidgetName is required"),
  body("databaseWidgetDescription")
    .optional()
    .isString()
    .withMessage("databaseWidgetDescription must be a string"),
  body("databaseWidgetType")
    .notEmpty()
    .withMessage("databaseWidgetType is required"),
  body("databaseWidgetConfig")
    .notEmpty()
    .withMessage("databaseWidgetConfig is required"),
  body("databaseQueries").notEmpty().withMessage("databaseQueries is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:widget:update"]),
  databaseWidgetController.updateDatabaseWidgetByID
);
router.delete(
  "/:databaseWidgetID",
  param("databaseWidgetID")
    .isNumeric()
    .withMessage("databaseWidgetID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:widget:delete"]),
  databaseWidgetController.deleteDatabaseWidgetByID
);

module.exports = router;
