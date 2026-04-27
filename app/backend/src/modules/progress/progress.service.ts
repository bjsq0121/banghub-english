import type { ChildMode } from "@banghub/shared";
import { COLLECTIONS } from "../../db/collections.js";
import { getKoreaDateKey } from "../../db/date-key.js";
import { getFirestoreClient } from "../../db/firestore.js";

export async function markCompletion(userId: string, missionId: string, childMode: ChildMode) {
  const db = getFirestoreClient();
  const now = new Date();
  const completedOn = getKoreaDateKey(now);

  await db
    .collection(COLLECTIONS.users)
    .doc(userId)
    .collection("completions")
    .doc(`${completedOn}-${missionId}-${childMode}`)
    .set({
      missionId,
      childMode,
      completedOn,
      rewardId: `sticker-${childMode}`,
      createdAt: now.toISOString()
    });
}

export async function listCompletions(userId: string) {
  const db = getFirestoreClient();
  const snapshot = await db.collection(COLLECTIONS.users).doc(userId).collection("completions").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as {
      missionId: string;
      childMode: ChildMode;
      completedOn: string;
      rewardId: string;
    };

    return {
      userId,
      missionId: data.missionId,
      childMode: data.childMode,
      completedOn: data.completedOn,
      rewardId: data.rewardId
    };
  });
}
