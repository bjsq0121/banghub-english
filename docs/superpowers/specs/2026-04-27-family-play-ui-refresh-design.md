# Family Play UI Refresh Design

## Goal

Refocus the current Banghub English MVP so a father can immediately understand and run a short English play session with young children. This phase is a UI and flow reset, not a backend rewrite.

The product should feel like:
- open the app
- see today's picture and character
- start playing within a few seconds
- move through a short guided sequence

This phase covers only:
- home screen redesign
- mission player redesign
- clearer separation between father guidance and child-facing content

It does not cover:
- admin form redesign
- Cloud/Vertex TTS integration
- new content generation pipelines

## Product Positioning

The app is not a study dashboard. It is a daily five-minute English play routine for a father and young children.

Primary promise:
- one mission per day
- one core word or phrase
- very low setup burden
- Korean guidance for the father
- visual and simple interaction for the child

## User Reality

### Father

The father is not assumed to be strong in English. He needs:
- a clear start point
- confidence about what to do next
- one short Korean instruction at a time
- a flow that feels like guided play rather than teaching

### Children

For this phase, the 3-year-old and 6-year-old flows should stay close together.

Shared assumptions:
- both are effectively beginner learners
- both should be able to use the same simple mission structure
- the 3-year-old may not reliably understand spoken instructions
- the 6-year-old can attempt a little more repetition, but should still stay in a very easy path

Design implication:
- use one base flow for everyone
- keep the 6-year-old path as a light extension, not a separate academic track

## Scope

### Included

- redesign the home screen around immediate mission start
- make `같이 하기` the primary CTA
- keep `3세랑 하기` and `6세랑 하기` as secondary CTAs
- replace the current mission layout with a single-page step player
- show one short father guide line at the top of every step
- reduce child-facing text and remove nonessential metadata from the main play area

### Excluded

- replacing the admin JSON editor with a form
- changing backend content storage shape beyond what the new UI requires
- replacing browser TTS with GCP audio
- advanced progress analytics

## Information Architecture

### Home

The home screen should be a direct entry point into today's mission.

Primary hierarchy:
1. today's mission image
2. character presence
3. mission title
4. primary CTA `같이 하기`
5. secondary CTAs `3세랑 하기`, `6세랑 하기`

Secondary support content:
- today's target word or phrase
- one short preparation hint for the father if needed

Things to remove from top-level emphasis:
- generic navigation-oriented language
- admin-like metadata
- difficulty/settings as first-view signals

### Mission Player

The mission experience should stay on one page and behave like a guided player.

Persistent regions:
- top status area: current step, character, short father guide
- main stage: picture, audio action, or child interaction
- bottom controls: `다시 듣기`, `이전`, `다음`, final step `완료`

The UI should feel sequential and calm, not like a dashboard of separate cards.

## Interaction Model

Use one five-step structure for `같이 하기`, `3세`, and `6세`. The structure stays the same; the content weight changes slightly.

### Step 1: Story

Purpose:
- frame today's play mission
- introduce the target object or concept with the character

Content:
- large image
- short English word or phrase
- minimal Korean context through the father guide line

### Step 2: Listen

Purpose:
- let father and child hear the target language clearly

Content:
- one large listen button
- replay option remains available in controls

Rules:
- keep the spoken content very short by default
- prioritize `word` or `phrase` over full sentence

### Step 3: Dad Guide

Purpose:
- tell the father exactly what to do right now

Content:
- one short Korean sentence
- action-oriented guidance such as pointing, tapping, or saying together

Rules:
- avoid long explanatory copy
- no block paragraphs

### Step 4: Kid Action

Purpose:
- let the child respond physically or visually

Default interaction types:
- tap the right picture
- choose between two big options
- imitate a simple action

Rules:
- participation matters more than correctness
- text should be minimal
- targets must be large and obvious

### Step 5: Reward

Purpose:
- end with encouragement and a sense of completion

Content:
- character praise
- target word recap
- optional short extension for the 6-year-old, but not required

## Age Handling

The current product should not create two strongly different curricula.

### Together Mode

This becomes the default and easiest path.
- simplest phrasing
- single shared action
- most natural first choice from home

### Age 3 Mode

Differences from together mode:
- shorter visible prompts
- stronger reliance on image and tapping
- no expectation that the child fully understands spoken Korean instructions

### Age 6 Mode

Differences from together mode:
- may invite one extra repetition attempt
- may show one short sentence at the end or in reward
- should still feel easy and low-pressure

## Content Rules

Per mission:
- one core target word
- optionally one short phrase
- sentence usage is secondary and should not dominate the flow

Do not assume reading ability.

Good examples:
- `car`
- `red car`
- `bear`
- `sleeping bear`

Avoid:
- multiple unrelated vocabulary targets in one mission
- long instruction text in the child area
- quiz-heavy behavior

## Visual Direction

The first signal on home must be the mission art and character, not navigation or settings.

Design direction:
- bright toy-forest mood
- clean greens, blues, yellow, red, and white
- large primary image areas
- big tap targets
- minimal chrome

The layout should avoid:
- nested dashboard cards
- admin-looking forms in the child path
- text-dense panels

## Technical Direction

### Frontend

Keep the existing React router structure, but change behavior:
- home becomes a clearer mission-launch screen
- mission route becomes an internal step player instead of a multi-panel dashboard

Implementation shape:
- mission player owns a local `currentStep` state
- same mission data model feeds all modes
- per-mode differences come from selecting shorter or slightly extended copy, not different page architecture

### Backend and Data

Reuse the existing daily mission model as much as possible.

This phase should avoid schema churn unless a UI need requires a narrow addition.

### Audio

This phase keeps the current browser-based fallback. Audio quality improvements are a later track.

## Error Handling

If mission data is missing:
- show a simple empty state on home

If audio cannot play:
- keep browser TTS fallback behavior
- show a retry path through the listen control

If the user leaves mid-flow:
- returning to the mission can safely start from step 1 for this phase

## Testing

Focus tests on behavior with the current data model.

Minimum coverage:
- home shows primary and secondary CTAs in the new hierarchy
- mission player advances through five steps
- father guide line changes by step
- together/age3/age6 all reuse the same player shell
- completion still works at the final step

## Implementation Boundary

This design is intentionally narrow.

It should produce a clearer family-facing product without:
- reworking admin publishing
- introducing paid audio infrastructure
- redesigning content operations

Those come after the core family play flow is understandable on first use.
