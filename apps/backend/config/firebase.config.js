const admin = require("firebase-admin");
const Logger = require("../utils/logger");
const environmentVariables = require("../environment");

let serviceAccount = null;

try {
  serviceAccount = JSON.parse(environmentVariables.FIREBASE_CREDENTIALS);
} catch (e) {
  Logger.log("error", { message: "Failed to parse FIREBASE_CREDENTIALS env variable" });
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
