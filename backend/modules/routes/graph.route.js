const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const tableController = require("../controllers/table.controller");
const {
  tableAuthorizationMiddleware,
} = require("../middlewares/table.authorization.middleware");
const { policyMiddleware } = require("../middlewares/policy.middleware");
const { graphController } = require("../controllers/graph.controller");
const router = express.Router();

// get all data of table
router.post("/", authMiddleware.authProvider, graphController.addGraph);
router.get(
  "/:id/data",
  authMiddleware.authProvider,
  graphController.getGraphData
);

module.exports = router;
