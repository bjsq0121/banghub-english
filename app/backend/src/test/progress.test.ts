import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { db } from "../db/client";

describe("completion API", () => {
  beforeEach(() => {
    db.reset();
    db.write((state) => {
      state.users.push({
        id: "user-1",
        email: "user@banghub.kr",
        password: "password123",
        difficulty: "basic",
        selected_tracks: JSON.stringify(["conversation", "news"]),
        is_admin: 0
      });
    });
  });

  it("saves completion for logged-in users", async () => {
    const app = buildApp();
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "user@banghub.kr", password: "password123" }
    });

    const cookieHeader = login.headers["set-cookie"];
    const sessionCookie = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader ?? "";
    const response = await app.inject({
      method: "POST",
      url: "/api/progress/completions",
      headers: { cookie: sessionCookie },
      payload: { contentId: "conversation-1" }
    });

    expect(response.statusCode).toBe(200);
    expect(db.read().completions).toHaveLength(1);
    expect(db.read().completions[0]?.user_id).toBe("user-1");
  });
});
