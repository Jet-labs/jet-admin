const express = require("express");
const router = express.Router({ mergeParams: true });
const { datasourceController } = require("./datasource.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
    updateDatasourceSchema,
    datasourceIdParamSchema,
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
  authMiddleware.checkUserPermissions(["tenant:datasource:list"]),
  datasourceController.getAllDatasources
);

router.post(
  "/test",
  authMiddleware.checkUserPermissions(["tenant:datasource:test"]),
  datasourceController.testDatasourceConnection
);

router.post(
  "/upload",
  authMiddleware.checkUserPermissions(["tenant:datasource:create"]),
  upload.single("file"),
  datasourceController.uploadFile
);

router.get(
  "/:datasourceID",
    validate(datasourceIdParamSchema, "params"),
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
    validateAll({
        params: datasourceIdParamSchema,
        body: updateDatasourceSchema,
    }),
  authMiddleware.checkUserPermissions(["tenant:datasource:update"]),
  datasourceController.updateDatasourceByID
);

router.post(
  "/:datasourceID/clone",
    validate(datasourceIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:datasource:clone"]),
  datasourceController.cloneDatasourceByID
);

router.delete(
  "/:datasourceID",
    validate(datasourceIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:datasource:delete"]),
  datasourceController.deleteDatasourceByID
);

module.exports = router;
