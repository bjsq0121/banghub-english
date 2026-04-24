import { afterEach, beforeEach } from "vitest";
import { getConfig } from "../config";

const CLEAR_TIMEOUT_MS = 8000;

function emulatorClearUrl() {
  const config = getConfig();
  return `http://${config.firestoreEmulatorHost}/emulator/v1/projects/${config.firestoreProjectId}/databases/(default)/documents`;
}

export async function clearFirestore() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLEAR_TIMEOUT_MS);

  try {
    const response = await fetch(emulatorClearUrl(), {
      method: "DELETE",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(
        `Failed to clear Firestore Emulator (status ${response.status}). Start it with \`pnpm emulator:start\` or run tests via \`pnpm test\`.`
      );
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Firestore Emulator is not reachable. Start it with `pnpm emulator:start` or run tests via `pnpm test`."
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

beforeEach(async () => {
  await clearFirestore();
});

afterEach(async () => {
  await clearFirestore();
});
