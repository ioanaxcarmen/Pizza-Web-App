// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAmy5QM_cscHiNyoRdp4OF1ilwfyXqWRy4",
  authDomain: "holy-pepperoni.firebaseapp.com",
  projectId: "holy-pepperoni",
  storageBucket: "holy-pepperoni.appspot.com",
  messagingSenderId: "69484819168",
  appId: "1:69484819168:web:ce9c835b2b4530b682d685",
  measurementId: "G-V8HGCMVP4D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);