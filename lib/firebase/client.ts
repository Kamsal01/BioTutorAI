import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

function requiredEnv(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing Firebase environment variable: ${name}`);
  return value;
}

export function isFirebaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

export function getFirebaseApp() {
  if (getApps().length) return getApp();

  return initializeApp({
    apiKey: requiredEnv("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: requiredEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: requiredEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: requiredEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: requiredEnv("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
  });
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseStorage() {
  return getStorage(getFirebaseApp());
}
