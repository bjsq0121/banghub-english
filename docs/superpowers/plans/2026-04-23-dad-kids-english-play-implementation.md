# Dad and Kids English Play Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current conversation/news English MVP into a daily "dad and kids toy forest English mission" app for a father and his 3-year-old and 6-year-old children.

**Architecture:** Replace track-based content with Firestore-backed daily missions. Keep the existing TypeScript monorepo, Fastify backend, React/Vite frontend, session auth, and Firestore Emulator test flow. Use browser TTS as the MVP fallback while shaping data so Cloud TTS audio URLs can be added later without changing page flow.

**Tech Stack:** TypeScript, Zod, Fastify, Firebase Admin Firestore, React, React Router, Vite, Vitest, Testing Library, pnpm.

---

## Current Context

- Branch: `feature/firestore-transition`
- Existing app shape:
  - `app/shared/src/content.ts` defines conversation/news schemas.
  - `app/shared/src/contracts.ts` defines home response and completion request schemas.
  - `app/backend/src/modules/content/*` serves `/api/home` and `/api/content/:track/:id`.
  - `app/backend/src/modules/progress/*` saves completions by `contentId`.
  - `app/frontend/src/app/router.tsx` routes home, conversation detail, news detail, login, difficulty, admin.
- Existing local verification:
  - `pnpm test`
  - `pnpm build`
  - `pnpm lint`
- Existing uncommitted environment fixes:
  - `.gitignore` ignores `app/shared/dist`.
  - Firestore scripts have executable mode.
  - `scripts/firestore/start-emulator.sh` uses `/dev/tcp` instead of Linux-only `ss`.

## File Structure

### Shared

- Modify `app/shared/src/content.ts`
  - Replace conversation/news item schemas with mission schemas.
  - Keep `difficultySchema` if existing auth preferences still use it.
- Modify `app/shared/src/contracts.ts`
  - Replace `homeResponseSchema` with mission home response.
  - Replace `markCompletionSchema` with mission completion request.
- Modify `app/shared/src/user.ts`
  - Keep existing user/completion types if compatible, or update completion schema to mission completion.
- Modify `app/shared/src/index.ts`
  - Continue exporting shared schemas and types.

### Backend

- Modify `app/backend/src/db/collections.ts`
  - Add `dailyMissions`.
  - Keep old collection names only if tests or transitional code still need them during the task.
- Modify `app/backend/src/db/seed-data.ts`
  - Replace conversation/news seed content with 7 mission seed records.
- Modify `app/backend/src/db/seed.ts`
  - Seed `dailyMissions`.
  - Seed today's assignment by mission ID or mark one mission as today.
  - Keep admin user seed.
- Replace `app/backend/src/modules/content/content.service.ts`
  - Mission service functions: `getTodayMission`, `getMissionById`.
- Replace `app/backend/src/modules/content/content.routes.ts`
  - Keep route module name for minimal wiring churn, but expose `/api/home` and `/api/missions/:id`.
- Modify `app/backend/src/modules/progress/progress.service.ts`
  - Save completions by `missionId` and `childMode`.
- Modify `app/backend/src/modules/progress/progress.routes.ts`
  - Validate mission completion request.
- Modify `app/backend/src/modules/admin/admin.service.ts` and `admin.routes.ts`
  - Publish mission records instead of conversation/news content.
- Modify backend tests in `app/backend/src/test/*.test.ts`
  - Replace content expectations with mission expectations.

### Frontend

- Modify `app/frontend/src/lib/api.ts`
  - Replace content fetchers with mission fetchers.
- Modify `app/frontend/src/lib/tts.ts`
  - Add `playMissionAudio({ audioUrl, fallbackText })`.
- Replace `app/frontend/src/features/home/HomePage.tsx`
  - Show today's mission and child mode start buttons.
- Create `app/frontend/src/features/mission/MissionPage.tsx`
  - Guided mission play sequence.
- Create `app/frontend/src/features/mission/MissionPage.test.tsx`
  - Render and audio fallback coverage.
- Remove or stop routing to `ConversationPage` and `NewsPage`.
- Modify `app/frontend/src/app/router.tsx`
  - Route `/mission/:id/:childMode`.
- Modify `app/frontend/src/app/AppShell.tsx`
  - Navigation should match the toy forest mission app.
- Modify `app/frontend/src/styles/global.css`
  - Child-friendly toy forest visual style with stable responsive layout.

---

### Task 0: Commit Local Environment Fixes

**Files:**
- Modify: `.gitignore`
- Modify mode: `scripts/firestore/run-emulator-tests.sh`
- Modify mode and content: `scripts/firestore/start-emulator.sh`

- [ ] **Step 1: Confirm the environment fix diff**

Run:

```bash
git diff -- .gitignore scripts/firestore/run-emulator-tests.sh scripts/firestore/start-emulator.sh
```

Expected: diff shows `app/shared/dist`, shell script executable mode changes, and `/dev/tcp` port probing in `start-emulator.sh`.

- [ ] **Step 2: Verify the environment fix**

Run:

```bash
pnpm test
pnpm build
pnpm lint
```

Expected: all commands exit 0. Backend test output includes 4 passed files and frontend test output includes 5 passed files before later tasks change the suite.

- [ ] **Step 3: Commit the environment fix**

Run:

```bash
git add .gitignore scripts/firestore/run-emulator-tests.sh scripts/firestore/start-emulator.sh
git commit -m "fix: make firestore emulator scripts portable"
```

Expected: commit succeeds. If Git identity is missing, set repo-local identity first with the user's preferred name/email:

```bash
git config user.name "Bang"
git config user.email "bang@example.com"
```

Use the real preferred email instead of the example.

---

### Task 1: Define Mission Contracts

**Files:**
- Modify: `app/shared/src/content.ts`
- Modify: `app/shared/src/contracts.ts`
- Modify: `app/shared/src/user.ts`
- Test: `app/shared` TypeScript check through `pnpm --filter @banghub/shared test`

- [ ] **Step 1: Replace content schemas with mission schemas**

In `app/shared/src/content.ts`, replace the track schemas and item schemas with:

```ts
import { z } from "zod";

export const difficultySchema = z.enum(["intro", "basic", "intermediate"]);
export const publishStatusSchema = z.enum(["draft", "published"]);
export const childModeSchema = z.enum(["age3", "age6", "together"]);
export const missionCharacterSchema = z.enum(["robo", "dino", "bunny"]);
export const missionActivityTypeSchema = z.enum(["tap-choice", "act-it-out", "repeat-after-me"]);

export const missionChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  imageUrl: z.string().optional(),
  isCorrect: z.boolean()
});

export const childMissionSchema = z.object({
  promptKo: z.string(),
  listenText: z.string(),
  activityType: missionActivityTypeSchema,
  choices: z.array(missionChoiceSchema),
  correctChoiceId: z.string().nullable()
});

export const missionImageSchema = z.object({
  url: z.string(),
  alt: z.string()
});

export const missionAudioSchema = z.object({
  wordUrl: z.string().nullable(),
  phraseUrl: z.string().nullable(),
  sentenceUrl: z.string().nullable()
});

export const dailyMissionSchema = z.object({
  id: z.string(),
  dateKey: z.string(),
  theme: z.string(),
  title: z.string(),
  character: missionCharacterSchema,
  targetWord: z.string(),
  phrase: z.string(),
  sentence: z.string(),
  dadGuideKo: z.string(),
  threeYearOld: childMissionSchema,
  sixYearOld: childMissionSchema,
  encouragement: z.string(),
  image: missionImageSchema,
  audio: missionAudioSchema,
  publishStatus: publishStatusSchema,
  isToday: z.boolean()
});

export type Difficulty = z.infer<typeof difficultySchema>;
export type PublishStatus = z.infer<typeof publishStatusSchema>;
export type ChildMode = z.infer<typeof childModeSchema>;
export type MissionCharacter = z.infer<typeof missionCharacterSchema>;
export type MissionActivityType = z.infer<typeof missionActivityTypeSchema>;
export type MissionChoice = z.infer<typeof missionChoiceSchema>;
export type ChildMission = z.infer<typeof childMissionSchema>;
export type DailyMission = z.infer<typeof dailyMissionSchema>;
```

- [ ] **Step 2: Update user completion schema**

In `app/shared/src/user.ts`, keep existing user profile fields, and update completion to this shape:

```ts
import { z } from "zod";
import { childModeSchema } from "./content";

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  difficulty: z.enum(["intro", "basic", "intermediate"]),
  selectedTracks: z.array(z.string()),
  isAdmin: z.boolean()
});

export const completionSchema = z.object({
  userId: z.string(),
  missionId: z.string(),
  childMode: childModeSchema,
  completedOn: z.string(),
  rewardId: z.string()
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type Completion = z.infer<typeof completionSchema>;
```

This intentionally leaves `selectedTracks` as `string[]` for auth compatibility in this phase.

- [ ] **Step 3: Update shared API contracts**

In `app/shared/src/contracts.ts`, replace content-specific imports and contracts with:

```ts
import { z } from "zod";
import { childModeSchema, dailyMissionSchema, difficultySchema } from "./content";
import { completionSchema, userProfileSchema } from "./user";

export const homeResponseSchema = z.object({
  viewer: userProfileSchema.nullable(),
  todayMission: dailyMissionSchema.nullable(),
  completions: z.array(completionSchema)
});

export const missionDetailResponseSchema = z.object({
  item: dailyMissionSchema
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const updatePreferencesSchema = z.object({
  difficulty: difficultySchema,
  selectedTracks: z.array(z.string()).min(1)
});

export const markCompletionSchema = z.object({
  missionId: z.string(),
  childMode: childModeSchema
});

export type HomeResponse = z.infer<typeof homeResponseSchema>;
export type MissionDetailResponse = z.infer<typeof missionDetailResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type UpdatePreferencesRequest = z.infer<typeof updatePreferencesSchema>;
export type MarkCompletionRequest = z.infer<typeof markCompletionSchema>;
```

- [ ] **Step 4: Run shared type check**

Run:

```bash
pnpm --filter @banghub/shared test
```

Expected: initially may fail in backend/frontend imports until later tasks, but shared package itself should typecheck once imports are internally consistent.

- [ ] **Step 5: Commit mission contracts**

Run:

```bash
git add app/shared/src/content.ts app/shared/src/contracts.ts app/shared/src/user.ts
git commit -m "feat: define family mission contracts"
```

---

### Task 2: Seed Daily Missions in Firestore

**Files:**
- Modify: `app/backend/src/db/collections.ts`
- Modify: `app/backend/src/db/seed-data.ts`
- Modify: `app/backend/src/db/seed.ts`
- Test: `app/backend/src/test/content.test.ts`

- [ ] **Step 1: Write failing backend test for today's mission**

In `app/backend/src/test/content.test.ts`, replace the home content test with:

```ts
import { describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { COLLECTIONS } from "../db/collections";
import { getFirestoreClient } from "../db/firestore";

describe("family mission content API", () => {
  it("returns today's toy forest mission", async () => {
    const db = getFirestoreClient();
    const today = new Date().toISOString().slice(0, 10);
    await db.collection(COLLECTIONS.dailyMissions).doc("mission-car").set({
      dateKey: today,
      theme: "Toys",
      title: "Find the red car",
      character: "robo",
      targetWord: "car",
      phrase: "red car",
      sentence: "I see a red car.",
      dadGuideKo: "빨간 자동차를 같이 찾고, red car를 천천히 두 번 말해보세요.",
      threeYearOld: {
        promptKo: "빨간 자동차를 눌러보세요.",
        listenText: "red car",
        activityType: "tap-choice",
        choices: [
          { id: "red-car", label: "red car", isCorrect: true },
          { id: "blue-block", label: "blue block", isCorrect: false }
        ],
        correctChoiceId: "red-car"
      },
      sixYearOld: {
        promptKo: "I see a red car 문장과 맞는 그림을 골라보세요.",
        listenText: "I see a red car.",
        activityType: "tap-choice",
        choices: [
          { id: "red-car", label: "I see a red car.", isCorrect: true },
          { id: "green-dino", label: "I see a green dinosaur.", isCorrect: false }
        ],
        correctChoiceId: "red-car"
      },
      encouragement: "Bunny says great job!",
      image: { url: "/assets/missions/red-car.svg", alt: "A red toy car in the forest" },
      audio: { wordUrl: null, phraseUrl: null, sentenceUrl: null },
      publishStatus: "published"
    });

    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/home" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.todayMission.title).toBe("Find the red car");
    expect(body.todayMission.isToday).toBe(true);
    expect(body.todayMission.threeYearOld.listenText).toBe("red car");
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
pnpm --filter @banghub/backend test -- src/test/content.test.ts
```

Expected: FAIL because `COLLECTIONS.dailyMissions` and `todayMission` service behavior do not exist yet.

- [ ] **Step 3: Add mission collection**

In `app/backend/src/db/collections.ts`, use:

```ts
export const COLLECTIONS = {
  dailyMissions: "dailyMissions",
  users: "users"
} as const;
```

- [ ] **Step 4: Replace seed data with seven missions**

In `app/backend/src/db/seed-data.ts`, export `seedDailyMissions` with seven records. Use `/assets/missions/*.svg` paths for images and null audio URLs. Include at minimum these IDs:

```ts
import type { DailyMission } from "@banghub/shared";

export const seedDailyMissions: Omit<DailyMission, "isToday">[] = [
  {
    id: "mission-red-car",
    dateKey: "seed-day-1",
    theme: "Toys",
    title: "Find the red car",
    character: "robo",
    targetWord: "car",
    phrase: "red car",
    sentence: "I see a red car.",
    dadGuideKo: "빨간 자동차를 같이 찾고, red car를 천천히 두 번 말해보세요.",
    threeYearOld: {
      promptKo: "빨간 자동차를 눌러보세요.",
      listenText: "red car",
      activityType: "tap-choice",
      choices: [
        { id: "red-car", label: "red car", imageUrl: "/assets/missions/red-car.svg", isCorrect: true },
        { id: "blue-block", label: "blue block", imageUrl: "/assets/missions/blue-block.svg", isCorrect: false }
      ],
      correctChoiceId: "red-car"
    },
    sixYearOld: {
      promptKo: "I see a red car 문장과 맞는 그림을 골라보세요.",
      listenText: "I see a red car.",
      activityType: "tap-choice",
      choices: [
        { id: "red-car", label: "I see a red car.", imageUrl: "/assets/missions/red-car.svg", isCorrect: true },
        { id: "green-dino", label: "I see a green dinosaur.", imageUrl: "/assets/missions/green-dino.svg", isCorrect: false }
      ],
      correctChoiceId: "red-car"
    },
    encouragement: "Bunny says great job!",
    image: { url: "/assets/missions/red-car.svg", alt: "A red toy car in the forest" },
    audio: { wordUrl: null, phraseUrl: null, sentenceUrl: null },
    publishStatus: "published"
  }
];
```

Add six more records with IDs:
- `mission-sleeping-bear`
- `mission-green-dino`
- `mission-yellow-star`
- `mission-jump`
- `mission-apple`
- `mission-blue-block`

Each record must have both child paths and valid choices.

- [ ] **Step 5: Update seed script**

In `app/backend/src/db/seed.ts`, replace conversation/news seeding with:

```ts
import { getConfig } from "../config";
import { hashPassword } from "../modules/auth/auth.service";
import { COLLECTIONS } from "./collections";
import { getFirestoreClient } from "./firestore";
import { seedDailyMissions } from "./seed-data";

export async function seedFirestore() {
  const config = getConfig();
  const db = getFirestoreClient();
  const now = new Date().toISOString();
  const today = new Date().toISOString().slice(0, 10);
  const batch = db.batch();

  seedDailyMissions.forEach((mission, index) => {
    batch.set(db.collection(COLLECTIONS.dailyMissions).doc(mission.id), {
      ...mission,
      dateKey: index === 0 ? today : mission.dateKey,
      createdAt: now,
      updatedAt: now
    });
  });

  batch.set(db.collection(COLLECTIONS.users).doc("admin-user"), {
    email: config.adminEmail,
    passwordHash: hashPassword(config.adminPassword),
    difficulty: "basic",
    selectedTracks: ["family-missions"],
    isAdmin: true,
    createdAt: now,
    updatedAt: now
  });

  await batch.commit();
}

await seedFirestore();
```

- [ ] **Step 6: Run backend content test**

Run:

```bash
pnpm --filter @banghub/backend test -- src/test/content.test.ts
```

Expected: still FAIL until service/routes are implemented in Task 3.

---

### Task 3: Implement Mission API

**Files:**
- Modify: `app/backend/src/modules/content/content.service.ts`
- Modify: `app/backend/src/modules/content/content.routes.ts`
- Modify: `app/backend/src/test/content.test.ts`

- [ ] **Step 1: Implement mission service**

Replace `app/backend/src/modules/content/content.service.ts` with:

```ts
import { dailyMissionSchema } from "@banghub/shared";
import { COLLECTIONS } from "../../db/collections";
import { getFirestoreClient } from "../../db/firestore";

function parseMission(doc: FirebaseFirestore.DocumentSnapshot, isToday: boolean) {
  return dailyMissionSchema.parse({
    id: doc.id,
    isToday,
    ...doc.data()
  });
}

export async function getTodayMission() {
  const db = getFirestoreClient();
  const today = new Date().toISOString().slice(0, 10);
  const snapshot = await db
    .collection(COLLECTIONS.dailyMissions)
    .where("dateKey", "==", today)
    .where("publishStatus", "==", "published")
    .limit(1)
    .get();

  const doc = snapshot.docs[0];
  return doc ? parseMission(doc, true) : null;
}

export async function getMissionById(id: string) {
  const db = getFirestoreClient();
  const today = new Date().toISOString().slice(0, 10);
  const doc = await db.collection(COLLECTIONS.dailyMissions).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data() as { dateKey?: string; publishStatus?: string };
  if (data.publishStatus !== "published") {
    return null;
  }

  return parseMission(doc, data.dateKey === today);
}
```

- [ ] **Step 2: Implement mission routes**

Replace `app/backend/src/modules/content/content.routes.ts` with:

```ts
import type { FastifyInstance } from "fastify";
import { homeResponseSchema, missionDetailResponseSchema } from "@banghub/shared";
import { getViewerById } from "../auth/auth.service";
import { listCompletions } from "../progress/progress.service";
import { getMissionById, getTodayMission } from "./content.service";

export async function registerContentRoutes(app: FastifyInstance) {
  app.get("/api/home", async (request) => {
    const viewer = request.sessionUserId ? await getViewerById(request.sessionUserId) : null;
    const payload = {
      viewer,
      todayMission: await getTodayMission(),
      completions: request.sessionUserId ? await listCompletions(request.sessionUserId) : []
    };

    return homeResponseSchema.parse(payload);
  });

  app.get("/api/missions/:id", async (request, reply) => {
    const params = request.params as { id: string };
    const item = await getMissionById(params.id);

    if (!item) {
      reply.code(404);
      return { message: "Not found" };
    }

    return missionDetailResponseSchema.parse({ item });
  });
}
```

- [ ] **Step 3: Add mission detail test**

Append to `app/backend/src/test/content.test.ts`:

```ts
  it("returns mission detail by id", async () => {
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.dailyMissions).doc("mission-detail").set({
      dateKey: "2099-01-01",
      theme: "Actions",
      title: "Let's jump",
      character: "dino",
      targetWord: "jump",
      phrase: "jump",
      sentence: "Let's jump.",
      dadGuideKo: "아이와 같이 점프하면서 jump를 말해보세요.",
      threeYearOld: {
        promptKo: "같이 점프해보세요.",
        listenText: "jump",
        activityType: "act-it-out",
        choices: [],
        correctChoiceId: null
      },
      sixYearOld: {
        promptKo: "Let's jump를 따라 말하고 점프해보세요.",
        listenText: "Let's jump.",
        activityType: "repeat-after-me",
        choices: [],
        correctChoiceId: null
      },
      encouragement: "Dino jumps with you!",
      image: { url: "/assets/missions/jump.svg", alt: "A toy dinosaur jumping" },
      audio: { wordUrl: null, phraseUrl: null, sentenceUrl: null },
      publishStatus: "published"
    });

    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/missions/mission-detail" });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.item.id).toBe("mission-detail");
    expect(body.item.sixYearOld.listenText).toBe("Let's jump.");
  });
```

- [ ] **Step 4: Run backend content tests**

Run:

```bash
pnpm --filter @banghub/backend test -- src/test/content.test.ts
```

Expected: PASS for mission home and detail tests.

- [ ] **Step 5: Commit mission API**

Run:

```bash
git add app/backend/src/db app/backend/src/modules/content app/backend/src/test/content.test.ts
git commit -m "feat: serve daily family missions"
```

---

### Task 4: Update Progress Completion by Child Mode

**Files:**
- Modify: `app/backend/src/modules/progress/progress.service.ts`
- Modify: `app/backend/src/modules/progress/progress.routes.ts`
- Modify: `app/backend/src/test/progress.test.ts`

- [ ] **Step 1: Write failing completion test**

Replace the main test in `app/backend/src/test/progress.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { COLLECTIONS } from "../db/collections";
import { getFirestoreClient } from "../db/firestore";
import { hashPassword } from "../modules/auth/auth.service";

describe("mission completion API", () => {
  it("saves completion for a child mode", async () => {
    const db = getFirestoreClient();
    await db.collection(COLLECTIONS.users).doc("user-1").set({
      email: "parent@example.com",
      passwordHash: hashPassword("password123"),
      difficulty: "basic",
      selectedTracks: ["family-missions"],
      isAdmin: false
    });

    const app = buildApp();
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "parent@example.com", password: "password123" }
    });
    const cookie = login.headers["set-cookie"];

    const response = await app.inject({
      method: "POST",
      url: "/api/progress/completions",
      headers: { cookie },
      payload: { missionId: "mission-red-car", childMode: "age3" }
    });

    const completion = await db
      .collection(COLLECTIONS.users)
      .doc("user-1")
      .collection("completions")
      .doc("mission-red-car-age3")
      .get();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
    expect(completion.data()).toMatchObject({
      missionId: "mission-red-car",
      childMode: "age3",
      rewardId: "sticker-age3"
    });
  });
});
```

- [ ] **Step 2: Run failing progress test**

Run:

```bash
pnpm --filter @banghub/backend test -- src/test/progress.test.ts
```

Expected: FAIL because current code expects `contentId`.

- [ ] **Step 3: Update progress service**

Replace `app/backend/src/modules/progress/progress.service.ts` with:

```ts
import type { ChildMode } from "@banghub/shared";
import { COLLECTIONS } from "../../db/collections";
import { getFirestoreClient } from "../../db/firestore";

function getRewardId(childMode: ChildMode) {
  return `sticker-${childMode}`;
}

export async function markCompletion(userId: string, missionId: string, childMode: ChildMode) {
  const db = getFirestoreClient();
  const completedOn = new Date().toISOString().slice(0, 10);
  const rewardId = getRewardId(childMode);

  await db
    .collection(COLLECTIONS.users)
    .doc(userId)
    .collection("completions")
    .doc(`${missionId}-${childMode}`)
    .set({
      missionId,
      childMode,
      completedOn,
      rewardId,
      createdAt: new Date().toISOString()
    });
}

export async function listCompletions(userId: string) {
  const db = getFirestoreClient();
  const snapshot = await db.collection(COLLECTIONS.users).doc(userId).collection("completions").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as {
      missionId: string;
      childMode: ChildMode;
      completedOn: string;
      rewardId: string;
    };

    return {
      userId,
      missionId: data.missionId,
      childMode: data.childMode,
      completedOn: data.completedOn,
      rewardId: data.rewardId
    };
  });
}
```

- [ ] **Step 4: Update progress route**

In `app/backend/src/modules/progress/progress.routes.ts`, change the completion call to:

```ts
await markCompletion(userId, payload.missionId, payload.childMode);
```

- [ ] **Step 5: Run progress test**

Run:

```bash
pnpm --filter @banghub/backend test -- src/test/progress.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit mission completions**

Run:

```bash
git add app/backend/src/modules/progress app/backend/src/test/progress.test.ts app/shared/src/contracts.ts app/shared/src/user.ts
git commit -m "feat: track mission completions by child mode"
```

---

### Task 5: Build Mission Frontend Flow

**Files:**
- Modify: `app/frontend/src/lib/api.ts`
- Modify: `app/frontend/src/lib/tts.ts`
- Modify: `app/frontend/src/features/home/HomePage.tsx`
- Create: `app/frontend/src/features/mission/MissionPage.tsx`
- Create: `app/frontend/src/features/mission/MissionPage.test.tsx`
- Modify: `app/frontend/src/app/router.tsx`
- Modify: `app/frontend/src/app/AppShell.tsx`
- Modify: existing frontend tests under `app/frontend/src/features/*`

- [ ] **Step 1: Write failing mission page test**

Create `app/frontend/src/features/mission/MissionPage.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { DailyMission } from "@banghub/shared";
import { MissionPage } from "./MissionPage";

const mission: DailyMission = {
  id: "mission-red-car",
  dateKey: "2026-04-23",
  theme: "Toys",
  title: "Find the red car",
  character: "robo",
  targetWord: "car",
  phrase: "red car",
  sentence: "I see a red car.",
  dadGuideKo: "빨간 자동차를 같이 찾고, red car를 천천히 두 번 말해보세요.",
  threeYearOld: {
    promptKo: "빨간 자동차를 눌러보세요.",
    listenText: "red car",
    activityType: "tap-choice",
    choices: [
      { id: "red-car", label: "red car", isCorrect: true },
      { id: "blue-block", label: "blue block", isCorrect: false }
    ],
    correctChoiceId: "red-car"
  },
  sixYearOld: {
    promptKo: "I see a red car 문장과 맞는 그림을 골라보세요.",
    listenText: "I see a red car.",
    activityType: "tap-choice",
    choices: [
      { id: "red-car", label: "I see a red car.", isCorrect: true },
      { id: "green-dino", label: "I see a green dinosaur.", isCorrect: false }
    ],
    correctChoiceId: "red-car"
  },
  encouragement: "Bunny says great job!",
  image: { url: "/assets/missions/red-car.svg", alt: "A red toy car in the forest" },
  audio: { wordUrl: null, phraseUrl: null, sentenceUrl: null },
  publishStatus: "published",
  isToday: true
};

describe("MissionPage", () => {
  it("renders dad guide and completes a child mission", async () => {
    const onComplete = vi.fn();
    render(<MissionPage mission={mission} childMode="age6" viewer={null} onComplete={onComplete} />);

    expect(screen.getByRole("heading", { name: "Find the red car" })).toBeInTheDocument();
    expect(screen.getByText("빨간 자동차를 같이 찾고, red car를 천천히 두 번 말해보세요.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "I see a red car." }));
    await userEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Bunny says great job!")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run failing frontend test**

Run:

```bash
pnpm --filter @banghub/frontend test -- src/features/mission/MissionPage.test.tsx
```

Expected: FAIL because `MissionPage` does not exist.

- [ ] **Step 3: Update frontend API**

Replace content helpers in `app/frontend/src/lib/api.ts` with mission helpers:

```ts
import type { ChildMode, HomeResponse, MarkCompletionRequest, MissionDetailResponse } from "@banghub/shared";

const API_BASE = "http://localhost:4000";

export async function getHome(): Promise<HomeResponse> {
  return (await fetch(`${API_BASE}/api/home`, { credentials: "include" })).json();
}

export async function getMission(id: string): Promise<MissionDetailResponse["item"]> {
  const response = await fetch(`${API_BASE}/api/missions/${id}`, { credentials: "include" });
  if (!response.ok) {
    throw new Error(response.status === 404 ? "Mission not found" : "Failed to load mission");
  }
  return ((await response.json()) as MissionDetailResponse).item;
}

export async function login(email: string, password: string) {
  return (
    await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
  ).json();
}

export async function updatePreferences(payload: { difficulty: string; selectedTracks: string[] }) {
  return (
    await fetch(`${API_BASE}/api/auth/preferences`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  ).json();
}

export async function markCompletion(payload: MarkCompletionRequest) {
  return (
    await fetch(`${API_BASE}/api/progress/completions`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  ).json();
}

export function getChildModeLabel(childMode: ChildMode) {
  if (childMode === "age3") return "3세";
  if (childMode === "age6") return "6세";
  return "같이";
}
```

- [ ] **Step 4: Update audio helper**

Replace `app/frontend/src/lib/tts.ts` with:

```ts
export function speak(text: string) {
  if (!("speechSynthesis" in window)) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find((voice) => voice.lang.startsWith("en-"));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  utterance.lang = englishVoice?.lang ?? "en-US";
  utterance.rate = 0.82;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function playMissionAudio(audioUrl: string | null | undefined, fallbackText: string) {
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    void audio.play();
    return true;
  }

  return speak(fallbackText);
}
```

- [ ] **Step 5: Implement MissionPage**

Create `app/frontend/src/features/mission/MissionPage.tsx`:

```tsx
import { useState } from "react";
import type { ChildMode, DailyMission, UserProfile } from "@banghub/shared";
import { playMissionAudio } from "../../lib/tts";

type MissionPageProps = {
  mission: DailyMission;
  childMode: ChildMode;
  viewer: UserProfile | null;
  onComplete: () => Promise<void> | void;
};

function getChildMission(mission: DailyMission, childMode: ChildMode) {
  return childMode === "age3" ? mission.threeYearOld : mission.sixYearOld;
}

function getListenText(mission: DailyMission, childMode: ChildMode) {
  if (childMode === "age3") return mission.phrase || mission.targetWord;
  if (childMode === "age6") return mission.sentence;
  return `${mission.phrase}. ${mission.sentence}`;
}

export function MissionPage({ mission, childMode, viewer, onComplete }: MissionPageProps) {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const childMission = getChildMission(mission, childMode);
  const listenText = getListenText(mission, childMode);
  const audioUrl = childMode === "age6" ? mission.audio.sentenceUrl : mission.audio.phraseUrl;

  async function handleComplete() {
    if (viewer) {
      await onComplete();
    }
    setCompleted(true);
  }

  return (
    <main className="mission-page">
      <section className="mission-hero">
        <img src={mission.image.url} alt={mission.image.alt} />
        <div>
          <p className="mission-character">{mission.character}</p>
          <h1>{mission.title}</h1>
          <p>{mission.theme}</p>
        </div>
      </section>

      <section className="mission-panel">
        <h2>Listen</h2>
        <p className="english-line">{listenText}</p>
        <button type="button" onClick={() => playMissionAudio(audioUrl, listenText)}>
          Listen
        </button>
      </section>

      <section className="mission-panel dad-guide">
        <h2>아빠 가이드</h2>
        <p>{mission.dadGuideKo}</p>
      </section>

      <section className="mission-panel">
        <h2>아이 미션</h2>
        <p>{childMission.promptKo}</p>
        {childMission.choices.length > 0 ? (
          <div className="choice-grid">
            {childMission.choices.map((choice) => (
              <button
                className={selectedChoiceId === choice.id ? "choice selected" : "choice"}
                key={choice.id}
                type="button"
                onClick={() => setSelectedChoiceId(choice.id)}
              >
                {choice.imageUrl ? <img src={choice.imageUrl} alt="" /> : null}
                <span>{choice.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="action-card">{childMission.listenText}</p>
        )}
      </section>

      <section className="mission-panel reward-panel">
        <button type="button" onClick={handleComplete}>
          완료
        </button>
        {completed ? <p>{mission.encouragement}</p> : null}
        {!viewer ? <p>로그인하면 완료 기록을 저장할 수 있어요.</p> : null}
      </section>
    </main>
  );
}
```

- [ ] **Step 6: Run mission page test**

Run:

```bash
pnpm --filter @banghub/frontend test -- src/features/mission/MissionPage.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Update HomePage and router**

Change `HomePage` to render `data.todayMission`, link buttons to:

```tsx
`/mission/${data.todayMission.id}/age3`
`/mission/${data.todayMission.id}/age6`
`/mission/${data.todayMission.id}/together`
```

Change `app/frontend/src/app/router.tsx` to remove conversation/news routes and add:

```tsx
{
  path: "mission/:id/:childMode",
  loader: async ({ params }) => {
    const home = await getHome();
    const mission = await getMission(params.id ?? "");
    return {
      mission,
      viewer: home.viewer,
      childMode: params.childMode
    };
  },
  element: <MissionRoute />
}
```

`MissionRoute` must validate that `childMode` is `age3`, `age6`, or `together`; default to `together` only if the param is invalid.

- [ ] **Step 8: Update frontend tests**

Update:
- `app/frontend/src/features/home/HomePage.test.tsx`
- `app/frontend/src/app/AppShell.test.tsx`
- `app/frontend/src/lib/api.test.ts`

Expected home assertions:

```tsx
expect(screen.getByRole("link", { name: "3세랑 하기" })).toHaveAttribute("href", "/mission/mission-red-car/age3");
expect(screen.getByRole("link", { name: "6세랑 하기" })).toHaveAttribute("href", "/mission/mission-red-car/age6");
expect(screen.getByRole("link", { name: "같이 하기" })).toHaveAttribute("href", "/mission/mission-red-car/together");
```

- [ ] **Step 9: Run frontend tests**

Run:

```bash
pnpm --filter @banghub/frontend test
```

Expected: PASS.

- [ ] **Step 10: Commit frontend mission flow**

Run:

```bash
git add app/frontend/src
git commit -m "feat: add toy forest mission flow"
```

---

### Task 6: Add MVP Visual Assets and Styling

**Files:**
- Create: `app/frontend/public/assets/missions/red-car.svg`
- Create: `app/frontend/public/assets/missions/blue-block.svg`
- Create: `app/frontend/public/assets/missions/green-dino.svg`
- Create: `app/frontend/public/assets/missions/sleeping-bear.svg`
- Create: `app/frontend/public/assets/missions/yellow-star.svg`
- Create: `app/frontend/public/assets/missions/apple.svg`
- Create: `app/frontend/public/assets/missions/jump.svg`
- Modify: `app/frontend/src/styles/global.css`

- [ ] **Step 1: Create simple original SVG assets**

Create flat, original, child-friendly SVGs matching each filename. Use simple shapes only. Do not copy copyrighted character designs.

For `red-car.svg`, use:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" role="img" aria-label="red toy car">
  <rect width="320" height="220" fill="#cdeffc"/>
  <circle cx="84" cy="162" r="24" fill="#263238"/>
  <circle cx="232" cy="162" r="24" fill="#263238"/>
  <path d="M58 132h204c12 0 22 10 22 22v12H36v-12c0-12 10-22 22-22z" fill="#e53935"/>
  <path d="M104 84h96c14 0 32 22 40 48H72c8-26 18-48 32-48z" fill="#ef5350"/>
  <path d="M124 98h34v28h-54c5-15 11-28 20-28zM170 98h26c8 0 20 13 27 28h-53z" fill="#ffffff"/>
  <circle cx="84" cy="162" r="10" fill="#eceff1"/>
  <circle cx="232" cy="162" r="10" fill="#eceff1"/>
</svg>
```

Use the same visual style for the remaining assets.

- [ ] **Step 2: Update global mission styling**

Add to `app/frontend/src/styles/global.css`:

```css
.mission-page {
  width: min(100%, 960px);
  margin: 0 auto;
  padding: 24px;
}

.mission-hero {
  display: grid;
  grid-template-columns: minmax(180px, 340px) 1fr;
  gap: 24px;
  align-items: center;
  padding: 20px 0;
}

.mission-hero img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: contain;
}

.mission-character {
  text-transform: uppercase;
  color: #2e7d32;
  font-weight: 700;
}

.mission-panel {
  padding: 18px 0;
  border-top: 1px solid #d7e7dc;
}

.english-line {
  font-size: 2rem;
  font-weight: 700;
  color: #1565c0;
}

.dad-guide {
  color: #2d3748;
}

.choice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.choice {
  min-height: 132px;
  border: 2px solid #d7e7dc;
  background: #ffffff;
  color: #1f2933;
}

.choice.selected {
  border-color: #f9a825;
  background: #fff8d8;
}

.choice img {
  width: 100%;
  height: 92px;
  object-fit: contain;
}

.reward-panel button {
  min-width: 160px;
}

@media (max-width: 700px) {
  .mission-page {
    padding: 16px;
  }

  .mission-hero {
    grid-template-columns: 1fr;
  }

  .english-line {
    font-size: 1.5rem;
  }
}
```

- [ ] **Step 3: Run frontend build**

Run:

```bash
pnpm --filter @banghub/frontend build
```

Expected: PASS and asset references resolve.

- [ ] **Step 4: Commit assets and styling**

Run:

```bash
git add app/frontend/public/assets app/frontend/src/styles/global.css
git commit -m "feat: add toy forest mission visuals"
```

---

### Task 7: Update Admin Publishing for Missions

**Files:**
- Modify: `app/backend/src/modules/admin/admin.service.ts`
- Modify: `app/backend/src/modules/admin/admin.routes.ts`
- Modify: `app/backend/src/test/content.test.ts`
- Modify: `app/frontend/src/features/admin/AdminPage.tsx`

- [ ] **Step 1: Write failing admin mission publish test**

In `app/backend/src/test/content.test.ts`, replace the existing admin publish test with one that posts a mission payload to `/api/admin/missions`.

Expected payload shape:

```ts
{
  id: "admin-mission",
  dateKey: new Date().toISOString().slice(0, 10),
  theme: "Toys",
  title: "Admin toy mission",
  character: "bunny",
  targetWord: "star",
  phrase: "yellow star",
  sentence: "I see a yellow star.",
  dadGuideKo: "노란 별을 같이 찾아보세요.",
  threeYearOld: {
    promptKo: "노란 별을 눌러보세요.",
    listenText: "yellow star",
    activityType: "tap-choice",
    choices: [{ id: "yellow-star", label: "yellow star", isCorrect: true }],
    correctChoiceId: "yellow-star"
  },
  sixYearOld: {
    promptKo: "I see a yellow star를 따라 말해보세요.",
    listenText: "I see a yellow star.",
    activityType: "repeat-after-me",
    choices: [],
    correctChoiceId: null
  },
  encouragement: "Bunny gives you a star!",
  image: { url: "/assets/missions/yellow-star.svg", alt: "A yellow star" },
  audio: { wordUrl: null, phraseUrl: null, sentenceUrl: null },
  publishStatus: "published",
  isToday: true
}
```

- [ ] **Step 2: Run failing admin test**

Run:

```bash
pnpm --filter @banghub/backend test -- src/test/content.test.ts
```

Expected: FAIL because `/api/admin/missions` does not exist.

- [ ] **Step 3: Implement admin mission save**

In `app/backend/src/modules/admin/admin.service.ts`, save `dailyMissionSchema.omit({ isToday: true })` to `COLLECTIONS.dailyMissions`.

In `admin.routes.ts`, expose:

```ts
app.post("/api/admin/missions", async (request, reply) => {
  const userId = requireSession(request, reply);
  if (!userId) return { message: "Unauthorized" };

  const db = getFirestoreClient();
  const user = await db.collection(COLLECTIONS.users).doc(userId).get();
  if (!user.data()?.isAdmin) {
    reply.code(403);
    return { message: "Forbidden" };
  }

  const saved = await saveMission(request.body);
  return { saved };
});
```

- [ ] **Step 4: Simplify AdminPage for mission JSON publishing**

For MVP, make `AdminPage` a simple mission JSON textarea plus publish button. It should POST to `/api/admin/missions` and show `Saved.` or `Save failed.`.

- [ ] **Step 5: Run backend and frontend tests**

Run:

```bash
pnpm --filter @banghub/backend test -- src/test/content.test.ts
pnpm --filter @banghub/frontend test
```

Expected: PASS.

- [ ] **Step 6: Commit admin mission publishing**

Run:

```bash
git add app/backend/src/modules/admin app/backend/src/test/content.test.ts app/frontend/src/features/admin/AdminPage.tsx
git commit -m "feat: publish daily missions from admin"
```

---

### Task 8: Final Verification and Local Smoke Test

**Files:**
- No required code changes unless verification reveals a defect.

- [ ] **Step 1: Run full automated verification**

Run:

```bash
pnpm test
pnpm build
pnpm lint
```

Expected:
- `pnpm test`: Firestore emulator starts and all package tests pass.
- `pnpm build`: shared/backend/frontend build pass.
- `pnpm lint`: shared/backend/frontend type checks pass.

- [ ] **Step 2: Run local seeded app**

Run in separate terminals:

```bash
pnpm emulator:start
pnpm --filter @banghub/backend seed
pnpm --filter @banghub/backend dev
pnpm --filter @banghub/frontend dev
```

Expected:
- Firestore emulator listens on `127.0.0.1:9080`.
- Backend listens on `http://127.0.0.1:4000`.
- Frontend listens on `http://localhost:5173/`.

- [ ] **Step 3: Smoke test home API**

Run:

```bash
node -e "fetch('http://127.0.0.1:4000/api/home',{credentials:'include'}).then(async r=>{console.log(r.status); console.log(await r.text())}).catch(e=>{console.error(e); process.exit(1)})"
```

Expected: status `200`, response includes `todayMission`, `Find the red car`, and `threeYearOld`.

- [ ] **Step 4: Smoke test frontend**

Open:

```text
http://localhost:5173/
```

Expected:
- Home shows today's toy forest mission.
- `3세랑 하기`, `6세랑 하기`, and `같이 하기` buttons navigate to mission play.
- Listen button plays audio through browser TTS fallback when no audio URL exists.
- Completion shows encouragement.

- [ ] **Step 5: Commit final polish**

If verification required any small fixes, commit them:

```bash
git add app docs
git commit -m "fix: polish family mission mvp"
```

Skip this commit if there were no final fixes.

---

## Self-Review

Spec coverage:
- Father-led Korean guidance: Task 1 data model, Task 5 UI.
- 3-year-old and 6-year-old paths: Task 1 schemas, Task 2 seed data, Task 5 mission page.
- Daily mission replacement for conversation/news: Tasks 1, 3, and 5.
- Browser TTS fallback and future audio URL path: Task 1 audio schema, Task 5 audio helper.
- Original toy forest visuals: Task 6.
- Firestore-backed mission data and completions: Tasks 2, 3, and 4.
- Admin publishing: Task 7.
- Full verification: Task 8.

Known implementation constraint:
- The plan intentionally keeps auth preferences mostly intact to avoid expanding scope into account redesign.
- Google Cloud TTS and Vertex AI generation are designed into the data model but are not implemented in this MVP plan.

