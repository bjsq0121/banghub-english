# Character prompts

Source prompts that produced each canonical character portrait in
`app/frontend/public/assets/characters/`. Edit the prompt here first,
then regenerate the matching image.

Target tool: **Vertex AI Imagen 3** via Vertex AI Studio (Phase 1
interactive) or the Imagen 3 Generation API (Phase 2 scripted). See
`docs/superpowers/specs/2026-04-24-character-assets-design.md` for
full pipeline context.

## Pairing

| Prompt | Image |
| --- | --- |
| `robo.prompt.md` | `app/frontend/public/assets/characters/robo.{png,webp}` |
| `dino.prompt.md` | `app/frontend/public/assets/characters/dino.{png,webp}` |
| `bunny.prompt.md` | `app/frontend/public/assets/characters/bunny.{png,webp}` |

## Shared style preamble

Prepend this block to every character prompt so outputs feel like the
same world:

> Flat vector illustration for a preschool picture book. Soft airbrush
> shading with one highlight and one shadow per shape, no gradients
> beyond two stops. Clean 3–4 px outline in dark ink `#27313b`. Soft
> pastel palette anchored on sky blue `#dff5ff` and grass green
> `#87d070`. Warm, friendly, childlike, non-realistic. Subject
> centered, generous negative space, plain white background for
> portrait studies. Lighting from upper-left.

## Imagen 3 parameters

- Endpoint model: `imagegeneration@006` (or the current Imagen 3
  family) via Vertex AI.
- Aspect ratio: `1:1`.
- Sample count: 4, then curate down to one.
- Safety filter: `safe`.
- Prompt language: English.

## Acceptance

See
`docs/superpowers/specs/2026-04-24-character-assets-design.md`
"Acceptance criteria" — 1024×1024, ~200 KB target, 350 KB hard cap,
PNG or WebP.
