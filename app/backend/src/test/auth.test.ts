import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { db } from "../db/client";
import { hashPassword } from "../modules/auth/auth.service";

describe("auth and session security", () => {
  beforeEach(() => {
    db.reset();
    db.write((state) => {
      state.users.push({
        id: "user-1",
        email: "user@banghub.kr",
        password: hashPassword("password123"),
        difficulty: "basic",
        selected_tracks: JSON.stringify(["conversation", "news"]),
        is_admin: 0
      });
    });
  });

  it("stores hashed passwords instead of plaintext", () => {
    const saved = db.read().users[0];

    expect(saved?.password).not.toBe("password123");
    expect(saved?.password).toContain(":");
  });

  it("rejects forged session cookies", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/progress/completions",
      headers: { cookie: "session=user-1" },
      payload: { contentId: "conversation-1" }
    });

    expect(response.statusCode).toBe(401);
    expect(db.read().completions).toHaveLength(0);
  });
});
