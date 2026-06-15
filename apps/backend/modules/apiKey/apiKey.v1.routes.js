const express = require("express");
const router = express.Router({ mergeParams: true });
const { apiKeyController } = require("./apiKey.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, validateAll } = require("../../utils/validation.utils");
const {
    createApiKeySchema,
    updateApiKeySchema,
    apiKeyIdParamSchema,
} = require("./apiKey.validator");

// Database APIKey routes
router.get(
  "/",
  authMiddleware.authorize("apikey", "list"),
  apiKeyController.getAllAPIKeys
);

router.post(
  "/",
  validate(createApiKeySchema, "body"),
  authMiddleware.authorize("apikey", "create"),
  apiKeyController.createAPIKey
);

router.get(
  "/:apiKeyID",
  validate(apiKeyIdParamSchema, "params"),
  authMiddleware.authorize("apikey", "read", {
    paramKey: "apiKeyID",
  }),
  apiKeyController.getAPIKeyByID
);

router.patch(
  "/:apiKeyID",
  validateAll({
      params: apiKeyIdParamSchema,
      body: updateApiKeySchema,
  }),
  authMiddleware.authorize("apikey", "update", {
    paramKey: "apiKeyID",
  }),
  apiKeyController.updateAPIKeyByID
);

router.delete(
  "/:apiKeyID",
  validate(apiKeyIdParamSchema, "params"),
  authMiddleware.authorize("apikey", "delete", {
    paramKey: "apiKeyID",
  }),
  apiKeyController.deleteAPIKeyByID
);

router.post(
  "/:apiKeyID/clone",
  validate(apiKeyIdParamSchema, "params"),
  authMiddleware.authorize([
    { resource: "apikey", action: "create" },
    { resource: "apikey", action: "read", paramKey: "apiKeyID" }
  ]),
  apiKeyController.cloneAPIKey
);

module.exports = router;
