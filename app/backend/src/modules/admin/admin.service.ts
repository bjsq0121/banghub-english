import { dailyMissionSchema } from "@banghub/shared";
import { COLLECTIONS } from "../../db/collections.js";
import { getKoreaDateKey } from "../../db/date-key.js";
import { getFirestoreClient } from "../../db/firestore.js";

export async function saveDailyMission(payload: unknown) {
  const parsed = dailyMissionSchema.parse(payload);
  const { isToday: _isToday, ...missionData } = parsed;

  if (parsed.isToday) {
    missionData.dateKey = getKoreaDateKey();
  }

  const db = getFirestoreClient();
  const now = new Date().toISOString();
  const docRef = db.collection(COLLECTIONS.dailyMissions).doc(parsed.id);
  const existing = await docRef.get();
  const existingCreatedAt = existing.data()?.createdAt;
  const createdAt = typeof existingCreatedAt === "string" ? existingCreatedAt : now;

  await docRef.set({
    ...missionData,
    createdAt,
    updatedAt: now
  });

  return { ...parsed, dateKey: missionData.dateKey };
}
