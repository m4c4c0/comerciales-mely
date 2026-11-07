import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mismo proyecto Firebase que la web (comerciales-mely). Estos valores son
// identificadores públicos del cliente; la seguridad la dan las reglas de Firestore.
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCGTLDar3ConqwOHD7Ex8ZLdvuUMTLjznQ",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "comerciales-mely.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "comerciales-mely",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "comerciales-mely.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "945325242075",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:945325242075:web:5872a9b3b4bc123b4ebefe",
};

// Client ID de tipo "Web" de Google (Firebase Console > Authentication > Google).
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  "945325242075-1s2ssfk2jqfsh0l28u90tb7a81nn8j1i.apps.googleusercontent.com";

const existing = getApps().length > 0;
export const app = existing ? getApp() : initializeApp(firebaseConfig);

// La sesión de Firebase se persiste en AsyncStorage para sobrevivir al cierre de la app.
export const auth = existing
  ? getAuth(app)
  : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);

