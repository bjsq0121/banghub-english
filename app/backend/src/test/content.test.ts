import "./test-firestore";
import { describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { COLLECTIONS } from "../db/collections";
import { getKoreaDateKey } from "../db/date-key";
import { getFirestoreClient } from "../db/firestore";

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

  it("returns today's mission deterministically by doc id", async () => {
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.dailyMissions).doc("mission-z").set(
      missionDoc({
        title: "Mission Z"
      })
    );
    await db.collection(COLLECTIONS.dailyMissions).doc("mission-a").set(
      missionDoc({
        title: "Mission A"
      })
    );

    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/home" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.todayMission.id).toBe("mission-a");
    expect(body.todayMission.title).toBe("Mission A");
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
});
