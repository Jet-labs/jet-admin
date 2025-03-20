const express = require("express");
const router = express.Router({mergeParams:true});
const { databaseQueryController } = require("./databaseQuery.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// Database query routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:query:list"]),
  databaseQueryController.getAllDatabaseQueries
);
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:database:query:create"]),
  databaseQueryController.createDatabaseQuery
);
router.patch(
  "/queryTest",
  authMiddleware.checkUserPermissions(["tenant:database:query:test"]),
  databaseQueryController.runDatabaseQuery
);
router.get(
  "/:databaseQueryID",
  authMiddleware.checkUserPermissions(["tenant:database:query:read"]),
  databaseQueryController.getDatabaseQueryByID
);
router.get(
  "/:databaseQueryID/queryTest",
  authMiddleware.checkUserPermissions(["tenant:database:query:test"]),
  databaseQueryController.runDatabaseQueryByID
);
router.patch(
  "/:databaseQueryID",
  authMiddleware.checkUserPermissions(["tenant:database:query:update"]),
  databaseQueryController.updateDatabaseQueryByID
);
router.delete(
  "/:databaseQueryID",
  authMiddleware.checkUserPermissions(["tenant:database:query:delete"]),
  databaseQueryController.deleteDatabaseQueryByID
);

module.exports = router;
