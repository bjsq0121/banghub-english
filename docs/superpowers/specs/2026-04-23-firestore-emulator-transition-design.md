# Firestore Emulator Transition Design

- Date: 2026-04-23
- Project root: `/mnt/c/devProject/banghub-english`
- Scope: Replace the MVP's JSON datastore with Firestore and standardize local development on Firestore Emulator

## 1. Goal

Replace the current local JSON-backed persistence layer with Firestore as the single source of truth for:

- Conversation content
- News content
- User profiles
- User completion records
- Daily content assignments

The transition must make local development run against Firestore Emulator, not an in-memory or file-based fallback.

## 2. Product Intent

This change is not primarily a feature expansion. It is an infrastructure and persistence transition that prepares the MVP for:

- Consistent local development
- A realistic backend data model
- Easier future deployment into GCP
- Future integration with Firebase Auth or other identity systems

The user-facing behavior should remain the same wherever possible.

## 3. Scope

Included in this transition:

- Firestore Emulator as the default local datastore
- Firestore-backed storage for all existing MVP data domains
- Removal of the JSON persistence path from the normal runtime
- Seed data for local development
- Backend query and write flows adapted to Firestore

Not included in this transition:

- Full production deployment wiring
- Firebase Auth migration
- Role/permission redesign beyond current MVP needs
- Analytics, billing, or recommendation logic

## 4. Authentication Position

For this phase, the system uses anonymous/development-oriented login only.

This means:

- The backend may create or reuse lightweight user documents for development
- User identity handling stays minimal
- Full production authentication is deferred

The data model should still be compatible with a future move to stronger identity.

## 5. Firestore Data Model

The Firestore structure is track-separated and user-centric for completions.

Top-level collections:

- `conversationItems`
- `newsItems`
- `users`
- `dailyAssignments`

Nested collection:

- `users/{userId}/completions`

### 5.1 Conversation Items

Collection:

- `conversationItems`

Document responsibilities:

- Store reusable conversation learning content
- Remain independent from the current day's assignment state

Suggested fields:

- `title`
- `difficulty`
- `situation`
- `prompt`
- `answer`
- `alternatives`
- `ttsText`
- `publishStatus`
- `createdAt`
- `updatedAt`

### 5.2 News Items

Collection:

- `newsItems`

Document responsibilities:

- Store reusable news learning content
- Remain independent from the current day's assignment state

Suggested fields:

- `title`
- `difficulty`
- `passage`
- `vocabulary`
- `question`
- `answer`
- `ttsText`
- `publishStatus`
- `createdAt`
- `updatedAt`

### 5.3 Users

Collection:

- `users`

Document responsibilities:

- Hold minimal profile and preference state for the MVP

Suggested fields:

- `email` or development identifier
- `difficulty`
- `selectedTracks`
- `isAdmin`
- `createdAt`
- `updatedAt`

### 5.4 Completions

Nested path:

- `users/{userId}/completions/{contentId}`

Document responsibilities:

- Store whether a user completed a specific content item
- Stay scoped to a user to keep read patterns simple for the MVP

Suggested fields:

- `contentId`
- `track`
- `completedOn`
- `createdAt`

### 5.5 Daily Assignments

Collection:

- `dailyAssignments`

Document responsibilities:

- Decide what content is treated as "today's conversation" and "today's news"
- Keep assignment state separate from reusable content documents

Suggested document key:

- Date string such as `2026-04-23`

Suggested fields:

- `conversationItemId`
- `newsItemId`
- `publishedAt`
- `updatedAt`

## 6. Why Assignments Are Separate

The current day's content should not be encoded with an `isToday` field on content items.

Reasons:

- Content remains reusable
- Reassigning today's content becomes a lightweight operation
- Rollbacks and corrections are easier
- The data model more closely reflects real publishing behavior

This also avoids update churn across content documents when the day changes.

## 7. Local Development Model

Local development must use Firestore Emulator as the normal path.

Requirements:

- Backend reads emulator configuration from environment
- Frontend and backend target the same local data model
- The default development workflow should not require access to live GCP resources

The local environment should make it easy to:

- Start the emulator
- Seed local data
- Run the app against the emulator
- Reset the local dataset when needed

## 8. Backend Architecture Transition

The existing module split should remain:

- `auth`
- `content`
- `progress`
- `admin`

The main architectural change is the storage layer.

The current file-based persistence helper should be replaced with a Firestore-backed data access layer that:

- Reads documents from the correct collections
- Maps Firestore documents into current response contracts
- Handles date-based daily assignment lookup
- Reads and writes nested completion documents

The backend should isolate Firestore-specific logic in the storage layer as much as practical so feature modules remain readable.

## 9. Runtime Behavior Mapping

### 9.1 Home

The home endpoint should:

- Resolve the current date's assignment from `dailyAssignments`
- Read the assigned conversation and news documents
- If a user exists, read completion documents for that user

### 9.2 Content Detail

The content detail endpoint should:

- Resolve track-specific documents from `conversationItems` or `newsItems`
- Return a 404-style response when a document does not exist

### 9.3 Preferences

The preferences endpoint should:

- Update the matching `users/{userId}` document

### 9.4 Completion

The completion endpoint should:

- Upsert the matching `users/{userId}/completions/{contentId}` document

### 9.5 Admin Publishing

The admin publishing flow should:

- Create or update content documents in the correct track collection
- Update the relevant `dailyAssignments/{date}` document when "publish today" is selected

## 10. Seed Strategy

This phase should treat current JSON-backed sample data as local seed input, not as a long-term runtime store.

The seed flow should populate Firestore Emulator with:

- At least one admin/development user
- A small set of conversation items
- A small set of news items
- A daily assignment document for the current working date

The result should be a fresh local environment where:

- Home has content immediately
- Admin flows can be exercised
- Completion tracking can be tested

## 11. Migration Position

Because the current persistence is local JSON rather than a stable production database, this transition does not require a complex production migration process.

Instead:

- Existing JSON sample data should be converted into seed input
- JSON runtime reads/writes should be removed from normal app flow

This keeps the transition focused and avoids maintaining dual persistence paths.

## 12. Testing Strategy

The backend test strategy should validate Firestore-backed behavior, not just abstract service logic.

Priority backend verification:

- Today's assigned content lookup works
- Missing assignment or missing content degrades safely
- Development login creates or resolves usable user identity
- Preference updates persist to Firestore
- Completion writes land in `users/{userId}/completions`
- Admin publishing updates content and the current daily assignment

Frontend test strategy:

- Keep component rendering tests
- Keep route/error handling tests
- Ensure API-layer error handling works when Firestore-backed endpoints return missing content

## 13. Error Handling

The system should degrade clearly when Firestore data is incomplete.

Important cases:

- Missing `dailyAssignments` document for today
- Assignment points to missing content document
- Missing user document for a development session
- Emulator unavailable during local startup

The product should render controlled empty/error states instead of hanging or silently returning bad data.

## 14. Environment Expectations

Expected configuration areas:

- Firestore project/emulator host values
- Local-vs-runtime mode selection
- Seed command configuration

The project should make the emulator path explicit so developers do not accidentally point development traffic at a real Firestore project.

## 15. Delivery Summary

This transition moves the MVP from local JSON persistence to a Firestore-first model with Firestore Emulator for local development.

The resulting architecture should provide:

- A realistic document model aligned with the product
- Cleaner future GCP deployment alignment
- A better foundation for later Firebase Auth or richer automation
- A single persistence direction instead of parallel storage paths
