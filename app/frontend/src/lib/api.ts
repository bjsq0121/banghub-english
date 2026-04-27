import type {
  ChildMode,
  HomeResponse,
  LoginRequest,
  MarkCompletionRequest,
  MissionDetailResponse,
  UpdatePreferencesRequest
} from "@banghub/shared";

export function resolveApiBase(explicitBase: string | undefined, isDev: boolean) {
  if (typeof explicitBase === "string") {
    return explicitBase;
  }

  return isDev ? "http://localhost:4000" : "";
}

export const API_BASE = resolveApiBase(import.meta.env.VITE_API_BASE_URL, import.meta.env.DEV);

async function readJson<T>(
  response: Response,
  fallbackMessage: string,
  options: { useResponseMessage?: boolean } = { useResponseMessage: true }
): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      options.useResponseMessage !== false &&
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : fallbackMessage;
    throw new Error(message);
  }

  return payload as T;
}

export async function getHome(): Promise<HomeResponse> {
  const response = await fetch(`${API_BASE}/api/home`, { credentials: "include" });
  return readJson<HomeResponse>(response, "Failed to load home", { useResponseMessage: false });
}

export async function getMission(id: string): Promise<MissionDetailResponse["item"]> {
  const response = await fetch(`${API_BASE}/api/missions/${id}`, {
    credentials: "include"
  });

  const payload = await readJson<MissionDetailResponse>(
    response,
    response.status === 404 ? "Mission not found" : "Failed to load mission",
    { useResponseMessage: false }
  );
  return payload.item as MissionDetailResponse["item"];
}

type LoginResponse = {
  user?: HomeResponse["viewer"];
  message?: string;
};

export async function login(email: LoginRequest["email"], password: LoginRequest["password"]) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  return readJson<LoginResponse>(response, "Login failed");
}

export async function updatePreferences(payload: UpdatePreferencesRequest) {
  const response = await fetch(`${API_BASE}/api/auth/preferences`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return readJson<{ ok: boolean }>(response, "Failed to update preferences");
}

export async function markCompletion(payload: MarkCompletionRequest) {
  const response = await fetch(`${API_BASE}/api/progress/completions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return readJson<{ ok: boolean }>(response, "Failed to save completion");
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
