import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import {
  __clearTtsCacheForTests,
  __setTtsProviderForTests
} from "../modules/tts/tts.service.js";

describe("TTS API", () => {
  afterEach(() => {
    delete process.env.GOOGLE_TTS_ENABLED;
    __setTtsProviderForTests(null);
    __clearTtsCacheForTests();
  });

  it("returns 501 when TTS is not configured", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/tts?text=hello" });

    expect(response.statusCode).toBe(501);
    expect(response.json().message).toMatch(/not configured/i);
  });

  it("rejects empty or missing text with 400", async () => {
    const app = buildApp();
    const missing = await app.inject({ method: "GET", url: "/api/tts" });
    const empty = await app.inject({ method: "GET", url: "/api/tts?text=" });

    expect(missing.statusCode).toBe(400);
    expect(empty.statusCode).toBe(400);
  });

  it("serves synthesized audio and caches repeat requests when configured", async () => {
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

  it("returns 502 when the TTS provider throws", async () => {
    process.env.GOOGLE_TTS_ENABLED = "true";
    __setTtsProviderForTests(async () => {
      throw new Error("upstream kaput");
    });

    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/tts?text=hello" });

    expect(response.statusCode).toBe(502);
  });
});
