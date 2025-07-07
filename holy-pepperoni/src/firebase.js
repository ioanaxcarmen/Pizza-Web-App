// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase project configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAmy5QM_cscHiNyoRdp4OF1ilwfyXqWRy4",           // API key for Firebase project
  authDomain: "holy-pepperoni.firebaseapp.com",                // Auth domain for Firebase Auth
  projectId: "holy-pepperoni",                                 // Project ID
  storageBucket: "holy-pepperoni.appspot.com",                 // Storage bucket for file uploads
  messagingSenderId: "69484819168",                            // Messaging sender ID
  appId: "1:69484819168:web:ce9c835b2b4530b682d685",           // App ID
  measurementId: "G-V8HGCMVP4D"                                // Analytics measurement ID
};

// Initialize Firebase app with the configuration
const app = initializeApp(firebaseConfig);
// Export the Firebase Auth instance for use in authentication
export const auth = getAuth(app);