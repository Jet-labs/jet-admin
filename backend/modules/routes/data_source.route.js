const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const tableController = require("../controllers/table.controller");
const {
  tableAuthorizationMiddleware,
} = require("../middlewares/table.authorization.middleware");
const { policyMiddleware } = require("../middlewares/policy.middleware");
const {
  dataSourceController,
} = require("../controllers/data_source.controller");
const {
  dataSourceAuthorizationMiddleware,
} = require("../middlewares/data_source.authorization.middleware");
const router = express.Router();

// get all data of table
router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  dataSourceAuthorizationMiddleware.populateAuthorizedDataSourcesForRead,
  dataSourceController.getAllDataSources
);
router.post(
  "/runner",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  // dataSourceAuthorizationMiddleware.populateAuthorizedDataSourcesForRead,
  dataSourceController.runPGQueryDataSource
);
// router.get(
//   "/:id",
//   authMiddleware.authProvider,
//   policyMiddleware.populateAuthorizationPolicies,
//   dataSourceAuthorizationMiddleware.populateAuthorizedDataSourcesForRead,
//   dataSourceController.getDataSourceByID
// );
// router.post(
//   "/",
//   authMiddleware.authProvider,
//   policyMiddleware.populateAuthorizationPolicies,
//   dataSourceAuthorizationMiddleware.populateAuthorizationForDataSourceAddition,
//   dataSourceController.addDataSource
// );
// router.put(
//   "/",
//   authMiddleware.authProvider,
//   policyMiddleware.populateAuthorizationPolicies,
//   dataSourceAuthorizationMiddleware.populateAuthorizedDataSourcesForUpdate,
//   dataSourceController.updateDataSource
// );

// router.delete(
//   "/:id",
//   authMiddleware.authProvider,
//   policyMiddleware.populateAuthorizationPolicies,
//   dataSourceAuthorizationMiddleware.populateAuthorizedDataSourcesForDelete,
//   dataSourceController.deleteDataSource
// );

module.exports = router;
