# Admin Form and Lazy TTS Cache Design

## Goal

Add two operational capabilities to the current family mission app:

1. replace the admin JSON editor with a fast internal mission form for a single operator
2. add server-side English TTS generation that creates audio on first play, stores it, and reuses it on later plays

This phase should improve content publishing speed and audio quality without turning the app into a complex CMS or live AI teaching system.

## Product Context

The app already has:
- a family-facing mission home
- a five-step mission player
- a backend API on Cloud Run
- Firebase Hosting in front of it

This phase improves the operator experience and the runtime audio path.

## Operator Model

The admin interface is for one person only: you.

Design consequences:
- optimize for speed over generality
- keep fields opinionated and minimal
- prefer inline defaults and prefilled values
- do not build roles, workflows, or review states beyond what already exists

The admin page should feel like:
- open page
- fill a short form
- publish today's mission

## Scope

### Included

- replace the JSON textarea admin page with a structured mission form
- keep output compatible with the existing mission document shape as much as possible
- add a backend `/api/tts` path that checks cache first
- on cache miss, generate English audio through Google Cloud TTS
- store generated audio in Cloud Storage
- store cache metadata in Firestore
- reuse cached audio on later requests
- keep browser TTS fallback in the frontend if server audio fails

### Excluded

- bulk content management
- spreadsheet import/export
- audio regeneration controls in admin
- multiple cached audio variants per mission in this phase
- pronunciation scoring
- per-user audio personalization

## Admin Form Design

### Primary Use Case

You create or update one mission at a time for the current day.

The form should make that fast by:
- pre-filling `dateKey` with today's Korea date
- defaulting `publishStatus` to `published`
- defaulting `isToday` to `true`
- keeping a small number of required fields

### Form Structure

The page should be organized into a few flat sections, not nested cards.

#### Mission Basics

- date
- mission id
- title
- theme
- character

#### Language Content

- target word
- short phrase
- short sentence
- father guide in Korean
- encouragement text

#### Child Activity

Because the current child paths are intentionally close together, the admin form should not force fully separate authoring flows at first.

Use a shared activity-first model with light per-age overrides:
- base prompt
- activity type
- choice 1 label
- choice 2 label
- correct choice

Optional per-age override fields may remain available but collapsed or secondary.

#### Visuals

- representative image URL
- image alt text

#### Publish Actions

- `임시 저장`
- `오늘 미션으로 발행`

### Admin UX Rules

- show field labels in Korean where that improves speed
- keep technical details out of the primary path
- validate required fields before submit
- show a compact success/failure message
- do not require hand-editing JSON for normal use

## Data Compatibility Strategy

The current mission schema already separates:
- `threeYearOld`
- `sixYearOld`
- `audio.wordUrl`
- `audio.phraseUrl`
- `audio.sentenceUrl`

This phase should not redesign the mission schema broadly.

Instead:
- admin form writes the existing mission shape
- shared fields can populate both child branches where appropriate
- lightweight transformation in frontend or backend may derive the final document shape from the simpler form input

This keeps change scope controlled.

## TTS Behavior

### User-Facing Rule

When a child taps `듣기`:
- if a cached mission audio file exists, play it
- otherwise generate it on the server, save it, then play it

If generation fails:
- fall back to browser TTS

### Why This Model

This avoids:
- paying for every click
- pre-generating audio for content that may never be played

It keeps:
- first use flexible
- later use cheap and fast

## TTS Cache Strategy

### Phase 1 Cache Unit

Cache one representative audio file per mission.

This is intentionally simpler than caching word, phrase, and sentence separately.

Selection rule:
- `together` and `age3`: prefer `phrase`, then `targetWord`, then `sentence`
- `age6`: prefer `sentence`, then `phrase`, then `targetWord`

In storage terms, the cache is still keyed so the implementation can expand later, but phase 1 behavior returns one mission-level audio asset.

### Storage Layout

Use Cloud Storage for audio files.

Suggested path pattern:
- `tts/missions/<missionId>/primary.mp3`

This is simple to inspect and replace if needed.

### Firestore Metadata

Use a `ttsCache` collection.

Suggested fields:
- `missionId`
- `text`
- `scope`
- `childModeStrategy`
- `storagePath`
- `contentType`
- `createdAt`
- `lastUsedAt`

Even with one cached asset per mission, Firestore metadata is still worth keeping because it makes:
- lookup explicit
- future invalidation easier
- debugging simpler

## Backend Flow

### Request Shape

The frontend should call a backend endpoint such as:
- `GET /api/tts?missionId=<id>&childMode=<mode>`

Do not expose cloud credentials to the browser.

### Server Flow

1. validate request
2. load the mission by `missionId`
3. choose the representative text for the requested mode
4. check `ttsCache`
5. if cache hit:
   - update `lastUsedAt`
   - stream or redirect to the stored audio
6. if cache miss:
   - call Google Cloud TTS
   - write audio to Cloud Storage
   - write cache metadata to Firestore
   - return the audio

### Provider Choice

Use Google Cloud Text-to-Speech from the backend side, not a frontend direct call.

This keeps:
- authentication on the server
- provider choice replaceable later
- the frontend API surface stable

### Failure Handling

If TTS generation fails:
- return an error code the frontend can distinguish from mission-not-found
- frontend falls back to browser TTS automatically

Do not block the mission flow on audio generation success.

## Frontend Audio Flow

The current mission player already has a listen action and browser fallback behavior.

This phase should change it to:
- request server audio by mission and mode
- if audio response succeeds, play returned blob or URL
- if it fails, use current browser TTS fallback

The user should still experience one `듣기` button only.

## Security and Cost Controls

### Security

- keep TTS calls server-side only
- validate `missionId` and `childMode`
- do not allow arbitrary unbounded text generation from the public client in this phase

The server should derive the actual spoken text from the mission record, not trust arbitrary user text.

### Cost Control

- one cached file per mission in phase 1
- no per-click regeneration after first success
- duplicate first-generation requests do not need special coalescing in this phase

## Technical Direction

### Frontend Files

Likely touch points:
- `app/frontend/src/features/admin/AdminPage.tsx`
- `app/frontend/src/lib/tts.ts`
- `app/frontend/src/features/mission/MissionPage.tsx`

### Backend Files

Likely touch points:
- admin route/service modules
- a new TTS route/service module
- Firestore collection definitions
- Cloud Storage helper
- tests for cache hit and cache miss behavior

### Shared Types

Shared contracts may need:
- admin form request shape updates
- a TTS request contract if the client endpoint is typed centrally

Keep the public contract narrow.

## Testing

Minimum coverage should include:
- admin form submits valid mission payload without JSON editing
- mission publish still stores the expected shape
- `/api/tts` returns cached audio when available
- `/api/tts` generates and stores audio on cache miss
- frontend listen action falls back to browser TTS on server failure

## Implementation Boundary

This design is intentionally operational and narrow.

It should give you:
- faster daily content publishing
- significantly better audio quality
- predictable TTS cost behavior

It should not attempt to solve:
- long-term audio asset management
- full CMS authoring workflows
- multi-voice content strategy
- multi-asset per mission audio design

Those can come later once this phase proves useful in daily use.
