import { db } from "../../db/client";

export function markCompletion(userId: string, contentId: string) {
  db.write((state) => {
    const existing = state.completions.find(
      (entry) => entry.user_id === userId && entry.content_id === contentId
    );

    if (existing) {
      existing.completed_on = new Date().toISOString().slice(0, 10);
      return;
    }

    state.completions.push({
      user_id: userId,
      content_id: contentId,
      completed_on: new Date().toISOString().slice(0, 10)
    });
  });
}

export function listCompletions(userId: string) {
  return db
    .read()
    .completions.filter((entry) => entry.user_id === userId)
    .map((entry) => ({
      userId: entry.user_id,
      contentId: entry.content_id,
      completedOn: entry.completed_on
    }));
}
