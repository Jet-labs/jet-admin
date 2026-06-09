import { google } from "googleapis";
import { Logger } from "../../utils/logger.js";

export const googlesheetsTestConnection = async ({ datasourceOptions, helpers }) => {
  try {
    Logger.log("info", {
      message: "googlesheets:googlesheetsTestConnection:params",
    });

    let auth;

    if (datasourceOptions.authType === "serviceAccount" && datasourceOptions.serviceAccountKey) {
      const credentials = typeof datasourceOptions.serviceAccountKey === "string"
        ? JSON.parse(datasourceOptions.serviceAccountKey)
        : datasourceOptions.serviceAccountKey;

      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });
    } else if (datasourceOptions.authType === "oauth2" && datasourceOptions.oauth2) {
      let clientId = null;
      let clientSecret = null;

      if (helpers && typeof helpers.getGoogleClientConfig === "function") {
        const clientConfig = helpers.getGoogleClientConfig();
        if (clientConfig) {
          clientId = clientConfig.clientId;
          clientSecret = clientConfig.clientSecret;
        }
      }

      let refreshToken = null;

      if (datasourceOptions.oauth2.vaultCredentialID && helpers && typeof helpers.getCredential === "function") {
        try {
          const credential = await helpers.getCredential(datasourceOptions.oauth2.vaultCredentialID);
          if (credential) {
            refreshToken = credential.refreshToken;
          }
        } catch (err) {
          Logger.log("error", {
            message: "googlesheetsTestConnection:failed_vault",
            params: { error: err.message },
          });
        }
      }

      if (!clientId || !clientSecret) {
        throw new Error("Google OAuth app credentials are not configured on the server.");
      }

      if (!refreshToken) {
        throw new Error("OAuth2 credentials not found in vault.");
      }
      
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      
      auth = oauth2Client;
    } else {
      return {
        ok: false,
        error: "Invalid authentication configuration. Provide service account key or OAuth2 credentials.",
      };
    }

    const sheets = google.sheets({ version: "v4", auth });
    
    // Test by checking if we can access the API
    if (datasourceOptions.defaultSpreadsheetId) {
      await sheets.spreadsheets.get({
        spreadsheetId: datasourceOptions.defaultSpreadsheetId,
      });
    }

    Logger.log("info", {
      message: "googlesheets:googlesheetsTestConnection:connected",
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "googlesheets:googlesheetsTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
