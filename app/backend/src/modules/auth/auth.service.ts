import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { COLLECTIONS } from "../../db/collections.js";
import { getFirestoreClient } from "../../db/firestore.js";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, hashedPassword: string) {
  const [salt, storedKey] = hashedPassword.split(":");

  if (!salt || !storedKey) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedKey, "hex");

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedKey);
}

export async function loginUser(email: string, password: string) {
  const db = getFirestoreClient();
  const snapshot = await db.collection(COLLECTIONS.users).where("email", "==", email).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0]!;
  const user = doc.data() as {
    email: string;
    passwordHash?: string;
    difficulty: "intro" | "basic" | "intermediate";
    selectedTracks: string[];
    isAdmin: boolean;
  };

  if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return {
    id: doc.id,
    email: user.email,
    difficulty: user.difficulty,
    selectedTracks: user.selectedTracks,
    isAdmin: user.isAdmin
  };
}

export async function getViewerById(userId: string) {
  const db = getFirestoreClient();
  const doc = await db.collection(COLLECTIONS.users).doc(userId).get();

  if (!doc.exists) {
    return null;
  }

  const user = doc.data() as {
    email: string;
    difficulty: "intro" | "basic" | "intermediate";
    selectedTracks: string[];
    isAdmin: boolean;
  };

  return {
    id: doc.id,
    email: user.email,
    difficulty: user.difficulty,
    selectedTracks: user.selectedTracks,
    isAdmin: user.isAdmin
  };
}

export async function updatePreferences(userId: string, difficulty: string, selectedTracks: string[]) {
  const db = getFirestoreClient();
  await db.collection(COLLECTIONS.users).doc(userId).set(
    {
      difficulty,
      selectedTracks,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
}
