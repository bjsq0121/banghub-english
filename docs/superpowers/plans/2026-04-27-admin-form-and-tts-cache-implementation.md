# Admin Form and Lazy TTS Cache Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the admin JSON editor with a fast single-operator mission form and add a backend-driven mission audio cache that generates TTS on first play and reuses it later.

**Architecture:** Keep the current mission schema and publishing route, but introduce a frontend form that maps to the existing mission document shape. Add a backend `/api/tts` endpoint that derives spoken text from a mission, checks Firestore cache metadata, stores MP3 files in Cloud Storage, and falls back cleanly when generation fails.

**Tech Stack:** TypeScript, React, Fastify, Firebase Admin Firestore, Firebase Admin Storage, Google Cloud Text-to-Speech, Vite, Vitest, Testing Library, pnpm.

---

## File Structure

- Modify `app/frontend/src/features/admin/AdminPage.tsx`
  - Replace textarea JSON publishing with a structured mission form.
- Create `app/frontend/src/features/admin/AdminPage.test.tsx`
  - Cover form fill, payload shaping, and publish action.
- Modify `app/frontend/src/lib/tts.ts`
  - Call `/api/tts` by mission and mode before falling back to browser TTS.
- Modify `app/frontend/src/features/mission/MissionPage.tsx`
  - Pass mission context into the TTS helper.
- Modify `app/backend/src/db/collections.ts`
  - Add `ttsCache`.
- Modify `app/backend/src/db/firestore.ts`
  - Add or share Firebase app access for Storage usage.
- Create `app/backend/src/db/storage.ts`
  - Provide Cloud Storage bucket access helpers.
- Modify `app/backend/src/modules/admin/admin.service.ts`
  - Accept a simpler form-shaped payload and map it into the current mission schema.
- Modify `app/backend/src/modules/admin/admin.routes.ts`
  - Keep auth, accept form payload, and return save result.
- Create `app/backend/src/modules/tts/tts.routes.ts`
  - Expose `/api/tts`.
- Create `app/backend/src/modules/tts/tts.service.ts`
  - Cache lookup, mission text selection, generation, storage, and response helpers.
- Modify `app/backend/src/app.ts`
  - Register the new TTS route module.
- Create or modify backend tests in `app/backend/src/test/*.test.ts`
  - Cover admin form payload handling and TTS cache miss/hit behavior.

## Task 1: Admin Form Payload Path

**Files:**
- Modify: `app/frontend/src/features/admin/AdminPage.tsx`
- Create: `app/frontend/src/features/admin/AdminPage.test.tsx`
- Modify: `app/backend/src/modules/admin/admin.service.ts`
- Modify: `app/backend/src/modules/admin/admin.routes.ts`

- [ ] **Step 1: Write the failing admin form test**

Create `app/frontend/src/features/admin/AdminPage.test.tsx` with one test that:
- renders labeled form inputs
- fills title, target word, phrase, sentence, dad guide, choices
- submits
- asserts `fetch` receives a mission payload compatible with the current backend route

- [ ] **Step 2: Run the focused admin test and verify it fails**

Run:

```bash
pnpm --filter @banghub/frontend test -- src/features/admin/AdminPage.test.tsx
```

Expected: FAIL because the current page is a textarea-only JSON publisher.

- [ ] **Step 3: Implement the admin form UI**

In `app/frontend/src/features/admin/AdminPage.tsx`:
- replace the textarea with flat field groups
- default today date, published status, `isToday`
- derive mission id from date and target word if empty
- build the existing mission document shape on submit
- preserve the current `/api/admin/missions` POST target

- [ ] **Step 4: Update backend admin save path minimally if needed**

In `app/backend/src/modules/admin/admin.service.ts`:
- keep `dailyMissionSchema` validation
- normalize generated id/date defaults only if the frontend leaves them empty
- preserve current publish behavior

- [ ] **Step 5: Re-run the focused admin test**

Run:

```bash
pnpm --filter @banghub/frontend test -- src/features/admin/AdminPage.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the admin form task**

Run:

```bash
git add app/frontend/src/features/admin/AdminPage.tsx app/frontend/src/features/admin/AdminPage.test.tsx app/backend/src/modules/admin/admin.service.ts app/backend/src/modules/admin/admin.routes.ts
git commit -m "feat: add admin mission publishing form"
```

Expected: commit succeeds.

## Task 2: TTS Cache Backend

**Files:**
- Modify: `app/backend/src/db/collections.ts`
- Modify: `app/backend/src/db/firestore.ts`
- Create: `app/backend/src/db/storage.ts`
- Create: `app/backend/src/modules/tts/tts.routes.ts`
- Create: `app/backend/src/modules/tts/tts.service.ts`
- Modify: `app/backend/src/app.ts`
- Test: `app/backend/src/test/tts.test.ts`

- [ ] **Step 1: Write the failing backend TTS tests**

Create `app/backend/src/test/tts.test.ts` to cover:
- cache miss generates and stores audio
- cache hit reuses stored audio metadata
- invalid mission id returns 404 or 400 as appropriate

- [ ] **Step 2: Run the focused backend TTS tests and verify they fail**

Run:

```bash
pnpm --filter @banghub/backend exec vitest run --maxWorkers=1 --testTimeout=10000 src/test/tts.test.ts
```

Expected: FAIL because the route and service do not exist.

- [ ] **Step 3: Add cache collection and storage helper**

Implement:
- `COLLECTIONS.ttsCache`
- a Firebase Storage bucket helper in `app/backend/src/db/storage.ts`
- shared Firebase app access if needed from `app/backend/src/db/firestore.ts`

- [ ] **Step 4: Implement `/api/tts` route and service**

Behavior:
- accept `missionId` and `childMode`
- load the mission
- choose representative text:
  - `age6`: sentence, phrase, target word
  - otherwise: phrase, target word, sentence
- check `ttsCache`
- on hit: update `lastUsedAt`, return stored file
- on miss: generate MP3 with Google Cloud TTS, write `tts/missions/<missionId>/primary.mp3`, create cache record, return audio

- [ ] **Step 5: Register the route and re-run focused TTS tests**

Run:

```bash
pnpm --filter @banghub/backend exec vitest run --maxWorkers=1 --testTimeout=10000 src/test/tts.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the backend TTS task**

Run:

```bash
git add app/backend/src/db/collections.ts app/backend/src/db/firestore.ts app/backend/src/db/storage.ts app/backend/src/modules/tts/tts.routes.ts app/backend/src/modules/tts/tts.service.ts app/backend/src/app.ts app/backend/src/test/tts.test.ts
git commit -m "feat: add cached mission audio generation"
```

Expected: commit succeeds.

## Task 3: Frontend Listen Integration

**Files:**
- Modify: `app/frontend/src/lib/tts.ts`
- Modify: `app/frontend/src/lib/tts.test.ts`
- Modify: `app/frontend/src/features/mission/MissionPage.tsx`
- Modify if needed: `app/frontend/src/features/mission/MissionPage.test.tsx`

- [ ] **Step 1: Write the failing frontend TTS integration test**

Update `app/frontend/src/lib/tts.test.ts` so one test expects:
- mission listen requests `/api/tts?missionId=...&childMode=...`
- returned blob audio is played
- browser speech fallback is used when fetch fails

- [ ] **Step 2: Run the focused frontend TTS test and verify it fails**

Run:

```bash
pnpm --filter @banghub/frontend test -- src/lib/tts.test.ts
```

Expected: FAIL because the helper only accepts static `audioUrl` values today.

- [ ] **Step 3: Implement the frontend mission-audio fetch path**

In `app/frontend/src/lib/tts.ts`:
- add mission-aware audio fetch helper using `missionId` and `childMode`
- play returned blob audio on success
- keep browser speech fallback on fetch or playback failure

In `app/frontend/src/features/mission/MissionPage.tsx`:
- pass mission id and mode into the helper instead of relying only on `audio.*Url`

- [ ] **Step 4: Re-run the focused frontend TTS test**

Run:

```bash
pnpm --filter @banghub/frontend test -- src/lib/tts.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the frontend TTS task**

Run:

```bash
git add app/frontend/src/lib/tts.ts app/frontend/src/lib/tts.test.ts app/frontend/src/features/mission/MissionPage.tsx app/frontend/src/features/mission/MissionPage.test.tsx
git commit -m "feat: fetch cached mission audio before browser fallback"
```

Expected: commit succeeds.

## Task 4: Full Verification

**Files:**
- Modify only if verification exposes regressions

- [ ] **Step 1: Run full tests**

Run:

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 2: Run full build**

Run:

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 3: Run full lint/typecheck**

Run:

```bash
pnpm lint
```

Expected: PASS.

- [ ] **Step 4: Commit any final verification-driven fixes**

If verification required any small final fixes:

```bash
git add <files>
git commit -m "fix: finalize admin form and tts cache integration"
```

If no fixes were needed, skip this commit.
