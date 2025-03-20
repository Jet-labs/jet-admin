const express = require("express");
const router = express.Router({mergeParams:true});
const { databaseChartController } = require("./databaseChart.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// Database chart routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:chart:list"]),
  databaseChartController.getAllDatabaseCharts
);
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:chart:create"]),
  databaseChartController.createDatabaseChart
);

router.get(
  "/:databaseChartID",
  authMiddleware.checkUserPermissions(["tenant:database:chart:read"]),
  databaseChartController.getDatabaseChartByID
);

router.get(
  "/:databaseChartID/data",
  authMiddleware.checkUserPermissions(["tenant:database:chart:test"]),
  databaseChartController.getDatabaseChartDataByID
);

router.post(
  "/:databaseChartID/data",
  authMiddleware.checkUserPermissions(["tenant:database:chart:test"]),
  databaseChartController.getDatabaseChartDataUsingDatabaseChart
);
router.patch(
  "/:databaseChartID",
  authMiddleware.checkUserPermissions(["tenant:database:chart:update"]),
  databaseChartController.updateDatabaseChartByID
);
router.delete(
  "/:databaseChartID",
  authMiddleware.checkUserPermissions(["tenant:database:chart:delete"]),
  databaseChartController.deleteDatabaseChartByID
);

module.exports = router;
