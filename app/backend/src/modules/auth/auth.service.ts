import { db } from "../../db/client";

export function loginUser(email: string, password: string) {
  const state = db.read();
  const user = state.users.find((entry) => entry.email === email && entry.password === password);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    difficulty: user.difficulty as "intro" | "basic" | "intermediate",
    selectedTracks: JSON.parse(user.selected_tracks) as Array<"conversation" | "news">,
    isAdmin: Boolean(user.is_admin)
  };
}

export function getViewerById(userId: string) {
  const state = db.read();
  const user = state.users.find((entry) => entry.id === userId);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    difficulty: user.difficulty as "intro" | "basic" | "intermediate",
    selectedTracks: JSON.parse(user.selected_tracks) as Array<"conversation" | "news">,
    isAdmin: Boolean(user.is_admin)
  };
}

export function updatePreferences(userId: string, difficulty: string, selectedTracks: string[]) {
  db.write((state) => {
    const user = state.users.find((entry) => entry.id === userId);

    if (user) {
      user.difficulty = difficulty;
      user.selected_tracks = JSON.stringify(selectedTracks);
    }
  });
}
