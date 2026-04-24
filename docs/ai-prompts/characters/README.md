# Character prompts

Source prompts that produced each canonical character portrait in
`app/frontend/public/assets/characters/`. Edit the prompt here first,
then regenerate the matching image.

Target tool: **Vertex AI Imagen 3** via Vertex AI Studio (Phase 1
interactive) or the Imagen 3 Generation API (Phase 2 scripted). See
`docs/superpowers/specs/2026-04-24-character-assets-design.md` for
full pipeline context.

## Pairing

| Prompt | Image (current) | Image (target) |
| --- | --- | --- |
| `robo.prompt.md` | `robo.svg` (stopgap) | `robo.{png,webp}` |
| `dino.prompt.md` | `dino.svg` (stopgap) | `dino.{png,webp}` |
| `bunny.prompt.md` | `bunny.svg` (stopgap) | `bunny.{png,webp}` |

All under `app/frontend/public/assets/characters/`.

### Why SVG is the current state

The three files shipping today are hand-authored SVGs that follow the
design guide palette and silhouette targets. They render crisp at the
64–96 px avatar display size and keep the app self-consistent until a
human curator regenerates them via Vertex AI Imagen 3 (see the
acceptance criteria in the design doc for the final PNG/WebP targets).

Replacement flow when Imagen output is ready:

1. Drop `robo.png` (or `.webp`) into `app/frontend/public/assets/characters/`.
2. Edit `app/frontend/src/lib/characters.ts`: change the `.svg`
   extension in the helper map to `.png` (or `.webp`). One-line per
   character.
3. Delete the old `.svg` stopgap.

See also `preview.svg` in this directory — a composite rendering of
the three stopgap portraits on the shared palette for one-world
consistency checking.

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
