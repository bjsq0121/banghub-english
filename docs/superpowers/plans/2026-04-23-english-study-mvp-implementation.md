# English Study MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a routine-first English study MVP with separate conversation/news tracks, anonymous browsing, login-gated completion saving, admin publishing, and PWA-ready delivery.

**Architecture:** Use a TypeScript monorepo-style layout inside the existing project folders. Build a React + Vite frontend in `app/frontend`, a Fastify + SQLite backend in `app/backend`, and shared Zod schemas in `app/shared`. Keep runtime behavior rule-based and template-driven, with browser-native TTS on the client and lightweight REST APIs on the server.

**Tech Stack:** TypeScript, React, Vite, React Router, Vitest, Testing Library, Fastify, better-sqlite3, Zod, Playwright, Workbox/Vite PWA plugin

---

## File Structure

### Frontend

- Create: `app/frontend/package.json`
- Create: `app/frontend/tsconfig.json`
- Create: `app/frontend/vite.config.ts`
- Create: `app/frontend/index.html`
- Create: `app/frontend/src/main.tsx`
- Create: `app/frontend/src/app/router.tsx`
- Create: `app/frontend/src/app/AppShell.tsx`
- Create: `app/frontend/src/styles/global.css`
- Create: `app/frontend/src/lib/api.ts`
- Create: `app/frontend/src/lib/tts.ts`
- Create: `app/frontend/src/lib/session.ts`
- Create: `app/frontend/src/features/home/HomePage.tsx`
- Create: `app/frontend/src/features/auth/LoginPage.tsx`
- Create: `app/frontend/src/features/onboarding/DifficultyPage.tsx`
- Create: `app/frontend/src/features/conversation/ConversationPage.tsx`
- Create: `app/frontend/src/features/news/NewsPage.tsx`
- Create: `app/frontend/src/features/admin/AdminPage.tsx`
- Create: `app/frontend/src/features/common/EmptyState.tsx`
- Create: `app/frontend/src/features/common/TrackCard.tsx`
- Create: `app/frontend/src/features/common/CompletionButton.tsx`
- Create: `app/frontend/src/test/setup.ts`
- Create: `app/frontend/src/features/home/HomePage.test.tsx`
- Create: `app/frontend/src/features/conversation/ConversationPage.test.tsx`
- Create: `app/frontend/src/features/news/NewsPage.test.tsx`

### Backend

- Create: `app/backend/package.json`
- Create: `app/backend/tsconfig.json`
- Create: `app/backend/src/server.ts`
- Create: `app/backend/src/app.ts`
- Create: `app/backend/src/config.ts`
- Create: `app/backend/src/db/client.ts`
- Create: `app/backend/src/db/schema.sql`
- Create: `app/backend/src/db/seed.ts`
- Create: `app/backend/src/modules/auth/auth.routes.ts`
- Create: `app/backend/src/modules/auth/auth.service.ts`
- Create: `app/backend/src/modules/content/content.routes.ts`
- Create: `app/backend/src/modules/content/content.service.ts`
- Create: `app/backend/src/modules/progress/progress.routes.ts`
- Create: `app/backend/src/modules/progress/progress.service.ts`
- Create: `app/backend/src/modules/admin/admin.routes.ts`
- Create: `app/backend/src/modules/admin/admin.service.ts`
- Create: `app/backend/src/plugins/session.ts`
- Create: `app/backend/src/plugins/cors.ts`
- Create: `app/backend/src/test/app.test.ts`
- Create: `app/backend/src/test/content.test.ts`
- Create: `app/backend/src/test/progress.test.ts`

### Shared

- Create: `app/shared/package.json`
- Create: `app/shared/tsconfig.json`
- Create: `app/shared/src/index.ts`
- Create: `app/shared/src/contracts.ts`
- Create: `app/shared/src/content.ts`
- Create: `app/shared/src/user.ts`

### Root and QA

- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.editorconfig`
- Create: `.env.example`
- Create: `tests/e2e/package.json`
- Create: `tests/e2e/playwright.config.ts`
- Create: `tests/e2e/tests/home.spec.ts`
- Create: `tests/e2e/tests/admin.spec.ts`
- Create: `public/manifest.webmanifest`
- Create: `public/icons/icon-192.png`
- Create: `public/icons/icon-512.png`
- Create: `README.md`

## Task 1: Workspace Bootstrap

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.editorconfig`
- Create: `.env.example`
- Create: `README.md`

- [ ] **Step 1: Write the failing workspace sanity check**

Create `package.json` with a root test script that points to package-level tests before any packages exist yet:

```json
{
  "name": "banghub-english",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "scripts": {
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "build": "pnpm -r build"
  }
}
```

- [ ] **Step 2: Run the root test command to verify the workspace is not complete yet**

Run: `pnpm test`
Expected: FAIL with a workspace/package resolution error because package files do not exist yet

- [ ] **Step 3: Add the minimal workspace files**

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - app/frontend
  - app/backend
  - app/shared
  - tests/e2e
```

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@banghub/shared": ["app/shared/src/index.ts"]
    }
  }
}
```

Create `.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
```

Create `.env.example`:

```dotenv
PORT=4000
APP_ORIGIN=http://localhost:5173
SQLITE_PATH=./app/backend/data/dev.sqlite
SESSION_SECRET=change-me
ADMIN_EMAIL=admin@banghub.kr
ADMIN_PASSWORD=change-me
```

Create `README.md`:

```md
# Banghub English

Routine-first English study MVP with conversation and news tracks.
```

- [ ] **Step 4: Run a file existence check**

Run: `rg --files .`
Expected: PASS with the new root files listed

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json .editorconfig .env.example README.md
git commit -m "chore: bootstrap workspace metadata"
```

## Task 2: Shared Contracts First

**Files:**
- Create: `app/shared/package.json`
- Create: `app/shared/tsconfig.json`
- Create: `app/shared/src/index.ts`
- Create: `app/shared/src/contracts.ts`
- Create: `app/shared/src/content.ts`
- Create: `app/shared/src/user.ts`

- [ ] **Step 1: Write the failing shared package build**

Create `app/shared/package.json`:

```json
{
  "name": "@banghub/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "tsc -p tsconfig.json --noEmit",
    "lint": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "typescript": "^5.7.3"
  }
}
```

Create `app/shared/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src"]
}
```

Create `app/shared/src/index.ts`:

```ts
export * from "./contracts";
export * from "./content";
export * from "./user";
```

- [ ] **Step 2: Run the shared package test to verify missing exports fail**

Run: `pnpm --filter @banghub/shared test`
Expected: FAIL because `contracts`, `content`, and `user` modules do not exist yet

- [ ] **Step 3: Add the shared content and user contracts**

Create `app/shared/src/content.ts`:

```ts
import { z } from "zod";

export const difficultySchema = z.enum(["intro", "basic", "intermediate"]);
export const trackSchema = z.enum(["conversation", "news"]);
export const publishStatusSchema = z.enum(["draft", "published"]);

export const conversationItemSchema = z.object({
  id: z.string(),
  track: z.literal("conversation"),
  difficulty: difficultySchema,
  title: z.string(),
  situation: z.string(),
  prompt: z.string(),
  answer: z.string(),
  alternatives: z.array(z.string()),
  ttsText: z.string(),
  publishStatus: publishStatusSchema,
  isToday: z.boolean()
});

export const newsItemSchema = z.object({
  id: z.string(),
  track: z.literal("news"),
  difficulty: difficultySchema,
  title: z.string(),
  passage: z.string(),
  vocabulary: z.array(z.object({ term: z.string(), meaning: z.string() })),
  question: z.string(),
  answer: z.string(),
  ttsText: z.string(),
  publishStatus: publishStatusSchema,
  isToday: z.boolean()
});

export type Difficulty = z.infer<typeof difficultySchema>;
export type Track = z.infer<typeof trackSchema>;
export type ConversationItem = z.infer<typeof conversationItemSchema>;
export type NewsItem = z.infer<typeof newsItemSchema>;
```

Create `app/shared/src/user.ts`:

```ts
import { z } from "zod";
import { difficultySchema, trackSchema } from "./content";

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  difficulty: difficultySchema,
  selectedTracks: z.array(trackSchema),
  isAdmin: z.boolean()
});

export const completionSchema = z.object({
  userId: z.string(),
  contentId: z.string(),
  completedOn: z.string()
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type Completion = z.infer<typeof completionSchema>;
```

Create `app/shared/src/contracts.ts`:

```ts
import { z } from "zod";
import { completionSchema, userProfileSchema } from "./user";
import { conversationItemSchema, newsItemSchema } from "./content";

export const homeResponseSchema = z.object({
  viewer: userProfileSchema.nullable(),
  todayConversation: conversationItemSchema.nullable(),
  todayNews: newsItemSchema.nullable(),
  completions: z.array(completionSchema)
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const updatePreferencesSchema = z.object({
  difficulty: z.enum(["intro", "basic", "intermediate"]),
  selectedTracks: z.array(z.enum(["conversation", "news"])).min(1)
});

export const markCompletionSchema = z.object({
  contentId: z.string()
});

export type HomeResponse = z.infer<typeof homeResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type UpdatePreferencesRequest = z.infer<typeof updatePreferencesSchema>;
export type MarkCompletionRequest = z.infer<typeof markCompletionSchema>;
```

- [ ] **Step 4: Run the shared package test to verify it passes**

Run: `pnpm --filter @banghub/shared test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/shared
git commit -m "feat: add shared MVP contracts"
```

## Task 3: Backend Skeleton and Database

**Files:**
- Create: `app/backend/package.json`
- Create: `app/backend/tsconfig.json`
- Create: `app/backend/src/server.ts`
- Create: `app/backend/src/app.ts`
- Create: `app/backend/src/config.ts`
- Create: `app/backend/src/db/client.ts`
- Create: `app/backend/src/db/schema.sql`
- Create: `app/backend/src/db/seed.ts`
- Create: `app/backend/src/plugins/session.ts`
- Create: `app/backend/src/plugins/cors.ts`
- Create: `app/backend/src/test/app.test.ts`

- [ ] **Step 1: Write the failing backend app smoke test**

Create `app/backend/package.json`:

```json
{
  "name": "@banghub/backend",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "lint": "tsc -p tsconfig.json --noEmit",
    "seed": "tsx src/db/seed.ts"
  },
  "dependencies": {
    "@banghub/shared": "workspace:*",
    "@fastify/cookie": "^10.0.1",
    "@fastify/cors": "^10.0.2",
    "better-sqlite3": "^11.7.0",
    "fastify": "^5.2.1",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.12",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3",
    "vitest": "^3.0.5"
  }
}
```

Create `app/backend/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

Create `app/backend/src/test/app.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildApp } from "../app";

describe("buildApp", () => {
  it("returns health payload", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });
});
```

- [ ] **Step 2: Run the backend smoke test to verify missing app code fails**

Run: `pnpm --filter @banghub/backend test`
Expected: FAIL because `../app` does not exist yet

- [ ] **Step 3: Add the minimal backend runtime and SQLite schema**

Create `app/backend/src/config.ts`:

```ts
export function getConfig() {
  return {
    port: Number(process.env.PORT ?? 4000),
    appOrigin: process.env.APP_ORIGIN ?? "http://localhost:5173",
    sqlitePath: process.env.SQLITE_PATH ?? "./app/backend/data/dev.sqlite",
    sessionSecret: process.env.SESSION_SECRET ?? "change-me",
    adminEmail: process.env.ADMIN_EMAIL ?? "admin@banghub.kr",
    adminPassword: process.env.ADMIN_PASSWORD ?? "change-me"
  };
}
```

Create `app/backend/src/plugins/cors.ts`:

```ts
import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

export async function registerCors(app: FastifyInstance, origin: string) {
  await app.register(cors, {
    origin,
    credentials: true
  });
}
```

Create `app/backend/src/plugins/session.ts`:

```ts
import cookie from "@fastify/cookie";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    sessionUserId: string | null;
  }
}

export async function registerSession(app: FastifyInstance, secret: string) {
  await app.register(cookie, { secret });

  app.addHook("onRequest", async (request) => {
    request.sessionUserId = request.cookies.session ?? null;
  });
}

export function setSession(reply: FastifyReply, userId: string) {
  reply.setCookie("session", userId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax"
  });
}

export function clearSession(reply: FastifyReply) {
  reply.clearCookie("session", { path: "/" });
}

export function requireSession(request: FastifyRequest) {
  if (!request.sessionUserId) {
    throw new Error("UNAUTHORIZED");
  }

  return request.sessionUserId;
}
```

Create `app/backend/src/db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  selected_tracks TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  track TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  title TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  publish_status TEXT NOT NULL,
  is_today INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS completions (
  user_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  completed_on TEXT NOT NULL,
  PRIMARY KEY (user_id, content_id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (content_id) REFERENCES content_items (id)
);
```

Create `app/backend/src/db/client.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { getConfig } from "../config";

const config = getConfig();
const dbPath = path.resolve(config.sqlitePath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);

db.exec(fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));

export { db };
```

Create `app/backend/src/app.ts`:

```ts
import Fastify from "fastify";
import { getConfig } from "./config";
import { registerCors } from "./plugins/cors";
import { registerSession } from "./plugins/session";

export function buildApp() {
  const config = getConfig();
  const app = Fastify();

  void registerCors(app, config.appOrigin);
  void registerSession(app, config.sessionSecret);

  app.get("/health", async () => ({ ok: true }));

  return app;
}
```

Create `app/backend/src/server.ts`:

```ts
import { buildApp } from "./app";
import { getConfig } from "./config";

const config = getConfig();
const app = buildApp();

app.listen({ port: config.port, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
```

Create `app/backend/src/db/seed.ts`:

```ts
import { randomUUID } from "node:crypto";
import { db } from "./client";
import { getConfig } from "../config";

const config = getConfig();

db.prepare("DELETE FROM completions").run();
db.prepare("DELETE FROM content_items").run();
db.prepare("DELETE FROM users").run();

db.prepare(
  `INSERT INTO users (id, email, password, difficulty, selected_tracks, is_admin)
   VALUES (?, ?, ?, ?, ?, ?)`
).run(
  randomUUID(),
  config.adminEmail,
  config.adminPassword,
  "basic",
  JSON.stringify(["conversation", "news"]),
  1
);
```

- [ ] **Step 4: Run the backend smoke test to verify it passes**

Run: `pnpm --filter @banghub/backend test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/backend
git commit -m "feat: add backend skeleton and database"
```

## Task 4: Content and Home APIs

**Files:**
- Create: `app/backend/src/modules/content/content.routes.ts`
- Create: `app/backend/src/modules/content/content.service.ts`
- Modify: `app/backend/src/app.ts`
- Create: `app/backend/src/test/content.test.ts`

- [ ] **Step 1: Write the failing home API test**

Create `app/backend/src/test/content.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { db } from "../db/client";

describe("home content API", () => {
  beforeEach(() => {
    db.prepare("DELETE FROM content_items").run();
    db.prepare(
      `INSERT INTO content_items (id, track, difficulty, title, payload_json, publish_status, is_today)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      "conversation-1",
      "conversation",
      "basic",
      "Client meeting opener",
      JSON.stringify({
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
      "published",
      1
    );
  });

  it("returns today's conversation item", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/home" });

    expect(response.statusCode).toBe(200);
    expect(response.json().todayConversation.title).toBe("Client meeting opener");
    expect(response.json().todayNews).toBeNull();
  });
});
```

- [ ] **Step 2: Run the content API test to verify it fails**

Run: `pnpm --filter @banghub/backend test -- content.test.ts`
Expected: FAIL because `/api/home` is not registered yet

- [ ] **Step 3: Add content service and home route**

Create `app/backend/src/modules/content/content.service.ts`:

```ts
import { db } from "../../db/client";
import { conversationItemSchema, newsItemSchema } from "@banghub/shared";

export function getTodayContent() {
  const rows = db
    .prepare(
      `SELECT track, payload_json
       FROM content_items
       WHERE publish_status = 'published' AND is_today = 1`
    )
    .all() as Array<{ track: "conversation" | "news"; payload_json: string }>;

  const conversationRow = rows.find((row) => row.track === "conversation");
  const newsRow = rows.find((row) => row.track === "news");

  return {
    todayConversation: conversationRow
      ? conversationItemSchema.parse(JSON.parse(conversationRow.payload_json))
      : null,
    todayNews: newsRow ? newsItemSchema.parse(JSON.parse(newsRow.payload_json)) : null
  };
}
```

Create `app/backend/src/modules/content/content.routes.ts`:

```ts
import type { FastifyInstance } from "fastify";
import { homeResponseSchema } from "@banghub/shared";
import { getTodayContent } from "./content.service";

export async function registerContentRoutes(app: FastifyInstance) {
  app.get("/api/home", async () => {
    const payload = {
      viewer: null,
      ...getTodayContent(),
      completions: []
    };

    return homeResponseSchema.parse(payload);
  });
}
```

Modify `app/backend/src/app.ts`:

```ts
import Fastify from "fastify";
import { getConfig } from "./config";
import { registerCors } from "./plugins/cors";
import { registerSession } from "./plugins/session";
import { registerContentRoutes } from "./modules/content/content.routes";

export function buildApp() {
  const config = getConfig();
  const app = Fastify();

  void registerCors(app, config.appOrigin);
  void registerSession(app, config.sessionSecret);

  app.get("/health", async () => ({ ok: true }));
  void registerContentRoutes(app);

  return app;
}
```

- [ ] **Step 4: Run the content API test to verify it passes**

Run: `pnpm --filter @banghub/backend test -- content.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/backend/src/modules/content app/backend/src/app.ts app/backend/src/test/content.test.ts
git commit -m "feat: add home content API"
```

## Task 5: Auth, Preferences, and Completion APIs

**Files:**
- Create: `app/backend/src/modules/auth/auth.routes.ts`
- Create: `app/backend/src/modules/auth/auth.service.ts`
- Create: `app/backend/src/modules/progress/progress.routes.ts`
- Create: `app/backend/src/modules/progress/progress.service.ts`
- Modify: `app/backend/src/app.ts`
- Create: `app/backend/src/test/progress.test.ts`

- [ ] **Step 1: Write the failing authenticated completion test**

Create `app/backend/src/test/progress.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { db } from "../db/client";

describe("completion API", () => {
  beforeEach(() => {
    db.prepare("DELETE FROM completions").run();
    db.prepare("DELETE FROM users").run();
    db.prepare(
      `INSERT INTO users (id, email, password, difficulty, selected_tracks, is_admin)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run("user-1", "user@banghub.kr", "password123", "basic", JSON.stringify(["conversation", "news"]), 0);
  });

  it("saves completion for logged-in users", async () => {
    const app = buildApp();
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "user@banghub.kr", password: "password123" }
    });

    const cookie = login.cookies[0].value;
    const response = await app.inject({
      method: "POST",
      url: "/api/progress/completions",
      cookies: { session: cookie },
      payload: { contentId: "conversation-1" }
    });

    expect(response.statusCode).toBe(200);
    expect(
      db.prepare("SELECT COUNT(*) as count FROM completions WHERE user_id = ?").get("user-1")
    ).toEqual({ count: 1 });
  });
});
```

- [ ] **Step 2: Run the progress test to verify it fails**

Run: `pnpm --filter @banghub/backend test -- progress.test.ts`
Expected: FAIL because auth and progress routes do not exist yet

- [ ] **Step 3: Add auth, preferences, and completion services/routes**

Create `app/backend/src/modules/auth/auth.service.ts`:

```ts
import { db } from "../../db/client";

export function loginUser(email: string, password: string) {
  const user = db
    .prepare(
      `SELECT id, email, difficulty, selected_tracks, is_admin
       FROM users
       WHERE email = ? AND password = ?`
    )
    .get(email, password) as
    | {
        id: string;
        email: string;
        difficulty: "intro" | "basic" | "intermediate";
        selected_tracks: string;
        is_admin: number;
      }
    | undefined;

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    difficulty: user.difficulty,
    selectedTracks: JSON.parse(user.selected_tracks),
    isAdmin: Boolean(user.is_admin)
  };
}

export function updatePreferences(userId: string, difficulty: string, selectedTracks: string[]) {
  db.prepare(
    `UPDATE users
     SET difficulty = ?, selected_tracks = ?
     WHERE id = ?`
  ).run(difficulty, JSON.stringify(selectedTracks), userId);
}
```

Create `app/backend/src/modules/auth/auth.routes.ts`:

```ts
import type { FastifyInstance } from "fastify";
import { loginRequestSchema, updatePreferencesSchema } from "@banghub/shared";
import { clearSession, requireSession, setSession } from "../../plugins/session";
import { loginUser, updatePreferences } from "./auth.service";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/api/auth/login", async (request, reply) => {
    const { email, password } = loginRequestSchema.parse(request.body);
    const user = loginUser(email, password);

    if (!user) {
      reply.code(401);
      return { message: "Invalid credentials" };
    }

    setSession(reply, user.id);
    return { user };
  });

  app.post("/api/auth/logout", async (_request, reply) => {
    clearSession(reply);
    return { ok: true };
  });

  app.post("/api/auth/preferences", async (request) => {
    const userId = requireSession(request);
    const payload = updatePreferencesSchema.parse(request.body);
    updatePreferences(userId, payload.difficulty, payload.selectedTracks);
    return { ok: true };
  });
}
```

Create `app/backend/src/modules/progress/progress.service.ts`:

```ts
import { db } from "../../db/client";

export function markCompletion(userId: string, contentId: string) {
  db.prepare(
    `INSERT OR REPLACE INTO completions (user_id, content_id, completed_on)
     VALUES (?, ?, ?)`
  ).run(userId, contentId, new Date().toISOString().slice(0, 10));
}
```

Create `app/backend/src/modules/progress/progress.routes.ts`:

```ts
import type { FastifyInstance } from "fastify";
import { markCompletionSchema } from "@banghub/shared";
import { requireSession } from "../../plugins/session";
import { markCompletion } from "./progress.service";

export async function registerProgressRoutes(app: FastifyInstance) {
  app.post("/api/progress/completions", async (request) => {
    const userId = requireSession(request);
    const payload = markCompletionSchema.parse(request.body);
    markCompletion(userId, payload.contentId);
    return { ok: true };
  });
}
```

Modify `app/backend/src/app.ts`:

```ts
import Fastify from "fastify";
import { getConfig } from "./config";
import { registerAuthRoutes } from "./modules/auth/auth.routes";
import { registerContentRoutes } from "./modules/content/content.routes";
import { registerProgressRoutes } from "./modules/progress/progress.routes";
import { registerCors } from "./plugins/cors";
import { registerSession } from "./plugins/session";

export function buildApp() {
  const config = getConfig();
  const app = Fastify();

  void registerCors(app, config.appOrigin);
  void registerSession(app, config.sessionSecret);

  app.get("/health", async () => ({ ok: true }));
  void registerAuthRoutes(app);
  void registerContentRoutes(app);
  void registerProgressRoutes(app);

  return app;
}
```

- [ ] **Step 4: Run the progress test to verify it passes**

Run: `pnpm --filter @banghub/backend test -- progress.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/backend/src/modules/auth app/backend/src/modules/progress app/backend/src/app.ts app/backend/src/test/progress.test.ts
git commit -m "feat: add login preferences and completion APIs"
```

## Task 6: Admin Publishing APIs

**Files:**
- Create: `app/backend/src/modules/admin/admin.routes.ts`
- Create: `app/backend/src/modules/admin/admin.service.ts`
- Modify: `app/backend/src/app.ts`
- Modify: `app/backend/src/db/seed.ts`
- Modify: `app/backend/src/test/content.test.ts`

- [ ] **Step 1: Extend a failing admin publishing test**

Append this test to `app/backend/src/test/content.test.ts`:

```ts
it("allows admin to publish today's news item", async () => {
  db.prepare("DELETE FROM users").run();
  db.prepare(
    `INSERT INTO users (id, email, password, difficulty, selected_tracks, is_admin)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run("admin-1", "admin@banghub.kr", "password123", "basic", JSON.stringify(["conversation", "news"]), 1);

  const app = buildApp();
  const login = await app.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: { email: "admin@banghub.kr", password: "password123" }
  });

  const cookie = login.cookies[0].value;

  const response = await app.inject({
    method: "POST",
    url: "/api/admin/content",
    cookies: { session: cookie },
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
```

- [ ] **Step 2: Run the content test to verify admin publishing fails**

Run: `pnpm --filter @banghub/backend test -- content.test.ts`
Expected: FAIL because admin routes do not exist yet

- [ ] **Step 3: Add the admin content publishing module**

Create `app/backend/src/modules/admin/admin.service.ts`:

```ts
import { db } from "../../db/client";
import { conversationItemSchema, newsItemSchema } from "@banghub/shared";

export function saveContentItem(payload: unknown) {
  const parsed =
    typeof payload === "object" && payload && (payload as { track?: string }).track === "conversation"
      ? conversationItemSchema.parse(payload)
      : newsItemSchema.parse(payload);

  db.prepare(
    `UPDATE content_items
     SET is_today = 0
     WHERE track = ?`
  ).run(parsed.track);

  db.prepare(
    `INSERT OR REPLACE INTO content_items (id, track, difficulty, title, payload_json, publish_status, is_today)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    parsed.id,
    parsed.track,
    parsed.difficulty,
    parsed.title,
    JSON.stringify(parsed),
    parsed.publishStatus,
    parsed.isToday ? 1 : 0
  );

  return parsed;
}
```

Create `app/backend/src/modules/admin/admin.routes.ts`:

```ts
import type { FastifyInstance } from "fastify";
import { db } from "../../db/client";
import { requireSession } from "../../plugins/session";
import { saveContentItem } from "./admin.service";

export async function registerAdminRoutes(app: FastifyInstance) {
  app.post("/api/admin/content", async (request, reply) => {
    const userId = requireSession(request);
    const user = db
      .prepare("SELECT is_admin FROM users WHERE id = ?")
      .get(userId) as { is_admin: number } | undefined;

    if (!user?.is_admin) {
      reply.code(403);
      return { message: "Forbidden" };
    }

    return { saved: saveContentItem(request.body) };
  });
}
```

Modify `app/backend/src/app.ts`:

```ts
import Fastify from "fastify";
import { getConfig } from "./config";
import { registerAdminRoutes } from "./modules/admin/admin.routes";
import { registerAuthRoutes } from "./modules/auth/auth.routes";
import { registerContentRoutes } from "./modules/content/content.routes";
import { registerProgressRoutes } from "./modules/progress/progress.routes";
import { registerCors } from "./plugins/cors";
import { registerSession } from "./plugins/session";

export function buildApp() {
  const config = getConfig();
  const app = Fastify();

  void registerCors(app, config.appOrigin);
  void registerSession(app, config.sessionSecret);

  app.get("/health", async () => ({ ok: true }));
  void registerAdminRoutes(app);
  void registerAuthRoutes(app);
  void registerContentRoutes(app);
  void registerProgressRoutes(app);

  return app;
}
```

Modify `app/backend/src/db/seed.ts` so the seeded admin login matches the tests:

```ts
import { randomUUID } from "node:crypto";
import { db } from "./client";
import { getConfig } from "../config";

const config = getConfig();

db.prepare("DELETE FROM completions").run();
db.prepare("DELETE FROM content_items").run();
db.prepare("DELETE FROM users").run();

db.prepare(
  `INSERT INTO users (id, email, password, difficulty, selected_tracks, is_admin)
   VALUES (?, ?, ?, ?, ?, ?)`
).run(
  randomUUID(),
  config.adminEmail,
  config.adminPassword,
  "basic",
  JSON.stringify(["conversation", "news"]),
  1
);
```

- [ ] **Step 4: Run the content test to verify admin publishing passes**

Run: `pnpm --filter @banghub/backend test -- content.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/backend/src/modules/admin app/backend/src/app.ts app/backend/src/db/seed.ts app/backend/src/test/content.test.ts
git commit -m "feat: add admin content publishing API"
```

## Task 7: Frontend App Shell, Home, and Track Pages

**Files:**
- Create: `app/frontend/package.json`
- Create: `app/frontend/tsconfig.json`
- Create: `app/frontend/vite.config.ts`
- Create: `app/frontend/index.html`
- Create: `app/frontend/src/main.tsx`
- Create: `app/frontend/src/app/router.tsx`
- Create: `app/frontend/src/app/AppShell.tsx`
- Create: `app/frontend/src/styles/global.css`
- Create: `app/frontend/src/lib/api.ts`
- Create: `app/frontend/src/lib/tts.ts`
- Create: `app/frontend/src/features/common/EmptyState.tsx`
- Create: `app/frontend/src/features/common/TrackCard.tsx`
- Create: `app/frontend/src/features/home/HomePage.tsx`
- Create: `app/frontend/src/features/conversation/ConversationPage.tsx`
- Create: `app/frontend/src/features/news/NewsPage.tsx`
- Create: `app/frontend/src/test/setup.ts`
- Create: `app/frontend/src/features/home/HomePage.test.tsx`
- Create: `app/frontend/src/features/conversation/ConversationPage.test.tsx`
- Create: `app/frontend/src/features/news/NewsPage.test.tsx`

- [ ] **Step 1: Write the failing home page rendering test**

Create `app/frontend/package.json`:

```json
{
  "name": "@banghub/frontend",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "lint": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@banghub/shared": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.5"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.4.1",
    "typescript": "^5.7.3",
    "vite": "^6.0.11",
    "vitest": "^3.0.5"
  }
}
```

Create `app/frontend/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["vitest/globals"]
  },
  "include": ["src", "vite.config.ts"]
}
```

Create `app/frontend/src/test/setup.ts`:

```ts
import "@testing-library/jest-dom";
```

Create `app/frontend/src/features/home/HomePage.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("shows both today's study cards", async () => {
    render(
      <MemoryRouter>
        <HomePage
          data={{
            viewer: null,
            todayConversation: {
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
            },
            todayNews: {
              id: "news-1",
              track: "news",
              difficulty: "basic",
              title: "Market update",
              passage: "Stocks rose after the rate decision.",
              vocabulary: [{ term: "rose", meaning: "went up" }],
              question: "What went up?",
              answer: "Stocks.",
              ttsText: "Stocks rose after the rate decision.",
              publishStatus: "published",
              isToday: true
            },
            completions: []
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Today's Conversation")).toBeInTheDocument();
    expect(screen.getByText("Today's News")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the frontend test to verify it fails**

Run: `pnpm --filter @banghub/frontend test -- HomePage.test.tsx`
Expected: FAIL because `HomePage` does not exist yet

- [ ] **Step 3: Add the frontend shell, API client, and pages**

Create `app/frontend/src/lib/api.ts`:

```ts
import type { HomeResponse, MarkCompletionRequest, UpdatePreferencesRequest } from "@banghub/shared";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export async function getHome(): Promise<HomeResponse> {
  const response = await fetch(`${API_BASE}/api/home`, { credentials: "include" });
  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  return response.json();
}

export async function updatePreferences(payload: UpdatePreferencesRequest) {
  const response = await fetch(`${API_BASE}/api/auth/preferences`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return response.json();
}

export async function markCompletion(payload: MarkCompletionRequest) {
  const response = await fetch(`${API_BASE}/api/progress/completions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return response.json();
}
```

Create `app/frontend/src/lib/tts.ts`:

```ts
export function speak(text: string) {
  if (!("speechSynthesis" in window)) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}
```

Create `app/frontend/src/features/common/EmptyState.tsx`:

```tsx
type EmptyStateProps = {
  title: string;
  body: string;
};

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}
```

Create `app/frontend/src/features/common/TrackCard.tsx`:

```tsx
import { Link } from "react-router-dom";

type TrackCardProps = {
  heading: string;
  title: string;
  description: string;
  to: string;
};

export function TrackCard({ heading, title, description, to }: TrackCardProps) {
  return (
    <article className="track-card">
      <p>{heading}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link to={to}>Start</Link>
    </article>
  );
}
```

Create `app/frontend/src/features/home/HomePage.tsx`:

```tsx
import type { HomeResponse } from "@banghub/shared";
import { EmptyState } from "../common/EmptyState";
import { TrackCard } from "../common/TrackCard";

type HomePageProps = {
  data: HomeResponse;
};

export function HomePage({ data }: HomePageProps) {
  return (
    <main className="page">
      <header className="hero">
        <p>Daily 10-minute routine</p>
        <h1>Today's English</h1>
      </header>

      <section className="grid">
        {data.todayConversation ? (
          <TrackCard
            heading="Today's Conversation"
            title={data.todayConversation.title}
            description={data.todayConversation.situation}
            to={`/conversation/${data.todayConversation.id}`}
          />
        ) : (
          <EmptyState title="Today's Conversation" body="Conversation content will appear here." />
        )}

        {data.todayNews ? (
          <TrackCard
            heading="Today's News"
            title={data.todayNews.title}
            description={data.todayNews.passage}
            to={`/news/${data.todayNews.id}`}
          />
        ) : (
          <EmptyState title="Today's News" body="News content will appear here." />
        )}
      </section>
    </main>
  );
}
```

Create `app/frontend/src/features/conversation/ConversationPage.tsx`:

```tsx
import type { ConversationItem } from "@banghub/shared";
import { speak } from "../../lib/tts";

type ConversationPageProps = {
  item: ConversationItem;
};

export function ConversationPage({ item }: ConversationPageProps) {
  return (
    <main className="page">
      <h1>{item.title}</h1>
      <p>{item.situation}</p>
      <p>{item.prompt}</p>
      <button onClick={() => speak(item.ttsText)}>Listen</button>
      <section>
        <h2>Suggested answer</h2>
        <p>{item.answer}</p>
        <ul>
          {item.alternatives.map((alternative) => (
            <li key={alternative}>{alternative}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
```

Create `app/frontend/src/features/news/NewsPage.tsx`:

```tsx
import type { NewsItem } from "@banghub/shared";
import { speak } from "../../lib/tts";

type NewsPageProps = {
  item: NewsItem;
};

export function NewsPage({ item }: NewsPageProps) {
  return (
    <main className="page">
      <h1>{item.title}</h1>
      <p>{item.passage}</p>
      <button onClick={() => speak(item.ttsText)}>Listen</button>
      <section>
        <h2>Vocabulary</h2>
        <ul>
          {item.vocabulary.map((entry) => (
            <li key={entry.term}>
              {entry.term}: {entry.meaning}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Check</h2>
        <p>{item.question}</p>
        <p>{item.answer}</p>
      </section>
    </main>
  );
}
```

Create `app/frontend/src/app/AppShell.tsx`:

```tsx
import { Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="app-shell">
      <nav className="nav">
        <a href="/">Home</a>
        <a href="/conversation">Conversation</a>
        <a href="/news">News</a>
        <a href="/admin">Admin</a>
      </nav>
      <Outlet />
    </div>
  );
}
```

Create `app/frontend/src/app/router.tsx`:

```tsx
import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { HomePage } from "../features/home/HomePage";

const placeholderHomeData = {
  viewer: null,
  todayConversation: null,
  todayNews: null,
  completions: []
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [{ index: true, element: <HomePage data={placeholderHomeData} /> }]
  }
]);
```

Create `app/frontend/src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

Create `app/frontend/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Banghub English</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
 </html>
```

Create `app/frontend/vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts"
  }
});
```

Create `app/frontend/src/styles/global.css`:

```css
:root {
  color-scheme: light;
  font-family: "IBM Plex Sans", sans-serif;
  background:
    radial-gradient(circle at top left, #f7d48b 0%, transparent 30%),
    linear-gradient(180deg, #fff9ef 0%, #f4efe5 100%);
  color: #182028;
}

body {
  margin: 0;
}

.app-shell {
  min-height: 100vh;
}

.nav {
  display: flex;
  gap: 16px;
  padding: 16px 24px;
}

.page {
  padding: 24px;
}

.grid {
  display: grid;
  gap: 16px;
}

.track-card,
.empty-state {
  border: 1px solid #d7c6a5;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
}
```

- [ ] **Step 4: Run the frontend home test to verify it passes**

Run: `pnpm --filter @banghub/frontend test -- HomePage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/frontend
git commit -m "feat: add frontend shell and study pages"
```

## Task 8: Frontend Login, Preferences, Completion, and Admin Pages

**Files:**
- Create: `app/frontend/src/lib/session.ts`
- Create: `app/frontend/src/features/auth/LoginPage.tsx`
- Create: `app/frontend/src/features/onboarding/DifficultyPage.tsx`
- Create: `app/frontend/src/features/common/CompletionButton.tsx`
- Create: `app/frontend/src/features/admin/AdminPage.tsx`
- Modify: `app/frontend/src/app/router.tsx`
- Modify: `app/frontend/src/features/conversation/ConversationPage.tsx`
- Modify: `app/frontend/src/features/news/NewsPage.tsx`

- [ ] **Step 1: Add a failing completion button test**

Append this test to `app/frontend/src/features/conversation/ConversationPage.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the conversation page test to verify it fails**

Run: `pnpm --filter @banghub/frontend test -- ConversationPage.test.tsx`
Expected: FAIL because the page does not support `viewer` or completion yet

- [ ] **Step 3: Add login, difficulty selection, completion, and admin UI**

Create `app/frontend/src/lib/session.ts`:

```ts
import { createContext, useContext } from "react";
import type { UserProfile } from "@banghub/shared";

export const SessionContext = createContext<UserProfile | null>(null);

export function useSession() {
  return useContext(SessionContext);
}
```

Create `app/frontend/src/features/common/CompletionButton.tsx`:

```tsx
import { useState } from "react";
import type { UserProfile } from "@banghub/shared";

type CompletionButtonProps = {
  viewer: UserProfile | null;
  onComplete: () => Promise<void> | void;
};

export function CompletionButton({ viewer, onComplete }: CompletionButtonProps) {
  const [message, setMessage] = useState("");

  return (
    <div>
      <button
        onClick={async () => {
          if (!viewer) {
            setMessage("Log in to save your progress.");
            return;
          }

          await onComplete();
          setMessage("Saved.");
        }}
      >
        Mark complete
      </button>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
```

Modify `app/frontend/src/features/conversation/ConversationPage.tsx`:

```tsx
import type { ConversationItem, UserProfile } from "@banghub/shared";
import { speak } from "../../lib/tts";
import { CompletionButton } from "../common/CompletionButton";

type ConversationPageProps = {
  item: ConversationItem;
  viewer: UserProfile | null;
  onComplete: () => Promise<void> | void;
};

export function ConversationPage({ item, viewer, onComplete }: ConversationPageProps) {
  return (
    <main className="page">
      <h1>{item.title}</h1>
      <p>{item.situation}</p>
      <p>{item.prompt}</p>
      <button onClick={() => speak(item.ttsText)}>Listen</button>
      <section>
        <h2>Suggested answer</h2>
        <p>{item.answer}</p>
        <ul>
          {item.alternatives.map((alternative) => (
            <li key={alternative}>{alternative}</li>
          ))}
        </ul>
      </section>
      <CompletionButton viewer={viewer} onComplete={onComplete} />
    </main>
  );
}
```

Modify `app/frontend/src/features/news/NewsPage.tsx`:

```tsx
import type { NewsItem, UserProfile } from "@banghub/shared";
import { speak } from "../../lib/tts";
import { CompletionButton } from "../common/CompletionButton";

type NewsPageProps = {
  item: NewsItem;
  viewer: UserProfile | null;
  onComplete: () => Promise<void> | void;
};

export function NewsPage({ item, viewer, onComplete }: NewsPageProps) {
  return (
    <main className="page">
      <h1>{item.title}</h1>
      <p>{item.passage}</p>
      <button onClick={() => speak(item.ttsText)}>Listen</button>
      <section>
        <h2>Vocabulary</h2>
        <ul>
          {item.vocabulary.map((entry) => (
            <li key={entry.term}>
              {entry.term}: {entry.meaning}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Check</h2>
        <p>{item.question}</p>
        <p>{item.answer}</p>
      </section>
      <CompletionButton viewer={viewer} onComplete={onComplete} />
    </main>
  );
}
```

Create `app/frontend/src/features/auth/LoginPage.tsx`:

```tsx
import { FormEvent, useState } from "react";
import { login } from "../../lib/api";

export function LoginPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await login(String(form.get("email")), String(form.get("password")));
    setMessage(result.user ? "Logged in." : "Login failed.");
  }

  return (
    <main className="page">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" />
        <button type="submit">Log in</button>
      </form>
      {message ? <p>{message}</p> : null}
    </main>
  );
}
```

Create `app/frontend/src/features/onboarding/DifficultyPage.tsx`:

```tsx
import { FormEvent, useState } from "react";
import { updatePreferences } from "../../lib/api";

export function DifficultyPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const difficulty = String(form.get("difficulty"));

    await updatePreferences({
      difficulty: difficulty as "intro" | "basic" | "intermediate",
      selectedTracks: ["conversation", "news"]
    });

    setMessage("Preferences saved.");
  }

  return (
    <main className="page">
      <h1>Select your level</h1>
      <form onSubmit={handleSubmit}>
        <label><input type="radio" name="difficulty" value="intro" defaultChecked /> Intro</label>
        <label><input type="radio" name="difficulty" value="basic" /> Basic</label>
        <label><input type="radio" name="difficulty" value="intermediate" /> Intermediate</label>
        <button type="submit">Save</button>
      </form>
      {message ? <p>{message}</p> : null}
    </main>
  );
}
```

Create `app/frontend/src/features/admin/AdminPage.tsx`:

```tsx
import { FormEvent, useState } from "react";

export function AdminPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Wire this page to the admin API in the same task that loads real data.");
  }

  return (
    <main className="page">
      <h1>Admin publishing</h1>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" />
        <select name="track" defaultValue="conversation">
          <option value="conversation">Conversation</option>
          <option value="news">News</option>
        </select>
        <button type="submit">Save draft</button>
      </form>
      {message ? <p>{message}</p> : null}
    </main>
  );
}
```

Modify `app/frontend/src/app/router.tsx`:

```tsx
import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { LoginPage } from "../features/auth/LoginPage";
import { AdminPage } from "../features/admin/AdminPage";
import { DifficultyPage } from "../features/onboarding/DifficultyPage";
import { HomePage } from "../features/home/HomePage";

const placeholderHomeData = {
  viewer: null,
  todayConversation: null,
  todayNews: null,
  completions: []
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage data={placeholderHomeData} /> },
      { path: "login", element: <LoginPage /> },
      { path: "difficulty", element: <DifficultyPage /> },
      { path: "admin", element: <AdminPage /> }
    ]
  }
]);
```

- [ ] **Step 4: Run the conversation page test to verify it passes**

Run: `pnpm --filter @banghub/frontend test -- ConversationPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/frontend/src/lib/session.ts app/frontend/src/features/auth app/frontend/src/features/onboarding app/frontend/src/features/common/CompletionButton.tsx app/frontend/src/features/admin app/frontend/src/features/conversation/ConversationPage.tsx app/frontend/src/features/news/NewsPage.tsx app/frontend/src/app/router.tsx
git commit -m "feat: add login preferences and completion UI"
```

## Task 9: Real Data Wiring, PWA, and End-to-End Tests

**Files:**
- Modify: `app/frontend/src/app/router.tsx`
- Modify: `app/frontend/src/features/home/HomePage.tsx`
- Modify: `app/frontend/src/features/admin/AdminPage.tsx`
- Create: `tests/e2e/package.json`
- Create: `tests/e2e/playwright.config.ts`
- Create: `tests/e2e/tests/home.spec.ts`
- Create: `tests/e2e/tests/admin.spec.ts`
- Create: `public/manifest.webmanifest`

- [ ] **Step 1: Write the failing end-to-end home routine test**

Create `tests/e2e/package.json`:

```json
{
  "name": "@banghub/e2e",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "playwright test",
    "lint": "playwright test --list"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.1"
  }
}
```

Create `tests/e2e/playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:5173"
  }
});
```

Create `tests/e2e/tests/home.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("home shows both daily study tracks", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Today's Conversation")).toBeVisible();
  await expect(page.getByText("Today's News")).toBeVisible();
});
```

- [ ] **Step 2: Run the end-to-end test to verify the app is not fully wired yet**

Run: `pnpm --filter @banghub/e2e test -- home.spec.ts`
Expected: FAIL because the frontend does not load live data yet

- [ ] **Step 3: Wire real data loading, admin submit, and manifest**

Modify `app/frontend/src/app/router.tsx` so the home page loads real data:

```tsx
import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";
import { LoginPage } from "../features/auth/LoginPage";
import { AdminPage } from "../features/admin/AdminPage";
import { DifficultyPage } from "../features/onboarding/DifficultyPage";
import { HomePage } from "../features/home/HomePage";
import { getHome } from "../lib/api";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        loader: async () => getHome(),
        element: <HomePage />
      },
      { path: "login", element: <LoginPage /> },
      { path: "difficulty", element: <DifficultyPage /> },
      { path: "admin", element: <AdminPage /> }
    ]
  }
]);
```

Modify `app/frontend/src/features/home/HomePage.tsx` to read from the router loader:

```tsx
import type { HomeResponse } from "@banghub/shared";
import { useLoaderData } from "react-router-dom";
import { EmptyState } from "../common/EmptyState";
import { TrackCard } from "../common/TrackCard";

type HomePageProps = {
  data?: HomeResponse;
};

export function HomePage({ data: initialData }: HomePageProps) {
  const loadedData = useLoaderData() as HomeResponse | undefined;
  const data = initialData ?? loadedData ?? {
    viewer: null,
    todayConversation: null,
    todayNews: null,
    completions: []
  };

  return (
    <main className="page">
      <header className="hero">
        <p>Daily 10-minute routine</p>
        <h1>Today's English</h1>
      </header>
      <section className="grid">
        {data.todayConversation ? (
          <TrackCard
            heading="Today's Conversation"
            title={data.todayConversation.title}
            description={data.todayConversation.situation}
            to={`/conversation/${data.todayConversation.id}`}
          />
        ) : (
          <EmptyState title="Today's Conversation" body="Conversation content will appear here." />
        )}
        {data.todayNews ? (
          <TrackCard
            heading="Today's News"
            title={data.todayNews.title}
            description={data.todayNews.passage}
            to={`/news/${data.todayNews.id}`}
          />
        ) : (
          <EmptyState title="Today's News" body="News content will appear here." />
        )}
      </section>
    </main>
  );
}
```

Modify `app/frontend/src/features/admin/AdminPage.tsx` to call the live API:

```tsx
import { FormEvent, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export function AdminPage() {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      id: crypto.randomUUID(),
      track: String(form.get("track")),
      difficulty: "basic",
      title: String(form.get("title")),
      situation: "Admin-entered conversation setup",
      prompt: "Say hello to the client.",
      answer: "Thanks for meeting today.",
      alternatives: ["Thanks for joining today."],
      ttsText: "Thanks for meeting today.",
      publishStatus: "published",
      isToday: true
    };

    const response = await fetch(`${API_BASE}/api/admin/content`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        payload.track === "conversation"
          ? payload
          : {
              id: payload.id,
              track: "news",
              difficulty: "basic",
              title: payload.title,
              passage: "Stocks rose after the rate decision.",
              vocabulary: [{ term: "rose", meaning: "went up" }],
              question: "What went up?",
              answer: "Stocks.",
              ttsText: "Stocks rose after the rate decision.",
              publishStatus: "published",
              isToday: true
            }
      )
    });

    setMessage(response.ok ? "Saved." : "Save failed.");
  }

  return (
    <main className="page">
      <h1>Admin publishing</h1>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" />
        <select name="track" defaultValue="conversation">
          <option value="conversation">Conversation</option>
          <option value="news">News</option>
        </select>
        <button type="submit">Publish today</button>
      </form>
      {message ? <p>{message}</p> : null}
    </main>
  );
}
```

Create `public/manifest.webmanifest`:

```json
{
  "name": "Banghub English",
  "short_name": "Banghub English",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fff9ef",
  "theme_color": "#182028",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Create `tests/e2e/tests/admin.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("admin page renders publishing form", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("button", { name: "Publish today" })).toBeVisible();
});
```

- [ ] **Step 4: Run the end-to-end test suite**

Run: `pnpm --filter @banghub/e2e test`
Expected: PASS after local frontend and backend servers are running with seeded data

- [ ] **Step 5: Commit**

```bash
git add app/frontend/src/app/router.tsx app/frontend/src/features/home/HomePage.tsx app/frontend/src/features/admin/AdminPage.tsx tests/e2e public/manifest.webmanifest
git commit -m "feat: wire live data and add PWA smoke coverage"
```

## Self-Review

Spec coverage check:

- Daily routine home with conversation/news cards: Tasks 4, 7, 9
- Anonymous browsing with login-gated persistence: Tasks 5, 8
- Difficulty and track preference persistence: Task 5 and Task 8
- Conversation roleplay and news reading pages: Task 7
- TTS-only audio behavior: Task 7
- Minimal completion-only progress model: Task 5
- Semi-automated admin publishing workflow: Task 6 and Task 9
- PWA-ready delivery path: Task 9

Placeholder scan:

- Remove any placeholder text introduced during implementation that leaks into production UI unless it is an intentional empty state
- Replace plain-text password storage with hashed storage before any public launch, even if skipped during the first local prototype commit sequence
- Add actual icon files before production build because the manifest references them directly

Type consistency check:

- Keep the shared enum values exactly `intro | basic | intermediate`
- Keep track values exactly `conversation | news`
- Keep completion payload shape exactly `{ contentId: string }`

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-23-english-study-mvp-implementation.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
