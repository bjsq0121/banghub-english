import { FormEvent, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export function AdminPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const track = String(form.get("track"));
    const title = String(form.get("title"));

    const payload =
      track === "conversation"
        ? {
            id: crypto.randomUUID(),
            track: "conversation",
            difficulty: "basic",
            title,
            situation: "Admin-entered conversation setup",
            prompt: "Say hello to the client.",
            answer: "Thanks for meeting today.",
            alternatives: ["Thanks for joining today."],
            ttsText: "Thanks for meeting today.",
            publishStatus: "published",
            isToday: true
          }
        : {
            id: crypto.randomUUID(),
            track: "news",
            difficulty: "basic",
            title,
            passage: "Stocks rose after the rate decision.",
            vocabulary: [{ term: "rose", meaning: "went up" }],
            question: "What went up?",
            answer: "Stocks.",
            ttsText: "Stocks rose after the rate decision.",
            publishStatus: "published",
            isToday: true
          };

    const response = await fetch(`${API_BASE}/api/admin/content`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setMessage(response.ok ? "Saved." : "Save failed.");
  }

  return (
    <main className="page">
      <h1>Admin publishing</h1>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" />
        <select name="track" defaultValue="conversation">
          <option value="conversation">Conversation</option>
          <option value="news">News</option>
        </select>
        <button type="submit">Publish today</button>
      </form>
      {message ? <p>{message}</p> : null}
    </main>
  );
}
