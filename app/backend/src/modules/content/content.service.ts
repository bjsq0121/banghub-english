import { dailyMissionSchema } from "@banghub/shared";
import { COLLECTIONS } from "../../db/collections.js";
import { getKoreaDateKey } from "../../db/date-key.js";
import { getFirestoreClient } from "../../db/firestore.js";

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

function getSortableUpdatedAt(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  const data = doc.data() as { updatedAt?: unknown; createdAt?: unknown };
  return typeof data.updatedAt === "string"
    ? data.updatedAt
    : typeof data.createdAt === "string"
      ? data.createdAt
      : "";
}

function compareTodayMissionDocs(
  left: FirebaseFirestore.QueryDocumentSnapshot,
  right: FirebaseFirestore.QueryDocumentSnapshot
) {
  const updatedAtComparison = getSortableUpdatedAt(right).localeCompare(getSortableUpdatedAt(left));

  if (updatedAtComparison !== 0) {
    return updatedAtComparison;
  }

  return left.id.localeCompare(right.id);
}

export async function getTodayMission() {
  const db = getFirestoreClient();
  const today = todayKey();
  const snapshot = await db
    .collection(COLLECTIONS.dailyMissions)
    .where("dateKey", "==", today)
    .where("publishStatus", "==", "published")
    .get();

  const doc = [...snapshot.docs].sort(compareTodayMissionDocs)[0];

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
