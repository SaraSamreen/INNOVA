// src/firebase.js

// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyChCy0Rl1Q8DX-ay7SwrJ7ZydcZx1hrurg",
  authDomain: "innova-oauth.firebaseapp.com",
  projectId: "innova-oauth",
  storageBucket: "innova-oauth.firebasestorage.app",
  messagingSenderId: "816331686234",
  appId: "1:816331686234:web:eb195d1af2c31b61303363",
  measurementId: "G-S5908KVQ2F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);

// Initialize authentication
export const auth = getAuth(app);

// Google provider
const provider = new GoogleAuthProvider();

// Exported function for Google Login
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user; // send user info back
  } catch (error) {
    console.error("Google Sign-in Error:", error);
    throw error;
  }
};
