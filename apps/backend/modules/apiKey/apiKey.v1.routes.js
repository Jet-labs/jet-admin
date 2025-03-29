const express = require("express");
const router = express.Router({mergeParams:true});
const { apiKeyController } = require("./apiKey.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// Database APIKey routes
router.get(
  "/",
  authMiddleware.checkUserPermissions(["tenant:apikey:list"]),
  apiKeyController.getAllAPIKeys
);

router.post(
  "/",
  authMiddleware.checkUserPermissions(["tenant:apikey:create"]),
  apiKeyController.createAPIKey
);

router.get(
  "/:apiKeyID",
  authMiddleware.checkUserPermissions(["tenant:apikey:read"]),
  apiKeyController.getAPIKeyByID
);

router.patch(
  "/:apiKeyID",
  authMiddleware.checkUserPermissions(["tenant:apikey:update"]),
  apiKeyController.updateAPIKeyByID
);

router.delete(
  "/:apiKeyID",
  authMiddleware.checkUserPermissions(["tenant:apikey:delete"]),
  apiKeyController.deleteAPIKeyByID
);

module.exports = router;