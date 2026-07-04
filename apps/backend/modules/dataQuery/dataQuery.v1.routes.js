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
const { P } = require("../../config/permissions");

// Database query routes

router.get(
  "/",
  validate(listDataQueriesQuerySchema, "query"),
  authMiddleware.authorize(P.dataquery.list),
  dataQueryController.getAllDataQueries
);

router.post(
  "/",
  validate(createDataQuerySchema, "body"),
  authMiddleware.authProvider,
  authMiddleware.authorize([
    P.dataquery.create,
    {
      ...P.datasource.read,
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
    P.dataquery.create,
    { ...P.dataquery.read, paramKey: "dataQueryID" },
    { ...P.datasource.read, reqKey: "datasourceID", skipIfMissing: true }
  ]),
  dataQueryController.cloneDataQueryByID
);


router.patch(
  "/queryTest",
  validate(testDataQuerySchema, "body"),
  authMiddleware.authorize([
    P.dataquery.test,
    { ...P.datasource.read, bodyKey: "dataQuery.datasourceID" }
  ]),
  dataQueryController.runDataQueryByData
);

router.get(
  "/:dataQueryID",
  validate(dataQueryIdParamSchema, "params"),
  authMiddleware.authorize({
    ...P.dataquery.read,
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
  authMiddleware.authorize({
    ...P.dataquery.test,
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
  authMiddleware.authorize({
    ...P.dataquery.execute,
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
      ...P.dataquery.update,
      paramKey: "dataQueryID",
    },
    {
      ...P.datasource.read,
      bodyKey: "datasourceID",
      skipIfMissing: true,
    }
  ]),
  dataQueryController.updateDataQueryByID
);

router.delete(
  "/:dataQueryID",
  validate(dataQueryIdParamSchema, "params"),
  authMiddleware.authorize({
    ...P.dataquery.delete,
    paramKey: "dataQueryID",
  }),
  dataQueryController.deleteDataQueryByID
);

module.exports = router;
