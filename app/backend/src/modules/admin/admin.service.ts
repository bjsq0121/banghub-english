import { conversationItemSchema, newsItemSchema } from "@banghub/shared";
import { db } from "../../db/client";

export function saveContentItem(payload: unknown) {
  const parsed =
    typeof payload === "object" && payload && (payload as { track?: string }).track === "conversation"
      ? conversationItemSchema.parse(payload)
      : newsItemSchema.parse(payload);

  db.write((state) => {
    state.content_items = state.content_items.map((entry) =>
      entry.track === parsed.track ? { ...entry, is_today: 0 } : entry
    );

    const nextRow = {
      id: parsed.id,
      track: parsed.track,
      difficulty: parsed.difficulty,
      title: parsed.title,
      payload_json: JSON.stringify(parsed),
      publish_status: parsed.publishStatus,
      is_today: parsed.isToday ? 1 : 0
    };

    const existingIndex = state.content_items.findIndex((entry) => entry.id === parsed.id);

    if (existingIndex >= 0) {
      state.content_items[existingIndex] = nextRow;
    } else {
      state.content_items.push(nextRow);
    }
  });

  return parsed;
}
