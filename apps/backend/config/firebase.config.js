const admin = require("firebase-admin");
const Logger = require("../utils/logger");

let serviceAccount = null;

try {
  serviceAccount = require("../firebase-key.json");
} catch (error) {
  if (process.env.FIREBASE_CREDENTIALS) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    } catch (e) {
      Logger.log("error", { message: "Failed to parse FIREBASE_CREDENTIALS env variable" });
    }
  } else {
    Logger.log("warn", { message: "firebase-key.json not found and FIREBASE_CREDENTIALS not set" });
  }
}

let firebaseApp = null;
let messaging = null;

if (serviceAccount) {
  firebaseApp = admin.initializeApp({
    // @ts-ignore
    credential: admin.credential.cert(serviceAccount),
  });
  messaging = admin.messaging(firebaseApp);
  
  // @ts-ignore
  Logger.log("success", {
    message: "configureFirebase:firebase app configured",
    params: { firebaseApp: firebaseApp.options.credential.projectId },
  });
}

module.exports = { firebaseApp, messaging };
