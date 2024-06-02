const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const tableController = require("../controllers/table.controller");
const {
  tableAuthorizationMiddleware,
} = require("../middlewares/table.authorization.middleware");
const { policyMiddleware } = require("../middlewares/policy.middleware");
const { graphController } = require("../controllers/graph.controller");
const {
  graphAuthorizationMiddleware,
} = require("../middlewares/graph.authorization.middleware");
const router = express.Router();

// get all data of table
router.get(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  graphAuthorizationMiddleware.populateAuthorizedGraphsForRead,
  graphController.getAllGraphs
);
router.post(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  graphAuthorizationMiddleware.populateAuthorizationForGraphAddition,
  graphController.addGraph
);
router.put(
  "/",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  graphAuthorizationMiddleware.populateAuthorizedGraphsForUpdate,
  graphController.updateGraph
);
router.get(
  "/:id/data",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  graphAuthorizationMiddleware.populateAuthorizedGraphsForRead,
  graphController.getGraphData
);

router.delete(
  "/:id",
  authMiddleware.authProvider,
  policyMiddleware.populateAuthorizationPolicies,
  graphAuthorizationMiddleware.populateAuthorizedGraphsForDelete,
  graphController.deleteGraph
);


module.exports = router;
