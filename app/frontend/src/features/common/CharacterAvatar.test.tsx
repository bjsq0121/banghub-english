import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

  it("swaps to a fallback initial badge when the image fails to load", () => {
    render(<CharacterAvatar character="robo" />);
    fireEvent.error(screen.getByRole("img", { name: /robo/i }));

    const fallback = screen.getByRole("img", { name: /robo/i });
    expect(fallback).toHaveTextContent("R");
    expect(fallback).toHaveAttribute("data-character", "robo");
    expect(fallback).not.toHaveAttribute("src");
  });

  it("shows the correct initial per character in the fallback", () => {
    render(<CharacterAvatar character="dino" />);
    fireEvent.error(screen.getByRole("img", { name: /dino/i }));
    expect(screen.getByRole("img", { name: /dino/i })).toHaveTextContent("D");

    cleanup();

    render(<CharacterAvatar character="bunny" />);
    fireEvent.error(screen.getByRole("img", { name: /bunny/i }));
    expect(screen.getByRole("img", { name: /bunny/i })).toHaveTextContent("B");
  });
});
