import "./test-firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "../app.js";
import { COLLECTIONS } from "../db/collections.js";
import { getFirestoreClient } from "../db/firestore.js";
import { resetTtsTestDeps, setTtsTestDeps } from "../modules/tts/tts.service.js";

function missionDoc(overrides: Record<string, unknown> = {}) {
  return {
    dateKey: "2026-04-27",
    theme: "toy forest",
    title: "Find the red car",
    character: "robo",
    targetWord: "car",
    phrase: "red car",
    sentence: "I see a red car.",
    dadGuideKo: "Find the red toy car together.",
    threeYearOld: {
      promptKo: "Tap the red car.",
      listenText: "red car",
      activityType: "tap-choice",
      choices: [{ id: "red-car", label: "red car", isCorrect: true }],
      correctChoiceId: "red-car"
    },
    sixYearOld: {
      promptKo: "Listen and repeat.",
      listenText: "I see a red car.",
      activityType: "repeat-after-me",
      choices: [],
      correctChoiceId: null
    },
    encouragement: "Great finding!",
    image: { url: "/assets/missions/red-car.svg", alt: "A red toy car" },
    audio: { wordUrl: null, phraseUrl: null, sentenceUrl: null },
    publishStatus: "published",
    ...overrides
  };
}

describe("mission tts API", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    resetTtsTestDeps();
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.dailyMissions).doc("mission-red-car").set(missionDoc());
  });

  it("returns 404 for an unknown mission id", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/api/tts?missionId=missing&childMode=together"
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ message: "Mission not found" });
  });

  it("returns 400 for an invalid child mode", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/api/tts?missionId=mission-red-car&childMode=bad"
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ message: "Invalid TTS request" });
  });

  it("reuses cached mission audio metadata when present", async () => {
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.ttsCache).doc("mission-red-car").set({
      missionId: "mission-red-car",
      text: "red car",
      scope: "phrase",
      childModeStrategy: "together",
      storagePath: "tts/missions/mission-red-car/primary.mp3",
      contentType: "audio/mpeg",
      createdAt: "2026-04-27T00:00:00.000Z",
      lastUsedAt: "2026-04-27T00:00:00.000Z"
    });
    setTtsTestDeps({
      readAudio: vi.fn().mockResolvedValue(Buffer.from("cached-audio"))
    });

    const app = buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/api/tts?missionId=mission-red-car&childMode=together"
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("audio/mpeg");
    expect(response.body).toBe("cached-audio");

    const refreshed = await db.collection(COLLECTIONS.ttsCache).doc("mission-red-car").get();
    expect(refreshed.data()?.lastUsedAt).not.toBe("2026-04-27T00:00:00.000Z");
  });

  it("generates and caches mission audio on cache miss", async () => {
    const db = getFirestoreClient();
    const writeAudio = vi.fn().mockResolvedValue(undefined);
    setTtsTestDeps({
      generateAudio: vi.fn().mockResolvedValue(Buffer.from("generated-audio")),
      writeAudio
    });

    const app = buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/api/tts?missionId=mission-red-car&childMode=together"
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("audio/mpeg");
    expect(response.body).toBe("generated-audio");
    expect(writeAudio).toHaveBeenCalledWith(
      "tts/missions/mission-red-car/primary.mp3",
      Buffer.from("generated-audio"),
      "audio/mpeg"
    );

    const cacheDoc = await db.collection(COLLECTIONS.ttsCache).doc("mission-red-car").get();
    expect(cacheDoc.data()).toMatchObject({
      missionId: "mission-red-car",
      text: "red car",
      storagePath: "tts/missions/mission-red-car/primary.mp3",
      contentType: "audio/mpeg"
    });
  });
});
