import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CharacterAvatar } from "./CharacterAvatar";

describe("CharacterAvatar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders an accessible portrait for each character", () => {
    const { rerender } = render(<CharacterAvatar character="robo" />);
    expect(screen.getByRole("img", { name: /robo/i })).toHaveAttribute(
      "src",
      "/assets/characters/robo.svg"
    );

    rerender(<CharacterAvatar character="dino" />);
    expect(screen.getByRole("img", { name: /dino/i })).toHaveAttribute(
      "src",
      "/assets/characters/dino.svg"
    );

    rerender(<CharacterAvatar character="bunny" />);
    expect(screen.getByRole("img", { name: /bunny/i })).toHaveAttribute(
      "src",
      "/assets/characters/bunny.svg"
    );
  });

  it("starts with data-loaded=false so CSS can keep it hidden until load fires", () => {
    render(<CharacterAvatar character="robo" />);
    expect(screen.getByRole("img", { name: /robo/i })).toHaveAttribute(
      "data-loaded",
      "false"
    );
  });
});
