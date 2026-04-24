# Dad and Kids English Play MVP Design

## Goal

Build a web app for a father to learn and practice beginner English together with his two children, ages 3 and 6. The app should feel like a short daily play mission, not a study dashboard. The father is not expected to be fluent; the product should guide him in Korean while giving the children simple English sounds, pictures, actions, and rewards.

The first MVP should be usable without paid runtime AI. Google Cloud and Vertex AI can be added as production-quality asset and audio generation tools after the core routine works.

## Product Concept

Working title: **Dad and the Toy Forest English Mission**

World:
- A gentle forest where toy friends live.
- Main characters:
  - **Robo**: helps with simple sentence missions, best for the 6-year-old.
  - **Dino**: leads sound, movement, and imitation missions, best for the 3-year-old.
  - **Bunny**: gives encouragement, stickers, and daily completion feedback.

Core promise:
- One daily mission takes about 5 minutes.
- The father can run the session even with weak English.
- Each child gets an age-appropriate path from the same theme.

## Target Users

### Father

Needs:
- Korean guidance for what to say and do.
- Confidence that the activity is age-appropriate.
- A short routine that does not require preparation.
- Pronunciation help through audio playback.

Success means:
- He can open the app and start the day's activity immediately.
- He does not need to invent explanations or translations.
- He can participate as a play partner rather than acting like a formal teacher.

### 3-Year-Old Child

Needs:
- Big pictures.
- Simple sound repetition.
- Touch/click interaction.
- Movement and imitation.
- Immediate positive feedback.

Appropriate content:
- One word or short phrase per mission.
- Examples: `car`, `red car`, `jump`, `bear`, `sleep`.
- No reading requirement.

### 6-Year-Old Child

Needs:
- Slightly more challenge without becoming academic.
- Short sentence patterns.
- Picture-based comprehension.
- Repetition and confidence building.

Appropriate content:
- One word plus one short sentence.
- Examples: `I see a red car.`, `The bear is sleeping.`, `Let's jump.`
- Optional simple choice question.

## MVP Scope

The MVP should replace the current conversation/news learning flow with daily family missions.

Included:
- Child selector: 3-year-old, 6-year-old, or together.
- Today's mission page with one theme, one main image, and character framing.
- Korean father guide.
- Listen button for the English word/phrase/sentence.
- 3-year-old activity path.
- 6-year-old activity path.
- Completion sticker or star.
- Firestore-backed mission data and completion records.
- Local seed data for at least 7 daily missions.
- Browser TTS fallback.

Not included in first MVP:
- Real speech recognition or pronunciation grading.
- Real-time AI tutor conversation.
- Parent account management beyond existing lightweight auth.
- Payment or subscription.
- Complex LMS progress analytics.
- User-generated child photos or personal data.

## Learning Model

The learning model is routine-first and play-first:

1. Hear the English.
2. Point, tap, or act.
3. Repeat with the father.
4. Receive a small reward.

Each daily mission has:
- Theme: toys, forest animals, colors, actions, family objects, snacks.
- Target word.
- Optional phrase.
- 6-year-old sentence.
- Korean father guide.
- 3-year-old activity.
- 6-year-old activity.
- Character encouragement line.
- Image asset.
- Audio text.

The app should avoid long explanations. The father guide can explain the activity in Korean, but the child-facing UI should stay visual and minimal.

## Content Example

Day 1:
- Theme: Toys
- Character: Robo
- Target word: `car`
- Phrase: `red car`
- 6-year-old sentence: `I see a red car.`
- Father guide: `빨간 자동차를 같이 찾고, "red car"를 천천히 두 번 말해보세요.`
- 3-year-old activity: tap the red car.
- 6-year-old activity: choose the card that matches `I see a red car.`
- Reward: Bunny gives a red car sticker.

Day 2:
- Theme: Forest animals
- Character: Dino
- Target word: `bear`
- Phrase: `sleeping bear`
- 6-year-old sentence: `The bear is sleeping.`
- Father guide: `곰이 자는 척을 같이 하면서 "sleeping bear"를 말해보세요.`
- 3-year-old activity: pretend to sleep.
- 6-year-old activity: pick the sleeping bear from two images.

## Data Model

Replace track-specific content with a `dailyMissions` collection.

Mission fields:
- `id`
- `dateKey`
- `theme`
- `title`
- `character`
- `targetWord`
- `phrase`
- `sentence`
- `dadGuideKo`
- `threeYearOld`
  - `promptKo`
  - `listenText`
  - `activityType`
  - `choices`
  - `correctChoiceId`
- `sixYearOld`
  - `promptKo`
  - `listenText`
  - `activityType`
  - `choices`
  - `correctChoiceId`
- `encouragement`
- `image`
  - `url`
  - `alt`
- `audio`
  - `wordUrl`
  - `phraseUrl`
  - `sentenceUrl`
- `publishStatus`
- `isToday`

Completion fields:
- `userId`
- `missionId`
- `childMode`
- `completedAt`
- `rewardId`

For local MVP, `audio.*Url` may be empty and the frontend uses browser TTS. For the GCP upgrade, audio URLs point to generated MP3 files in Cloud Storage.

## UX Structure

### Home

The first screen should show the actual daily mission, not a marketing page.

Primary elements:
- Large mission image.
- Mission title.
- Character badge.
- Buttons:
  - `3세랑 하기`
  - `6세랑 하기`
  - `같이 하기`
- Small progress/reward area.

### Mission Play

The mission page should behave like a guided card sequence:

1. Story card: character introduces the mission.
2. Listen card: play word/phrase/sentence.
3. Dad guide card: Korean instruction for the father.
4. Child activity card: tap/choose/act.
5. Reward card: sticker/star and short encouragement.

The UI should use large tap targets, strong visual hierarchy, and minimal text. Cards may be used for individual mission steps, but the page should not become a nested-card dashboard.

## Visual Direction

Style:
- Friendly illustrated toy forest.
- Warm but not beige-dominant.
- Clear colors: leaf green, toy red, sky blue, sunshine yellow, soft white.
- Characters should have simple silhouettes and be recognizable at small sizes.

Asset direction:
- MVP can start with a small static asset set.
- Use original characters only.
- Avoid copyrighted characters or lookalikes.
- Keep character prompts consistent:
  - Robo: small friendly toy robot, rounded antenna, blue body.
  - Dino: small green toy dinosaur, soft felt texture, cheerful expression.
  - Bunny: small white forest bunny with yellow scarf.

## Audio Direction

MVP:
- Keep browser TTS as a free fallback.
- Improve voice selection where possible by preferring English voices and slower pace.

GCP upgrade:
- Use Google Cloud Text-to-Speech Chirp 3 HD for natural English audio.
- Generate MP3 once per mission text.
- Store audio in Cloud Storage.
- Save URLs on mission documents.
- Frontend should use `<audio>` playback when URL exists, otherwise fallback to browser TTS.

This keeps paid audio out of the critical path for the first MVP while making the later upgrade straightforward.

## Vertex AI Usage

Vertex AI should be used as a content and asset production tool, not as an uncontrolled runtime teacher in the first MVP.

Good first uses:
- Generate mission draft ideas from a fixed schema.
- Generate image prompts.
- Generate or edit character/card images with Gemini 2.5 Flash Image.
- Batch create 7-30 mission assets for review.

Avoid in first MVP:
- Unreviewed live lessons.
- Free-form child chat.
- Personalized advice based on sensitive child data.

## Technical Direction

Keep the current monorepo shape:
- `app/frontend`: React/Vite UI.
- `app/backend`: Fastify API.
- `app/shared`: shared schemas and contracts.
- Firestore Emulator for local development and tests.

Main changes:
- Replace conversation/news contracts with mission contracts.
- Replace home/content endpoints with mission-oriented endpoints.
- Keep existing auth/session behavior where useful.
- Replace current pages with family mission pages.
- Add seed data for missions.
- Add tests for mission loading, completion saving, and child mode behavior.

## Deployment Direction

Near term:
- Local development with Firestore Emulator.
- Optional Firebase Hosting/Cloud Run later.

GCP-friendly path:
- Backend on Cloud Run.
- Frontend on Firebase Hosting or Cloud Storage + CDN.
- Firestore Native mode.
- Cloud Storage for images/audio.
- Cloud Text-to-Speech for MP3 generation.
- Vertex AI for asset/content generation scripts.

VM use is acceptable for experiments, but Cloud Run is preferred for the app backend once deployment starts because it reduces server maintenance.

## Safety and Privacy

The app is for the user's own children, but it should still avoid unnecessary child data.

Rules:
- Do not store child photos.
- Do not store voice recordings in MVP.
- Do not require child names; use labels like `3세`, `6세`, or local nicknames later.
- Keep AI-generated content reviewable before children see it.
- Prefer pre-generated assets/audio over live generation during play.

## Testing

Required verification:
- Shared schema tests or type checks.
- Backend tests:
  - returns today's mission.
  - returns mission detail.
  - saves completion by child mode.
  - rejects invalid child mode.
- Frontend tests:
  - home renders mission and child mode buttons.
  - mission page renders dad guide and activity.
  - audio button uses URL audio when available and TTS fallback when not.
- Full commands:
  - `pnpm test`
  - `pnpm build`
  - `pnpm lint`

## Success Criteria

The MVP is successful if:
- The father can run a 5-minute session without preparing content.
- The 3-year-old can participate through picture/touch/action without reading.
- The 6-year-old gets a slightly richer sentence-based activity.
- The app works locally with seeded Firestore data.
- Audio and images can later be upgraded without rewriting the mission flow.

