import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders only links that exist in the router", () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "오늘 미션" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "난이도" })).toHaveAttribute("href", "/difficulty");
    expect(screen.getByRole("link", { name: "관리" })).toHaveAttribute("href", "/admin");
  });
});
