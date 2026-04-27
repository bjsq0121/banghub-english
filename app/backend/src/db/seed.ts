import { getConfig } from "../config.js";
import { hashPassword } from "../modules/auth/auth.service.js";
import { COLLECTIONS } from "./collections.js";
import { getKoreaDateKey } from "./date-key.js";
import { getFirestoreClient } from "./firestore.js";
import { seedDailyMissions } from "./seed-data.js";

export async function seedFirestore() {
  const config = getConfig();
  const db = getFirestoreClient();
  const now = new Date().toISOString();
  const today = getKoreaDateKey();
  const batch = db.batch();

  seedDailyMissions.forEach((item, index) => {
    batch.set(db.collection(COLLECTIONS.dailyMissions).doc(item.id), {
      ...item,
      dateKey: index === 0 ? today : item.dateKey,
      createdAt: now,
      updatedAt: now
    });
  });

  batch.set(db.collection(COLLECTIONS.users).doc("admin-user"), {
    email: config.adminEmail,
    passwordHash: hashPassword(config.adminPassword),
    difficulty: "basic",
    selectedTracks: ["family-missions"],
    isAdmin: true,
    createdAt: now,
    updatedAt: now
  });

  await batch.commit();
}

await seedFirestore();
