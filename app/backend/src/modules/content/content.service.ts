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

export function getContentById(track: "conversation" | "news", id: string) {
  const row = db.read().content_items.find((entry) => entry.track === track && entry.id === id);

  if (!row) {
    return null;
  }

  const parsed = JSON.parse(row.payload_json);
  return track === "conversation"
    ? conversationItemSchema.parse(parsed)
    : newsItemSchema.parse(parsed);
}
