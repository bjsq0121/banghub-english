import "./test-firestore";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { COLLECTIONS } from "../db/collections";
import { getKoreaDateKey } from "../db/date-key";
import { getFirestoreClient } from "../db/firestore";
import { hashPassword } from "../modules/auth/auth.service";

describe("completion API", () => {
  beforeEach(async () => {
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.users).doc("user-1").set({
      email: "parent@example.com",
      passwordHash: hashPassword("password123"),
      difficulty: "basic",
      selectedTracks: ["family-missions"],
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  it("saves mission completion for logged-in users", async () => {
    const app = buildApp();
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "parent@example.com", password: "password123" }
    });

    const cookieHeader = login.headers["set-cookie"];
    const sessionCookie = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader ?? "";
    const response = await app.inject({
      method: "POST",
      url: "/api/progress/completions",
      headers: { cookie: sessionCookie },
      payload: { missionId: "mission-red-car", childMode: "age3" }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });

    const db = getFirestoreClient();
    const completion = await db
      .collection(COLLECTIONS.users)
      .doc("user-1")
      .collection("completions")
      .doc("mission-red-car-age3")
      .get();
    expect(completion.data()).toMatchObject({
      missionId: "mission-red-car",
      childMode: "age3",
      completedOn: getKoreaDateKey(),
      rewardId: "sticker-age3"
    });
  });
});
