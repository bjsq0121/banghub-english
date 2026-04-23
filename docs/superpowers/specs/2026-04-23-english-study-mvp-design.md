# English Study MVP Design

- Date: 2026-04-23
- Project root: `/mnt/c/devProject/banghub-english`
- Product type: English study web/app MVP
- Deployment target: `banghub.kr` subdomain, delivered first as a PWA-style responsive web app

## 1. Goal

Build a lightweight English study MVP that makes users return daily for at least 10 minutes.

The first release serves two distinct study tracks in one product:

- Business conversation for office workers
- Short-form English news reading

The product must feel like one service with a shared daily habit loop, while keeping the two tracks clearly separated in menu structure and content flow.

## 2. Success Metric

Primary success metric:

- Daily repeat usage of at least 10 minutes

This means the MVP should optimize for habit formation and fast re-entry, not for deep one-time exploration or monetization.

## 3. Product Strategy

Recommended approach selected during brainstorming:

- Routine-first two-track hub

Key product principles:

- Show a clear daily routine on the home screen
- Keep the two tracks separated in navigation and learning flow
- Allow broad anonymous browsing
- Require login only when persistence or personalization starts
- Keep the learning engine rule-based and template-driven in the MVP
- Design the content pipeline so it can later expand with Vertex AI Gemini, n8n, and GCP

## 4. Users and Scope

Primary target users:

- Office workers who want practical conversation practice
- Users who want short English news reading practice

The first MVP intentionally supports both tracks in one release.

Out of scope for the first MVP:

- Open-ended AI tutoring
- Speech recognition
- Detailed progress analytics
- Payment and subscription billing
- Deep recommendation systems

## 5. Core Experience

The core daily loop is:

- Today’s Conversation: 1 item
- Today’s News: 1 item

The product should make it obvious that a user can come in, complete both items, and leave with a sense of completion.

The home screen should emphasize:

- Today’s conversation item
- Today’s news item
- Current streak or routine continuity
- Selected difficulty level

The product should avoid overwhelming users with a large content library in the first release.

## 6. Information Architecture

The service uses a shared hub with separate track menus.

Shared areas:

- Home
- Login / account
- Difficulty selection
- Progress summary based on completion state

Conversation track areas:

- Today’s conversation
- Track-specific item detail

News track areas:

- Today’s news
- Track-specific item detail

Design rule:

- Shared shell, shared account, shared habit loop
- Separate content structure, screen flow, and labels per track

## 7. Anonymous and Logged-In Experience

Anonymous users can:

- Browse most of the product
- View the structure of both tracks
- Try sample or current learning items

Login is required for:

- Saving completion state
- Keeping a daily streak or routine continuity
- Persisting selected difficulty
- Persisting track-related preferences

This supports low-friction entry while still creating a reason to sign in after initial interest.

## 8. Personalization

Personalization is intentionally minimal in the first MVP.

Included:

- Track choice
- Difficulty choice

Difficulty levels:

- Intro
- Basic
- Intermediate

Not included in the MVP:

- Topic preference
- Job-domain personalization
- Dynamic recommendations

## 9. Conversation Track Design

Primary learning format:

- Prompt-response roleplay

Each conversation item should contain:

- A short situation setup
- A user prompt or scenario cue
- A model answer or acceptable response pattern
- One or more alternative expressions
- TTS playback for the target expressions

Interaction style:

- The learner reads the situation
- The learner thinks or types a response
- The product reveals the target answer and alternatives
- The learner listens using TTS
- The learner marks the item complete

The MVP does not need free-form AI grading. Content quality and consistency come from templates and pre-authored answer patterns.

## 10. News Track Design

Primary content format:

- Short in-house news reading passages

Each news item should contain:

- A short news passage created by the operator
- Key vocabulary or expressions
- A concise meaning check or understanding question
- TTS playback for the text or key sentences

Reason for this choice:

- Avoid copyright complications
- Keep content length and difficulty controlled
- Reduce dependency on external publishers and unstable page structures

## 11. Learning Engine

The MVP learning engine is:

- Rule-based
- Template-driven

Why this is the right fit for the first release:

- Faster to implement
- Easier to operate consistently
- Lower risk of confusing or low-quality AI output
- Easier to test and debug
- Clear path to later AI-assisted expansion

The product should be architected so template generation and content operations can later be assisted by Gemini without changing the user-facing learning loop.

## 12. Audio Scope

Audio support in the MVP:

- TTS playback only

Not included:

- Microphone input
- Pronunciation scoring
- Voice-based roleplay

This keeps complexity low while still adding value to both conversation and news reading.

## 13. Data Model Scope

Persist only the minimum needed to support the daily routine.

User profile:

- Account identifier
- Selected difficulty
- Selected track state

Learning state:

- Completion state for each daily item

Do not store in MVP:

- Detailed right/wrong history
- Session duration analytics
- Fine-grained answer attempts
- Complex mastery models

This keeps both engineering and product scope aligned with the daily habit goal.

## 14. Content Operations

Initial operating model:

- Semi-automated generation with manual review

Operator workflow:

- Generate a draft from conversation/news templates
- Review and edit the content manually
- Assign difficulty
- Mark the item as today’s content
- Publish

This creates a practical bridge to the future target stack:

- Vertex AI Gemini for first-draft generation
- n8n for workflow orchestration
- GCP-hosted services and storage

The MVP should support the workflow conceptually, even if the first implementation stays lightweight.

## 15. Admin Requirements

The admin area only needs the minimum features required to keep the routine alive.

Required admin capabilities:

- Create content
- Edit content
- Set track and difficulty
- Set publish status
- Mark content as today’s conversation or today’s news

Not required in MVP:

- Multi-admin approval flows
- Editorial analytics
- Advanced scheduling
- Automated AI quality evaluation

## 16. Deployment Direction

First release format:

- Responsive web app with PWA-level packaging

Deployment assumptions:

- Served from a `banghub.kr` subdomain
- Mobile-friendly first
- Installable to home screen where supported

The initial architecture should avoid tight coupling to a specific temporary hosting setup so migration into the future GCP stack stays straightforward.

## 17. Future Expansion Path

Planned later integrations:

- Vertex AI Gemini
- n8n
- GCP services

Recommended expansion order after MVP validation:

1. AI-assisted draft generation for conversation and news content
2. Workflow automation for review and publishing
3. Richer personalization
4. Voice input and spoken feedback
5. Monetization options

This order preserves the MVP focus on repeat usage before adding expensive or operationally heavy systems.

## 18. Error Handling and Edge Cases

The MVP should handle basic failure cases cleanly:

- If today’s content is missing, show a clear fallback state instead of a broken screen
- If TTS fails, keep text-based learning usable
- If the user is anonymous, clearly explain why completion is not saved
- If difficulty is not selected yet, ask for it before personalizing the home screen

The product should prefer stable fallback behavior over partial smart behavior.

## 19. Testing Focus

Testing should focus on the habit loop and operational stability.

Priority coverage:

- Home screen correctly surfaces today’s two items
- Anonymous browsing works
- Login gates persistence, not discovery
- Completion state saves correctly
- Difficulty selection changes content targeting behavior
- Admin publishing correctly updates today’s items
- TTS controls degrade safely when unavailable

The first implementation does not need complex AI evaluation tests because the MVP avoids AI-dependent runtime behavior.

## 20. Delivery Summary

The first MVP is a routine-first English study hub with two clearly separated tracks:

- Business conversation roleplay
- Short-form news reading

It is optimized for:

- Fast daily re-entry
- Minimal friction before login
- Lightweight persistence
- Controlled content quality
- Future compatibility with Gemini, n8n, and GCP

The product should feel simple, structured, and operationally sustainable from day one.
