import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("shows today's mission links for each child mode", () => {
    render(
      <MemoryRouter>
        <HomePage
          data={{
            viewer: null,
            todayMission: {
              id: "mission-1",
              dateKey: "2026-04-23",
              theme: "Toy forest",
              title: "Find the Train",
              character: "robo",
              targetWord: "train",
              phrase: "little train",
              sentence: "I see a little train.",
              dadGuideKo: "기차를 찾아보세요.",
              threeYearOld: {
                promptKo: "기차를 톡 눌러요.",
                listenText: "train",
                activityType: "tap-choice",
                choices: [{ id: "train", label: "train", isCorrect: true }],
                correctChoiceId: "train"
              },
              sixYearOld: {
                promptKo: "문장을 골라요.",
                listenText: "I see a little train.",
                activityType: "tap-choice",
                choices: [{ id: "sentence", label: "I see a little train.", isCorrect: true }],
                correctChoiceId: "sentence"
              },
              encouragement: "좋았어!",
              image: { url: "/mission.png", alt: "Mission" },
              audio: { wordUrl: null, phraseUrl: null, sentenceUrl: null },
              publishStatus: "published",
              isToday: true
            },
            completions: []
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "3세랑 하기" })).toHaveAttribute(
      "href",
      "/mission/mission-1/age3"
    );
    expect(screen.getByRole("link", { name: "6세랑 하기" })).toHaveAttribute(
      "href",
      "/mission/mission-1/age6"
    );
    expect(screen.getByRole("link", { name: "같이 하기" })).toHaveAttribute(
      "href",
      "/mission/mission-1/together"
    );
  });
});
