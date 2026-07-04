const express = require("express");
const router = express.Router();
const { oauthController } = require("./oauth.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { validate, schemas } = require("../../utils/validation.utils");
const { P } = require("../../config/permissions");

// Get Google OAuth Authorization URL (authenticated) - matching frontend useOAuthPopup
router.get(
  "/google/auth/:tenantID",
  authMiddleware.authProvider,
  validate(schemas.tenantIdParamSchema, "params"),
  authMiddleware.authorize(P.datasource.update),
  oauthController.getGoogleAuthUrl
);

// Get Google OAuth Authorization URL (authenticated)
router.get(
  "/:tenantID/google/url",
  authMiddleware.authProvider,
  validate(schemas.tenantIdParamSchema, "params"),
  authMiddleware.authorize(P.datasource.update),
  oauthController.getGoogleAuthUrl
);

// Google OAuth Redirect Callback (public)
router.get(
  "/google/callback",
  oauthController.handleGoogleCallback
);

module.exports = router;
