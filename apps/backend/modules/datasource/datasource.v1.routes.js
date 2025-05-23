const express = require("express");
const router = express.Router({mergeParams:true});
const { datasourceController } = require("./datasource.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// Datasource routes
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:datasource:list"]),
  datasourceController.getAllDatasources
);
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:datasource:create"]),
  datasourceController.createDatasource
);

module.exports = router;