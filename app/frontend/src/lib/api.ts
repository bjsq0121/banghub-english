import type {
  ChildMode,
  HomeResponse,
  MarkCompletionRequest,
  MissionDetailResponse,
  UpdatePreferencesRequest
} from "@banghub/shared";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export async function getHome(): Promise<HomeResponse> {
  const response = await fetch(`${API_BASE}/api/home`, { credentials: "include" });
  return response.json();
}

export async function getMission(id: string): Promise<MissionDetailResponse["item"]> {
  const response = await fetch(`${API_BASE}/api/missions/${id}`, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(response.status === 404 ? "Mission not found" : "Failed to load mission");
  }

  const payload = await response.json();
  return payload.item as MissionDetailResponse["item"];
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

export function getChildModeLabel(childMode: ChildMode) {
  if (childMode === "age3") {
    return "3세";
  }

  if (childMode === "age6") {
    return "6세";
  }

  return "같이";
}
