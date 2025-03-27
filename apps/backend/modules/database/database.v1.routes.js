const express = require("express");
const router = express.Router({ mergeParams: true });
const { databaseController } = require("./database.controller");

const databaseQueryRouter = require("../databaseQuery/databaseQuery.v1.routes");
const databaseTableRouter = require("../databaseTable/databaseTable.v1.routes");
const databaseTriggerRouter = require("../databaseTrigger/databaseTrigger.v1.routes");
const databaseChartRouter = require("../databaseChart/databaseChart.v1.routes");
const databaseWidgetRouter = require("../databaseWidget/databaseWidget.v1.routes");
const databaseDashboardRouter = require("../databaseDashboard/databaseDashboard.v1.routes");
const databaseNotificationRouter = require("../databaseNotification/databaseNotification.v1.routes");
const { authMiddleware } = require("../auth/auth.middleware");

// Database routes
router.get(
  "/metadata",
  authMiddleware.checkUserPermissions(["tenant:database:metadata"]),
  databaseController.getDatabaseMetadata
);
router.post(
  "/schemas",
  authMiddleware.checkUserPermissions(["tenant:database:schema:create"]),
  databaseController.createDatabaseSchema
);
router.use("/schemas/:databaseSchemaName/tables", databaseTableRouter);
router.use("/schemas/:databaseSchemaName/triggers", databaseTriggerRouter);
router.use("/queries/", databaseQueryRouter);
router.use("/charts/", databaseChartRouter);
router.use("/widgets/", databaseWidgetRouter);
router.use("/dashboards/", databaseDashboardRouter);
router.use("/notifications/", databaseNotificationRouter);

module.exports = router;
