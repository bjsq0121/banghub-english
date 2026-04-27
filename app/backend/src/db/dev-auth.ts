import { randomUUID } from "node:crypto";
import { COLLECTIONS } from "./collections.js";
import { getFirestoreClient } from "./firestore.js";

export async function ensureDevelopmentUser(email: string, isAdmin = false) {
  const db = getFirestoreClient();
  const existing = await db.collection(COLLECTIONS.users).where("email", "==", email).limit(1).get();

  if (!existing.empty) {
    return existing.docs[0]!.id;
  }

  const userId = randomUUID();
  await db.collection(COLLECTIONS.users).doc(userId).set({
    email,
    difficulty: "basic",
    selectedTracks: ["conversation", "news"],
    isAdmin,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return userId;
}
