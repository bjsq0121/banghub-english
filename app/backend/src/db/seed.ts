import { getConfig } from "../config";
import { hashPassword } from "../modules/auth/auth.service";
import { COLLECTIONS } from "./collections";
import { getKoreaDateKey } from "./date-key";
import { getFirestoreClient } from "./firestore";
import { seedDailyMissions } from "./seed-data";

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
