const express = require("express");
const router = express.Router({mergeParams:true});
const { databaseChartController } = require("./databaseChart.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// Database chart routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:chart:list"]),
  databaseChartController.getAllDatabaseCharts
);
router.post(
  "/",
  body("databaseChartName")
    .notEmpty()
    .withMessage("databaseChartName is required"),
  body("databaseChartDescription")
    .optional()
    .isString()
    .withMessage("databaseChartDescription must be a string"),
  body("databaseChartType")
    .notEmpty()
    .withMessage("databaseChartType is required"),
  body("databaseChartConfig")
    .notEmpty()
    .withMessage("databaseChartConfig is required"),
  body("databaseQueries").notEmpty().withMessage("databaseQueries is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:chart:create"]),
  databaseChartController.createDatabaseChart
);

router.get(
  "/:databaseChartID",

  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:chart:read"]),
  databaseChartController.getDatabaseChartByID
);

router.patch(
  "/generate",
  body("aiPrompt").notEmpty().withMessage("aiPrompt is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:chart:aigenerate"]),
  databaseChartController.generateAIPromptBasedChart
);

router.get(
  "/:databaseChartID/data",
  param("databaseChartID")
    .isNumeric()
    .withMessage("databaseChartID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:chart:test"]),
  databaseChartController.getDatabaseChartDataByID
);

router.post(
  "/:databaseChartID/data",
  param("databaseChartID")
    .exists()

    .isNumeric()
    .withMessage("databaseChartID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:chart:test"]),
  databaseChartController.getDatabaseChartDataUsingDatabaseChart
);
router.patch(
  "/:databaseChartID",
  param("databaseChartID")
    .isNumeric()
    .withMessage("databaseChartID must be a number"),
  body("databaseChartName")
    .notEmpty()
    .withMessage("databaseChartName is required"),
  body("databaseChartDescription")
    .optional()
    .isString()
    .withMessage("databaseChartDescription must be a string"),
  body("databaseChartType")
    .notEmpty()
    .withMessage("databaseChartType is required"),
  body("databaseChartConfig")
    .notEmpty()
    .withMessage("databaseChartConfig is required"),
  body("databaseQueries").notEmpty().withMessage("databaseQueries is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:chart:update"]),
  databaseChartController.updateDatabaseChartByID
);
router.delete(
  "/:databaseChartID",
  param("databaseChartID")
    .isNumeric()
    .withMessage("databaseChartID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:chart:delete"]),
  databaseChartController.deleteDatabaseChartByID
);

module.exports = router;
