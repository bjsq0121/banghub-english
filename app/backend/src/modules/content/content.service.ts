import { dailyMissionSchema } from "@banghub/shared";
import { COLLECTIONS } from "../../db/collections";
import { getKoreaDateKey } from "../../db/date-key";
import { getFirestoreClient } from "../../db/firestore";

function todayKey() {
  return getKoreaDateKey();
}

function parseMissionDocument(
  doc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>,
  today: string
) {
  const data = doc.data();

  return dailyMissionSchema.parse({
    ...data,
    id: doc.id,
    isToday: data?.dateKey === today
  });
}

export async function getTodayMission() {
  const db = getFirestoreClient();
  const today = todayKey();
  const snapshot = await db
    .collection(COLLECTIONS.dailyMissions)
    .where("dateKey", "==", today)
    .where("publishStatus", "==", "published")
    .get();

  const doc = [...snapshot.docs].sort((left, right) => left.id.localeCompare(right.id))[0];

  if (!doc) {
    return null;
  }

  return parseMissionDocument(doc, today);
}

export async function getMissionById(id: string) {
  const db = getFirestoreClient();
  const today = todayKey();
  const doc = await db.collection(COLLECTIONS.dailyMissions).doc(id).get();

  if (!doc.exists || doc.data()?.publishStatus !== "published") {
    return null;
  }

  return parseMissionDocument(doc, today);
}
