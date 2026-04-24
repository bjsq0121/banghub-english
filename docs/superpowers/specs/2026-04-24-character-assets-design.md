# Character Assets Design

## Goal

Give Banghub English a real visual identity for its three characters — Robo,
Dino, Bunny — so the app feels like a story world instead of placeholder
shapes, and so mission illustrations can consistently feature the same
friends without one-off art every time.

This document is design only: tool choice, folder structure, style guide,
prompt drafts, naming, integration plan. No art is generated here. A
follow-up implementation ticket executes Phase 1.

## Current state

- `DailyMission.character` is a string enum (`"robo" | "dino" | "bunny"`)
  in `app/shared/src/content.ts`. It is rendered as plain text in
  `app/frontend/src/features/mission/MissionPage.tsx` (line 51): the user
  sees "robo · 3세" as a subheading, with no portrait.
- `DailyMission.image` is the per-mission scene SVG at
  `app/frontend/public/assets/missions/<slug>.svg`. The 7 original SVGs
  are hand-crafted (red-car, sleeping-bear, etc.); the 7 new ones (bubble,
  rain-drop, …) are acknowledged placeholders in
  `docs/superpowers/plans/...seed missions`.
- No character portraits exist anywhere in the repo or Firestore.

## Scope

Split into two phases so the MVP can ship with consistent visuals even if
larger-scale art is still in flight.

### Phase 1 — Canonical portraits (ship-blocking for v1)
- One front-facing portrait per character (3 images total).
- Rendered next to the "character · 모드" line in `MissionPage`, and
  reusable as an avatar wherever a character is referenced (future home
  dashboard, completion sticker, admin editor preview).
- Goal: visual identity lock. Every later piece of art derives from
  these three reference portraits.

### Phase 2 — Character-in-scene illustrations (post-MVP)
- Replace the placeholder per-mission scene SVGs with illustrations that
  feature the lead character doing the mission's theme (Robo holding the
  red car, Dino clapping, Bunny waving good night).
- Incremental: one batch of scenes at a time, driven by the 14 seed
  missions. Can run in parallel with early users being on the app.
- Admin can upload replacement scene art without code changes (the
  `mission.image.url` field already accepts any path).

Out of scope here:
- Full character animation (Lottie / Rive).
- In-mission voice-face sync.
- User-generated kid avatars.

## Tool decision

### Recommendation
- **Phase 1 portraits**: generated interactively through **Vertex AI
  Studio (Imagen 3)** in the browser console. It's the GCP-native path,
  no extra billing account, results land in the same project we already
  use for TTS, and the console gives fast iterate-and-pick UX without
  scripting. Download the three chosen PNGs and commit them.

- **Phase 2 scenes**: **Vertex AI Imagen 3 Generation API**, called from
  a small repo script (`scripts/generate-character-art.ts`) that takes
  the Phase 1 portraits as reference images for character-consistency
  conditioning. Keep the script in-repo so prompt history is reviewable
  and rebuilds are reproducible.

### Why GCP-first
- Already provisioned in `banghub-english-prod`; same service account
  can call Imagen once `aiplatform.googleapis.com` is enabled.
- Cost predictable (~$0.04 per 1024×1024 Imagen 3 sample); burst of
  ~100 images to cover phase 2 is well under $10.
- Reference-image conditioning in Imagen 3 Capability handles the
  "same character again" problem, which is the hardest part of doing
  picture-book style at scale.
- Billing consolidates with Firebase / Cloud Run / TTS — one invoice.

### When to reach for external tools
- **Midjourney `--cref`**: better painterly quality, but manual
  workflow (Discord → download → commit). Use when Imagen output feels
  too "digital clean" and we want a single marquee asset (landing page
  hero, app store screenshot).
- **Ideogram / DALL-E 3**: decent fallback if Imagen rate-limits or
  struggles on a specific prompt. Keep in our back pocket; do not make
  them the primary pipeline because they sit outside GCP billing.
- **Illustrator hired for the landing page**: if the app gets traction,
  one-time brand polish pass replaces generator output with hand art.
  Nothing in the pipeline prevents this; the file paths stay the same.

We explicitly do **not** train a custom LoRA in Phase 1. The reference-
image conditioning in Imagen is enough; a LoRA is a weeks-of-work move
we save for after the MVP proves itself.

## Style guide

Applies to both phases. Consistency across the three characters matters
more than any individual character looking amazing.

### Medium & rendering

| Property | Target | Why |
| --- | --- | --- |
| Style | Flat vector with soft airbrushed shading | Matches existing mission SVGs; reads well at 320×240 and at 64×64 avatar |
| Line weight | 3–4 px at 1024 px canvas, scale proportionally | The current SVGs use 3–5 px strokes; stays coherent |
| Shading | One soft highlight + one soft shadow per shape; no gradients with more than two stops | Preschool picture-book feel, avoids 3D realism |
| Composition | Subject centered, ~70 % of canvas, generous negative space | Leaves room for overlays and does not compete with UI text |
| Lighting direction | Upper-left, same for all characters | Makes side-by-side renders feel from the same world |
| Texture | Almost none — optional faint paper grain | Prevents "AI-plastic" look |

### Palette

Derive from existing mission SVGs:

| Role | Hex | Notes |
| --- | --- | --- |
| Sky / primary cool | `#dff5ff` | Already used as backdrop in mission SVGs |
| Grass / primary warm | `#87d070` | Already used for ground plane |
| Accent red | `#e8463f` | Red car, apple |
| Accent yellow | `#ffd84d` | Sun, star |
| Character outline | `#27313b` | Same dark used for car wheels |
| Highlight warm | `#fff3c8` | Clap-hands background, keeps energy |
| Skin warm | `#ffd88a` | Hand skin in clap-hands.svg |

Characters should pick ONE signature hue each from this palette so they
are distinguishable at thumb size:

- **Robo** — sky `#dff5ff` primary body with `#5aa9d8` accent
- **Dino** — grass `#87d070` primary body with `#4fa85a` accent
- **Bunny** — cream-white `#faf5ec` primary body with `#f298b8` accent

### Character personalities

These must come through in the portrait, so the prompt can push each
character in the right direction.

**Robo** — the gentle sentence helper for the 6-year-old.
- Round, chubby body. No sharp corners or mechanical menace.
- Friendly LED eyes (simple circles, no pupils drama).
- Small antenna with a soft ball on top.
- Posture: upright, slight head tilt, one hand waving or pointing at a
  speech bubble cue.

**Dino** — the sound-and-movement buddy for the 3-year-old.
- Small and roly-poly. No teeth bared, no fierce pose.
- Short stubby legs, tiny wings or stubs.
- Wide happy mouth (smile, not a roar).
- Posture: mid-hop, both feet just off the ground — motion hints energy
  without action-hero vibe.

**Bunny** — the encourager, sticker-giver.
- Soft long ears, slightly floppy.
- Kind closed-mouth smile.
- Holds a gold star or a sticker sheet in one paw.
- Posture: standing calmly, warm inviting stance.

### Technical specs per deliverable

| Deliverable | Canvas | Aspect | Transparent? | Format | Target size | Hard cap |
| --- | --- | --- | --- | --- | --- | --- |
| Portrait (phase 1) | 1024 × 1024 | 1:1 | yes | `.png` or `.webp` | ~200 KB | 350 KB |
| Avatar render (derived from portrait) | 256 × 256, downsampled client-side from the same portrait | 1:1 | yes | same as portrait | n/a | n/a |
| Scene (phase 2) | 1024 × 768 | 4:3 | no (colored background) | `.png` or `.webp` | ~250 KB | 450 KB |
| Mission SVG replacement (optional fallback) | 320 × 240 | 4:3 | no | `.svg` only if handmade | n/a | n/a |

Size notes:
- "Target size" is what a compressed PNG/WebP of this kind of flat
  illustration typically lands at (e.g., Imagen 3 PNG output run
  through `squoosh` or `oxipng -O2`). If a portrait comes back at
  600 KB, compress before committing.
- "Hard cap" is the refusal line — if compression can't get the file
  under it without visible quality damage, reduce the canvas or
  simplify the prompt (fewer fine strokes, larger solid areas).
- WebP is preferred when the source is a photorealistic-ish render
  from Imagen; PNG when the output is closer to true vector with flat
  regions. Either format is fine — the `<img>` tag renders both.

## Folder structure

Served assets (published via Firebase Hosting):
```
app/frontend/public/assets/
  characters/
    robo.png              # Phase 1 portrait, 1024x1024
    dino.png
    bunny.png
  missions/
    (existing mission scene art)
```

Non-served sources (git-tracked docs, never in the deploy bundle):
```
docs/ai-prompts/
  characters/
    robo.prompt.md
    dino.prompt.md
    bunny.prompt.md
  missions/
    <mission-id>.prompt.md   # populated in Phase 2
```

Notes:
- Keeping prompts under `docs/` instead of `public/` means they never
  ship to end users and never inflate the Hosting payload, while still
  living next to the generated artefacts in review (filenames pair:
  `robo.png` ↔ `docs/ai-prompts/characters/robo.prompt.md`).
- Scene prompts live in `docs/ai-prompts/missions/` so a future
  contributor can regenerate a specific mission without excavating git
  history.

### File naming rules

- Lowercase, kebab-case.
- Character portraits: `<character>.png`. Exactly one canonical file
  per character; no `-v2` suffix. When we replace art, overwrite and
  commit — git history is the version log.
- Scene art: `<mission-id>.<ext>`. `mission-id` mirrors the Firestore
  document id (`mission-red-car`, `mission-clap-hands`). Strip the
  `mission-` prefix **only in the filename** if desired, but keep the
  prefix in any code that references it. Current repo keeps the prefix
  off the file (`red-car.svg`); stay consistent with that for Phase 2
  scenes so URLs don't double-prefix.
- Prompt files: `<name>.prompt.md`, same stem as the image. Keeps pairs
  obvious.

## Prompt drafts

Starting point for Vertex AI Imagen 3. Use `imagegeneration@006` or
latest Imagen 3 endpoint. Aspect `1:1`, safety filter "safe",
`numberOfImages: 4`, then curate. Negative prompt included to rule out
the common failure modes we saw in early experiments with similar
generators.

### Shared style preamble

Prefix every prompt with this block so runs stay coherent:

> Flat vector illustration for a preschool picture book. Soft airbrush
> shading with one highlight and one shadow per shape, no gradients
> beyond two stops. Clean 3–4 px outline in dark ink `#27313b`. Soft
> pastel palette anchored on sky blue `#dff5ff` and grass green
> `#87d070`. Warm, friendly, childlike, non-realistic. Subject
> centered, generous negative space, plain white background for
> portrait studies. Lighting from upper-left.

### Robo portrait (`robo.prompt.md`)

> **Style preamble above, then:** A friendly round child-shaped robot
> named Robo, standing front-facing, chubby rounded body in sky blue
> `#dff5ff` with darker blue `#5aa9d8` accent panels on chest and
> joints, two small black-ink circle eyes with soft white highlights,
> a gentle closed-mouth smile, one short antenna with a small yellow
> ball `#ffd84d` on top, arms slightly raised with one hand waving,
> stubby legs, no weapons no armor no mechanical menace, cute curious
> expression. Full body visible, feet on implied ground plane. 1:1
> aspect.
>
> Negative: sharp edges, metallic texture realism, glowing red eyes,
> scary expression, weapons, antenna thorns, photorealistic, 3D
> render, heavy shading, mechanical grime, detailed background.

### Dino portrait (`dino.prompt.md`)

> **Style preamble above, then:** A small friendly dinosaur named
> Dino, round body in grass green `#87d070` with darker green
> `#4fa85a` back spikes that are soft and rounded, short stubby arms
> and legs, tiny tail, wide happy open-mouth smile with no visible
> teeth, two large black-ink eyes with small white highlights, mid-
> hop pose with both feet just off the ground, small motion lines
> under feet, cute playful energy, no scales rendered as realistic
> texture. 1:1 aspect.
>
> Negative: sharp teeth, roaring mouth, scary eyes, realistic
> dinosaur skin, action-figure posture, aggressive stance,
> photorealistic, dark lighting.

### Bunny portrait (`bunny.prompt.md`)

> **Style preamble above, then:** A soft cream-white rabbit named
> Bunny, standing calmly front-facing, cream `#faf5ec` primary fur
> with inner-ear blush pink `#f298b8`, long slightly-floppy ears,
> kind closed-mouth smile, gentle half-closed eyes, holding a small
> gold five-pointed star `#ffd84d` in one paw at chest height, soft
> cheek blush, warm welcoming body language, front paws slightly
> apart. 1:1 aspect.
>
> Negative: scary expression, red eyes, sharp claws, realistic fur
> texture with strands, photorealistic, aggressive stance, pet
> photography lighting, dramatic shadow.

### Phase 2 scene example (mission-clap-hands) — illustrative

For the later batch, scene prompts layer character + setting + action
on top of the shared preamble, and pass the Phase 1 portrait as the
reference image (`referenceImage.referenceType: SUBJECT`).

> **Style preamble above, then:** Dino (reference image provided)
> standing in a grassy forest clearing, two small cartoon hands mid-
> clap with motion arcs between them, warm yellow sparkle `#ffd84d`
> bursts radiating out, happy open-mouth smile, eyes closed in joy,
> sunlight from upper-left, soft clouds in a sky blue `#dff5ff`
> background, composition leaves bottom third empty for captions, 4:3
> aspect.
>
> Negative: different dinosaur species, color drift from reference,
> extra characters, text in image.

## Integration plan

### Frontend wiring (Phase 1)

Single small change to `MissionPage.tsx`:

1. Add a character-asset helper in `app/frontend/src/features/mission/`
   (or `app/frontend/src/lib/characters.ts`) that maps the enum value
   to an image path:

   ```ts
   const CHARACTER_ASSETS: Record<MissionCharacter, { src: string; alt: string }> = {
     robo: { src: "/assets/characters/robo.png", alt: "Robo the robot" },
     dino: { src: "/assets/characters/dino.png", alt: "Dino the friendly dinosaur" },
     bunny: { src: "/assets/characters/bunny.png", alt: "Bunny the encourager" }
   };
   ```

2. In the hero area, add a small portrait next to the "character ·
   모드" label. Graceful degradation: wrap in `<img onError>` that
   hides itself if the file 404s, so the page keeps working before
   art lands.

3. No contract change. No Firestore migration. No admin UI change.
   The rename of `.mission-character` CSS class stays wrong-named for
   now (it refers to the scene panel); rename is a follow-up cleanup,
   not blocking.

Avatar size in the hero: 64×64 on mobile, 96×96 on desktop, rendered
via CSS. The source PNG stays 1024×1024; the browser downsamples.
Long-term we may pre-bake a 256×256 variant at build time — not yet
needed.

### Scene replacement path (Phase 2)

No wiring change. The admin mission-edit flow already accepts a URL
string in `mission.image.url`. When Phase 2 art is ready, either:
- drop the new `<slug>.png` into `public/assets/missions/`, update the
  Firestore doc via admin UI to the new URL; or
- overwrite the existing `<slug>.svg` with a same-named `<slug>.png`
  and migrate the Firestore `image.url` in one batch.

### Regeneration workflow (Phase 2 script, sketched)

Not implemented in this doc; captured here so the shape is agreed:

- `scripts/generate-character-art.ts` takes a prompt file path and a
  character reference PNG, calls Vertex AI Imagen 3, writes the
  returned PNG back next to the prompt file.
- Dev runs it once per mission:
  `pnpm tsx scripts/generate-character-art.ts app/frontend/public/assets/_sources/missions/mission-clap-hands.prompt.md`.
- The script is idempotent: writes a new variant with timestamp
  suffix into a `_drafts/` sibling, never overwrites the committed
  asset. Curation stays human; the script only removes the
  boilerplate of API calls.

## Easy swap & iteration policy

- Canonical character assets are **three files**. Swap = rewrite those
  three files. Everything else references them by path.
- When a character's look is updated (say, Dino gets a scarf), the
  update must also be reflected in every scene PNG that features
  Dino. That's why Phase 2 scenes are expensive to redo — version the
  character first, then regenerate scenes in one sweep rather than
  drifting.
- Prompt files are the source of truth for "what does this character
  look like right now." A PR that changes `robo.prompt.md` is the
  trigger for regenerating the portrait.
- If we ever want to A/B two character styles, branch off
  `design/character-assets-v2`, regenerate under a parallel path
  (`/assets/characters/v2/robo.png`), flip the helper map behind a
  feature flag. Not needed until we have traction.

## Open questions

1. **Korean localization in art.** Current plan is English-only labels
   in images (actually: zero text in images). Should Korean ever
   appear inside a scene? Default answer: no — keep text in UI layer,
   not baked in PNG.
2. **Accessibility alt text.** The helper map above pins short
   English alt. Decide whether to add Korean alt for screen readers
   that prefer ko-KR. Low priority until we hear from a real user.
3. **Background plate for scenes.** The existing SVGs put a solid
   soft-blue backdrop inside the illustration. For Imagen output with
   more detailed backgrounds, confirm the UI card's background still
   harmonizes — may need to widen `.mission-character img`'s
   `background` in global.css.
4. **Licensing trail.** Imagen output is ours under GCP terms, but
   document this in DEPLOY.md or LICENSE so there is a paper trail.
5. **Landing page hero vs in-app art.** The landing page (does not yet
   exist) might want a richer shared scene. Not in Phase 1.

## Acceptance criteria for implementation follow-up

When Phase 1 is done and this design has earned its keep:

- [ ] `app/frontend/public/assets/characters/robo.{png,webp}`,
      `dino.{png,webp}`, `bunny.{png,webp}` exist, each 1024 × 1024,
      targeting ~200 KB with a 350 KB hard cap.
- [ ] Paired `docs/ai-prompts/characters/<name>.prompt.md` committed.
- [ ] `MissionPage` renders the character portrait as a small avatar
      next to the character name, and degrades gracefully if the file
      is missing.
- [ ] No change to `DailyMission` or any shared contract.
- [ ] `pnpm test` green.
- [ ] At least one screenshot of the three characters together
      attached to the implementation PR so reviewers can confirm the
      "one world" feel before landing.
