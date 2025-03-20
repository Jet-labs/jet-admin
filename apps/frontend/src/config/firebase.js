import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC36hc0GR2vNqYpEbbd15g1_hfHeToPFOo",
  authDomain: "jet-restaurant-admin.firebaseapp.com",
  projectId: "jet-restaurant-admin",
  storageBucket: "jet-restaurant-admin.firebasestorage.app",
  messagingSenderId: "359329245037",
  appId: "1:359329245037:web:8358d7675f5f7576b69c64",
  measurementId: "G-WGNEJR5SNN",
};

const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseMessaging = getMessaging(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
export default firebaseApp;
