const express = require("express");
const router = express.Router({mergeParams:true});
const { apiKeyController } = require("./apiKey.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { body, param } = require("express-validator");
const { expressUtils } = require("../../utils/express.utils");

// Database APIKey routes
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:apikey:list"]),
  apiKeyController.getAllAPIKeys
);

router.post(
  "/",
  body("apiKeyName").notEmpty().withMessage("apiKeyName is required"),
  body("roleIDs").optional().isArray().withMessage("roleIDs must be an array"),
  body("roleIDs.*")
    .optional()
    .isNumeric()
    .withMessage("roleIDs must be an array of numbers"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:apikey:create"]),
  apiKeyController.createAPIKey
);

router.get(
  "/:apiKeyID",
  param("apiKeyID").isNumeric().withMessage("apiKeyID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:apikey:read"]),
  apiKeyController.getAPIKeyByID
);

router.patch(
  "/:apiKeyID",
  param("apiKeyID").isNumeric().withMessage("apiKeyID must be a number"),
  body("apiKeyName").notEmpty().withMessage("apiKeyName is required"),
  body("roleIDs").optional().isArray().withMessage("roleIDs must be an array"),
  body("roleIDs.*")
    .optional()
    .isNumeric()
    .withMessage("roleIDs must be an array of numbers"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:apikey:update"]),
  apiKeyController.updateAPIKeyByID
);

router.delete(
  "/:apiKeyID",
  param("apiKeyID").isNumeric().withMessage("apiKeyID must be a number"),
  expressUtils.validationChecker,
  authMiddleware.checkUserPermissions(["tenant:apikey:delete"]),
  apiKeyController.deleteAPIKeyByID
);

module.exports = router;