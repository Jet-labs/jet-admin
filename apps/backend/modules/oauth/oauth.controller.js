const constants = require("../../constants");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const Logger = require("../../utils/logger");
const { vaultService } = require("../vault/vault.service");
const { expressUtils } = require("../../utils/express.utils");
const environment = require("../../environment");

const oauthController = {};

const getRedirectUri = (req) => {
  if (environment.BACKEND_URL) {
    return `${environment.BACKEND_URL}/api/v1/oauth/google/callback`;
  }
  if (req && req.headers && req.headers.host) {
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    return `${protocol}://${req.headers.host}/api/v1/oauth/google/callback`;
  }
  const port = environment.PORT || 8090;
  return `http://localhost:${port}/api/v1/oauth/google/callback`;
};

/**
 * Generates the Google OAuth authorization URL.
 * GET /api/v1/oauth/google/url?tenantId=xxx
 */
oauthController.getGoogleAuthUrl = async (req, res) => {
  const { tenantID } = req.params;
  Logger.log("info", {
    message: "oauthController:getGoogleAuthUrl:params",
    params: { tenantID },
  });

  try {
    const { clientId } = vaultService.getGoogleClientConfig();
    if (!clientId) {
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }

    // Sign the state using the vault encryption key, valid for 10 minutes
    const stateToken = jwt.sign(
      { 
        tenantID,
        creatorID: req.user?.userID || null,
        createdByApiKeyID: req.authContext?.apiKey?.apiKeyID || null
      },
      environment.OAUTH_STATE_SECRET,
      { expiresIn: "10m" }
    );

    const scopes = [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/datastore",
      "openid",
      "email",
      "profile"
    ];

    const redirectUri = getRedirectUri(req);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scopes.join(" "))}` +
      `&access_type=offline` +
      `&prompt=consent` +
      `&state=${encodeURIComponent(stateToken)}`;

    return expressUtils.sendResponse(res, true, { url: authUrl }, null, constants.HTTP_STATUS.OK);
  } catch (error) {
    Logger.log("error", {
      message: "oauthController:getGoogleAuthUrl:failure",
      params: { tenantID, errorMessage: error.message },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Handles the Google OAuth callback.
 * GET /api/v1/oauth/google/callback
 */
oauthController.handleGoogleCallback = async (req, res) => {
  const { code, state, error } = req.query;

  Logger.log("info", {
    message: "oauthController:handleGoogleCallback:params",
    params: { code: !!code, state: !!state, error },
  });

  if (error) {
    const safeError = JSON.stringify(error).replace(/</g, "\\u003c");
    return res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'OAUTH_FAILURE', error: ${safeError} }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  }

  try {
    if (!code || !state) {
      throw new Error("Missing authorization code or state");
    }

    // Verify state token and extract tenantID
    let decoded;
    try {
      decoded = jwt.verify(state, environment.OAUTH_STATE_SECRET);
    } catch (err) {
      throw new Error("Invalid or expired state token");
    }

    const { tenantID, creatorID, createdByApiKeyID } = decoded;

    const { clientId, clientSecret } = vaultService.getGoogleClientConfig();

    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth credentials are not fully configured on the server");
    }

    const redirectUri = getRedirectUri(req);
    // Exchange authorization code for tokens
    const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    if (!refresh_token) {
      Logger.log("warning", {
        message: "oauthController:handleGoogleCallback:no_refresh_token",
        params: { tenantID },
      });
    }

    // Retrieve user email/profile if we want a descriptive name in the vault
    let credentialName = "Google Account";
    try {
      const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (userInfoResponse.data && userInfoResponse.data.email) {
        credentialName = `Google Account - ${userInfoResponse.data.email}`;
      }
    } catch (err) {
      Logger.log("warning", {
        message: "oauthController:handleGoogleCallback:failed_userinfo",
        params: { error: err.message },
      });
    }

    // Store in Vault
    const vaultData = {
      accessToken: access_token,
      refreshToken: refresh_token || null,
      expiresAt: Date.now() + expires_in * 1000,
    };

    const stored = await vaultService.storeCredential({
      tenantID,
      provider: "google",
      name: credentialName,
      data: vaultData,
      creatorID,
      createdByApiKeyID,
    });

    const safeVaultCredentialID = JSON.stringify(stored.vaultCredentialID).replace(/</g, "\\u003c");
    return res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'OAUTH_SUCCESS', vaultCredentialID: ${safeVaultCredentialID} }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    Logger.log("error", {
      message: "oauthController:handleGoogleCallback:failure",
      params: { errorMessage: err.message },
    });
    const safeErrMsg = JSON.stringify(err.message).replace(/</g, "\\u003c");
    return res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'OAUTH_FAILURE', error: ${safeErrMsg} }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  }
};

module.exports = { oauthController };
