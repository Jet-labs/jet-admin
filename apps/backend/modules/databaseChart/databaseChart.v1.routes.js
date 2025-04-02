const express = require("express");
const router = express.Router({mergeParams:true});
const { databaseChartController } = require("./databaseChart.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// Database chart routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:chart:list"]),
  databaseChartController.getAllDatabaseCharts
);
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:chart:create"]),
  databaseChartController.createDatabaseChart
);

router.get(
  "/:databaseChartID",
  authMiddleware.checkUserPermissions(["tenant:chart:read"]),
  databaseChartController.getDatabaseChartByID
);

router.get(
  "/:databaseChartID/data",
  authMiddleware.checkUserPermissions(["tenant:chart:test"]),
  databaseChartController.getDatabaseChartDataByID
);

router.post(
  "/:databaseChartID/data",
  authMiddleware.checkUserPermissions(["tenant:chart:test"]),
  databaseChartController.getDatabaseChartDataUsingDatabaseChart
);
router.patch(
  "/:databaseChartID",
  authMiddleware.checkUserPermissions(["tenant:chart:update"]),
  databaseChartController.updateDatabaseChartByID
);
router.delete(
  "/:databaseChartID",
  authMiddleware.checkUserPermissions(["tenant:chart:delete"]),
  databaseChartController.deleteDatabaseChartByID
);

module.exports = router;
