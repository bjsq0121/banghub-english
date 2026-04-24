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
    expect(screen.queryByRole("link", { name: "로그인" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "난이도" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "관리" })).not.toBeInTheDocument();
  });
});
