import { Firestore } from "@google-cloud/firestore";
import { google } from "googleapis";
import { Logger } from "../../utils/logger.js";

export const firestoreTestConnection = async ({ datasourceOptions, helpers }) => {
  const { projectId, serviceAccountKey, vaultCredentialID, databaseURL } = datasourceOptions;
  
  try {
    Logger.log("info", {
      message: "firestore:firestoreTestConnection:params",
      params: { projectId, databaseURL },
    });

    let finalKey = serviceAccountKey;

    if (vaultCredentialID && helpers && typeof helpers.getCredential === "function") {
      try {
        const credential = await helpers.getCredential(vaultCredentialID);
        if (credential) {
          finalKey = credential;
        }
      } catch (err) {
        Logger.log("error", {
          message: "firestoreTestConnection:failed_vault",
          params: { error: err.message },
        });
      }
    }

    const firestoreConfig = {
      projectId,
    };

    if (databaseURL) {
      firestoreConfig.databaseId = databaseURL;
    }

    if (finalKey) {
      if (typeof finalKey === "object" && finalKey.refreshToken) {
        try {
          let clientId = null;
          let clientSecret = null;
          if (helpers && typeof helpers.getGoogleClientConfig === "function") {
            const clientConfig = helpers.getGoogleClientConfig();
            if (clientConfig) {
              clientId = clientConfig.clientId;
              clientSecret = clientConfig.clientSecret;
            }
          }
          if (!clientId || !clientSecret) {
            throw new Error("Google OAuth app credentials are not configured on the server.");
          }
          const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
          oauth2Client.setCredentials({ refresh_token: finalKey.refreshToken });
          
          firestoreConfig.authClient = oauth2Client;
        } catch (oauthError) {
          Logger.log("error", {
            message: "firestore:firestoreTestConnection:oauthError",
            params: { error: oauthError.message },
          });
          return {
            ok: false,
            error: "Failed to initialize Google OAuth credential: " + oauthError.message,
          };
        }
      } else {
        try {
          const serviceAccount = typeof finalKey === "string" 
            ? JSON.parse(finalKey) 
            : finalKey;
          
          firestoreConfig.credentials = {
            client_email: serviceAccount.client_email,
            private_key: serviceAccount.private_key,
          };
        } catch (parseError) {
          Logger.log("error", {
            message: "firestore:firestoreTestConnection:parseError",
            params: { error: parseError.message },
          });
          return {
            ok: false,
            error: "Invalid service account JSON: " + parseError.message,
          };
        }
      }
    }

    const db = new Firestore(firestoreConfig);

    // Test the connection by listing collections
    const collections = await db.listCollections();
    const collectionNames = collections.map(col => col.id);

    Logger.log("info", {
      message: "firestore:firestoreTestConnection:success",
      params: { projectId, collectionCount: collectionNames.length },
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
      collections: collectionNames,
    };
  } catch (error) {
    Logger.log("error", {
      message: "firestore:firestoreTestConnection:catch",
      params: { error: error.message },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
