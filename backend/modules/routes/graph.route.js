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
router.get("/", authMiddleware.authProvider, graphController.getAllGraphs);
router.post("/", authMiddleware.authProvider, graphController.addGraph);
router.put("/", authMiddleware.authProvider, graphController.updateGraph);
router.get(
  "/:id/data",
  authMiddleware.authProvider,
  graphController.getGraphData
);


module.exports = router;
