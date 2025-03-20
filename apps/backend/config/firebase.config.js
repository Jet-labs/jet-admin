const admin = require("firebase-admin");
const serviceAccount = require("../firebase-key.json");
const Logger = require("../utils/logger");

const firebaseApp = admin.initializeApp({
  // @ts-ignore
  credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging(firebaseApp);

// @ts-ignore
Logger.log("success", {
  message: "configureFirebase:firebase app configured",
  params: { firebaseApp: firebaseApp.options.credential.projectId },
});

module.exports = { firebaseApp, messaging };
