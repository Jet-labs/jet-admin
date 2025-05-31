const express = require("express");
const router = express.Router({mergeParams:true});
const { dataQueryController } = require("./dataQuery.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// Database query routes

router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:query:list"]),
  dataQueryController.getAllDataQueries
);

router.post(
  "/",
  body("dataQueryOptions")
    .notEmpty()
    .withMessage("dataQueryOptions is required"),
  body("dataQueryTitle")
    .notEmpty()
    .withMessage("dataQueryTitle is required"),
  body("runOnLoad").optional().isBoolean().withMessage("runOnLoad is required"),
  expressUtils.validationChecker,
  authMiddleware.authProvider,
  authMiddleware.checkUserPermissions(["tenant:query:create"]),
  dataQueryController.createDataQuery
);

router.post(
  "/bulk",
  expressUtils.validationChecker,
  authMiddleware.authProvider,
  authMiddleware.checkUserPermissions(["tenant:query:bulk:create"]),
  dataQueryController.createBulkDataQuery
);

router.post(
  "/:dataQueryID/clone",
  param("dataQueryID")
    .isNumeric()
    .withMessage("dataQueryID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:query:clone"]),
  dataQueryController.cloneDataQueryByID
);

router.patch(
  "/queryTest",
  body("dataQueryOptions")
    .notEmpty()
    .withMessage("dataQueryOptions is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:query:test"]),
  dataQueryController.runDataQuery
);

router.patch(
  "/aigenerate",
  body("aiPrompt").notEmpty().withMessage("aiPrompt is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:query:aigenerate"]),
  dataQueryController.generateAIPromptBasedQuery
);
router.get(
  "/:dataQueryID",
  param("dataQueryID")
    .isNumeric()
    .withMessage("dataQueryID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:query:read"]),
  dataQueryController.getDataQueryByID
);
router.post(
  "/:dataQueryID/queryTest",
  param("dataQueryID").isNumeric().withMessage("dataQueryID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:query:test"]),
  dataQueryController.runDataQueryByID
);
router.patch(
  "/:dataQueryID",
  param("dataQueryID")
    .isNumeric()
    .withMessage("dataQueryID must be a number"),
  body("dataQueryOptions")
    .notEmpty()
    .withMessage("dataQueryOptions is required"),
  body("dataQueryTitle")
    .notEmpty()
    .withMessage("dataQueryTitle is required"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:query:update"]),
  dataQueryController.updateDataQueryByID
);
router.delete(
  "/:dataQueryID",
  param("dataQueryID")
    .isNumeric()
    .withMessage("dataQueryID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:query:delete"]),
  dataQueryController.deleteDataQueryByID
);

module.exports = router;
