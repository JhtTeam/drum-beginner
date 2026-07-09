---
title: 'Story 2.1: Phase 1 curriculum data + Roadmap page + Lesson page'
type: 'feature'
created: '2026-07-09'
status: 'done'
baseline_revision: '0372126d8399862554382545b67e0eac0b4272d3'
final_revision: '06f60142f941684d317669adc59f973bc1fccbfb'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/2-1-giao-trinh-giai-doan-1-trang-lo-trinh-trang-bai-hoc.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Problem:** The app has a working metronome but no course: `/lo-trinh` and `/bai-hoc/:id` are stubs, and no curriculum data layer exists. A beginner cannot see the 3-week Phase 1 roadmap or read any lesson.

**Approach:** Build the content-as-data foundation (`core/types.ts` domain types, `content/phase-1.ts` Vietnamese curriculum ~13 items, `content/index.ts` registry + lookup API), then render RoadmapPage (3 weeks of card links) and LessonPage (breadcrumb, objective, theory, practice steps, in-page 404) purely from that API.

## Boundaries & Constraints

**Always:**
- AD-1 layering: `core/` and `content/` import zero React/`app/`/`ui/`/`features/`; `content/` imports only `core/`; features never import each other — shared Vietnamese kind labels live in `core/types.ts` (`LESSON_KIND_LABEL`).
- AD-2 content-as-data: one ID space `gd{p}-t{w}-b{n}`; theory and exercise are both `LessonItem` discriminated by `kind`; exercise data embedded with no own ID; features render only from `getPhases()`/`getWeeks()`/`getItemById()` — no tree-walking in components.
- Binding anchor: `gd1-t1-b1` = "Làm quen bộ trống", kind `theory`. IDs are permanent (future progress-store keys, AD-4) — all 4 PRD topics covered (stick grip, kit parts, metronome 60–80, stick control); single stroke appears in Tuần 1.
- AD-5/AD-6: CSS Modules beside components, token-only `var(--…)` values (all needed tokens exist); every link via `ROUTES`/`lessonPath()` — no string-built paths.
- TS gotchas: `verbatimModuleSyntax` (use `import type`), `erasableSyntaxOnly` (no enums; string-literal unions + `as const`), no path aliases, named exports only. House style: no semicolons, single quotes, Vietnamese comments citing invariant codes.
- Red-green: write failing `content/index.test.ts` before implementing `content/index.ts`.
- `Video` type is a discriminated union on `lang` making `note` required for `'en'`, optional for `'vi'`.
- Content voice (UX-DR10/NFR-1): xưng "bạn", encouraging, short paragraphs; drum terms in English with Vietnamese gloss at first use per lesson.

**Block If:**
- The existing route wiring (`ROUTES.lesson`, `activeNavPath`, App.tsx registration) turns out NOT to already support these pages and would require modifying `src/app/*`.
- Fulfilling an AC would require new dependencies or edits to `src/styles/tokens.css`, `vite.config.ts`, `package.json`, or `vercel.json`.

**Never:**
- No video rendering or video data (story 2.2 — only the `Video` TYPE ships; `videos: []` everywhere).
- No DrumMap/sounds (2.3), no PatternGrid/MetronomeBlock embed/tempo UI (2.4) — but `ExerciseSpec` DATA is authored now (patterns RLRL / RRLL / RLRRLRLL, targetTempo, techniqueNotes).
- No progress store, checkmarks, progress bars, "bài tiếp theo" (Epic 3).
- No changes under `src/core/audio/`, `src/app/`, `src/ui/`, `src/styles/`.
- No jsdom/@testing-library component tests; no redirect/throw for unknown lesson ID (single in-page 404 treatment).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Roadmap render | open `/lo-trinh` | 3 weeks (Tuần 1–3), ordered card links, each showing title + kind label | No error expected |
| Lesson open | click a card / deep-link `/bai-hoc/gd1-t1-b1` | Breadcrumb "Lộ trình → Tuần N → Bài M", h1 + kind badge, Mục tiêu, theory paragraphs, Thực hành `<ol>` | No error expected |
| Unknown lesson ID | `/bai-hoc/khong-ton-tai` | In-page "Không tìm thấy bài" + link back to `/lo-trinh`, inside AppLayout | `getItemById` returns `undefined`; no throw/redirect |
| Missing/empty route param | `useParams().id` undefined or `''` | Same not-found treatment | Guard before lookup |
| Lookup roundtrip | `getItemById(id)` for every item | `{ item, phaseId, weekNumber, ordinal }` consistent with tree position | Unknown id → `undefined` |
| Unknown phase | `getWeeks('gd9')` | Empty array (or equivalent safe result) | No throw |

</intent-contract>

## Code Map

- `src/core/types.ts` -- NEW: Phase/Week/LessonItem/LessonItemId/LessonKind/Video/ExerciseSpec + `LESSON_KIND_LABEL` (framework-free)
- `src/content/phase-1.ts` -- NEW: `phase1: Phase`, ~13 items across 3 weeks (skeleton table in story Dev Notes); replaces `src/content/.gitkeep`
- `src/content/index.ts` -- NEW: registry `[phase1]`, `getPhases()`, `getWeeks(phaseId)`, `getItemById(id)` with location fields; id→location map built once at module init
- `src/content/index.test.ts` -- NEW: content-API unit tests (node env, Vietnamese descriptions, model on `src/app/routes.test.ts`)
- `src/features/roadmap/RoadmapPage.tsx` + NEW `RoadmapPage.module.css` -- UPDATE stub: render from `getPhases()`; cards = `<Link to={lessonPath(id)}>`
- `src/features/lesson/LessonPage.tsx` + NEW `LessonPage.module.css` -- UPDATE stub (keep named export): lesson article + in-page 404
- `src/app/routes.ts` -- READ-ONLY: `ROUTES`, `lessonPath`, `activeNavPath` already wired (nav highlight + App.tsx registration done in story 1.1)

## Tasks & Acceptance

**Execution:**
- [x] `src/core/types.ts` -- define all domain types + `LESSON_KIND_LABEL` -- full shape now so 2.2/2.4 only add data
- [x] `src/content/index.test.ts` -- failing tests first: gd1 has 3 weeks 1..3 non-empty; every id matches `/^gd1-t[1-3]-b\d+$/` with `t{n}` = containing weekNumber; ids unique; roundtrip weekNumber+ordinal for every item; unknown id → undefined; `gd1-t1-b1` kind theory; every exercise item has embed with non-empty pattern and `40 ≤ from ≤ to ≤ 200`
- [x] `src/content/phase-1.ts` -- author GĐ1 curriculum in Vietnamese (objective 1–2 câu, theory 2–4 đoạn, practiceSteps 3–6 bước; exercise embeds populated; `videos: []`) -- delete `.gitkeep`
- [x] `src/content/index.ts` -- implement registry + lookup API to green the tests
- [x] `src/features/roadmap/RoadmapPage.tsx` + `.module.css` -- phases → week sections (`<h2>Tuần {n} — {title}</h2>`) → ordered card list; card tokens `--card-background/-border/-radius`, badge `--color-text-secondary`+`--font-size-small`, hover border → amber
- [x] `src/features/lesson/LessonPage.tsx` + `.module.css` -- breadcrumb `<nav aria-label="Breadcrumb">`, article layout ~65ch, sections Mục tiêu/theory/Thực hành; in-page not-found branch
- [x] Quality gate -- `npm run check` green; grep confirms `'gd1'` only in `content/` + tests, never `features/`; manual verify per story Task 7 (deep-link, 404, nav active, 375px, keyboard)

**Acceptance Criteria:**
- Given the curriculum data layer exists, when opening `/lo-trinh`, then 3 weeks render as ordered card lists showing title + kind, sourced solely from `content/index.ts` exports.
- Given any roadmap card, when clicked, then `/bai-hoc/:id` shows breadcrumb (Lộ trình → Tuần N → Bài M), title, objective, short Vietnamese theory, and step-by-step practice instructions; English drum terms glossed in Vietnamese at first use per lesson.
- Given a non-existent lesson ID, when visiting `/bai-hoc/<bad-id>`, then a single in-page "Không tìm thấy bài" message with a link back to the roadmap renders.
- Given a hypothetical `content/phase-2.ts`, when registered in `content/index.ts`, then the roadmap would display it with zero component changes (structural review: components hardcode no phase IDs).
- Given the full suite, when running `npm run check`, then tsc + oxlint + all tests (60 existing + new) + build pass.

## Spec Change Log

## Review Triage Log

### 2026-07-09 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 6: (high 0, medium 0, low 6)
- defer: 0
- reject: 12: (high 0, medium 0, low 12)
- addressed_findings:
  - `[low]` `[patch]` `LessonItem.exercise` invariant ("present iff kind === 'exercise'") was comment-only — converted `LessonItem` to a discriminated union on `kind` (`theory` forbids `exercise` via `?: never`, `exercise` requires it)
  - `[low]` `[patch]` ID-namespace test hardcoded `/^gd1-t[1-3]-b\d+$/` for ALL phases, contradicting AC #3 extensibility — per-item regex now derived from `phase.id` + `weekNumber`; gd1-literal check kept as its own test
  - `[low]` `[patch]` Brittle `item.id.split('-')[1]?.slice(1)` week-segment parsing — removed, subsumed by the derived regex
  - `[low]` `[patch]` No phase-id uniqueness guard in registry — added test asserting phase ids unique
  - `[low]` `[patch]` Content-string React keys (`key={paragraph}`, `key={step}`) could collide on repeated text — switched to index keys (static, never reordered lists)
  - `[low]` `[patch]` Phase title and week title both `<h2>` broke heading outline — week heading now `<h3>` (same visual class)
  - `[low]` `[patch]` Dead `as const` widened by `Record` annotation on `LESSON_KIND_LABEL` — now `as const satisfies Record<LessonKind, string>`

Rejected as noise (spec-conformant or speculative): registry init-throw for duplicate ids (test-enforced), 40/200 magic numbers (spec-specified bound), breadcrumb ol/li + aria-current restructure, jsdom component tests (spec "Never"), deep-readonly arrays, branded `LessonItemId`, case-sensitive lookup vs lowercased nav, "unused" `getWeeks` (spec-required export), `videos: []` boilerplate (spec-mandated), empty-array render guards, theory section heading (story specifies unheaded paragraphs), theory-lacks-exercise test gap (moot after DU patch).

## Verification

**Commands:**
- `npm run check` -- expected: tsc -b, oxlint, vitest run (60 existing + new content tests), vite build all green
- `grep -rn "'gd1'" src/features src/ui src/app` -- expected: no matches (phase IDs live only in content/ and tests)

**Manual checks (if no CLI):**
- `vite dev`: `/lo-trinh` 3 tuần + cards; card click → lesson; deep-link `/bai-hoc/gd1-t1-b1` works; `/bai-hoc/khong-ton-tai` → in-page 404 + link back; nav "Lộ trình" active on lesson pages; 375px single-column, targets ≥44px, no horizontal scroll; Tab reaches every card with visible focus ring

## Auto Run Result

**Status:** done — final_revision `06f6014`

**Summary:** Story 2.1 delivered the content-as-data foundation and the first two course pages. `core/types.ts` defines the full domain model (LessonItem as a discriminated union on `kind`, Video as a union on `lang` with required English notes); `content/phase-1.ts` ships the complete Vietnamese Phase 1 curriculum (13 items over 3 weeks, all 4 PRD topics, exercise embeds for single/double stroke and paradiddle); `content/index.ts` provides the registry + O(1) lookup API. `/lo-trinh` renders weeks of card links and `/bai-hoc/:id` renders the lesson article with breadcrumb and a single in-page content-404.

**Files changed:**
- `../../src/core/types.ts` — NEW: domain types + LESSON_KIND_LABEL, framework-free
- `../../src/content/phase-1.ts` — NEW: GĐ1 curriculum data (replaces `.gitkeep`)
- `../../src/content/index.ts` — NEW: phase registry + getPhases/getWeeks/getItemById
- `../../src/content/index.test.ts` — NEW: 10 content-API tests (red-green)
- `../../src/features/roadmap/RoadmapPage.tsx` + `RoadmapPage.module.css` — stub → card list from getPhases()
- `../../src/features/lesson/LessonPage.tsx` + `LessonPage.module.css` — stub → lesson article + in-page 404

**Review findings breakdown:** 7 patches applied (all low: LessonItem discriminated union, extensible test regex, phase-id uniqueness test, index React keys, week heading h3, `satisfies` label typing, removed brittle id parsing); 0 deferred; 12 rejected as noise.

**Follow-up review:** not recommended — all review-driven changes were localized, low-consequence type/test/markup hygiene with no behavior change.

**Verification:** `npm run check` fully green after patches — tsc -b, oxlint, vitest `4 files / 70 tests passed` (60 pre-existing + 10 new), vite build OK. Structural AC #3 check: `gd1` appears only in `content/` and tests (grep-verified). Forbidden paths (`src/core/audio/`, `src/app/`, `src/ui/`, `src/styles/`, configs) untouched (git-verified).

**Residual risks:** Lesson/roadmap rendering has no component-level tests (project has no jsdom/@testing-library by design); visual/manual checks (375px layout, keyboard traversal, Vercel deploy) not exercised in this unattended run — recommend a quick human smoke pass on the deployed roadmap and one lesson page. Sprint-status.yaml not updated by this workflow (story 1-3 entry there is also stale at `review` though its spec is `done`).
