import { getConfig } from "../config";
import { hashPassword } from "../modules/auth/auth.service";
import { COLLECTIONS } from "./collections";
import { getFirestoreClient } from "./firestore";
import { seedConversationItems, seedNewsItems } from "./seed-data";

export async function seedFirestore() {
  const config = getConfig();
  const db = getFirestoreClient();
  const now = new Date().toISOString();
  const today = new Date().toISOString().slice(0, 10);
  const batch = db.batch();

  for (const item of seedConversationItems) {
    batch.set(db.collection(COLLECTIONS.conversationItems).doc(item.id), {
      ...item,
      createdAt: now,
      updatedAt: now
    });
  }

  for (const item of seedNewsItems) {
    batch.set(db.collection(COLLECTIONS.newsItems).doc(item.id), {
      ...item,
      createdAt: now,
      updatedAt: now
    });
  }

  batch.set(db.collection(COLLECTIONS.users).doc("admin-user"), {
    email: config.adminEmail,
    passwordHash: hashPassword(config.adminPassword),
    difficulty: "basic",
    selectedTracks: ["conversation", "news"],
    isAdmin: true,
    createdAt: now,
    updatedAt: now
  });

  batch.set(db.collection(COLLECTIONS.dailyAssignments).doc(today), {
    conversationItemId: "conversation-1",
    newsItemId: "news-1",
    publishedAt: now,
    updatedAt: now
  });

  await batch.commit();
}

await seedFirestore();
