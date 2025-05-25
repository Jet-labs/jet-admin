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
  "/test",
  authMiddleware.checkUserPermissions(["tenant:datasource:test"]),
  datasourceController.testDatasourceConnection
);
router.get(
  "/:datasourceID",
  param("datasourceID").isUUID().withMessage("datasourceID must be a uuid"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:datasource:read"]),
  datasourceController.getDatasourceByID
);
router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:datasource:create"]),
  datasourceController.createDatasource
);

router.patch(
  "/:datasourceID",
  param("datasourceID").isUUID().withMessage("datasourceID must be a uuid"),
  body("datasourceTitle").notEmpty().withMessage("datasourceTitle is required"),
  body("datasourceType").notEmpty().withMessage("datasourceType is required"),
  body("datasourceOptions")
    .notEmpty()
    .withMessage("datasourceOptions is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:datasource:update"]),
  datasourceController.updateDatasourceByID
);




module.exports = router;