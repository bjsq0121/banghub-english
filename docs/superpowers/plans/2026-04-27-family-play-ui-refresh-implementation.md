# Family Play UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the current family mission frontend so the app reads as a five-minute dad-and-kids English play experience, then verify and deploy the updated frontend.

**Architecture:** Keep the existing mission data model and routes, but redesign the home screen hierarchy and replace the current mission dashboard with a single-page five-step player driven by local step state. Preserve the existing backend APIs and completion behavior so this stays a frontend-led refresh.

**Tech Stack:** TypeScript, React, React Router, Vite, Vitest, Testing Library, pnpm, Firebase Hosting plus current backend API origin.

---

## File Structure

- Modify `app/frontend/src/features/home/HomePage.tsx`
  - Rebuild the home screen hierarchy around mission image, character, and primary CTA.
- Modify `app/frontend/src/features/home/HomePage.test.tsx`
  - Assert the new CTA hierarchy and mission-first copy.
- Modify `app/frontend/src/features/mission/MissionPage.tsx`
  - Replace the multi-panel layout with a local five-step mission player.
- Modify `app/frontend/src/features/mission/MissionPage.test.tsx`
  - Cover step progression, per-step dad guide, and completion on the final step.
- Modify `app/frontend/src/app/AppShell.tsx`
  - Reduce chrome so the product feels like a family play tool.
- Modify `app/frontend/src/styles/global.css`
  - Add the new home and mission player layout styles.
- Modify `app/frontend/src/app/router.tsx`
  - Keep current routes, but ensure the mission page works as a single player and home remains the primary entry.

## Task 1: Home Screen Hierarchy

**Files:**
- Modify: `app/frontend/src/features/home/HomePage.tsx`
- Test: `app/frontend/src/features/home/HomePage.test.tsx`

- [ ] **Step 1: Write the failing home test expectations**

Update `app/frontend/src/features/home/HomePage.test.tsx` so it asserts:
- mission title is present
- `같이 하기` exists and links to `/mission/<id>/together`
- `3세랑 하기` and `6세랑 하기` exist as secondary links
- today's target word or phrase is shown

Expected assertions:

```ts
expect(screen.getByRole("link", { name: "같이 하기" })).toHaveAttribute(
  "href",
  "/mission/mission-1/together"
);
expect(screen.getByText("little train")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused home test and confirm it fails**

Run:

```bash
pnpm --filter @banghub/frontend test -- src/features/home/HomePage.test.tsx
```

Expected: FAIL because the current home layout does not match the new hierarchy assertions.

- [ ] **Step 3: Implement the new home screen**

In `app/frontend/src/features/home/HomePage.tsx`:
- make the mission image and character the first visual signal
- render `같이 하기` as the primary CTA
- render `3세랑 하기`, `6세랑 하기` as secondary links
- show one short target phrase block and one short dad-prep block
- keep the existing empty state path

- [ ] **Step 4: Re-run the focused home test**

Run:

```bash
pnpm --filter @banghub/frontend test -- src/features/home/HomePage.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the home screen task**

Run:

```bash
git add app/frontend/src/features/home/HomePage.tsx app/frontend/src/features/home/HomePage.test.tsx app/frontend/src/styles/global.css
git commit -m "feat: redesign family mission home screen"
```

Expected: commit succeeds.

## Task 2: Mission Player Flow

**Files:**
- Modify: `app/frontend/src/features/mission/MissionPage.tsx`
- Test: `app/frontend/src/features/mission/MissionPage.test.tsx`

- [ ] **Step 1: Write failing mission player tests**

Update `app/frontend/src/features/mission/MissionPage.test.tsx` to assert:
- step 1 story content renders first
- `다음` advances through five steps
- the dad guide line is always visible
- completion only becomes available on the reward step
- logged-in completion still saves once

Expected checks include:

```ts
expect(screen.getByText("1 / 5")).toBeInTheDocument();
fireEvent.click(screen.getByRole("button", { name: "다음" }));
expect(screen.getByText("2 / 5")).toBeInTheDocument();
expect(screen.queryByRole("button", { name: "완료" })).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused mission test and confirm it fails**

Run:

```bash
pnpm --filter @banghub/frontend test -- src/features/mission/MissionPage.test.tsx
```

Expected: FAIL because the current mission layout is not a five-step player.

- [ ] **Step 3: Implement the five-step mission player**

In `app/frontend/src/features/mission/MissionPage.tsx`:
- add local `currentStep` state from 0 to 4
- render one persistent father guide line at the top
- render one main stage that changes by step
- keep `다시 듣기`, `이전`, `다음` controls
- show `완료` only on the final step
- preserve current TTS fallback and logged-in completion behavior

- [ ] **Step 4: Re-run the focused mission tests**

Run:

```bash
pnpm --filter @banghub/frontend test -- src/features/mission/MissionPage.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the mission player task**

Run:

```bash
git add app/frontend/src/features/mission/MissionPage.tsx app/frontend/src/features/mission/MissionPage.test.tsx app/frontend/src/styles/global.css
git commit -m "feat: turn mission page into family play player"
```

Expected: commit succeeds.

## Task 3: Shell and Styling Cleanup

**Files:**
- Modify: `app/frontend/src/app/AppShell.tsx`
- Modify: `app/frontend/src/app/router.tsx`
- Modify: `app/frontend/src/styles/global.css`
- Test: existing frontend tests

- [ ] **Step 1: Adjust shell chrome**

Update `app/frontend/src/app/AppShell.tsx` so the top chrome feels lighter and product-facing rather than like a tool nav.

- [ ] **Step 2: Keep routing behavior aligned**

Update `app/frontend/src/app/router.tsx` only as needed to fit the new player wording and preserve existing completion behavior.

- [ ] **Step 3: Run the full frontend test suite**

Run:

```bash
pnpm --filter @banghub/frontend test
```

Expected: PASS for the full frontend suite.

- [ ] **Step 4: Commit shell and styling cleanup**

Run:

```bash
git add app/frontend/src/app/AppShell.tsx app/frontend/src/app/router.tsx app/frontend/src/styles/global.css
git commit -m "feat: polish family play shell and layout"
```

Expected: commit succeeds.

## Task 4: Full Verification and Deploy Preparation

**Files:**
- Modify if needed: deployment config only if verification reveals a gap

- [ ] **Step 1: Run full project verification**

Run:

```bash
pnpm test
pnpm build
pnpm lint
```

Expected: all exit 0.

- [ ] **Step 2: Confirm the deploy target path**

Check the current hosting response and current Firebase config so the deploy command matches the live setup. If repo config is incomplete, stop and report the exact missing deployment configuration before deploying.

- [ ] **Step 3: Deploy only if configuration is sufficient**

Run the repository's real Firebase deploy command for the frontend target. If there is no complete hosting config in the repo or no authenticated Firebase session, stop and report that blocker instead of guessing.

- [ ] **Step 4: Record the outcome**

Capture:
- deployed commit
- deployed URL
- any manual follow-up needed if deploy is blocked by missing config or auth
