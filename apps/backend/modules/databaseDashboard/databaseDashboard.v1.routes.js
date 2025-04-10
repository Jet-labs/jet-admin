const express = require("express");
const router = express.Router({mergeParams:true});
const { databaseDashboardController } = require("./databaseDashboard.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");
// Database chart routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:dashboard:list"]),
  databaseDashboardController.getAllDatabaseDashboards
);
router.post(
  "/",
  body("databaseDashboardName")
    .notEmpty()
    .withMessage("databaseDashboardName is required"),
  body("databaseDashboardDescription")
    .optional()
    .isString()
    .withMessage("databaseDashboardDescription must be a string"),
  body("databaseDashboardConfig")
    .notEmpty()
    .withMessage("databaseDashboardConfig is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:dashboard:create"]),
  databaseDashboardController.createDatabaseDashboard
);

router.get(
  "/:databaseDashboardID",
  param("databaseDashboardID")
    .isNumeric()
    .withMessage("databaseDashboardID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:dashboard:read"]),
  databaseDashboardController.getDatabaseDashboardByID
);

router.patch(
  "/:databaseDashboardID",
  param("databaseDashboardID")
    .isNumeric()
    .withMessage("databaseDashboardID must be a number"),
  body("databaseDashboardName")
    .notEmpty()
    .withMessage("databaseDashboardName is required"),
  body("databaseDashboardDescription")
    .optional()
    .isString()
    .withMessage("databaseDashboardDescription must be a string"),
  body("databaseDashboardConfig")
    .notEmpty()
    .withMessage("databaseDashboardConfig is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:dashboard:update"]),
  databaseDashboardController.updateDatabaseDashboardByID
);

router.delete(
  "/:databaseDashboardID",
  param("databaseDashboardID")
    .isNumeric()
    .withMessage("databaseDashboardID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:dashboard:delete"]),
  databaseDashboardController.deleteDatabaseDashboardByID
);

module.exports = router;
