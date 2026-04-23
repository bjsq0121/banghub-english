import "./test-firestore";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { getConfig } from "../config";
import { COLLECTIONS } from "../db/collections";
import { getFirestoreClient } from "../db/firestore";
import { hashPassword } from "../modules/auth/auth.service";

describe("auth and session security", () => {
  beforeEach(async () => {
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.users).doc("user-1").set({
      email: "user@banghub.kr",
      passwordHash: hashPassword("password123"),
      difficulty: "basic",
      selectedTracks: ["conversation", "news"],
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  it("stores hashed passwords instead of plaintext", async () => {
    const db = getFirestoreClient();
    const saved = await db.collection(COLLECTIONS.users).doc("user-1").get();
    const data = saved.data() as { passwordHash: string };

    expect(data.passwordHash).not.toBe("password123");
    expect(data.passwordHash).toContain(":");
  });

  it("rejects forged session cookies", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/progress/completions",
      headers: { cookie: "session=user-1" },
      payload: { missionId: "mission-1", childMode: "age3" }
    });

    expect(response.statusCode).toBe(401);
    const db = getFirestoreClient();
    const snapshot = await db.collection(COLLECTIONS.users).doc("user-1").collection("completions").get();
    expect(snapshot.empty).toBe(true);
  });

  it("rate limits repeated failed login attempts", async () => {
    const app = buildApp();

    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "user@banghub.kr", password: "wrong-password" }
      });

      expect(response.statusCode).toBe(401);
    }

    const limited = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "user@banghub.kr", password: "wrong-password" }
    });

    expect(limited.statusCode).toBe(429);
    expect(limited.json()).toEqual({ message: "Too many login attempts" });
  });

  it("rejects production defaults for session and admin secrets", () => {
    const originalEnv = { ...process.env };
    process.env.NODE_ENV = "production";
    delete process.env.SESSION_SECRET;
    delete process.env.ADMIN_PASSWORD;

    try {
      expect(() => getConfig()).toThrow("SESSION_SECRET");
    } finally {
      process.env = originalEnv;
    }
  });
});
