---
title: 'Story 1.3: Complete MetronomeBlock — a genuinely usable metronome page'
type: 'feature'
created: '2026-07-08'
status: 'in-review'
baseline_revision: '20e16c2f3c5ace7aced263af399c352d74a65b6d'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/1-3-metronome-block-hoan-chinh-trang-metronome-dung-duoc-that.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** `/metronome` still shows story 1.2's minimal placeholder (start/stop + number input). The engine is done, but there is no usable practice UI: no giant BPM display readable from 2m, no beat dots synced to audio, no ±1/±5/tap controls, no time-signature picker, no keyboard shortcuts.

**Approach:** Build the shared `ui/MetronomeBlock` component (AD-8): 96px amber tabular-nums BPM display, beat-dot row driven by engine beat events with audio-time compensation, transport buttons, 2/4·3/4·4/4 picker, tap tempo, and a single `useMetronomeShortcuts` hook whose decision logic lives in a pure, node-testable resolver. Compose it into `MetronomePage`, replacing the 1.2 UI entirely.

## Boundaries & Constraints

**Always:**
- `MetronomeBlock` lives in `src/ui/` (features/practice reuses it in 2.4), takes NO props in this story, reads state only via existing `useMetronome()` and commands the existing `metronome` singleton from `../core/audio` public entry (no deep imports).
- Visual beat position comes ONLY from `onBeat` events, delay-compensated with `delayMs = max(0, (event.audioTime - metronome.currentTime) * 1000)` and ONE pending `setTimeout` (new event replaces old via clearTimeout). No rAF loops, no tempo-driven CSS animations, no UI-side tick counting (AD-3).
- `useMetronomeShortcuts` registers ONE window `keydown` listener in a `useEffect` with `[]` deps, reads `metronome.getSnapshot()` inside the handler (no stale closures), and is the only keydown registration in the codebase; called only inside MetronomeBlock. Pure decision logic in `src/ui/metronome-shortcuts.ts` (no React, no DOM types).
- Shortcut rules: null when target is interactive (INPUT/TEXTAREA/SELECT/BUTTON/A/contentEditable) or ctrl/meta/alt held; Space→toggle, ↑/↓→±1, Shift+↑/↓→±5, t/T→tap; key `repeat` allowed for the 4 tempo actions, blocked for toggle and tap. `preventDefault()` only when an action resolves.
- CSS module uses only `var(--token)` values (all needed tokens already exist in tokens.css); the two sanctioned raw values: "bpm" label ~20px and active-dot glow `box-shadow: 0 0 16px <amber>`. Accent dot (beat 1) scale 1.4 always; active-dot scale/glow wrapped in `@media (prefers-reduced-motion: no-preference)`, color change outside it.
- Unmount cleans up subscription + timer but does NOT stop the engine (state persists across routes); `isRunning` false → clear timer + no active dot.
- TDD red-green for the resolver; `verbatimModuleSyntax` (use `import type`); Vietnamese UI text inline; keep named export `MetronomePage`.

**Block If:**
- A new npm dependency turns out to be required (`package.json` must not change; `@testing-library/react` stays deferred).
- Satisfying an AC requires modifying anything in `src/core/`, `app/routes.ts`, `App.tsx`, `AppLayout.*`, `tokens.css`, or `global.css`.

**Never:**
- No PatternGrid, target tempo, best-tempo recording, or mount-with-exercise props (stories 2.4/3.3). No tempo/beatsPerBar persistence to localStorage (3.1). No subdivision/per-beat accents. No number input for tempo (UX-DR4 removes it — tap + ±5 covers it). No skip-link work (stays deferred). No master gain stage (deferred to 2.3). No new tokens in tokens.css.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Render idle | `/metronome` loads, engine idle | BPM number + "bpm" label, beatsPerBar dots (none active, accent dot larger), transport −5/−1/▶/+1/+5, Tap, 2/4·3/4·4/4 picker, kbd hints | No error expected |
| Beat sync | Engine running, beat event `{beatInBar, audioTime}` | Active dot switches after compensated delay, in sync with audible tick (≤50ms perceived) | No error expected |
| Rapid events / hidden tab | New beat event while timer pending; tab hidden 60s then shown | New event clearTimeouts the old one — no pile-up; on return visuals catch up within ≤1 beat, no replay | No error expected |
| Shortcut on interactive target | Space pressed while a button has focus | Resolver returns null; native button click only — no double-fire; page does not scroll | Handled by resolver |
| Modifier held | Ctrl/Cmd/Alt + any shortcut key | null — browser shortcuts (Cmd+T) not hijacked | Handled by resolver |
| Key repeat | Held ↑ / held Space | ↑ keeps stepping tempo; Space toggles once only; tap ignores repeat | Handled by resolver |
| Tempo bounds | +5 at 198 / −1 at 40 | Engine clamps to 200 / 40; UI just calls `setTempo(tempo±n)`; layout never shifts (tabular-nums + reserved width) | Engine clamps silently |
| beatsPerBar change while running | Click 3/4 during 4/4 run | Dots re-render to 3; stale active index beyond range simply renders no active dot for ≤1 beat | Render guard `index === activeBeat` |
| Stop / navigate away | `stop()` or route change while running | Stop: no dot active, dots still visible. Route change: engine keeps running; return reflects true state | No error expected |
| Reduced motion | `prefers-reduced-motion: reduce` | Active dot changes color only — no scale/glow | Media query variant |

</intent-contract>

## Code Map

- `src/ui/metronome-shortcuts.ts` -- NEW: `ShortcutAction` type + pure `resolveShortcutAction(input)` (key, shiftKey, ctrl/meta/alt, repeat, isInteractiveTarget)
- `src/ui/metronome-shortcuts.test.ts` -- NEW: unit tests, vitest node env (no DOM)
- `src/ui/useMetronomeShortcuts.ts` -- NEW: single window keydown listener; computes isInteractiveTarget from event.target; dispatches to metronome singleton
- `src/ui/MetronomeBlock.tsx` -- NEW: shared block (BPM display, beat dots, transport, picker, tap, kbd hints); onBeat subscription + compensated single-timer active-dot state
- `src/ui/MetronomeBlock.module.css` -- NEW: token-only styles; reduced-motion variant for dot scale/glow
- `src/features/metronome/MetronomePage.tsx` -- UPDATE: replace 1.2 UI with `<h1>Metronome</h1>` + `<MetronomeBlock />`; keep named export
- `src/features/metronome/MetronomePage.module.css` -- UPDATE: centered page layout, remove old controls styles
- `src/ui/useMetronome.ts`, `src/core/audio/index.ts` -- READ-ONLY: snapshot hook; `metronome`, `TEMPO_MIN/MAX`, `BeatEvent`, `MetronomeSnapshot`
- `_bmad-output/implementation-artifacts/deferred-work.md` -- UPDATE: mark composite bpm-display token item resolved (consumed via role tokens); skip-link stays

## Tasks & Acceptance

**Execution:**
- [x] `src/ui/metronome-shortcuts.test.ts` -- write failing tests first (red): all 6 key mappings; Shift+Space still toggles; isInteractiveTarget blocks all; ctrl/meta/alt block; repeat blocks toggle/tap but allows tempo±; unknown keys → null -- AC-3 logic floor (28 tests, genuine red before resolver existed)
- [x] `src/ui/metronome-shortcuts.ts` -- implement pure resolver to green -- single-owner shortcut semantics (AD-8)
- [x] `src/ui/useMetronomeShortcuts.ts` -- hook: one keydown listener, `[]` deps, snapshot read inside handler, preventDefault on resolved action, dispatch toggle/tempo±n/tap -- AC-3 wiring
- [x] `src/ui/MetronomeBlock.tsx` + `src/ui/MetronomeBlock.module.css` -- component per UX-DR4 (structure/order per story Dev Notes "Layout"; dots row `aria-hidden`, ± buttons `aria-label`, picker `aria-pressed`, toggle min-width, tabular-nums + reserved width) + beat-event visual sync (Task-4 timer semantics) + reduced-motion variant -- AC-1, AC-2
- [x] `src/features/metronome/MetronomePage.tsx` + `.module.css` -- compose block, delete draft-commit input UI entirely -- AC-1
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- close composite bpm-display token item -- housekeeping owed by this story

**Acceptance Criteria:**
- Given `/metronome` renders, when viewed idle or running, then it shows all UX-DR4 elements (96px amber tabular BPM + "bpm", dots with 1.4× accent, −5/−1/toggle/+1/+5, Tap, 2/4·3/4·4/4, kbd hints) and BPM changes 60→200 never shift layout.
- Given the metronome is running, when observing dots vs sound, then the active dot follows engine beat events within ≤50ms perceived, survives hidden-tab throttling without replay, and under reduced-motion only changes color.
- Given focus is not on an interactive element, when pressing Space/↑/↓/Shift+↑/↓/T, then toggle/±1/±5/tap fire exactly once (no double-fire when focus is on a button; browser modifier combos untouched), and every action is also reachable via on-screen ≥44px buttons.
- Given the suite, when `npm run check` runs, then tsc, oxlint, vitest (32 existing + new resolver tests), and vite build all pass.

## Spec Change Log

## Review Triage Log

### 2026-07-08 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 4: (high 0, medium 1, low 3)
- defer: 3: (high 0, medium 1, low 2)
- reject: 6
- addressed_findings:
  - `[medium]` `[patch]` Transport/picker/tap buttons lacked `user-select: none` + `touch-action: manipulation` — rapid tap-tempo clicks selected label text on desktop and risked double-tap zoom on iOS Safari. Added both properties to `.toggleButton`, `.secondaryButton`, `.pickerButton`.
  - `[low]` `[patch]` Toggle glyphs `■`/`▶` polluted the accessible name ("black square Dừng"). Wrapped glyph in `<span aria-hidden="true">`; SR now reads only "Dừng"/"Bắt đầu".
  - `[low]` `[patch]` `.dots` reserved only vertical room while the accent dot scales 1.4× in both axes, painting ~4px past the row's horizontal edges. Added horizontal padding `var(--spacing-1)`.
  - `[low]` `[patch]` Active-dot glow hard-coded `rgba(255, 201, 77, 0.5)`, silently duplicating `--color-amber-bright`'s channels — palette drift risk. Replaced with `color-mix(in srgb, var(--beat-dot-active-color) 50%, transparent)`.

## Design Notes

- Beat compensation: `onBeat` fires at schedule time, up to ~100ms early; `metronome.currentTime` getter exists precisely for `delayMs = max(0,(event.audioTime - currentTime)*1000)`. One pending-timer ref; replace-on-new-event is the UX-DR13 no-pile-up mechanism (at 40–200 bpm the beat interval 300–1500ms exceeds the 100ms lookahead, so overlap only occurs in catch-up bursts, where dropping intermediate dots is correct).
- Reduced-motion: global.css only zeroes animation/transition durations — it cannot strip a static `transform: scale`/`box-shadow` on the active class. Sanctioned exception (reconcile-ux GAP-3): wrap scale+glow in `@media (prefers-reduced-motion: no-preference)` inside `MetronomeBlock.module.css`; color change lives outside.
- Token gotchas from investigation: `--button-secondary-*` has no hover token (skip or reuse existing tokens); spacing scale has gaps (1,2,3,4,6,8,12 only); glow composed from `--color-amber`/`--color-amber-bright` raw rgba is the sanctioned one-off. oxlint `react/only-export-components` warns if `MetronomeBlock.tsx` exports non-components — keep hook/resolver in their own files.
- kbd hint row may be hidden <768px (mobile has no keyboard) — the only allowed breakpoint.

## Verification

**Commands:**
- `npx vitest run src/ui` -- expected: resolver tests red before implementation, green after
- `npm run check` -- expected: exit 0 (tsc -b, oxlint src, vitest run 32+new, vite build)

**Manual checks (if no CLI):**
- `npm run dev` on `/metronome`: BPM 96px amber, 60→200 no layout shift; running → active dot matches tick audibly, beat 1 bigger dot + higher pitch; all 6 shortcuts work; click toggle by mouse then Space → single toggle; Tab shows amber focus ring; switch to 3/4 while running → 3 dots, no beat glitch; DevTools reduced-motion → color-only; hide tab 60s → dot catches up instantly on return; 375px viewport: all actions via buttons ≥44px; navigate away and back while running → UI reflects engine state.
- After push: Vercel production deploy green.

## Auto Run Result

Status: done (implementation + adversarial review complete; committed, not pushed)

**Summary:** Story 1.3 implemented — the full shared `ui/MetronomeBlock` now powers `/metronome`: 96px amber tabular-nums BPM display with "bpm" label, beat-dot row driven exclusively by engine beat events with audio-time delay compensation (single replaceable pending timer — no frame pile-up on hidden tabs), transport −5/−1/toggle/+1/+5 + Tap tempo, 2/4·3/4·4/4 picker with `aria-pressed`, kbd shortcut hints (hidden <768px), and the single-owner keyboard-shortcut stack: pure node-tested resolver (`resolveShortcutAction`) + one window keydown hook (`useMetronomeShortcuts`). Story 1.2's minimal page UI (number input + draft-commit logic) was deleted per UX-DR4.

**Files changed:**
- `../../src/ui/metronome-shortcuts.ts` — pure shortcut resolver (no React/DOM); modifier/repeat/interactive-target semantics
- `../../src/ui/metronome-shortcuts.test.ts` — 28 unit tests (red-green TDD, node env)
- `../../src/ui/useMetronomeShortcuts.ts` — single window keydown listener, `[]` deps, snapshot read in-handler
- `../../src/ui/MetronomeBlock.tsx` — shared block per AD-8; beat-event visual sync with delay compensation
- `../../src/ui/MetronomeBlock.module.css` — token-only styles; reduced-motion gating for glow; touch/select hardening
- `../../src/features/metronome/MetronomePage.tsx` — now composes `<MetronomeBlock />` only (named export kept)
- `../../src/features/metronome/MetronomePage.module.css` — centered page layout, old controls styles removed
- `deferred-work.md` — composite bpm-display token item closed; 3 new deferred entries from review

**Review breakdown:** 2 parallel reviewers (adversarial + edge-case), 13 deduplicated findings. 4 patches applied (1 medium: `user-select: none` + `touch-action: manipulation` on rapid-click buttons — 3 low: glyph excluded from toggle's accessible name, horizontal padding for the 1.4× accent dot, glow color derived via `color-mix` from the token instead of a hard-coded rgba). 3 deferred (shortcuts inert while a button holds focus — faithful to the intent contract's blanket block, relaxing it is a product decision; no aria-live announcement of tempo changes; tokens.css header comment vs sanctioned component media query doc drift). 6 rejected as noise (silent clamp at 40/200 is spec-documented behavior, duplicated dispatch is spec-prescribed structure, label-in-name pedantry, hypothetical interactive elements, impossible multi-instance mount, hidden-tab dot within accepted ≤1-beat catch-up tolerance). No intent gaps, no spec repairs — zero loopbacks.

**Follow-up review recommended: false** — the review pass produced only 4 localized, low-consequence fixes (CSS interaction hardening + one aria span); no behavioral or API changes.

**Verification performed:** genuine red-green TDD (`npx vitest run src/ui` failed before the resolver existed, 28/28 after); `npm run check` exit 0 before and after review patches (tsc -b, oxlint src clean, vitest 60/60 = 32 existing + 28 new, vite build); grep confirms `useMetronomeShortcuts` holds the codebase's only Space/↑/↓/T keydown registration; all referenced tokens verified present in tokens.css; `src/core/` untouched.

**Residual risks:** browser-perception behaviors (≤50ms dot-to-sound sync, hidden-tab catch-up feel, reduced-motion emulation, iOS touch behavior) are implemented per the verified mechanisms but not yet human-verified in a real browser; production deploy not pushed (story Task 7's push + Vercel verify remains a human step). Keyboard shortcuts are intentionally inert while focus rests on a button (see deferred entry) — expected to surface in manual testing.
