import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import config from "../config/firebase-client.json";

// This delivery is pinned to the team's original Firebase project. These are
// public client identifiers; Authentication and Firestore rules enforce access.
// Existing Vercel environment values must not reconnect the temporary project.

const app = getApps().length ? getApp() : initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
