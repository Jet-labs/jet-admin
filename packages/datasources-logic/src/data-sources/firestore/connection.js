import { initializeApp, cert, getApps, deleteApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Logger } from "../../utils/logger";

export const firestoreTestConnection = async ({ datasourceOptions }) => {
  const { projectId, serviceAccountKey, databaseURL } = datasourceOptions;
  let app = null;
  
  try {
    Logger.log("info", {
      message: "firestore:firestoreTestConnection:params",
      params: { projectId, databaseURL },
    });

    // Parse service account key if it's a string
    let credential;
    if (serviceAccountKey) {
      try {
        const serviceAccount = typeof serviceAccountKey === "string" 
          ? JSON.parse(serviceAccountKey) 
          : serviceAccountKey;
        credential = cert(serviceAccount);
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

    // Create a unique app name for testing
    const appName = `test-${Date.now()}`;
    
    const appConfig = {
      credential,
      projectId,
    };
    
    if (databaseURL) {
      appConfig.databaseURL = databaseURL;
    }

    app = initializeApp(appConfig, appName);
    const db = getFirestore(app);

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
  } finally {
    // Clean up the test app
    if (app) {
      try {
        await deleteApp(app);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
};
