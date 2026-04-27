import { getStorage } from "firebase-admin/storage";
import { getConfig } from "../config";
import { getFirebaseApp } from "./firestore";

export function getStorageBucket() {
  const config = getConfig();

  if (!config.storageBucket) {
    throw new Error("STORAGE_BUCKET must be set");
  }

  return getStorage(getFirebaseApp()).bucket(config.storageBucket);
}
