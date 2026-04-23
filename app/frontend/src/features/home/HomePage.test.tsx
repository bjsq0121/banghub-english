import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("shows both today's study cards", () => {
    render(
      <MemoryRouter>
        <HomePage
          data={{
            viewer: null,
            todayConversation: {
              id: "conversation-1",
              track: "conversation",
              difficulty: "basic",
              title: "Client meeting opener",
              situation: "You are opening a client call.",
              prompt: "Greet the client.",
              answer: "Thanks for joining.",
              alternatives: [],
              ttsText: "Thanks for joining.",
              publishStatus: "published",
              isToday: true
            },
            todayNews: {
              id: "news-1",
              track: "news",
              difficulty: "basic",
              title: "Market update",
              passage: "Stocks rose after the rate decision.",
              vocabulary: [{ term: "rose", meaning: "went up" }],
              question: "What went up?",
              answer: "Stocks.",
              ttsText: "Stocks rose after the rate decision.",
              publishStatus: "published",
              isToday: true
            },
            completions: []
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Today's Conversation")).toBeInTheDocument();
    expect(screen.getByText("Today's News")).toBeInTheDocument();
  });
});
