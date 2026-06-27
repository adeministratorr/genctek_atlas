import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration using Vite environment variables with fallback values.
// Students should replace these with their own Firebase project credentials.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID",
};

// Initialize Firebase safely to prevent duplicate App initialization during HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Services with custom settings to bypass restricted networks CORS channel blocks
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false, // Force long-polling and disable WebSocket/Stream autodetect
  useFetchStreams: false,
});
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage, firebaseConfig };
export default app;
