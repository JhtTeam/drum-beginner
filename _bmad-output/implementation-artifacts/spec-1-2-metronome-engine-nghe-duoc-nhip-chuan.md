---
title: 'Story 1.2: MetronomeEngine — audibly accurate ticking'
type: 'feature'
created: '2026-07-08'
status: 'done'
baseline_revision: '6a1b346fd69018781e54a80f069a0f19e9672078'
final_revision: '2ede5011910765e2426c9aa9d5a1d4a7664a9782'
review_loop_iteration: 0
followup_review_recommended: true
context:
  - '{project-root}/_bmad-output/implementation-artifacts/1-2-metronome-engine-nghe-duoc-nhip-chuan.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** The app has no audio engine — `/metronome` is a placeholder. Learners need a trustworthy tick source: accurate to the audio clock, uninterrupted when the tab is hidden, with an accented beat 1.

**Approach:** Build a framework-free `MetronomeEngine` in `src/core/audio/` (dependency-injected, fully unit-testable in node) using lookahead scheduling ("A Tale of Two Clocks": Web Worker timer ~25ms pumps a queue scheduled ~100ms ahead on `AudioContext.currentTime`). Export one module singleton, bind React via `useSyncExternalStore`, and replace the placeholder page with a minimal start/stop + tempo input UI.

## Boundaries & Constraints

**Always:**
- `core/` imports no React; `metronome-engine.ts` touches no `Worker`/`AudioContext` directly (deps injected via constructor; real wiring only in `core/audio/index.ts`).
- Sound is scheduled on the audio clock (`osc.start(t)`); the JS timer only pumps the queue — never emit sound directly in a timer callback (NFR-2 ±2ms).
- Tick timer lives in a Web Worker (main-thread timers are throttled ≥1s in hidden tabs — UX-DR13).
- AudioContext + Worker created lazily on first `start()` (user gesture / autoplay policy); `resume()` if suspended. `stop()` never calls `ctx.close()`. Engine state (tempo, beatsPerBar, running) persists across SPA route changes; `pagehide` → `stop()`.
- `getSnapshot()` returns a cached immutable object; new reference only on state change (else React render loop).
- Follow story-1.1 conventions: TDD red-green for unit tests, CSS only `var(--...)`, Vietnamese UI text inline, TS strict, paths via `ROUTES` constants.

**Block If:**
- A new npm dependency turns out to be required (`package.json` must not change).
- Satisfying an AC requires modifying `routes.ts`, `App.tsx`, `AppLayout.*`, `tokens.css`, or `global.css`.

**Never:**
- No MetronomeBlock UI, BPM display, beat dots, ±1/±5/Tap buttons, time-signature picker, or keyboard shortcuts (story 1.3 — no `keydown` listeners anywhere in 1.2).
- No subdivision, per-beat accents, tempo persistence to localStorage, drum sample player, or audio files (tick is synthesized via OscillatorNode: accent 880Hz, regular 440Hz, ~50ms gain envelope).
- Don't add `webworker` lib to shared tsconfig; keep the worker file typecheckable under DOM lib (local cast if needed).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Start at defaults | `start()` fresh engine | Ticks exactly 60/tempo apart from `currentTime + 0.05`; beat 1 of each bar accented; emits `{bar, beatInBar, audioTime}` (1-based) | No error expected |
| Tempo change mid-run | `setTempo(120)` while running | Already-scheduled ticks keep their times; new interval applies from next unscheduled beat — no stutter, no cancel | No error expected |
| Clamp | `setTempo(39)` / `setTempo(201)` | Clamped to 40 / 200 | Silent clamp, no throw |
| Tap tempo | 4 taps 500ms apart | tempo = 120 (avg of intervals, ≤5 last taps, via `setTempo` clamp); tap never auto-starts | No error expected |
| Tap after silence | >2000ms gap then tap | Buffer resets; new chain starts, old taps ignored | No error expected |
| Bar wrap | 4/4 running; `setBeatsPerBar(3)` | beatInBar wraps 1→beatsPerBar→1 correctly | No error expected |
| Hidden tab 60s | Tab backgrounded while running | Worker timer keeps pumping; audio uninterrupted, no burst on return | No error expected |
| Route change | Navigate away & back while running | Engine keeps running; UI re-reads correct snapshot | No error expected |
| No state change | `getSnapshot()` twice, nothing changed | Same object reference | No error expected |
| Stop | `stop()` | Ticker stopped, `isRunning=false`, tempo/beatsPerBar retained, `ctx.close()` never called | No error expected |

</intent-contract>

## Code Map

- `src/core/audio/metronome-engine.ts` -- NEW: engine class + `BeatEvent`/snapshot types; pure TS, DI constructor
- `src/core/audio/metronome-engine.test.ts` -- NEW: unit tests with fake deps (fake AudioContext/ticker/now)
- `src/core/audio/tick-worker.ts` -- NEW: minimal setInterval worker (`{type:'start',intervalMs}` / `{type:'stop'}`)
- `src/core/audio/index.ts` -- NEW: real wiring (Vite worker URL syntax), lazy init, `export const metronome`, pagehide hook
- `src/ui/useMetronome.ts` -- NEW: `useSyncExternalStore` hook (reused by story 1.3)
- `src/features/metronome/MetronomePage.tsx` -- UPDATE: placeholder → start/stop button ("Bắt đầu"/"Dừng") + tempo number input (40–200)
- `src/core/.gitkeep`, `src/ui/.gitkeep` -- DELETE once real files exist
- `vite.config.ts`, `package.json` -- READ-ONLY: vitest env `node`, include `src/**/*.test.{ts,tsx}`; `check` = tsc -b + oxlint src + vitest run + vite build

## Tasks & Acceptance

**Execution:**
- [x] `src/core/audio/metronome-engine.test.ts` -- write failing tests first (red): tick spacing per tempo without cumulative drift; mid-run tempo change effective next beat; tap averaging/reset/5-cap; beatInBar wrap incl. beatsPerBar change; accent on beat 1; setTempo clamp; stop() never closes ctx; snapshot reference stability -- AC-3 floor plus story extras
- [x] `src/core/audio/metronome-engine.ts` -- implement engine to green: DI constructor (`createAudioContext`, `createTicker`, `now`), lookahead scheduler loop, `scheduleClick(time, isAccent)` (osc+gain envelope), `start/stop/setTempo/setBeatsPerBar/tap/subscribe/getSnapshot/onBeat`, `currentTime` getter -- core logic, testable in node
- [x] `src/core/audio/tick-worker.ts` -- minimal message-driven setInterval worker -- unthrottled tick source
- [x] `src/core/audio/index.ts` -- real deps wiring, lazy creation at first start(), suspended→resume(), singleton export, `pagehide` → stop(); delete `src/core/.gitkeep` -- AR-4 single instance
- [x] `src/ui/useMetronome.ts` -- hook wrapping `useSyncExternalStore(metronome.subscribe, metronome.getSnapshot)`; delete `src/ui/.gitkeep` -- shared with 1.3
- [x] `src/features/metronome/MetronomePage.tsx` -- minimal UI: start/stop + `<input type="number" min={40} max={200}>`; token vars only; Vietnamese text -- exercises AC-1/AC-2 (also added `MetronomePage.module.css` — CSS module per component is the architecture convention)

**Acceptance Criteria:**
- Given the app runs in a browser, when the user clicks "Bắt đầu" on `/metronome`, then the AudioContext is lazily created in that gesture and ticking starts (default 60 bpm, 4/4) with beat 1 audibly accented.
- Given the metronome is running, when the tab is hidden for 60s and shown again, then ticking never stuttered or bunched and the UI is consistent on return.
- Given the metronome is running, when the user navigates to another route and back, then it is still running with the same tempo/beatsPerBar and the UI reflects it.
- Given the test suite, when `npm run check` runs, then tsc, oxlint, vitest (all engine tests), and vite build (including worker bundling) all pass.

## Spec Change Log

## Review Triage Log

### 2026-07-08 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 8: (high 0, medium 3, low 5)
- defer: 1: (high 0, medium 0, low 1)
- reject: 6
- addressed_findings:
  - `[medium]` `[patch]` Scheduler had no catch-up guard: after a large clock jump (device sleep, stalled worker) `pump()` burst-scheduled every missed beat in the past (machine-gun clicks). Added `CATCH_UP_THRESHOLD_SEC = 0.25` snap-forward + 2 unit tests (large jump skips missed beats; small stall still plays continuously).
  - `[medium]` `[patch]` A throwing beat/snapshot listener aborted `pump()` before `nextNoteTime` advanced, re-scheduling the same beat every 25ms. Wrapped listener dispatch in try/catch (both channels) + unit test.
  - `[medium]` `[patch]` Tempo input clamped per keystroke, making e.g. 45 untypeable ("4"→40, then "405"→200) and desyncing on cleared input. Reworked to local draft state: live-commit only in-range values, clamp+resync on blur, `step={1}`.
  - `[low]` `[patch]` `resume()` only handled `'suspended'` (missed iOS `'interrupted'`) and discarded a rejectable promise. Now `state !== 'running'` + `.catch` swallow.
  - `[low]` `[patch]` Module-level `window.addEventListener('pagehide')` crashed any node-env import of `core/audio`. Guarded with `typeof window !== 'undefined'`.
  - `[low]` `[patch]` Worker had no `error` listener (silent never-ticking metronome on load failure) and fed unvalidated `intervalMs` to `setInterval` (NaN/0 → message flood). Added error logging + finite/≥1 guard.
  - `[low]` `[patch]` `setBeatsPerBar` had no runtime guard (0/NaN/7 from future JS callers → nonsense bars) and `setTempo` accepted fractional bpm inconsistent with `tap()` rounding. Added 2|3|4 guard + `Math.round` + unit tests.
  - `[low]` `[patch]` Toggle label swap "Bắt đầu"↔"Dừng" shifted layout of the adjacent tempo field. Added `min-width: 7em`.

## Design Notes

- Scheduler loop per worker tick: `while (nextNoteTime < ctx.currentTime + 0.1) { advance beat; scheduleClick; emit event; nextNoteTime += 60/tempo }`. Tempo change only alters the increment — max ~1 beat is pre-queued (100ms < 300ms at 200bpm), so it takes effect next beat naturally.
- `start()`: `bar=1, beatInBar=0`, `nextNoteTime = ctx.currentTime + 0.05`, ticker.start(25).
- `tap()`: `now - last > 2000` → buffer=[now]; else push & keep last 5; if ≥2: `setTempo(round(60000 / avgInterval))`.
- Beat events are emitted at schedule time (up to ~100ms early) — payload carries `audioTime`; visual compensation is story 1.3's job.
- Fake deps in tests: AudioContext stub with manually-set `currentTime` recording `osc.start(t)`/frequency; ticker with manual `fire()`; injected `now()`. No jsdom, no module mocks, no `@testing-library/react`.

## Verification

**Commands:**
- `npx vitest run src/core/audio` -- expected: new engine tests red before implementation, green after
- `npm run check` -- expected: exit 0 (tsc -b, oxlint src, vitest run, vite build incl. worker)

**Manual checks (if no CLI):**
- `npm run dev`: start → even ticks, accent audible; hide tab 60s → no stutter/burst; change tempo while running → smooth from next beat; navigate to `/lo-trinh` and back → still running, UI correct; reload → defaults 60/4/4.
- After push: Vercel production deploy green (build = `npm run check`).

## Auto Run Result

Status: done (implementation + adversarial review complete; committed `2ede501`, not pushed)

**Summary:** Story 1.2 implemented — framework-free `MetronomeEngine` in `src/core/audio/` with lookahead scheduling (Web Worker 25ms ticker, 100ms schedule-ahead on the audio clock), accented beat 1 (880/440Hz synthesized clicks), tempo clamp 40–200 effective from the next beat, tap tempo, immutable snapshots for `useSyncExternalStore`, lazy singleton AudioContext at first user gesture, `pagehide` → `stop()` (never `close()`), plus the minimal start/stop + tempo-input UI on `/metronome`.

**Files changed:**
- `../../src/core/audio/metronome-engine.ts` — engine class, DI, scheduler, catch-up guard
- `../../src/core/audio/metronome-engine.test.ts` — 24 unit tests, pure fake deps (node env)
- `../../src/core/audio/tick-worker.ts` — message-driven setInterval worker, intervalMs guard
- `../../src/core/audio/index.ts` — real wiring, singleton export, worker error listener, pagehide
- `../../src/ui/useMetronome.ts` — `useSyncExternalStore` binding hook
- `../../src/features/metronome/MetronomePage.tsx` — placeholder → minimal UI (draft-commit tempo input)
- `../../src/features/metronome/MetronomePage.module.css` — token-only styles
- `src/core/.gitkeep`, `src/ui/.gitkeep` deleted; story/sprint-status artifacts synced to `review`

**Review breakdown:** 2 parallel reviewers (adversarial + edge-case). 8 patches applied (3 medium: scheduler catch-up guard against post-sleep click bursts; listener exception isolation; tempo-input rework so mid-range values are typeable — 5 low: resume() non-running states + rejection, `typeof window` guard, worker error listener + intervalMs validation, setBeatsPerBar guard + integer bpm rounding, toggle min-width). 1 deferred (master gain stage for the shared AudioContext — matters at story 2.3, logged in deferred-work.md). 6 rejected as noise. No intent gaps, no spec repairs — zero loopbacks.

**Follow-up review recommended: true** — the review pass changed core engine scheduling behavior (catch-up threshold semantics) and reworked the UI input's commit model; an independent pass over `2ede501` would be cheap insurance.

**Verification performed:** red-green TDD (suite failed before implementation); `npx vitest run src/core/audio` 24/24; `npm run check` exit 0 (tsc -b, oxlint src, 32/32 tests, vite build with worker bundled); all referenced CSS tokens verified present in tokens.css.

**Residual risks:** browser-only behaviors (audible accent, hidden-tab 60s continuity, cross-route persistence, iOS resume) are implemented per the verified mechanisms and unit-tested at engine level but not yet human-verified in a real browser; production deploy not pushed. Story Task 5's two manual subtasks remain open in the story file.
