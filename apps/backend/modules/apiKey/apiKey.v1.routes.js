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
  authMiddleware.checkUserPermissions(["tenant:apikey:list"]),
  apiKeyController.getAllAPIKeys
);

router.post(
  "/",
    validate(createApiKeySchema, "body"),
  authMiddleware.checkUserPermissions(["tenant:apikey:create"]),
  apiKeyController.createAPIKey
);

router.get(
  "/:apiKeyID",
    validate(apiKeyIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:apikey:read"]),
  apiKeyController.getAPIKeyByID
);

router.patch(
  "/:apiKeyID",
    validateAll({
        params: apiKeyIdParamSchema,
        body: updateApiKeySchema,
    }),
  authMiddleware.checkUserPermissions(["tenant:apikey:update"]),
  apiKeyController.updateAPIKeyByID
);

router.delete(
  "/:apiKeyID",
    validate(apiKeyIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:apikey:delete"]),
  apiKeyController.deleteAPIKeyByID
);

router.post(
  "/:apiKeyID/clone",
  validate(apiKeyIdParamSchema, "params"),
  authMiddleware.checkUserPermissions(["tenant:apikey:create"]),
  apiKeyController.cloneAPIKey
);

module.exports = router;
