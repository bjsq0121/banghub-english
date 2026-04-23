import { conversationItemSchema, newsItemSchema } from "@banghub/shared";
import { COLLECTIONS } from "../../db/collections";
import { getFirestoreClient } from "../../db/firestore";

function getTodayAssignmentId(
  assignment: { conversationItemId?: string | null; newsItemId?: string | null },
  track: "conversation" | "news"
) {
  return track === "conversation" ? assignment.conversationItemId : assignment.newsItemId;
}

export async function getTodayContent() {
  const db = getFirestoreClient();
  const today = new Date().toISOString().slice(0, 10);
  const assignmentDoc = await db.collection(COLLECTIONS.dailyAssignments).doc(today).get();

  if (!assignmentDoc.exists) {
    return {
      todayConversation: null,
      todayNews: null
    };
  }

  const assignment = assignmentDoc.data() as {
    conversationItemId?: string | null;
    newsItemId?: string | null;
  };

  const conversationDoc = assignment.conversationItemId
    ? await db.collection(COLLECTIONS.conversationItems).doc(assignment.conversationItemId).get()
    : null;
  const newsDoc = assignment.newsItemId
    ? await db.collection(COLLECTIONS.newsItems).doc(assignment.newsItemId).get()
    : null;

  return {
    todayConversation: conversationDoc?.exists
      ? conversationItemSchema.parse({
          id: conversationDoc.id,
          track: "conversation",
          isToday: true,
          ...conversationDoc.data()
        })
      : null,
    todayNews: newsDoc?.exists
      ? newsItemSchema.parse({
          id: newsDoc.id,
          track: "news",
          isToday: true,
          ...newsDoc.data()
        })
      : null
  };
}

export async function getContentById(track: "conversation" | "news", id: string) {
  const db = getFirestoreClient();
  const today = new Date().toISOString().slice(0, 10);
  const collection =
    track === "conversation" ? COLLECTIONS.conversationItems : COLLECTIONS.newsItems;
  const doc = await db.collection(collection).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const assignmentDoc = await db.collection(COLLECTIONS.dailyAssignments).doc(today).get();
  const assignment = assignmentDoc.exists
    ? (assignmentDoc.data() as {
        conversationItemId?: string | null;
        newsItemId?: string | null;
      })
    : {};
  const isToday = getTodayAssignmentId(assignment, track) === id;

  return track === "conversation"
    ? conversationItemSchema.parse({
        id: doc.id,
        track: "conversation",
        isToday,
        ...doc.data()
      })
    : newsItemSchema.parse({
        id: doc.id,
        track: "news",
        isToday,
        ...doc.data()
      });
}
