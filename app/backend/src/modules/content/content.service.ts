import { conversationItemSchema, newsItemSchema } from "@banghub/shared";
import { db } from "../../db/client";

export function getTodayContent() {
  const state = db.read();
  const conversationRow = state.content_items.find(
    (row) => row.track === "conversation" && row.publish_status === "published" && row.is_today === 1
  );
  const newsRow = state.content_items.find(
    (row) => row.track === "news" && row.publish_status === "published" && row.is_today === 1
  );

  return {
    todayConversation: conversationRow
      ? conversationItemSchema.parse(JSON.parse(conversationRow.payload_json))
      : null,
    todayNews: newsRow ? newsItemSchema.parse(JSON.parse(newsRow.payload_json)) : null
  };
}
