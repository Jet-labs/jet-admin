const express = require("express");
const router = express.Router({ mergeParams: true });
const { datasourceController } = require("./datasource.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
    createDatasourceSchema,
    updateDatasourceSchema,
    testConnectionSchema,
    proxyActionSchema,
    datasourceIdParamSchema,
    listDatasourcesQuerySchema,
} = require("./datasource.validator");

const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Datasource routes
router.get(
  "/",
  validate(listDatasourcesQuerySchema, "query"),
  authMiddleware.authorize("datasource", "list"),
  datasourceController.getAllDatasources
);

router.post(
  "/test",
  validate(testConnectionSchema, "body"),
  authMiddleware.authorize("datasource", "test"),
  datasourceController.testDatasourceConnection
);

router.post(
  "/upload",
  authMiddleware.authorize("datasource", "create"),
  upload.single("file"),
  datasourceController.uploadFile
);

router.get(
  "/:datasourceID",
  validate(datasourceIdParamSchema, "params"),
  authMiddleware.authorize("datasource", "read", {
    paramKey: "datasourceID",
  }),
  datasourceController.getDatasourceByID
);

router.post(
  "/",
  validate(createDatasourceSchema, "body"),
  authMiddleware.authorize("datasource", "create"),
  datasourceController.createDatasource
);

router.patch(
  "/:datasourceID",
  validateAll({
      params: datasourceIdParamSchema,
      body: updateDatasourceSchema,
  }),
  authMiddleware.authorize("datasource", "update", {
    paramKey: "datasourceID",
  }),
  datasourceController.updateDatasourceByID
);

router.post(
  "/:datasourceID/clone",
  validate(datasourceIdParamSchema, "params"),
  authMiddleware.authorize([
    { resource: "datasource", action: "create" },
    { resource: "datasource", action: "read", paramKey: "datasourceID" }
  ]),
  datasourceController.cloneDatasourceByID
);

router.delete(
  "/:datasourceID",
  validate(datasourceIdParamSchema, "params"),
  authMiddleware.authorize("datasource", "delete", {
    paramKey: "datasourceID",
  }),
  datasourceController.deleteDatasourceByID
);

// Datasource proxy — dedicated editors call DS-specific helper methods through backend
router.post(
  "/:datasourceID/proxy",
  validateAll({
    params: datasourceIdParamSchema,
    body: proxyActionSchema,
  }),
  authMiddleware.authorize("datasource", "read", {
    paramKey: "datasourceID",
  }),
  datasourceController.proxyDatasourceAction
);

module.exports = router;
