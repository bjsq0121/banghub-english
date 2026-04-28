import "./test-firestore";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "../app.js";
import { COLLECTIONS } from "../db/collections.js";
import { getFirestoreClient } from "../db/firestore.js";
import {
  __clearTtsCacheForTests,
  __setTtsProviderForTests,
  resetTtsTestDeps,
  setTtsTestDeps
} from "../modules/tts/tts.service.js";

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

describe("TTS API", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    resetTtsTestDeps();
    __setTtsProviderForTests(null);
    __clearTtsCacheForTests();
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.dailyMissions).doc("mission-red-car").set(missionDoc());
  });

  afterEach(() => {
    delete process.env.GOOGLE_TTS_ENABLED;
    resetTtsTestDeps();
    __setTtsProviderForTests(null);
    __clearTtsCacheForTests();
  });

  it("returns 501 when direct text TTS is not configured", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/tts?text=hello" });

    expect(response.statusCode).toBe(501);
    expect(response.json().message).toMatch(/not configured/i);
  });

  it("rejects missing TTS parameters with 400", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/tts" });

    expect(response.statusCode).toBe(400);
  });

  it("serves direct text audio and caches repeat requests when configured", async () => {
    process.env.GOOGLE_TTS_ENABLED = "true";
    let calls = 0;
    __setTtsProviderForTests(async () => {
      calls += 1;
      return Buffer.from([0x49, 0x44, 0x33, 0x04]);
    });

    const app = buildApp();
    const first = await app.inject({ method: "GET", url: "/api/tts?text=red%20car" });
    const second = await app.inject({ method: "GET", url: "/api/tts?text=red%20car" });

    expect(first.statusCode).toBe(200);
    expect(first.headers["content-type"]).toBe("audio/mpeg");
    expect(first.rawPayload.length).toBeGreaterThan(0);
    expect(second.statusCode).toBe(200);
    expect(calls).toBe(1);
  });

  it("returns 502 when the direct text TTS provider throws", async () => {
    process.env.GOOGLE_TTS_ENABLED = "true";
    __setTtsProviderForTests(async () => {
      throw new Error("upstream unavailable");
    });

    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/tts?text=hello" });

    expect(response.statusCode).toBe(502);
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
