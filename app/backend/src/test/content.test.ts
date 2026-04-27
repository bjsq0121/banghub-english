import "./test-firestore";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { COLLECTIONS } from "../db/collections.js";
import { getKoreaDateKey } from "../db/date-key.js";
import { getFirestoreClient } from "../db/firestore.js";
import { hashPassword } from "../modules/auth/auth.service.js";

function missionDoc(overrides: Record<string, unknown> = {}) {
  return {
    dateKey: getKoreaDateKey(),
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
      choices: [
        { id: "red-car", label: "red car", imageUrl: "/assets/missions/red-car.svg", isCorrect: true },
        { id: "blue-block", label: "blue block", imageUrl: "/assets/missions/blue-block.svg", isCorrect: false }
      ],
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

describe("mission content API", () => {
  beforeEach(async () => {
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.users).doc("admin-1").set({
      email: "admin@banghub.kr",
      passwordHash: hashPassword("password123"),
      difficulty: "basic",
      selectedTracks: ["family-missions"],
      isAdmin: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  it("uses Korea local date for mission date keys", () => {
    expect(getKoreaDateKey(new Date("2026-04-22T16:00:00.000Z"))).toBe("2026-04-23");
  });

  it("returns today's toy forest mission", async () => {
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.dailyMissions).doc("mission-red-car").set(missionDoc());

    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/home" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.todayMission.title).toBe("Find the red car");
    expect(body.todayMission.isToday).toBe(true);
    expect(body.todayMission.threeYearOld.listenText).toBe("red car");
  });

  it("returns today's mission deterministically by updated time and doc id", async () => {
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.dailyMissions).doc("mission-z").set(
      missionDoc({
        title: "Mission Z",
        updatedAt: "2026-04-23T00:00:00.000Z"
      })
    );
    await db.collection(COLLECTIONS.dailyMissions).doc("mission-a").set(
      missionDoc({
        title: "Mission A",
        updatedAt: "2026-04-23T00:00:00.000Z"
      })
    );
    await db.collection(COLLECTIONS.dailyMissions).doc("mission-m").set(
      missionDoc({
        title: "Mission M",
        updatedAt: "2026-04-23T00:01:00.000Z"
      })
    );

    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/home" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.todayMission.id).toBe("mission-m");
    expect(body.todayMission.title).toBe("Mission M");
  });

  it("returns mission detail by id", async () => {
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.dailyMissions).doc("mission-detail").set(
      missionDoc({
        title: "Jump together",
        targetWord: "jump",
        phrase: "jump",
        sentence: "Let's jump.",
        sixYearOld: {
          promptKo: "Listen and repeat.",
          listenText: "Let's jump.",
          activityType: "repeat-after-me",
          choices: [],
          correctChoiceId: null
        }
      })
    );

    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/missions/mission-detail" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.item.id).toBe("mission-detail");
    expect(body.item.sixYearOld.listenText).toBe("Let's jump.");
  });

  it("publishes a daily mission from an admin session", async () => {
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.dailyMissions).doc("mission-red-car").set(
      missionDoc({
        title: "Existing seeded mission",
        updatedAt: "2026-04-23T00:00:00.000Z"
      })
    );

    const app = buildApp();
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "admin@banghub.kr", password: "password123" }
    });
    const cookieHeader = login.headers["set-cookie"];
    const sessionCookie = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader ?? "";
    const payload = missionDoc({
      id: "mission-admin-publish",
      title: "Admin mission",
      dateKey: "2000-01-01",
      isToday: true
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/admin/missions",
      headers: { cookie: sessionCookie },
      payload
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.saved).toMatchObject({
      id: "mission-admin-publish",
      title: "Admin mission",
      dateKey: getKoreaDateKey(),
      targetWord: "car",
      isToday: true
    });

    const saved = await db.collection(COLLECTIONS.dailyMissions).doc("mission-admin-publish").get();
    expect(saved.data()).toMatchObject({
      dateKey: getKoreaDateKey(),
      title: "Admin mission",
      targetWord: "car",
      publishStatus: "published"
    });
    expect(saved.data()).not.toHaveProperty("isToday");

    const home = await app.inject({ method: "GET", url: "/api/home" });
    expect(home.statusCode).toBe(200);
    expect(home.json().todayMission).toMatchObject({
      id: "mission-admin-publish",
      title: "Admin mission",
      isToday: true
    });
  });

  it("returns 400 for invalid admin mission payloads", async () => {
    const app = buildApp();
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "admin@banghub.kr", password: "password123" }
    });
    const cookieHeader = login.headers["set-cookie"];
    const sessionCookie = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader ?? "";

    const response = await app.inject({
      method: "POST",
      url: "/api/admin/missions",
      headers: { cookie: sessionCookie },
      payload: { id: "invalid-mission" }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ message: "Invalid mission payload" });
  });
});
