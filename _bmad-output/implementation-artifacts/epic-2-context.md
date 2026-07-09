# Epic 2 Context: Học theo lộ trình Giai đoạn 1

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Deliver the learning content layer of the app: users browse a 3-week Phase 1 roadmap (Tuần 1–3), open each lesson to read short Vietnamese theory with step-by-step practice instructions, watch curated YouTube videos (Vietnamese first, English with Vietnamese summary notes), explore an interactive drum-kit diagram with sample sounds, and practice stick-control exercises (single stroke, double stroke, paradiddle) with an R/L pattern grid that runs in sync with the metronome embedded right in the lesson page. This epic turns the metronome foundation from Epic 1 into an actual guided course and proves the content-as-data architecture that later phases depend on.

## Stories

- Story 2.1: Phase 1 curriculum data + roadmap page + lesson page
- Story 2.2: YouTube videos in lessons
- Story 2.3: Interactive drum-kit diagram
- Story 2.4: Stick-control practice block in lessons

## Requirements & Constraints

- Roadmap shows Phase 1 as 3 weeks, each week an ordered list of lesson/exercise cards. Curriculum content per Phase 1 scope: stick grip, drum-kit parts, keeping time with metronome at 60–80 bpm, stick control.
- Curriculum is declarative data (TS files); adding a phase/week/item must require zero component changes — verified by structure review, not by actually building Phase 2.
- Each lesson: title, goal, short Vietnamese theory, embedded videos, step-by-step practice instructions. All UI/content in Vietnamese; drum terms stay in English with a Vietnamese gloss on first occurrence per lesson. Unknown lesson ID renders a single "Không tìm thấy bài" page with a link back to the roadmap.
- Videos: 1–n per lesson with VI/EN language badge; VI listed first (by data order — component never sorts); EN videos must carry an author-written Vietnamese summary note. YouTube iframes are click-to-load only (thumbnail + play button first); a removed/broken video shows a fallback message plus a YouTube search link — never an empty frame.
- The "Làm quen bộ trống" lesson embeds an interactive drum-kit diagram: 6 regions (snare, tom, kick, hi-hat, crash, ride); click shows name/role and plays a sample sound once (no loop); hover highlights only, no sound; no audio autoplay ever; audio-load failure degrades silently (highlight + panel still work).
- Stick-control exercises carry an R/L pattern, target tempo (e.g. "clean at 60 → build to 80") and technique notes, all displayed in the practice block. Pattern letters must be readable from ~2 m. The pattern cursor advances strictly on metronome beat events and loops until stop; changing tempo mid-run must not desync the cursor. (Recording "best tempo" is Epic 3, display only here.)
- The practice block embeds the shared metronome — this fulfills the "metronome embedded in an open exercise" requirement.

## Technical Decisions

- **Layering (one-way deps):** `core/` and `content/` are pure TS, never import React; `features/` never import each other — shared pieces live in `ui/` (components/hooks) or `core/` (logic). Epic 2 code lands in `features/roadmap`, `features/lesson`, `features/practice`, plus shared `ui/VideoEmbed`, `ui/DrumMap`, `ui/PatternGrid`.
- **Content-as-data:** one ID space `gd1-t2-b3` (phase–week–item) for every roadmap item; lessons and exercises are both `LessonItem`, distinguished by `kind`. Exercises/patterns are embedded inside items with no separate ID. Types (Phase/Week/LessonItem/Video) live in `core/types.ts`; curriculum in `content/phase-1.ts`; `content/index.ts` exports lookup APIs (`getItemById`, `getWeeks(phaseId)`) — features never walk the tree themselves. IDs are stable forever (they key the progress store).
- **Video type:** `{ youtubeId, lang: 'vi' | 'en', title, note?: string }` with `note` required when `lang: 'en'`. Only allowed CDN: YouTube — static thumbnail `i.ytimg.com/vi/<id>/hqdefault.jpg`, iframe mounted only after click.
- **Audio:** drum-map samples are self-hosted royalty-free files in `public/sounds/`, played through the app's single shared `AudioContext` owned by `core/audio` (lazy-init on user gesture; never `close()`). The pattern cursor consumes the engine's beat event `{bar, beatInBar, audioTime}` — UI never counts ticks itself; audio is the source of truth, visuals trail by ≤50ms.
- **Metronome embedding:** compose the existing `ui/MetronomeBlock` (from Epic 1) inside the practice block; do not build a second control surface or keyboard handler. Mount rule: engine idle → set tempo to the exercise's start tempo; engine already running → keep current tempo.
- **Routing/styling conventions:** navigate via constants in `app/routes.ts` (`/lo-trinh`, `/bai-hoc/:id`); all styling via `var()` tokens from `styles/tokens.css` (no raw hex/px for tokenized values); CSS modules, no Tailwind/CSS-in-JS; errors returned as explicit results, not thrown across layers.
- A verified initial video list exists in the PRD addendum (grip → Việt Thương/Tran Tin/Duy Phan; kit parts → Việt Thương/Soul/Trung Drum/Pong Ơi; metronome → GIAO DRUM + EN; stick control → Pong Ơi/Duy Phan/Drumeo) — use those exact youtubeIds in `content/phase-1.ts`.

## UX & Interaction Patterns

- **PatternGrid:** R cells amber, L cells teal — always with the letter, never color-only; 56px extra-bold letters (40px under 768px via token override); active cell gets overlay background + amber-bright outline; grid rows of 4–8 cells matching beats per bar.
- **VideoEmbed:** 16:9 frame on overlay surface, thumbnail + play button, VI/EN badge top-left (amber badge, dark text); EN summary note shown below the player.
- **DrumMap:** flat self-drawn SVG styled by the `drum-map` tokens (hover: amber stroke; active: amber-dim fill + amber-bright stroke; labels in secondary text color); info panel uses card style, right of the diagram on desktop, below on mobile.
- **Layout:** lesson page is single-column reading flow with breadcrumb (Lộ trình → Tuần N → Bài M). Practice block on desktop ≥768px: pattern + beat dots + BPM occupy ≥60% of viewport height, prose pushed below. Mobile <375–768px: tempo controls pinned at the bottom within thumb reach, pattern wraps 4 cells per row.
- Roadmap keeps the "Lộ trình" nav item active while on a lesson page (lessons have no own tab).
- Accessibility floor: keyboard access for all flows, focus ring on every interactive element, contrast ≥4.5:1, no meaning conveyed by color alone, `prefers-reduced-motion` disables scale/bounce (color change stays), touch targets ≥44px.
- A reference mockup exists for the lesson + practice page (`ux-designs/.../mockups/mock-bai-hoc-luyen-tap.html`); tokens/spec win over the mock on conflict.

## Cross-Story Dependencies

- Story 2.1 is the foundation: `core/types.ts` and `content/phase-1.ts` + lookup API are consumed by 2.2 (video data), 2.3 (drum-map lesson), and 2.4 (exercise patterns/tempos).
- All of Epic 2 builds on Epic 1 deliverables: scaffold/tokens/nav/routes (1.1), `core/audio` engine + beat events + shared AudioContext (1.2 — also used by DrumMap samples in 2.3), and `ui/MetronomeBlock` (1.3 — embedded in 2.4).
- Epic 3 consumes Epic 2's IDs and structure: progress store keys off `LessonItem` IDs, "next item" ordering follows roadmap order, and best-tempo recording attaches to the practice block built in 2.4. Keep IDs stable and the practice block open to a "record best tempo" affordance.
