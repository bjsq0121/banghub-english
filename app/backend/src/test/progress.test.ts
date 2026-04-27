import "./test-firestore";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { COLLECTIONS } from "../db/collections.js";
import { getKoreaDateKey } from "../db/date-key.js";
import { getFirestoreClient } from "../db/firestore.js";
import { hashPassword } from "../modules/auth/auth.service.js";

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
    const today = getKoreaDateKey();
    const completion = await db
      .collection(COLLECTIONS.users)
      .doc("user-1")
      .collection("completions")
      .doc(`${today}-mission-red-car-age3`)
      .get();
    expect(completion.data()).toMatchObject({
      missionId: "mission-red-car",
      childMode: "age3",
      completedOn: today,
      rewardId: "sticker-age3"
    });
  });

  it("keeps prior-day completion when the same mission is redone on another day", async () => {
    const db = getFirestoreClient();
    await db
      .collection(COLLECTIONS.users)
      .doc("user-1")
      .collection("completions")
      .doc("2026-04-23-mission-red-car-age3")
      .set({
        missionId: "mission-red-car",
        childMode: "age3",
        completedOn: "2026-04-23",
        rewardId: "sticker-age3",
        createdAt: "2026-04-23T10:00:00.000Z"
      });

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

    const snapshot = await db
      .collection(COLLECTIONS.users)
      .doc("user-1")
      .collection("completions")
      .get();
    const completedOnValues = snapshot.docs.map((doc) => doc.data().completedOn as string).sort();

    expect(completedOnValues).toContain("2026-04-23");
    expect(completedOnValues).toContain(getKoreaDateKey());
    expect(snapshot.docs.length).toBeGreaterThanOrEqual(2);
  });
});
