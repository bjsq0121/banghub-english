import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConversationPage } from "./ConversationPage";

describe("ConversationPage", () => {
  it("shows a login message before saving completion when there is no user session", () => {
    render(
      <ConversationPage
        item={{
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
        }}
        viewer={null}
        onComplete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Mark complete"));
    expect(screen.getByText("Log in to save your progress.")).toBeInTheDocument();
  });
});
