import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "../../db/client";

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

export function loginUser(email: string, password: string) {
  const state = db.read();
  const user = state.users.find(
    (entry) => entry.email === email && verifyPassword(password, entry.password)
  );

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    difficulty: user.difficulty as "intro" | "basic" | "intermediate",
    selectedTracks: JSON.parse(user.selected_tracks) as Array<"conversation" | "news">,
    isAdmin: Boolean(user.is_admin)
  };
}

export function getViewerById(userId: string) {
  const state = db.read();
  const user = state.users.find((entry) => entry.id === userId);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    difficulty: user.difficulty as "intro" | "basic" | "intermediate",
    selectedTracks: JSON.parse(user.selected_tracks) as Array<"conversation" | "news">,
    isAdmin: Boolean(user.is_admin)
  };
}

export function updatePreferences(userId: string, difficulty: string, selectedTracks: string[]) {
  db.write((state) => {
    const user = state.users.find((entry) => entry.id === userId);

    if (user) {
      user.difficulty = difficulty;
      user.selected_tracks = JSON.stringify(selectedTracks);
    }
  });
}
