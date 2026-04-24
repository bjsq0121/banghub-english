import { dailyMissionSchema } from "@banghub/shared";
import { COLLECTIONS } from "../../db/collections";
import { getKoreaDateKey } from "../../db/date-key";
import { getFirestoreClient } from "../../db/firestore";

function todayKey() {
  return getKoreaDateKey();
}

function parseMissionDocument(
  doc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>,
  todayMissionId: string | null
) {
  const data = doc.data();

  return dailyMissionSchema.parse({
    ...data,
    id: doc.id,
    isToday: doc.id === todayMissionId
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

async function getTodayMissionDoc(
  db: FirebaseFirestore.Firestore,
  today: string
): Promise<FirebaseFirestore.QueryDocumentSnapshot | null> {
  const snapshot = await db
    .collection(COLLECTIONS.dailyMissions)
    .where("dateKey", "==", today)
    .where("publishStatus", "==", "published")
    .get();

  return [...snapshot.docs].sort(compareTodayMissionDocs)[0] ?? null;
}

export async function getTodayMission() {
  const db = getFirestoreClient();
  const today = todayKey();
  const doc = await getTodayMissionDoc(db, today);

  if (!doc) {
    return null;
  }

  return parseMissionDocument(doc, doc.id);
}

export async function getMissionById(id: string) {
  const db = getFirestoreClient();
  const today = todayKey();
  const doc = await db.collection(COLLECTIONS.dailyMissions).doc(id).get();

  if (!doc.exists || doc.data()?.publishStatus !== "published") {
    return null;
  }

  const todayDoc = await getTodayMissionDoc(db, today);
  return parseMissionDocument(doc, todayDoc?.id ?? null);
}
