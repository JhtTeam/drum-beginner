# Epic 1 Context: Luyện nhịp với Metronome

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Deliver a fully usable, publicly deployed metronome so the user can practice keeping time at 60–80 bpm from day one: beat dots synced to audio, accented beat 1, tap tempo, and keyboard shortcuts. This epic simultaneously lays the project foundation every later epic builds on — Vite/React scaffold, design tokens, navigation shell, the audio engine, and a Vercel deploy pipeline with a quality gate.

## Stories

- Story 1.1: Project scaffold, design tokens, nav, and deploy
- Story 1.2: MetronomeEngine — audibly accurate ticking
- Story 1.3: Complete MetronomeBlock — a genuinely usable metronome page

## Requirements & Constraints

- Metronome runs in-browser via Web Audio API: tempo range 40–200 bpm (default 60), start/stop, ±1 and ±5 bpm steps, tap tempo, time signatures 2/4, 3/4, 4/4 (default 4/4). No subdivision support yet — the engine only needs to leave room for it (`beatsPerBar` exists).
- Timing accuracy is measurable: each tick within ±2 ms of its scheduled time, no cumulative drift over 10 minutes. Lookahead scheduling against the audio clock is mandatory; plain `setInterval` for sound is forbidden.
- Ticking must survive a hidden tab: audio stays on beat while backgrounded, and visuals resync immediately (no frame pile-up) when the tab returns.
- Visual beat indicator is synced to sound with perceived lag ≤ 50 ms; beat 1 has a distinct accent sound. Audio is the source of truth — visuals follow beat events, never a parallel animation clock.
- The metronome must work as a standalone page in this epic; the same UI block will later be embedded inside exercise pages (Epic 2), so nothing may assume it only lives on one route.
- Sound never autoplays — audio starts only from an explicit user gesture.
- All UI text is Vietnamese (no i18n framework); drum terminology stays in English. Responsive from ~375 px to desktop with a single 768 px breakpoint. TypeScript strict throughout.
- Static site deployed free on Vercel; deep links to any route must not 404. A failing test must fail the production build.

## Technical Decisions

- **Stack (seed at scaffold time):** Node ≥ 22.12; scaffold with `npm create vite@latest -- --template react-ts` (Vite 8.1/Rolldown, React 19.2, TS 6.0 strict); react-router 8 declarative; Vitest 4.1; oxlint per starter default (no ESLint config); `@fontsource/be-vietnam-pro`.
- **Layering, one-way deps:** `app/` + `ui/` (shared React) → `features/*` (one folder per surface; features never import each other) → `core/` + `content/` (pure TS, no React imports). Anything shared between features drops to `ui/` or `core/`.
- **Audio engine:** `core/audio/` exports exactly ONE module-singleton instance `metronome: MetronomeEngine` and ONE `AudioContext` for the whole app (lazy-init on first user gesture; later shared by the drum-map sample player). Scheduling uses the lookahead pattern with the tick timer in a **Web Worker** (~25 ms tick, ~100 ms schedule-ahead against `AudioContext.currentTime`) because main-thread timers are throttled in hidden tabs. Engine emits beat events `{ bar, beatInBar, audioTime }` — the engine is the only counter; UI derives everything from the payload. `tap()` is an engine API (average of the last ≤5 tap intervals, resets after 2 s of silence). Tempo changes while running take effect from the next beat, without a stutter. React binds via `useSyncExternalStore`. Engine state (tempo, beats-per-bar, running) persists across route changes within a session; leaving a page calls `stop()` (suspend is allowed) — never `close()` the context.
- **Shared UI block:** one component `ui/MetronomeBlock` (transport, ±1/±5, tap, time-signature picker, BPM display, beat dots) composed by `features/metronome` now and `features/practice` later. Keyboard shortcuts (Space/↑/↓/Shift+↑/Shift+↓/T) are registered in a single hook `useMetronomeShortcuts` inside MetronomeBlock, which ignores events when focus is on another interactive element; no other keydown listeners for those keys anywhere.
- **Routes as constants:** 5 routes — `/`, `/lo-trinh`, `/bai-hoc/:id`, `/metronome`, `/tien-do` — defined once in `app/routes.ts`; all links reference the constants.
- **Styling:** design tokens map 1-1 from the UX design frontmatter into `styles/tokens.css` (CSS custom properties, original names kept); the 768 px breakpoint and responsive token overrides (e.g. pattern-letter 56→40 px) also live in `tokens.css` via media query. Components use only `var(...)` — no raw hex/px where a token exists. Plain CSS modules per component; no Tailwind/CSS-in-JS. `styles/global.css` solely owns `:focus-visible` (focus-ring token) and `prefers-reduced-motion`.
- **Assets self-hosted:** font bundled via @fontsource; metronome tick sounds in `public/sounds/`. YouTube is the only permitted CDN exception (later epics).
- **Deploy & quality gate:** Vercel static hosting with `vercel.json` rewriting `/(.*)` → `/index.html` (SPA fallback is not native); Vercel build command = `npm run check` = `tsc --noEmit` + oxlint + `vitest run` + `vite build`.
- **Testing:** `core/` requires unit tests — for this epic: tick schedule spacing per tempo (mocked AudioContext), mid-run tempo change effective from next beat, tap-tempo averaging and 2 s reset. Dates are ISO 8601 UTC strings; errors/results are returned explicitly, never thrown across the UI boundary.
- **Ops:** single production environment; deploy = git push; no env vars, no analytics.

## UX & Interaction Patterns

- **MetronomeBlock visuals:** BPM number 96 px amber, tabular-nums (so digits don't shift layout) with a "bpm" label; a row of beat dots where beat 1 is 1.4× size and the active dot turns amber-bright with glow (a sanctioned elevation exception); buttons −5 / −1 / start-stop / +1 / +5 / tap; time-signature picker; keyboard-shortcut hints rendered as `kbd`.
- **Shortcuts:** Space start/stop, ↑/↓ ±1, Shift+↑/↓ ±5, T tap. Shortcuts are accelerators only — every action has an on-screen button (mobile has no keyboard). Space must not double-fire when focus is on another button/input.
- **Nav shell:** sticky 60 px header on desktop ≥768 px (active item: bright text + 2 px amber underline); 56 px bottom tab bar on mobile <768 px with 4 items (Trang chủ · Lộ trình · Metronome · Tiến độ); the lesson page keeps "Lộ trình" active.
- **Global styling floor:** dark-stage look on `--surface-base`, Be Vietnam Pro font, visible focus ring on all interactive elements, touch targets ≥ 44 px, text contrast ≥ 4.5:1, beats never encoded by color alone.
- **Reduced motion:** with `prefers-reduced-motion`, the active beat dot only changes color — no scale/glow animation.
- **Placeholder pages** for all 5 routes render inside the shared layout in this epic; other epics fill them in.

## Cross-Story Dependencies

- Within the epic, strictly sequential: 1.1 (scaffold, tokens, nav, routes, deploy pipeline) → 1.2 (engine + minimal start/stop UI on `/metronome`) → 1.3 (full MetronomeBlock replacing the minimal UI).
- Epic 2 depends on this epic's outputs: `ui/MetronomeBlock` gets embedded in exercise pages (when mounted with an exercise: engine idle → set the exercise's starting tempo; engine running → keep current tempo), the practice pattern cursor consumes the engine's `{bar, beatInBar}` beat events, and the drum-map sample player reuses the single shared AudioContext.
- Epic 3 and all epics rely on the scaffold conventions from 1.1: layered deps, route constants, tokens.css, `npm run check` quality gate, and the deploy pipeline.
