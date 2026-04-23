import "./test-firestore";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
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
      payload: { contentId: "conversation-1" }
    });

    expect(response.statusCode).toBe(401);
    const db = getFirestoreClient();
    const snapshot = await db.collection(COLLECTIONS.users).doc("user-1").collection("completions").get();
    expect(snapshot.empty).toBe(true);
  });
});
