import { COLLECTIONS } from "../../db/collections";
import { getFirestoreClient } from "../../db/firestore";

export async function markCompletion(userId: string, contentId: string) {
  const db = getFirestoreClient();
  await db
    .collection(COLLECTIONS.users)
    .doc(userId)
    .collection("completions")
    .doc(contentId)
    .set({
      contentId,
      completedOn: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString()
    });
}

export async function listCompletions(userId: string) {
  const db = getFirestoreClient();
  const snapshot = await db.collection(COLLECTIONS.users).doc(userId).collection("completions").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as { contentId: string; completedOn: string };

    return {
      userId,
      contentId: data.contentId,
      completedOn: data.completedOn
    };
  });
}
