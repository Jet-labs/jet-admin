const express = require("express");
const router = express.Router({mergeParams:true});
const { databaseQueryController } = require("./databaseQuery.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// Database query routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:query:list"]),
  databaseQueryController.getAllDatabaseQueries
);
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:query:create"]),
  databaseQueryController.createDatabaseQuery
);
router.patch(
  "/queryTest",
  authMiddleware.checkUserPermissions(["tenant:query:test"]),
  databaseQueryController.runDatabaseQuery
);
router.get(
  "/:databaseQueryID",
  authMiddleware.checkUserPermissions(["tenant:query:read"]),
  databaseQueryController.getDatabaseQueryByID
);
router.get(
  "/:databaseQueryID/queryTest",
  authMiddleware.checkUserPermissions(["tenant:query:test"]),
  databaseQueryController.runDatabaseQueryByID
);
router.patch(
  "/:databaseQueryID",
  authMiddleware.checkUserPermissions(["tenant:query:update"]),
  databaseQueryController.updateDatabaseQueryByID
);
router.delete(
  "/:databaseQueryID",
  authMiddleware.checkUserPermissions(["tenant:query:delete"]),
  databaseQueryController.deleteDatabaseQueryByID
);

module.exports = router;
