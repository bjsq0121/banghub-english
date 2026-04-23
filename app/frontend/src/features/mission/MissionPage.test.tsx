import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { DailyMission, UserProfile } from "@banghub/shared";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MissionPage } from "./MissionPage";

const mission: DailyMission = {
  id: "mission-forest-1",
  dateKey: "2026-04-23",
  theme: "Toy forest",
  title: "Find the Little Train",
  character: "robo",
  targetWord: "train",
  phrase: "little train",
  sentence: "I see a little train.",
  dadGuideKo: "아빠는 기차 장난감을 가리키며 천천히 말해 주세요.",
  threeYearOld: {
    promptKo: "기차를 찾아 톡 눌러요.",
    listenText: "train",
    activityType: "tap-choice",
    choices: [
      { id: "train", label: "train", isCorrect: true },
      { id: "car", label: "car", isCorrect: false }
    ],
    correctChoiceId: "train"
  },
  sixYearOld: {
    promptKo: "아빠 말을 듣고 맞는 문장을 골라요.",
    listenText: "I see a little train.",
    activityType: "tap-choice",
    choices: [
      { id: "bus", label: "I see a bus.", isCorrect: false },
      { id: "train", label: "I see a little train.", isCorrect: true }
    ],
    correctChoiceId: "train"
  },
  encouragement: "좋았어! 숲속 기차를 찾았네.",
  image: { url: "/missions/forest-train.png", alt: "Toy train in a forest" },
  audio: { wordUrl: null, phraseUrl: null, sentenceUrl: null },
  publishStatus: "published",
  isToday: true
};

describe("MissionPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders dad guide and completes anonymous child mission locally", async () => {
    const onComplete = vi.fn();

    render(
      <MissionPage mission={mission} childMode="age6" viewer={null} onComplete={onComplete} />
    );

    expect(screen.getByRole("heading", { name: "Find the Little Train" })).toBeInTheDocument();
    expect(screen.getByText("아빠는 기차 장난감을 가리키며 천천히 말해 주세요.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "I see a little train." }));
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(onComplete).not.toHaveBeenCalled();
    expect(await screen.findByText("좋았어! 숲속 기차를 찾았네.")).toBeInTheDocument();
  });

  it("persists completion for a logged-in viewer", async () => {
    const onComplete = vi.fn();
    const viewer: UserProfile = {
      id: "user-1",
      email: "dad@example.com",
      difficulty: "basic",
      selectedTracks: ["mission"],
      isAdmin: false
    };

    render(<MissionPage mission={mission} childMode="age6" viewer={viewer} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: "I see a little train." }));
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("좋았어! 숲속 기차를 찾았네.")).toBeInTheDocument();
  });

  it("prevents duplicate completion clicks while saving", async () => {
    let resolveCompletion: () => void = () => undefined;
    const onComplete = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCompletion = resolve;
        })
    );
    const viewer: UserProfile = {
      id: "user-1",
      email: "dad@example.com",
      difficulty: "basic",
      selectedTracks: ["mission"],
      isAdmin: false
    };

    render(<MissionPage mission={mission} childMode="age6" viewer={viewer} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: "I see a little train." }));
    const completeButton = screen.getByRole("button", { name: "완료" });
    fireEvent.click(completeButton);
    fireEvent.click(screen.getByRole("button", { name: "저장 중" }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "저장 중" })).toBeDisabled();

    resolveCompletion();
    expect(await screen.findByText("좋았어! 숲속 기차를 찾았네.")).toBeInTheDocument();
  });
});
