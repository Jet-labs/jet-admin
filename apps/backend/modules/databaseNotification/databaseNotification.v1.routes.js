const express = require("express");
const router = express.Router({ mergeParams: true });
const {
    databaseNotificationController,
} = require("./databaseNotification.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
    createNotificationSchema,
    updateNotificationSchema,
    notificationIdParamSchema,
} = require("./databaseNotification.validator");

// Database notification routes
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:notification:list"]),
  databaseNotificationController.getAllDatabaseNotifications
);

router.post(
  "/",
    validate(createNotificationSchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:database:notification:create"]),
  databaseNotificationController.createDatabaseNotification
);

router.get(
  "/:databaseNotificationID",
    validate(notificationIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:database:notification:read"]),
  databaseNotificationController.getDatabaseNotificationByID
);

router.patch(
  "/:databaseNotificationID",
    validateAll({
        params: notificationIdParamSchema,
        body: updateNotificationSchema,
    }),
  authMiddleware.checkUserPermissions(["tenant:database:notification:update"]),
  databaseNotificationController.updateDatabaseNotificationByID
);

router.delete(
  "/:databaseNotificationID",
    validate(notificationIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:database:notification:delete"]),
  databaseNotificationController.deleteDatabaseNotificationByID
);

module.exports = router;
