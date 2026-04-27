import { App, getApp, getApps, initializeApp } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { getConfig } from "../config.js";

let firestoreClient: Firestore | null = null;

function getFirebaseApp(): App {
  const config = getConfig();

  if (config.useFirestoreEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST = config.firestoreEmulatorHost;
  }

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    projectId: config.firestoreProjectId
  });
}

export function getFirestoreClient() {
  if (!firestoreClient) {
    firestoreClient = getFirestore(getFirebaseApp());
  }

  return firestoreClient;
}
