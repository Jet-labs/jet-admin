const { Firestore } = require("@google-cloud/firestore");
const { google } = require("googleapis");

async function test() {
  try {
    const oauth2Client = new google.auth.OAuth2("dummy_id", "dummy_secret");
    oauth2Client.setCredentials({ refresh_token: "dummy_token" });

    const db = new Firestore({
      projectId: "dummy-project",
      authClient: oauth2Client
    });

    console.log("Firestore instantiated successfully with authClient");
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
