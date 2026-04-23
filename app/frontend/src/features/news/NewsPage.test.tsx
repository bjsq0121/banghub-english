import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NewsPage } from "./NewsPage";

describe("NewsPage", () => {
  it("renders vocabulary and question blocks", () => {
    render(
      <NewsPage
        item={{
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
        }}
        viewer={null}
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText("Vocabulary")).toBeInTheDocument();
    expect(screen.getByText("Check")).toBeInTheDocument();
  });
});
