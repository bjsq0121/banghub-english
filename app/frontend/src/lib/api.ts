import type {
  ConversationItem,
  HomeResponse,
  MarkCompletionRequest,
  NewsItem,
  UpdatePreferencesRequest
} from "@banghub/shared";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export async function getHome(): Promise<HomeResponse> {
  const response = await fetch(`${API_BASE}/api/home`, { credentials: "include" });
  return response.json();
}

export async function getContentItem(track: "conversation" | "news", id: string) {
  const response = await fetch(`${API_BASE}/api/content/${track}/${id}`, {
    credentials: "include"
  });
  const payload = await response.json();
  return payload.item as ConversationItem | NewsItem;
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  return response.json();
}

export async function updatePreferences(payload: UpdatePreferencesRequest) {
  const response = await fetch(`${API_BASE}/api/auth/preferences`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return response.json();
}

export async function markCompletion(payload: MarkCompletionRequest) {
  const response = await fetch(`${API_BASE}/api/progress/completions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return response.json();
}
