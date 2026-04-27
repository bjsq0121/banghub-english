import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders a lightweight family play shell", () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "아빠와 5분 영어놀이" })).toHaveAttribute("href", "/");
    expect(screen.getByText("BANGHUB ENGLISH")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "로그인" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "난이도" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "관리" })).not.toBeInTheDocument();
  });
});
