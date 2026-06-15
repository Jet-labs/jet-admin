const express = require("express");
const router = express.Router({ mergeParams: true });
const { dataQueryController } = require("./dataQuery.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const { dataQueryMiddleware } = require("./dataQuery.middleware");
const {
  createDataQuerySchema,
  updateDataQuerySchema,
  testDataQuerySchema,
  runDataQueryByIDSchema,
  dataQueryIdParamSchema,
  listDataQueriesQuerySchema,
} = require("./dataQuery.validator");

// Database query routes

router.get(
  "/",
  validate(listDataQueriesQuerySchema, "query"),
  authMiddleware.authorize("dataquery", "list"),
  dataQueryController.getAllDataQueries
);

router.post(
  "/",
  validate(createDataQuerySchema, "body"),
  authMiddleware.authProvider,
  authMiddleware.authorize([
    {
      resource: "dataquery",
      action: "create",
    },
    {
      resource: "datasource",
      action: "read",
      bodyKey: "datasourceID",
    }
  ]),
  dataQueryController.createDataQuery
);

router.post(
  "/:dataQueryID/clone",
  validate(dataQueryIdParamSchema, "params"),
  dataQueryMiddleware.resolveDatasourceIDFromDB,
  authMiddleware.authorize([
    { resource: "dataquery", action: "create" },
    { resource: "dataquery", action: "read", paramKey: "dataQueryID" },
    { resource: "datasource", action: "read", reqKey: "datasourceID", skipIfMissing: true }
  ]),
  dataQueryController.cloneDataQueryByID
);


router.patch(
  "/queryTest",
  validate(testDataQuerySchema, "body"),
  authMiddleware.authorize([
    { resource: "dataquery", action: "test" },
    { resource: "datasource", action: "read", bodyKey: "datasourceID" }
  ]),
  dataQueryController.runDataQueryByData
);

router.get(
  "/:dataQueryID",
  validate(dataQueryIdParamSchema, "params"),
  authMiddleware.authorize("dataquery", "read", {
    paramKey: "dataQueryID",
  }),
  dataQueryController.getDataQueryByID
);

router.post(
  "/:dataQueryID/queryTest",
  validateAll({
    params: dataQueryIdParamSchema,
    body: runDataQueryByIDSchema,
  }),
  authMiddleware.authorize("dataquery", "test", {
    paramKey: "dataQueryID",
  }),
  dataQueryController.runDataQueryByID
);

router.post(
  "/:dataQueryID/run",
  validateAll({
    params: dataQueryIdParamSchema,
    body: runDataQueryByIDSchema,
  }),
  authMiddleware.authorize("dataquery", "execute", {
    paramKey: "dataQueryID",
  }),
  dataQueryController.runDataQueryByID
);

router.patch(
  "/:dataQueryID",
  validateAll({
    params: dataQueryIdParamSchema,
    body: updateDataQuerySchema,
  }),
  authMiddleware.authorize([
    {
      resource: "dataquery",
      action: "update",
      paramKey: "dataQueryID",
    },
    {
      resource: "datasource",
      action: "read",
      bodyKey: "datasourceID",
      skipIfMissing: true,
    }
  ]),
  dataQueryController.updateDataQueryByID
);

router.delete(
  "/:dataQueryID",
  validate(dataQueryIdParamSchema, "params"),
  authMiddleware.authorize("dataquery", "delete", {
    paramKey: "dataQueryID",
  }),
  dataQueryController.deleteDataQueryByID
);

module.exports = router;
