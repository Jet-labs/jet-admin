const express = require("express");
const router = express.Router({mergeParams:true});
const { dashboardController } = require("./dashboard.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:dashboard:list"]),
  dashboardController.getAllDashboards
);

router.post(
  "/",
  body("dashboardTitle").notEmpty().withMessage("dashboardTitle is required"),
  body("dashboardDescription")
    .optional()
    .isString()
    .withMessage("dashboardDescription must be a string"),
  body("dashboardConfig").notEmpty().withMessage("dashboardConfig is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:dashboard:create"]),
  dashboardController.createDashboard
);

router.get(
  "/:dashboardID",
  param("dashboardID").isNumeric().withMessage("dashboardID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:dashboard:read"]),
  dashboardController.getDashboardByID
);

router.post(
  "/:dashboardID/clone",
  param("dashboardID").isNumeric().withMessage("dashboardID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:dashboard:clone"]),
  dashboardController.cloneDashboardByID
);

router.patch(
  "/:dashboardID",
  param("dashboardID").isNumeric().withMessage("dashboardID must be a number"),
  body("dashboardTitle").notEmpty().withMessage("dashboardTitle is required"),
  body("dashboardDescription")
    .optional()
    .isString()
    .withMessage("dashboardDescription must be a string"),
  body("dashboardConfig").notEmpty().withMessage("dashboardConfig is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:dashboard:update"]),
  dashboardController.updateDashboardByID
);

router.delete(
  "/:dashboardID",
  param("dashboardID").isNumeric().withMessage("dashboardID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:dashboard:delete"]),
  dashboardController.deleteDashboardByID
);

module.exports = router;
