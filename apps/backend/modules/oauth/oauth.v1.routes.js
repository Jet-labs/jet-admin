const express = require("express");
const router = express.Router();
const { oauthController } = require("./oauth.controller");
const { authMiddleware } = require("../auth/auth.middleware");

// Get Google OAuth Authorization URL (authenticated) - matching frontend useOAuthPopup
router.get(
  "/google/auth/:tenantID",
  authMiddleware.authProvider,
  authMiddleware.authorize("datasource", "update"),
  oauthController.getGoogleAuthUrl
);

// Get Google OAuth Authorization URL (authenticated)
router.get(
  "/:tenantID/google/url",
  authMiddleware.authProvider,
  authMiddleware.authorize("datasource", "update"),
  oauthController.getGoogleAuthUrl
);

// Google OAuth Redirect Callback (public)
router.get(
  "/google/callback",
  oauthController.handleGoogleCallback
);

module.exports = router;
