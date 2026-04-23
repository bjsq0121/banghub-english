import "./test-firestore";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { COLLECTIONS } from "../db/collections";
import { getFirestoreClient } from "../db/firestore";
import { hashPassword } from "../modules/auth/auth.service";

describe("home content API", () => {
  beforeEach(async () => {
    const db = getFirestoreClient();
    const now = new Date().toISOString();
    const today = new Date().toISOString().slice(0, 10);

    await db.collection(COLLECTIONS.conversationItems).doc("conversation-1").set({
      title: "Client meeting opener",
      difficulty: "basic",
      situation: "You are starting a weekly client call.",
      prompt: "Greet the client and confirm the agenda.",
      answer: "Thanks for joining. Shall we quickly confirm today's agenda?",
      alternatives: ["Thanks for making time today.", "Can we start by reviewing the agenda?"],
      ttsText: "Thanks for joining. Shall we quickly confirm today's agenda?",
      publishStatus: "published",
      createdAt: now,
      updatedAt: now
    });

    await db.collection(COLLECTIONS.dailyAssignments).doc(today).set({
      conversationItemId: "conversation-1",
      newsItemId: null,
      publishedAt: now,
      updatedAt: now
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
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.users).doc("admin-1").set({
      email: "admin@banghub.kr",
      passwordHash: hashPassword("password123"),
      difficulty: "basic",
      selectedTracks: ["conversation", "news"],
      isAdmin: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
