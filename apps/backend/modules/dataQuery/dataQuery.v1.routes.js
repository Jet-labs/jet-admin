const express = require("express");
const router = express.Router({ mergeParams: true });
const { dataQueryController } = require("./dataQuery.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
  createDataQuerySchema,
  updateDataQuerySchema,
  testDataQuerySchema,
  runDataQueryByIDSchema,
  aiGenerateSchema,
  dataQueryIdParamSchema,
} = require("./dataQuery.validator");

// Database query routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:query:list"]),
  dataQueryController.getAllDataQueries
);

router.post(
  "/",
  validate(createDataQuerySchema, "body"),
  authMiddleware.authProvider,
  authMiddleware.checkUserPermissions(["tenant:query:create"]),
  dataQueryController.createDataQuery
);

router.post(
  "/bulk",
  authMiddleware.authProvider,
  authMiddleware.checkUserPermissions(["tenant:query:bulk:create"]),
  dataQueryController.createBulkDataQuery
);

router.post(
  "/:dataQueryID/clone",
  validate(dataQueryIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:query:clone"]),
  dataQueryController.cloneDataQueryByID
);

router.patch(
  "/queryTest",
  validate(testDataQuerySchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:query:test"]),
  dataQueryController.runDataQueryByData
);

router.get(
  "/:dataQueryID",
  validate(dataQueryIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:query:read"]),
  dataQueryController.getDataQueryByID
);

router.post(
  "/:dataQueryID/queryTest",
  validateAll({
    params: dataQueryIdParamSchema,
    body: runDataQueryByIDSchema,
  }),
  authMiddleware.checkUserPermissions(["tenant:query:test"]),
  dataQueryController.runDataQueryByID
);

router.post(
  "/:dataQueryID/run",
  validateAll({
    params: dataQueryIdParamSchema,
    body: runDataQueryByIDSchema,
  }),
  authMiddleware.checkUserPermissions(["tenant:query:read"]),
  dataQueryController.runDataQueryByID
);

router.patch(
  "/:dataQueryID",
  validateAll({
    params: dataQueryIdParamSchema,
    body: updateDataQuerySchema,
  }),
  authMiddleware.checkUserPermissions(["tenant:query:update"]),
  dataQueryController.updateDataQueryByID
);

router.delete(
  "/:dataQueryID",
  validate(dataQueryIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:query:delete"]),
  dataQueryController.deleteDataQueryByID
);

module.exports = router;
