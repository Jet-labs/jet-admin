const express = require("express");
const router = express.Router({ mergeParams: true });
const { dashboardController } = require("./dashboard.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
  createDashboardSchema,
  updateDashboardSchema,
  dashboardIdParamSchema,
} = require("./dashboard.validator");

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:dashboard:list"]),
  dashboardController.getAllDashboards
);

router.post(
  "/",
  validate(createDashboardSchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:dashboard:create"]),
  dashboardController.createDashboard
);

router.get(
  "/:dashboardID",
  validate(dashboardIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:dashboard:read"]),
  dashboardController.getDashboardByID
);

router.post(
  "/:dashboardID/clone",
  validate(dashboardIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:dashboard:clone"]),
  dashboardController.cloneDashboardByID
);

router.patch(
  "/:dashboardID",
  validateAll({
    params: dashboardIdParamSchema,
    body: updateDashboardSchema,
  }),
  authMiddleware.checkUserPermissions(["tenant:dashboard:update"]),
  dashboardController.updateDashboardByID
);

router.delete(
  "/:dashboardID",
  validate(dashboardIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:dashboard:delete"]),
  dashboardController.deleteDashboardByID
);

module.exports = router;
