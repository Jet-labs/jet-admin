const express = require("express");
const router = express.Router({mergeParams:true});
const { databaseDashboardController } = require("./databaseDashboard.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// Database chart routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:dashboard:list"]),
  databaseDashboardController.getAllDatabaseDashboards
);
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:dashboard:create"]),
  databaseDashboardController.createDatabaseDashboard
);

router.get(
  "/:databaseDashboardID",
  authMiddleware.checkUserPermissions(["tenant:database:dashboard:read"]),
  databaseDashboardController.getDatabaseDashboardByID
);

router.patch(
  "/:databaseDashboardID",
  authMiddleware.checkUserPermissions(["tenant:database:dashboard:update"]),
  databaseDashboardController.updateDatabaseDashboardByID
);

router.delete(
  "/:databaseDashboardID",
  authMiddleware.checkUserPermissions(["tenant:database:dashboard:delete"]),
  databaseDashboardController.deleteDatabaseDashboardByID
);

module.exports = router;
