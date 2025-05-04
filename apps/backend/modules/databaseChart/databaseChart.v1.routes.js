const express = require("express");
const router = express.Router({mergeParams:true});
const { databaseChartController } = require("./databaseChart.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// Database chart routes

router.patch(
  "/aigenerate",
  body("aiPrompt").notEmpty().withMessage("aiPrompt is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:chart:aigenerate"]),
  databaseChartController.generateAIPromptBasedChart
);

router.patch(
  "/aistyle",
  body("aiPrompt").notEmpty().withMessage("aiPrompt is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:chart:aistyle"]),
  databaseChartController.generateAIPromptBasedChartStyle
);

router.post(
  "/:databaseChartID/data",
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:chart:test"]),
  databaseChartController.getDatabaseChartDataUsingDatabaseChart
);



module.exports = router;
