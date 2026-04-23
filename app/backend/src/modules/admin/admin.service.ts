import { dailyMissionSchema } from "@banghub/shared";
import { COLLECTIONS } from "../../db/collections";
import { getKoreaDateKey } from "../../db/date-key";
import { getFirestoreClient } from "../../db/firestore";

export async function saveDailyMission(payload: unknown) {
  const parsed = dailyMissionSchema.parse(payload);
  const { isToday: _isToday, ...missionData } = parsed;

  if (parsed.isToday) {
    missionData.dateKey = getKoreaDateKey();
  }

  const db = getFirestoreClient();
  const now = new Date().toISOString();

  await db.collection(COLLECTIONS.dailyMissions).doc(parsed.id).set({
    ...missionData,
    createdAt: now,
    updatedAt: now
  });

  return { ...parsed, dateKey: missionData.dateKey };
}
