const express = require("express");
const router = express.Router({mergeParams:true});
const { databaseWidgetController } = require("./databaseWidget.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// Database widget routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:widget:list"]),
  databaseWidgetController.getAllDatabaseWidgets
);
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:widget:create"]),
  databaseWidgetController.createDatabaseWidget
);

router.get(
  "/:databaseWidgetID",
  authMiddleware.checkUserPermissions(["tenant:widget:read"]),
  databaseWidgetController.getDatabaseWidgetByID
);

router.get(
  "/:databaseWidgetID/data",
  authMiddleware.checkUserPermissions(["tenant:widget:test"]),
  databaseWidgetController.getDatabaseWidgetDataByID
);

router.post(
  "/:databaseWidgetID/data",
  authMiddleware.checkUserPermissions(["tenant:widget:test"]),
  databaseWidgetController.getDatabaseWidgetDataUsingDatabaseWidget
);
router.patch(
  "/:databaseWidgetID",
  authMiddleware.checkUserPermissions(["tenant:widget:update"]),
  databaseWidgetController.updateDatabaseWidgetByID
);
router.delete(
  "/:databaseWidgetID",
  authMiddleware.checkUserPermissions(["tenant:widget:delete"]),
  databaseWidgetController.deleteDatabaseWidgetByID
);

module.exports = router;
