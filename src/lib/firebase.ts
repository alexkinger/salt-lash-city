import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId && config.authDomain,
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

function getApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!app) app = initializeApp(config);
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getApp();
  if (!firebaseApp) return null;
  if (!auth) auth = getAuth(firebaseApp);
  return auth;
}

export function getDb(): Firestore | null {
  const firebaseApp = getApp();
  if (!firebaseApp) return null;
  if (!db) db = getFirestore(firebaseApp);
  return db;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  const firebaseApp = getApp();
  if (!firebaseApp) return null;
  if (!storage) storage = getStorage(firebaseApp);
  return storage;
}

export function getContactFunctionUrl() {
  const override = import.meta.env.VITE_CONTACT_FUNCTION_URL;
  if (override) return override;
  return "/api/contact";
}
