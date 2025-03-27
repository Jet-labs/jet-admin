const express = require("express");
const router = express.Router({mergeParams:true});
const { databaseNotificationController } = require("./databaseNotification.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// Database notification routes
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:notification:list"]),
  databaseNotificationController.getAllDatabaseNotifications
);

router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:notification:create"]),
  databaseNotificationController.createDatabaseNotification
);

router.get(
  "/:databaseNotificationID",
  authMiddleware.checkUserPermissions(["tenant:database:notification:read"]),
  databaseNotificationController.getDatabaseNotificationByID
);

router.patch(
  "/:databaseNotificationID",
  authMiddleware.checkUserPermissions(["tenant:database:notification:update"]),
  databaseNotificationController.updateDatabaseNotificationByID
);

router.delete(
  "/:databaseNotificationID",
  authMiddleware.checkUserPermissions(["tenant:database:notification:delete"]),
  databaseNotificationController.deleteDatabaseNotificationByID
);

module.exports = router;