// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "bangla-typing-master",
  appId: "1:478439890216:web:3fbad072de80d31041441d",
  storageBucket: "bangla-typing-master.firebasestorage.app",
  apiKey: "AIzaSyC4cGo59Yc7besX3bC4zZJVRNL3D9IzWiQ",
  authDomain: "bangla-typing-master.firebaseapp.com",
  messagingSenderId: "478439890216",
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
