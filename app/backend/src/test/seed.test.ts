import { describe, expect, it } from "vitest";
import { dailyMissionSchema } from "@banghub/shared";
import { seedDailyMissions } from "../db/seed-data";

describe("seed daily missions", () => {
  it("has at least two weeks of missions", () => {
    expect(seedDailyMissions.length).toBeGreaterThanOrEqual(14);
  });

  it("has unique mission ids", () => {
    const ids = seedDailyMissions.map((mission) => mission.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every mission parses as a DailyMission", () => {
    for (const mission of seedDailyMissions) {
      expect(() =>
        dailyMissionSchema.parse({ ...mission, isToday: false })
      ).not.toThrow();
    }
  });

  it("covers all three activity types across the age paths", () => {
    const types = new Set<string>();
    for (const mission of seedDailyMissions) {
      types.add(mission.threeYearOld.activityType);
      types.add(mission.sixYearOld.activityType);
    }
    expect(types).toEqual(new Set(["tap-choice", "act-it-out", "repeat-after-me"]));
  });

  it("uses every character at least once", () => {
    const characters = new Set(seedDailyMissions.map((mission) => mission.character));
    expect(characters).toEqual(new Set(["robo", "dino", "bunny"]));
  });
});
