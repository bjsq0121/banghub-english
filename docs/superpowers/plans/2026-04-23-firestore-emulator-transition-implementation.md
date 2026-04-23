# Firestore Emulator Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the JSON-backed MVP datastore with Firestore Emulator-backed persistence for local development, including content, users, completions, and daily assignments.

**Architecture:** Keep the existing backend module split (`auth`, `content`, `progress`, `admin`) and replace the JSON file adapter with a Firestore-backed storage layer. Use Firebase Admin SDK on the backend, Firestore Emulator for local development and tests, and dedicated seed scripts to populate conversation items, news items, users, and daily assignments.

**Tech Stack:** TypeScript, Fastify, Firebase Admin SDK, Firebase Emulator Suite, React, Vite, Vitest

---

## File Structure

### Root / Infra

- Modify: `.env.example`
- Modify: `README.md`
- Modify: `package.json`
- Create: `firebase.json`
- Create: `.firebaserc`
- Create: `scripts/firestore/start-emulator.sh`

### Backend Firestore Layer

- Modify: `app/backend/package.json`
- Modify: `app/backend/src/config.ts`
- Delete: `app/backend/src/db/client.ts`
- Delete: `app/backend/src/db/schema.sql`
- Create: `app/backend/src/db/firestore.ts`
- Create: `app/backend/src/db/collections.ts`
- Create: `app/backend/src/db/seed.ts`
- Create: `app/backend/src/db/seed-data.ts`
- Create: `app/backend/src/db/dev-auth.ts`
- Modify: `app/backend/src/modules/auth/auth.service.ts`
- Modify: `app/backend/src/modules/auth/auth.routes.ts`
- Modify: `app/backend/src/modules/content/content.service.ts`
- Modify: `app/backend/src/modules/content/content.routes.ts`
- Modify: `app/backend/src/modules/progress/progress.service.ts`
- Modify: `app/backend/src/modules/progress/progress.routes.ts`
- Modify: `app/backend/src/modules/admin/admin.service.ts`
- Modify: `app/backend/src/modules/admin/admin.routes.ts`

### Backend Tests

- Modify: `app/backend/src/test/app.test.ts`
- Modify: `app/backend/src/test/auth.test.ts`
- Modify: `app/backend/src/test/content.test.ts`
- Modify: `app/backend/src/test/progress.test.ts`
- Create: `app/backend/src/test/test-firestore.ts`

### Frontend

- Modify: `app/frontend/src/lib/api.ts`
- Modify: `app/frontend/src/features/auth/LoginPage.tsx`
- Modify: `app/frontend/src/features/admin/AdminPage.tsx`
- Modify: `app/frontend/src/app/router.tsx`
- Modify: `app/frontend/src/features/common/ErrorPage.tsx`

## Task 1: Add Firebase Emulator Project Configuration

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `package.json`
- Create: `firebase.json`
- Create: `.firebaserc`
- Create: `scripts/firestore/start-emulator.sh`

- [ ] **Step 1: Write the failing emulator command wiring**

Update root `package.json` to declare emulator-oriented commands before config files exist:

```json
{
  "name": "banghub-english",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "scripts": {
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "build": "pnpm -r build",
    "emulator:start": "firebase emulators:start --only firestore",
    "emulator:exec:test": "firebase emulators:exec --only firestore \"pnpm test\""
  }
}
```

- [ ] **Step 2: Run the emulator start command to verify it fails before config exists**

Run: `pnpm emulator:start`
Expected: FAIL with missing Firebase configuration or missing CLI setup

- [ ] **Step 3: Add the Firebase project and environment configuration**

Update `.env.example`:

```dotenv
PORT=4000
APP_ORIGIN=http://localhost:5173
SESSION_SECRET=change-me
ADMIN_EMAIL=admin@banghub.kr
ADMIN_PASSWORD=change-me
FIRESTORE_PROJECT_ID=banghub-english-local
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
USE_FIRESTORE_EMULATOR=true
```

Create `firebase.json`:

```json
{
  "emulators": {
    "firestore": {
      "host": "127.0.0.1",
      "port": 8080
    }
  },
  "firestore": {
    "rules": "infra/firestore.rules"
  }
}
```

Create `.firebaserc`:

```json
{
  "projects": {
    "default": "banghub-english-local"
  }
}
```

Create `scripts/firestore/start-emulator.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
firebase emulators:start --only firestore
```

Update `README.md` with a local data section:

```md
## Local Firestore

1. Copy `.env.example` to `.env`
2. Start Firestore Emulator with `pnpm emulator:start`
3. Seed local data with `pnpm --filter @banghub/backend seed`
```

- [ ] **Step 4: Run a file existence check**

Run: `rg --files . | rg "firebase.json|.firebaserc|start-emulator.sh|README.md|.env.example|package.json"`
Expected: PASS with the new Firebase config files listed

- [ ] **Step 5: Commit**

```bash
git add package.json .env.example README.md firebase.json .firebaserc scripts/firestore/start-emulator.sh
git commit -m "chore: add firestore emulator project config"
```

## Task 2: Replace JSON DB Client with Firestore Bootstrap

**Files:**
- Modify: `app/backend/package.json`
- Modify: `app/backend/src/config.ts`
- Delete: `app/backend/src/db/client.ts`
- Delete: `app/backend/src/db/schema.sql`
- Create: `app/backend/src/db/firestore.ts`
- Create: `app/backend/src/db/collections.ts`

- [ ] **Step 1: Write the failing Firestore bootstrap test**

Create `app/backend/src/test/test-firestore.ts`:

```ts
import { afterEach, beforeEach } from "vitest";
import { getFirestoreClient } from "../db/firestore";

export async function clearFirestore() {
  const db = getFirestoreClient();
  const collections = await db.listCollections();

  for (const collection of collections) {
    const snapshot = await collection.get();
    for (const doc of snapshot.docs) {
      await doc.ref.delete();
    }
  }
}

beforeEach(async () => {
  await clearFirestore();
});

afterEach(async () => {
  await clearFirestore();
});
```

Modify `app/backend/src/test/app.test.ts`:

```ts
import "./test-firestore";
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

- [ ] **Step 2: Run the backend test to verify Firestore bootstrap is missing**

Run: `pnpm --filter @banghub/backend test -- src/test/app.test.ts`
Expected: FAIL because `../db/firestore` does not exist yet

- [ ] **Step 3: Add Firestore bootstrap files**

Update `app/backend/package.json`:

```json
{
  "name": "@banghub/backend",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run --maxWorkers=1 --testTimeout=10000",
    "lint": "tsc -p tsconfig.json --noEmit",
    "seed": "tsx src/db/seed.ts"
  },
  "dependencies": {
    "@banghub/shared": "workspace:*",
    "@fastify/cookie": "^10.0.1",
    "@fastify/cors": "^10.0.2",
    "fastify": "^5.2.1",
    "firebase-admin": "^13.0.1",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "tsx": "^4.19.2",
    "typescript": "^5.7.3",
    "vitest": "^3.0.5"
  }
}
```

Update `app/backend/src/config.ts`:

```ts
export function getConfig() {
  return {
    port: Number(process.env.PORT ?? 4000),
    appOrigin: process.env.APP_ORIGIN ?? "http://localhost:5173",
    sessionSecret: process.env.SESSION_SECRET ?? "change-me",
    adminEmail: process.env.ADMIN_EMAIL ?? "admin@banghub.kr",
    adminPassword: process.env.ADMIN_PASSWORD ?? "change-me",
    firestoreProjectId: process.env.FIRESTORE_PROJECT_ID ?? "banghub-english-local",
    firestoreEmulatorHost: process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080",
    useFirestoreEmulator: process.env.USE_FIRESTORE_EMULATOR !== "false"
  };
}
```

Create `app/backend/src/db/firestore.ts`:

```ts
import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { getConfig } from "../config";

let firestoreClient: Firestore | null = null;

function getFirebaseApp(): App {
  const config = getConfig();

  if (config.useFirestoreEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST = config.firestoreEmulatorHost;
  }

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    projectId: config.firestoreProjectId
  });
}

export function getFirestoreClient() {
  if (!firestoreClient) {
    firestoreClient = getFirestore(getFirebaseApp());
  }

  return firestoreClient;
}
```

Create `app/backend/src/db/collections.ts`:

```ts
export const COLLECTIONS = {
  conversationItems: "conversationItems",
  newsItems: "newsItems",
  users: "users",
  dailyAssignments: "dailyAssignments"
} as const;
```

- [ ] **Step 4: Run the backend health test**

Run: `pnpm --filter @banghub/backend test -- src/test/app.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/backend/package.json app/backend/src/config.ts app/backend/src/db/firestore.ts app/backend/src/db/collections.ts app/backend/src/test/app.test.ts app/backend/src/test/test-firestore.ts
git rm app/backend/src/db/client.ts app/backend/src/db/schema.sql
git commit -m "feat: add firestore backend bootstrap"
```

## Task 3: Seed Firestore Emulator with MVP Data

**Files:**
- Create: `app/backend/src/db/seed-data.ts`
- Modify: `app/backend/src/db/seed.ts`
- Create: `app/backend/src/db/dev-auth.ts`

- [ ] **Step 1: Write the failing seed-data test**

Append this test to `app/backend/src/test/auth.test.ts`:

```ts
it("creates a seeded admin user with hashed password", async () => {
  const { seedFirestore } = await import("../db/seed");
  await seedFirestore();

  const user = db.read; // intentionally broken reference to prove seed helper is not ready yet
  expect(user).toBeDefined();
});
```

- [ ] **Step 2: Run the auth test to verify the seed helper is missing**

Run: `pnpm --filter @banghub/backend test -- src/test/auth.test.ts`
Expected: FAIL because the Firestore seed helper is not implemented

- [ ] **Step 3: Add seed data and development auth helpers**

Create `app/backend/src/db/seed-data.ts`:

```ts
export const seedConversationItems = [
  {
    id: "conversation-1",
    title: "Client meeting opener",
    difficulty: "basic",
    situation: "You are starting a weekly client call.",
    prompt: "Greet the client and confirm the agenda.",
    answer: "Thanks for joining. Shall we quickly confirm today's agenda?",
    alternatives: ["Thanks for making time today.", "Can we start by reviewing the agenda?"],
    ttsText: "Thanks for joining. Shall we quickly confirm today's agenda?",
    publishStatus: "published"
  }
];

export const seedNewsItems = [
  {
    id: "news-1",
    title: "Market update",
    difficulty: "basic",
    passage: "Stocks rose after the central bank kept rates unchanged.",
    vocabulary: [{ term: "unchanged", meaning: "not changed" }],
    question: "What happened to rates?",
    answer: "They stayed the same.",
    ttsText: "Stocks rose after the central bank kept rates unchanged.",
    publishStatus: "published"
  }
];
```

Create `app/backend/src/db/dev-auth.ts`:

```ts
import { randomUUID } from "node:crypto";
import { getFirestoreClient } from "./firestore";
import { COLLECTIONS } from "./collections";

export async function ensureDevelopmentUser(email: string, isAdmin = false) {
  const db = getFirestoreClient();
  const existing = await db.collection(COLLECTIONS.users).where("email", "==", email).limit(1).get();

  if (!existing.empty) {
    return existing.docs[0]!.id;
  }

  const userId = randomUUID();
  await db.collection(COLLECTIONS.users).doc(userId).set({
    email,
    difficulty: "basic",
    selectedTracks: ["conversation", "news"],
    isAdmin,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return userId;
}
```

Replace `app/backend/src/db/seed.ts` with:

```ts
import { getConfig } from "../config";
import { hashPassword } from "../modules/auth/auth.service";
import { COLLECTIONS } from "./collections";
import { getFirestoreClient } from "./firestore";
import { seedConversationItems, seedNewsItems } from "./seed-data";

export async function seedFirestore() {
  const config = getConfig();
  const db = getFirestoreClient();
  const now = new Date().toISOString();
  const today = new Date().toISOString().slice(0, 10);

  const batch = db.batch();

  for (const item of seedConversationItems) {
    batch.set(db.collection(COLLECTIONS.conversationItems).doc(item.id), {
      ...item,
      createdAt: now,
      updatedAt: now
    });
  }

  for (const item of seedNewsItems) {
    batch.set(db.collection(COLLECTIONS.newsItems).doc(item.id), {
      ...item,
      createdAt: now,
      updatedAt: now
    });
  }

  batch.set(db.collection(COLLECTIONS.users).doc("admin-user"), {
    email: config.adminEmail,
    passwordHash: hashPassword(config.adminPassword),
    difficulty: "basic",
    selectedTracks: ["conversation", "news"],
    isAdmin: true,
    createdAt: now,
    updatedAt: now
  });

  batch.set(db.collection(COLLECTIONS.dailyAssignments).doc(today), {
    conversationItemId: "conversation-1",
    newsItemId: "news-1",
    publishedAt: now,
    updatedAt: now
  });

  await batch.commit();
}

await seedFirestore();
```

- [ ] **Step 4: Run the auth test and seed command**

Run: `pnpm --filter @banghub/backend test -- src/test/auth.test.ts`
Expected: PASS after the test is updated to read Firestore state

Run: `pnpm --filter @banghub/backend seed`
Expected: PASS and local Firestore Emulator contains seed documents

- [ ] **Step 5: Commit**

```bash
git add app/backend/src/db/seed-data.ts app/backend/src/db/seed.ts app/backend/src/db/dev-auth.ts
git commit -m "feat: seed firestore emulator with MVP data"
```

## Task 4: Move Auth to Firestore Users

**Files:**
- Modify: `app/backend/src/modules/auth/auth.service.ts`
- Modify: `app/backend/src/modules/auth/auth.routes.ts`
- Modify: `app/backend/src/test/auth.test.ts`

- [ ] **Step 1: Write the failing Firestore auth tests**

Replace `app/backend/src/test/auth.test.ts` with:

```ts
import "./test-firestore";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { getFirestoreClient } from "../db/firestore";
import { COLLECTIONS } from "../db/collections";
import { hashPassword } from "../modules/auth/auth.service";

describe("auth and session security", () => {
  beforeEach(async () => {
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.users).doc("user-1").set({
      email: "user@banghub.kr",
      passwordHash: hashPassword("password123"),
      difficulty: "basic",
      selectedTracks: ["conversation", "news"],
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  it("logs in with hashed passwords stored in firestore", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "user@banghub.kr", password: "password123" }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user.email).toBe("user@banghub.kr");
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
  });
});
```

- [ ] **Step 2: Run the auth test to verify JSON-backed auth no longer works**

Run: `pnpm --filter @banghub/backend test -- src/test/auth.test.ts`
Expected: FAIL because auth service still uses the old storage assumptions

- [ ] **Step 3: Implement Firestore-backed auth**

Update `app/backend/src/modules/auth/auth.service.ts` so it uses Firestore user documents with `passwordHash`:

```ts
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getFirestoreClient } from "../../db/firestore";
import { COLLECTIONS } from "../../db/collections";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, hashedPassword: string) {
  const [salt, storedKey] = hashedPassword.split(":");

  if (!salt || !storedKey) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedKey, "hex");

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedKey);
}

export async function loginUser(email: string, password: string) {
  const db = getFirestoreClient();
  const snapshot = await db.collection(COLLECTIONS.users).where("email", "==", email).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0]!;
  const user = doc.data() as {
    email: string;
    passwordHash?: string;
    difficulty: "intro" | "basic" | "intermediate";
    selectedTracks: Array<"conversation" | "news">;
    isAdmin: boolean;
  };

  if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return {
    id: doc.id,
    email: user.email,
    difficulty: user.difficulty,
    selectedTracks: user.selectedTracks,
    isAdmin: user.isAdmin
  };
}

export async function getViewerById(userId: string) {
  const db = getFirestoreClient();
  const doc = await db.collection(COLLECTIONS.users).doc(userId).get();

  if (!doc.exists) {
    return null;
  }

  const user = doc.data() as {
    email: string;
    difficulty: "intro" | "basic" | "intermediate";
    selectedTracks: Array<"conversation" | "news">;
    isAdmin: boolean;
  };

  return {
    id: doc.id,
    email: user.email,
    difficulty: user.difficulty,
    selectedTracks: user.selectedTracks,
    isAdmin: user.isAdmin
  };
}

export async function updatePreferences(
  userId: string,
  difficulty: string,
  selectedTracks: string[]
) {
  const db = getFirestoreClient();
  await db.collection(COLLECTIONS.users).doc(userId).set(
    {
      difficulty,
      selectedTracks,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
}
```

Update `app/backend/src/modules/auth/auth.routes.ts` to await the async service methods.

- [ ] **Step 4: Run auth tests and backend lint**

Run: `pnpm --filter @banghub/backend test -- src/test/auth.test.ts`
Expected: PASS

Run: `pnpm --filter @banghub/backend lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/backend/src/modules/auth/auth.service.ts app/backend/src/modules/auth/auth.routes.ts app/backend/src/test/auth.test.ts
git commit -m "feat: move auth to firestore users"
```

## Task 5: Move Content and Daily Assignment Reads to Firestore

**Files:**
- Modify: `app/backend/src/modules/content/content.service.ts`
- Modify: `app/backend/src/modules/content/content.routes.ts`
- Modify: `app/backend/src/test/content.test.ts`

- [ ] **Step 1: Write failing Firestore content tests**

Replace `app/backend/src/test/content.test.ts` with:

```ts
import "./test-firestore";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { getFirestoreClient } from "../db/firestore";
import { COLLECTIONS } from "../db/collections";

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
      alternatives: ["Thanks for making time today."],
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

  it("returns today's assigned conversation item", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/home" });

    expect(response.statusCode).toBe(200);
    expect(response.json().todayConversation.title).toBe("Client meeting opener");
    expect(response.json().todayNews).toBeNull();
  });
});
```

- [ ] **Step 2: Run the content test to verify the old storage layer fails**

Run: `pnpm --filter @banghub/backend test -- src/test/content.test.ts`
Expected: FAIL because content lookup still depends on JSON state

- [ ] **Step 3: Implement Firestore-backed assignment and content lookup**

Update `app/backend/src/modules/content/content.service.ts`:

```ts
import { conversationItemSchema, newsItemSchema } from "@banghub/shared";
import { COLLECTIONS } from "../../db/collections";
import { getFirestoreClient } from "../../db/firestore";

export async function getTodayContent() {
  const db = getFirestoreClient();
  const today = new Date().toISOString().slice(0, 10);
  const assignmentDoc = await db.collection(COLLECTIONS.dailyAssignments).doc(today).get();

  if (!assignmentDoc.exists) {
    return {
      todayConversation: null,
      todayNews: null
    };
  }

  const assignment = assignmentDoc.data() as {
    conversationItemId?: string | null;
    newsItemId?: string | null;
  };

  const conversationDoc = assignment.conversationItemId
    ? await db.collection(COLLECTIONS.conversationItems).doc(assignment.conversationItemId).get()
    : null;
  const newsDoc = assignment.newsItemId
    ? await db.collection(COLLECTIONS.newsItems).doc(assignment.newsItemId).get()
    : null;

  return {
    todayConversation: conversationDoc?.exists
      ? conversationItemSchema.parse({
          id: conversationDoc.id,
          track: "conversation",
          ...conversationDoc.data()
        })
      : null,
    todayNews: newsDoc?.exists
      ? newsItemSchema.parse({
          id: newsDoc.id,
          track: "news",
          ...newsDoc.data()
        })
      : null
  };
}

export async function getContentById(track: "conversation" | "news", id: string) {
  const db = getFirestoreClient();
  const collection =
    track === "conversation" ? COLLECTIONS.conversationItems : COLLECTIONS.newsItems;
  const doc = await db.collection(collection).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return track === "conversation"
    ? conversationItemSchema.parse({ id: doc.id, track: "conversation", ...doc.data() })
    : newsItemSchema.parse({ id: doc.id, track: "news", ...doc.data() });
}
```

Update `app/backend/src/modules/content/content.routes.ts` to await `getTodayContent()` and `getContentById(...)`.

- [ ] **Step 4: Run the content test**

Run: `pnpm --filter @banghub/backend test -- src/test/content.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/backend/src/modules/content/content.service.ts app/backend/src/modules/content/content.routes.ts app/backend/src/test/content.test.ts
git commit -m "feat: move content lookup to firestore"
```

## Task 6: Move Completion Writes to User Subcollections

**Files:**
- Modify: `app/backend/src/modules/progress/progress.service.ts`
- Modify: `app/backend/src/modules/progress/progress.routes.ts`
- Modify: `app/backend/src/test/progress.test.ts`

- [ ] **Step 1: Write the failing completion subcollection test**

Replace `app/backend/src/test/progress.test.ts` with:

```ts
import "./test-firestore";
import { beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { getFirestoreClient } from "../db/firestore";
import { COLLECTIONS } from "../db/collections";
import { hashPassword } from "../modules/auth/auth.service";

describe("completion API", () => {
  beforeEach(async () => {
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.users).doc("user-1").set({
      email: "user@banghub.kr",
      passwordHash: hashPassword("password123"),
      difficulty: "basic",
      selectedTracks: ["conversation", "news"],
      isAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  it("writes completion to the user's completions subcollection", async () => {
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

    const db = getFirestoreClient();
    const completion = await db
      .collection(COLLECTIONS.users)
      .doc("user-1")
      .collection("completions")
      .doc("conversation-1")
      .get();

    expect(response.statusCode).toBe(200);
    expect(completion.exists).toBe(true);
  });
});
```

- [ ] **Step 2: Run the progress test to verify the old service fails**

Run: `pnpm --filter @banghub/backend test -- src/test/progress.test.ts`
Expected: FAIL because completions are not written to Firestore yet

- [ ] **Step 3: Implement Firestore subcollection writes**

Update `app/backend/src/modules/progress/progress.service.ts`:

```ts
import { COLLECTIONS } from "../../db/collections";
import { getFirestoreClient } from "../../db/firestore";

export async function markCompletion(userId: string, contentId: string) {
  const db = getFirestoreClient();
  await db
    .collection(COLLECTIONS.users)
    .doc(userId)
    .collection("completions")
    .doc(contentId)
    .set({
      contentId,
      completedOn: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString()
    });
}

export async function listCompletions(userId: string) {
  const db = getFirestoreClient();
  const snapshot = await db.collection(COLLECTIONS.users).doc(userId).collection("completions").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as { contentId: string; completedOn: string };

    return {
      userId,
      contentId: data.contentId,
      completedOn: data.completedOn
    };
  });
}
```

Update `app/backend/src/modules/progress/progress.routes.ts` to await `markCompletion(...)`.

- [ ] **Step 4: Run the progress test**

Run: `pnpm --filter @banghub/backend test -- src/test/progress.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/backend/src/modules/progress/progress.service.ts app/backend/src/modules/progress/progress.routes.ts app/backend/src/test/progress.test.ts
git commit -m "feat: move completion writes to firestore subcollections"
```

## Task 7: Move Admin Publishing to Firestore Collections and Daily Assignments

**Files:**
- Modify: `app/backend/src/modules/admin/admin.service.ts`
- Modify: `app/backend/src/modules/admin/admin.routes.ts`
- Modify: `app/backend/src/test/content.test.ts`

- [ ] **Step 1: Write the failing admin publish test**

Append this test to `app/backend/src/test/content.test.ts`:

```ts
it("updates today's daily assignment when publishing a conversation item", async () => {
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
  await app.inject({
    method: "POST",
    url: "/api/admin/content",
    headers: { cookie: sessionCookie },
    payload: {
      id: "conversation-2",
      track: "conversation",
      difficulty: "basic",
      title: "New conversation",
      situation: "You are greeting a vendor.",
      prompt: "Say hello to the vendor.",
      answer: "Thanks for joining today.",
      alternatives: [],
      ttsText: "Thanks for joining today.",
      publishStatus: "published",
      isToday: true
    }
  });

  const today = new Date().toISOString().slice(0, 10);
  const assignment = await db.collection(COLLECTIONS.dailyAssignments).doc(today).get();

  expect(assignment.data()?.conversationItemId).toBe("conversation-2");
});
```

- [ ] **Step 2: Run the content test to verify admin publishing is not Firestore-backed yet**

Run: `pnpm --filter @banghub/backend test -- src/test/content.test.ts`
Expected: FAIL because admin publishing still uses the previous storage logic

- [ ] **Step 3: Implement Firestore-backed admin publishing**

Update `app/backend/src/modules/admin/admin.service.ts`:

```ts
import { conversationItemSchema, newsItemSchema } from "@banghub/shared";
import { COLLECTIONS } from "../../db/collections";
import { getFirestoreClient } from "../../db/firestore";

export async function saveContentItem(payload: unknown) {
  const parsed =
    typeof payload === "object" && payload && (payload as { track?: string }).track === "conversation"
      ? conversationItemSchema.parse(payload)
      : newsItemSchema.parse(payload);

  const db = getFirestoreClient();
  const now = new Date().toISOString();
  const today = new Date().toISOString().slice(0, 10);
  const collection =
    parsed.track === "conversation" ? COLLECTIONS.conversationItems : COLLECTIONS.newsItems;

  await db.collection(collection).doc(parsed.id).set({
    ...parsed,
    createdAt: now,
    updatedAt: now
  });

  if (parsed.isToday) {
    await db.collection(COLLECTIONS.dailyAssignments).doc(today).set(
      parsed.track === "conversation"
        ? {
            conversationItemId: parsed.id,
            updatedAt: now
          }
        : {
            newsItemId: parsed.id,
            updatedAt: now
          },
      { merge: true }
    );
  }

  return parsed;
}
```

Update `app/backend/src/modules/admin/admin.routes.ts` so it reads the current user from Firestore and awaits `saveContentItem(...)`.

- [ ] **Step 4: Run the content test**

Run: `pnpm --filter @banghub/backend test -- src/test/content.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/backend/src/modules/admin/admin.service.ts app/backend/src/modules/admin/admin.routes.ts app/backend/src/test/content.test.ts
git commit -m "feat: move admin publishing to firestore"
```

## Task 8: Update Frontend Development Flows for Emulator-backed Data

**Files:**
- Modify: `app/frontend/src/lib/api.ts`
- Modify: `app/frontend/src/features/auth/LoginPage.tsx`
- Modify: `app/frontend/src/features/admin/AdminPage.tsx`
- Modify: `app/frontend/src/app/router.tsx`
- Modify: `app/frontend/src/features/common/ErrorPage.tsx`

- [ ] **Step 1: Write the failing frontend API error-path test**

Append this test to `app/frontend/src/lib/api.test.ts`:

```ts
it("throws a generic message for non-404 backend failures", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "boom" })
    })
  );

  await expect(getContentItem("news", "broken")).rejects.toThrow("Failed to load content");
});
```

- [ ] **Step 2: Run the API test to verify current frontend error handling is incomplete**

Run: `pnpm --filter @banghub/frontend test -- src/lib/api.test.ts`
Expected: FAIL until the API layer and error page messaging are aligned

- [ ] **Step 3: Adjust frontend API and error rendering for Firestore-backed responses**

Update `app/frontend/src/lib/api.ts`:

```ts
import type {
  ConversationItem,
  HomeResponse,
  MarkCompletionRequest,
  NewsItem,
  UpdatePreferencesRequest
} from "@banghub/shared";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function parseJson(response: Response) {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message ?? `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function getHome(): Promise<HomeResponse> {
  const response = await fetch(`${API_BASE}/api/home`, { credentials: "include" });
  return parseJson(response);
}

export async function getContentItem(track: "conversation" | "news", id: string) {
  const response = await fetch(`${API_BASE}/api/content/${track}/${id}`, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(response.status === 404 ? "Content not found" : "Failed to load content");
  }

  const payload = await response.json();
  return payload.item as ConversationItem | NewsItem;
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  return parseJson(response);
}

export async function updatePreferences(payload: UpdatePreferencesRequest) {
  const response = await fetch(`${API_BASE}/api/auth/preferences`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseJson(response);
}

export async function markCompletion(payload: MarkCompletionRequest) {
  const response = await fetch(`${API_BASE}/api/progress/completions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseJson(response);
}
```

Update `LoginPage.tsx` to show backend error messages.

Update `AdminPage.tsx` to show the backend's failure reason when publish fails.

Update `ErrorPage.tsx`:

```tsx
import { Link, useRouteError } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError() as { message?: string; statusText?: string } | undefined;
  const message = error?.message ?? error?.statusText ?? "Something went wrong.";

  return (
    <main className="page">
      <h1>Page unavailable</h1>
      <p>{message}</p>
      <Link to="/">Back to home</Link>
    </main>
  );
}
```

- [ ] **Step 4: Run frontend tests and lint**

Run: `pnpm --filter @banghub/frontend test`
Expected: PASS

Run: `pnpm --filter @banghub/frontend lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/frontend/src/lib/api.ts app/frontend/src/features/auth/LoginPage.tsx app/frontend/src/features/admin/AdminPage.tsx app/frontend/src/app/router.tsx app/frontend/src/features/common/ErrorPage.tsx app/frontend/src/lib/api.test.ts
git commit -m "feat: align frontend flows with firestore backend"
```

## Task 9: Run Emulator-backed Verification End-to-End

**Files:**
- Modify: `README.md`
- Modify: `package.json`

- [ ] **Step 1: Add a failing emulator-backed verification checklist to the docs**

Append this section to `README.md`:

```md
## Verification

- `pnpm emulator:exec:test`
- `pnpm --filter @banghub/backend seed`
- `pnpm --filter @banghub/frontend build`
```

- [ ] **Step 2: Run emulator-backed verification before finalizing**

Run: `pnpm emulator:exec:test`
Expected: PASS with backend tests using Firestore Emulator

Run: `pnpm --filter @banghub/backend seed`
Expected: PASS with seed data written into Firestore Emulator

Run: `pnpm --filter @banghub/frontend build`
Expected: PASS

- [ ] **Step 3: Update README to reflect the verified local workflow**

Ensure `README.md` includes:

```md
## Local Firestore Workflow

1. `pnpm install`
2. `pnpm emulator:start`
3. `pnpm --filter @banghub/backend seed`
4. `pnpm --filter @banghub/backend dev`
5. `pnpm --filter @banghub/frontend dev`
```

- [ ] **Step 4: Run `git status` to confirm only intentional files changed**

Run: `git status --short`
Expected: PASS with only expected tracked changes

- [ ] **Step 5: Commit**

```bash
git add README.md package.json
git commit -m "docs: verify firestore emulator workflow"
```

## Self-Review

Spec coverage check:

- Firestore Emulator as local default: Tasks 1 and 9
- Track-separated collections: Tasks 2, 5, and 7
- User completions as subcollections: Task 6
- Daily assignment document model: Tasks 5 and 7
- Development login and minimal identity: Tasks 3 and 4
- Removal of JSON runtime persistence: Tasks 2 through 7
- Seeded local development flow: Tasks 3 and 9

Placeholder scan:

- No `TBD`, `TODO`, or deferred implementation notes in task steps
- Every storage transition task has concrete file paths and commands
- Every test step names the exact command and expected result

Type consistency check:

- Collection names stay exactly `conversationItems`, `newsItems`, `users`, `dailyAssignments`
- Completion path stays exactly `users/{userId}/completions/{contentId}`
- User document field stays `passwordHash`
- Daily assignment fields stay `conversationItemId` and `newsItemId`

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-23-firestore-emulator-transition-implementation.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
