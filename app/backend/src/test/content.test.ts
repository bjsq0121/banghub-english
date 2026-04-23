import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { db } from "../db/client";
import { hashPassword } from "../modules/auth/auth.service";

describe("home content API", () => {
  beforeEach(() => {
    db.reset();
    db.write((state) => {
      state.content_items.push({
        id: "conversation-1",
        track: "conversation",
        difficulty: "basic",
        title: "Client meeting opener",
        payload_json: JSON.stringify({
          id: "conversation-1",
          track: "conversation",
          difficulty: "basic",
          title: "Client meeting opener",
          situation: "You are starting a weekly client call.",
          prompt: "Greet the client and confirm the agenda.",
          answer: "Thanks for joining. Shall we quickly confirm today's agenda?",
          alternatives: ["Thanks for making time today.", "Can we start by reviewing the agenda?"],
          ttsText: "Thanks for joining. Shall we quickly confirm today's agenda?",
          publishStatus: "published",
          isToday: true
        }),
        publish_status: "published",
        is_today: 1
      });
    });
  });

  it("returns today's conversation item", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/home" });

    expect(response.statusCode).toBe(200);
    expect(response.json().todayConversation.title).toBe("Client meeting opener");
    expect(response.json().todayNews).toBeNull();
  });

  it("allows admin to publish today's news item", async () => {
    db.write((state) => {
      state.users.push({
        id: "admin-1",
        email: "admin@banghub.kr",
        password: hashPassword("password123"),
        difficulty: "basic",
        selected_tracks: JSON.stringify(["conversation", "news"]),
        is_admin: 1
      });
    });

    const app = buildApp();
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "admin@banghub.kr", password: "password123" }
    });

    const cookieHeader = login.headers["set-cookie"];
    const sessionCookie = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader ?? "";
    const response = await app.inject({
      method: "POST",
      url: "/api/admin/content",
      headers: { cookie: sessionCookie },
      payload: {
        id: "news-1",
        track: "news",
        difficulty: "basic",
        title: "Market update",
        passage: "Stocks rose after the central bank kept rates unchanged.",
        vocabulary: [{ term: "unchanged", meaning: "not changed" }],
        question: "What happened to rates?",
        answer: "They stayed the same.",
        ttsText: "Stocks rose after the central bank kept rates unchanged.",
        publishStatus: "published",
        isToday: true
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().saved.track).toBe("news");
  });

  it("returns a content item by track and id", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "GET",
      url: "/api/content/conversation/conversation-1"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().item.id).toBe("conversation-1");
  });
});
