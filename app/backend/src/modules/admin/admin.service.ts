import { conversationItemSchema, newsItemSchema } from "@banghub/shared";
import { COLLECTIONS } from "../../db/collections";
import { getFirestoreClient } from "../../db/firestore";

export async function saveContentItem(payload: unknown) {
  const parsed =
    typeof payload === "object" && payload && (payload as { track?: string }).track === "conversation"
      ? conversationItemSchema.parse(payload)
      : newsItemSchema.parse(payload);

  const db = getFirestoreClient();
  const now = new Date().toISOString();
  const today = new Date().toISOString().slice(0, 10);
  const collection =
    parsed.track === "conversation" ? COLLECTIONS.conversationItems : COLLECTIONS.newsItems;

  await db.collection(collection).doc(parsed.id).set({
    ...parsed,
    createdAt: now,
    updatedAt: now
  });

  if (parsed.isToday) {
    await db.collection(COLLECTIONS.dailyAssignments).doc(today).set(
      parsed.track === "conversation"
        ? {
            conversationItemId: parsed.id,
            updatedAt: now
          }
        : {
            newsItemId: parsed.id,
            updatedAt: now
          },
      { merge: true }
    );
  }

  return parsed;
}
