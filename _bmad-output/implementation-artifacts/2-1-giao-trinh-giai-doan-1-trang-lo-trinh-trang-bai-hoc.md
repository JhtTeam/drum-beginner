# Story 2.1: Giáo trình Giai đoạn 1 + trang Lộ trình + trang Bài học

Status: ready-for-dev

## Story

As a người mới hoàn toàn,
I want xem lộ trình 3 tuần và đọc nội dung từng bài bằng tiếng Việt,
so that tôi luôn biết hôm nay học gì và học như thế nào.

## Acceptance Criteria

1. **Data layer + trang Lộ trình**
   **Given** `core/types.ts` định nghĩa Phase/Week/LessonItem (một không gian ID `gd1-t2-b3`, phân biệt `kind` — AR-3) và `content/phase-1.ts` chứa đủ giáo trình GĐ1 theo PRD §2 (cầm dùi, bộ phận trống, metronome 60–80, stick control) phân bổ vào Tuần 1–3
   **When** mở `/lo-trinh`
   **Then** thấy 3 tuần, mỗi tuần là danh sách card bài theo thứ tự (FR-1); card hiển thị tiêu đề + kind
   **And** `content/index.ts` export `getItemById`, `getWeeks(phaseId)` — feature không tự duyệt cây (AR-3).

2. **Trang Bài học + 404 nội dung**
   **Given** một item bất kỳ trong lộ trình
   **When** click card
   **Then** điều hướng `/bai-hoc/:id` hiển thị: breadcrumb (Lộ trình → Tuần N → Bài M), tiêu đề, mục tiêu, lý thuyết ngắn tiếng Việt, hướng dẫn thực hành từng bước (FR-4); thuật ngữ trống giữ tiếng Anh, chú thích lần đầu (NFR-1)
   **And** ID không tồn tại → trang thông báo "Không tìm thấy bài" + link về Lộ trình (một kiểu 404 duy nhất).

3. **Mở rộng được không sửa component (FR-2, SM-3)**
   **Given** giáo trình cần mở rộng sau này
   **When** thêm file `content/phase-2.ts` và đăng ký
   **Then** lộ trình hiển thị giai đoạn mới mà không sửa component nào (kiểm bằng review cấu trúc, không cần build GĐ2 thật).

## Tasks / Subtasks

- [ ] Task 1: `core/types.ts` — domain types, framework-free (AC: #1, #3)
  - [ ] Create `src/core/types.ts` (NO React imports — AD-1). Define: `LessonItemId` (string, convention `gd{p}-t{w}-b{n}`), `LessonKind = 'theory' | 'exercise'`, `Video` as a **discriminated union on `lang`** so `note` is *required* when `lang: 'en'` and optional when `'vi'` (AR-7 enforced at compile time — no runtime validation needed): `{ youtubeId: string; lang: 'vi'; title: string; note?: string } | { youtubeId: string; lang: 'en'; title: string; note: string }`
  - [ ] `ExerciseSpec`: `{ pattern: ReadonlyArray<'R' | 'L'>; targetTempo: { from: number; to: number }; techniqueNotes: string[] }` — embedded inside the item, **no ID of its own** (AD-2)
  - [ ] `LessonItem`: `{ id, kind, title, objective, theory: string[], practiceSteps: string[], videos: Video[], exercise?: ExerciseSpec }` — `videos` stays `[]` this story (data lands in 2.2), `exercise` present iff `kind === 'exercise'`. Defining the FULL shape now means stories 2.2/2.4 only ADD DATA, never change types
  - [ ] `Week`: `{ weekNumber: number; title: string; items: LessonItem[] }`; `Phase`: `{ id: string; title: string; weeks: Week[] }`
  - [ ] Export `LESSON_KIND_LABEL: Record<LessonKind, string>` = `{ theory: 'Lý thuyết', exercise: 'Luyện tập' }` — single Vietnamese label source usable by both roadmap and lesson features (features can't import each other — AD-1; core holds shared data)
  - [ ] No TS enums, no parameter properties (`erasableSyntaxOnly` is on) — string-literal unions + plain objects `as const` only
- [ ] Task 2: `content/phase-1.ts` — author the GĐ1 curriculum in Vietnamese (AC: #1)
  - [ ] Delete `src/content/.gitkeep`; create `src/content/phase-1.ts` exporting `const phase1: Phase` covering all 4 PRD §2 topics across Tuần 1–3 (suggested skeleton in Dev Notes — 13 items). **Binding anchor:** `gd1-t1-b1` MUST be "Làm quen bộ trống" kind `theory` (KF-2 first-day flow; story 2.3 mounts the DrumMap in this exact lesson)
  - [ ] Every item: Vietnamese `objective` (1–2 câu), `theory` (2–4 đoạn ngắn), `practiceSteps` (3–6 bước hành động). Drum terms stay English with a Vietnamese gloss at first use *per lesson* (vd. "snare (trống lẫy — trống chính trước mặt bạn)") — NFR-1. Voice per UX-DR10: xưng "bạn", giọng bạn tập cùng, động viên, không giáo điều
  - [ ] Exercise items: populate `exercise` embed now (content is known): single stroke `['R','L','R','L']`, double stroke `['R','R','L','L']`, paradiddle `['R','L','R','R','L','R','L','L']`; `targetTempo` per lesson (60→70, 70→80…); `techniqueNotes` (thả lỏng cổ tay, lực đều hai tay — PRD FR-14). Story 2.4 renders these; authoring once here avoids a second content pass
  - [ ] `videos: []` on every item this story — story 2.2 fills them from addendum B. Structure the lessons so each addendum-B category has a home (mapping in Dev Notes)
  - [ ] IDs are FOREVER: they become progress-store keys in story 3.1 (AD-4) — never reuse or renumber after this story ships
- [ ] Task 3: `content/index.ts` — lookup API + registry (AC: #1, #3)
  - [ ] Create `src/content/index.ts` with an internal registry `const phases: readonly Phase[] = [phase1]` — adding GĐ2 later = import `phase2` + add to this array, nothing else (FR-2/SM-3)
  - [ ] Export `getPhases(): readonly Phase[]` (RoadmapPage iterates ALL registered phases — hardcoding `'gd1'` in the component would fail AC #3), `getWeeks(phaseId: string): readonly Week[]`, and `getItemById(id: string)` returning `{ item: LessonItem; phaseId: string; weekNumber: number; ordinal: number } | undefined` — the location fields feed the breadcrumb (Tuần N / Bài M) so LessonPage never walks the tree itself (AD-2). Build the id→location map once at module init
  - [ ] `content/` imports only from `core/` — never React/`app/`/`ui/`/`features/` (AD-1)
- [ ] Task 4: Unit tests for content API — red-green, write failing tests first (AC: #1)
  - [ ] Create `src/content/index.test.ts` (vitest env `node`, model on `src/app/routes.test.ts`): `getPhases()` contains phase `gd1` with exactly 3 weeks numbered 1..3, each week non-empty; every item id matches `/^gd1-t[1-3]-b\d+$/` and the `t{n}` segment equals its containing `weekNumber` (consistency guard); all ids unique across all phases; `getItemById` roundtrip for EVERY item returns correct `weekNumber` + `ordinal`; unknown id → `undefined`; `gd1-t1-b1` exists with kind `theory` (2.3 anchor); every `kind === 'exercise'` item has an `exercise` embed with non-empty pattern and `40 ≤ from ≤ to ≤ 200`
- [ ] Task 5: RoadmapPage — replace stub (AC: #1)
  - [ ] UPDATE `src/features/roadmap/RoadmapPage.tsx`: `<h1>Lộ trình</h1>`, then map `getPhases()` → phase heading, `phase.weeks` → week section (`<h2>Tuần {weekNumber} — {title}</h2>`), items as an ordered list of card links. Card = `<Link to={lessonPath(item.id)}>` showing `title` + kind badge (`LESSON_KIND_LABEL[item.kind]`). Import `lessonPath` from `../../app/routes` — NEVER string-concatenate paths (AD-6)
  - [ ] NEW `src/features/roadmap/RoadmapPage.module.css`: card uses `var(--card-background)`, `var(--card-border)`, `var(--card-radius)`, padding `var(--spacing-4)` (denser than `--card-padding` 24px is fine for list cards — pick one and stay consistent); kind badge `--color-text-secondary` + `--font-size-small`; hover raises border to amber. Token-only, no hex/px for token-covered values (AD-5); single breakpoint 768px only if needed (cards stack fine at 375px — a simple single-column list needs no media query)
  - [ ] NO completion checkmarks/progress bars — those are UX-DR8 backed by the progress store (story 3.1). Render structure only
- [ ] Task 6: LessonPage — replace stub (AC: #2)
  - [ ] UPDATE `src/features/lesson/LessonPage.tsx`: `useParams().id` (param name is `:id` — NOT `slug`) → `getItemById(id)`. Found: render breadcrumb `<nav aria-label="Breadcrumb">` (`<Link to={ROUTES.roadmap}>Lộ trình</Link> → Tuần {weekNumber} → Bài {ordinal}`), `<h1>{title}</h1>` + kind badge, section "Mục tiêu" (objective), theory paragraphs, section "Thực hành" as `<ol>` of practiceSteps. For `exercise` items, the practiceSteps ARE the instructions this story — do NOT render pattern/tempo/MetronomeBlock (story 2.4) and do NOT render videos (story 2.2)
  - [ ] Not found (undefined): render in-page (inside AppLayout shell): "Không tìm thấy bài" + short line + `<Link to={ROUTES.roadmap}>` về Lộ trình. This is THE single lesson-404 treatment (AC #2 "một kiểu 404 duy nhất") — no redirect, no throw; route-level `NotFoundPage` (unknown paths) stays untouched
  - [ ] NEW `src/features/lesson/LessonPage.module.css`: readable article layout — content max-width ~65ch via spacing tokens, body text `--font-size-body`/`--line-height-body`, headings from role tokens, breadcrumb `--font-size-small` + `--color-text-secondary`. Token-only (AD-5)
- [ ] Task 7: Quality gate + manual verify (AC: #1, #2, #3)
  - [ ] `npm run check` green (tsc -b + oxlint src + vitest run + vite build); all 60 existing tests still green; ZERO changes under `src/core/audio/`, `src/app/`, `src/ui/`, `src/styles/`
  - [ ] Manual verify on `vite dev`: (a) `/lo-trinh` shows 3 weeks, ordered cards with title + kind; (b) click card → lesson page with breadcrumb/objective/theory/steps; (c) deep-link paste `/bai-hoc/gd1-t1-b1` directly → renders (SPA rewrite already handles prod); (d) `/bai-hoc/khong-ton-tai` → "Không tìm thấy bài" + link back; (e) on a lesson page the nav active item is "Lộ trình" (already wired via `activeNavPath` — just confirm); (f) 375px viewport: cards single-column, touch targets ≥44px, no horizontal scroll; (g) keyboard: Tab reaches every card, focus ring visible
  - [ ] AC #3 structural review (no GĐ2 build): grep confirms `'gd1'` appears in `content/` and tests only — never in `features/`; RoadmapPage renders purely from `getPhases()`
  - [ ] Commit convention: `feat(curriculum): story 2.1 — <mô tả>`; push + verify Vercel deploy green (build = `npm run check`)

## Dev Notes

### Existing code state — what you touch and what you DON'T

**This story is 80% data layer, 20% page rendering. Routing/nav/layout are DONE — story 1.1 already delivered them:**

- `src/app/routes.ts` — `ROUTES` (5 paths incl. `/lo-trinh`, `/bai-hoc/:id`), `lessonPath(id)` (URL-encodes), `activeNavPath()` (lesson pages already map active-nav to "Lộ trình" — UX-DR3). **Use, don't modify.**
- `src/app/App.tsx` — routes already registered, incl. `ROUTES.lesson → <LessonPage/>` and catch-all `NotFoundPage`. **Don't modify.**
- `src/app/AppLayout.tsx` + module.css — nav with all 4 items incl. "Lộ trình", sticky header ≥768px / bottom tab bar <768px. **Don't modify.**
- `src/features/roadmap/RoadmapPage.tsx` — stub: heading + placeholder paragraph. **Replace body.**
- `src/features/lesson/LessonPage.tsx` — stub: already reads `useParams().id`, renders placeholder. **Replace body, keep named export** (`App.tsx` imports by name).
- `src/content/` — only `.gitkeep`. `src/core/` — only `audio/`. **`core/types.ts`, `content/phase-1.ts`, `content/index.ts` do not exist — you create them.**
- **Do NOT touch:** `src/core/audio/*` (engine done, 24 tests green), `src/ui/*` (MetronomeBlock etc. — story 2.4 composes them), `src/styles/*` (all needed tokens already exist), `vercel.json`, `vite.config.ts`, `package.json`.

**Not Next.js.** Vite 8 + React 19 SPA, react-router 8 declarative (`import { Link, useParams } from 'react-router'` — the package is `react-router`, NOT `react-router-dom`). No file-based routing, no `'use client'` (doesn't exist in this codebase), no server components.

### Architecture guardrails (binding)

- **AD-1 layering:** `core/` + `content/` never import React/`app/`/`ui/`/`features/`. `features/roadmap` and `features/lesson` never import each other — anything shared lives in `core/` (the `LESSON_KIND_LABEL` map) or `ui/`. [Source: planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/ARCHITECTURE-SPINE.md#AD-1]
- **AD-2 content-as-data (the reason this story exists):** ONE id space `gd1-t2-b3` for every roadmap item; theory lessons and exercises are both `LessonItem` discriminated by `kind`; exercise/pattern data is EMBEDDED in the item with no separate ID (it must not appear as its own progress key in 3.1). `content/` exports the lookup API; features render from API results only — no tree-walking in components. Adding a phase = new data file + registry entry, zero component edits. [Source: ARCHITECTURE-SPINE.md#AD-2]
- **AD-5 tokens:** CSS Modules beside components, every token-covered value via `var(--…)`. All tokens this story needs already exist in `src/styles/tokens.css` (card, typography roles, spacing, colors) — **do not add tokens, do not edit tokens.css.** [Source: ARCHITECTURE-SPINE.md#AD-5; src/styles/tokens.css]
- **AD-6 routes:** every link via `ROUTES` / `lessonPath()` constants. No string literals like `'/bai-hoc/' + id`. [Source: ARCHITECTURE-SPINE.md#AD-6]
- **AD-4 (forward constraint):** `LessonItemId` strings become `completedLessons` keys in story 3.1 — stable forever. [Source: ARCHITECTURE-SPINE.md#AD-4]
- **Naming:** pure modules `kebab-case.ts` (`phase-1.ts`), components `PascalCase.tsx`, CSS modules `PascalCase.module.css` beside the component. Named exports only (codebase has zero default exports). [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions]

### TypeScript strictness gotchas (will fail `tsc -b` if ignored)

- `verbatimModuleSyntax` — type-only imports MUST use `import type { Phase } from '../core/types'`.
- `erasableSyntaxOnly` — no enums, no class parameter properties; use string-literal unions + `as const` (see `RoutePath` in `app/routes.ts` for the house pattern).
- `noUnusedLocals` / `noUnusedParameters` are errors.
- **No path aliases** — no `@/`; all imports relative (`../core/types`, `../../app/routes`).

### Suggested curriculum skeleton (author freely, keep the anchors)

Anchors that are NOT free: `gd1-t1-b1` = "Làm quen bộ trống", kind `theory` (KF-2; DrumMap mounts here in 2.3). All 4 PRD §2 topics covered. Single stroke starts in Tuần 1 (KF-1 shows it as a week-1 item). Each addendum-B video category needs a lesson home. 4–6 items/week.

| ID | kind | Đề xuất nội dung | Video home (2.2, addendum B) |
|---|---|---|---|
| gd1-t1-b1 | theory | Làm quen bộ trống — 6 bộ phận: snare, tom, kick, hi-hat, crash, ride | B2 (Việt Thương/Soul/Trung Drum/Pong Ơi) |
| gd1-t1-b2 | theory | Cách cầm dùi & tư thế ngồi | B1 (Việt Thương/Tran Tin/Duy Phan) |
| gd1-t1-b3 | theory | Metronome là gì — tập giữ nhịp 60 bpm | B3 (GIAO DRUM + EN) |
| gd1-t1-b4 | exercise | Single stroke @ 60 (RLRL) | B4 (Pong Ơi single) |
| gd1-t1-b5 | exercise | Single stroke đều tay 60→70 | — |
| gd1-t2-b1 | theory | Thả lỏng cổ tay, lực đều hai tay | — |
| gd1-t2-b2 | exercise | Double stroke @ 60 (RRLL) | B4 (Pong Ơi double) |
| gd1-t2-b3 | exercise | Single + double xen kẽ @ 60–70 | — |
| gd1-t2-b4 | exercise | Double stroke 60→70 | — |
| gd1-t3-b1 | exercise | Paradiddle @ 60 (RLRR LRLL) | B4 (Duy Phan/Drumeo) |
| gd1-t3-b2 | exercise | Paradiddle 60→70 | — |
| gd1-t3-b3 | exercise | Tổng hợp single/double/paradiddle 70→80 | — |
| gd1-t3-b4 | theory | Tổng kết GĐ1 — tự kiểm SM-2 (giữ nhịp 60–80, sạch single/double @ 60) | — |

Week titles gợi ý: Tuần 1 "Làm quen & nhịp đầu tiên", Tuần 2 "Kiểm soát dùi", Tuần 3 "Paradiddle & tăng tốc". Content wording is the dev's to write — good Vietnamese, short paragraphs, actionable steps. Numbers straight per UX-DR10 ("sạch ở 60 → nâng dần 80"), no percentages.

### Token map (all pre-existing in tokens.css)

| Element | Tokens |
|---|---|
| Card lộ trình | `--card-background` `--card-border` `--card-radius`; padding từ thang `--spacing-*` |
| Kind badge | `--color-text-secondary`, `--font-size-small`; nền `--color-surface-overlay` + `--rounded-sm` nếu làm pill |
| Week heading | `--font-size-h2` `--font-weight-h2` `--line-height-h2` |
| Lesson h1 | `--font-size-h1` `--font-weight-h1` `--line-height-h1` |
| Body/theory | `--font-size-body` `--line-height-body` `--color-text-primary` |
| Breadcrumb | `--font-size-small` `--color-text-secondary`; separator "→" text thường |
| Hover/focus | border → `--color-amber`; focus ring do global.css lo — KHÔNG override outline |
| Success/checkmark | KHÔNG dùng story này (Epic 3) |

### Scope — NOT in this story

- NO `ui/VideoEmbed`, no video rendering, no `videos` data (2.2 — but the `Video` TYPE ships now).
- NO `ui/DrumMap`, no sounds (2.3). `gd1-t1-b1` theory text may mention the sơ đồ is coming — better: write it standalone-valid.
- NO `ui/PatternGrid`, no MetronomeBlock embed, no target-tempo UI (2.4 — but `ExerciseSpec` DATA ships now).
- NO progress store, checkmarks, "Hoàn thành" button, week progress bars, "bài tiếp theo" (Epic 3).
- NO new dependencies (`package.json` untouched). No @testing-library — tests are pure-node against `content/index.ts`.
- NO skip-link/focus-management on route change (still deferred — deferred-work.md; revisit when a11y pass happens).
- NO sitemap/SEO/meta work — single-user hobby SPA.

### Testing

- Vitest 4.1 env `node`, include `src/**/*.test.{ts,tsx}` — `src/content/index.test.ts` is auto-picked, no config change.
- Red-green house rule (stories 1.1–1.3): write the failing content-API tests BEFORE implementing `content/index.ts`.
- The `en`-video `note` requirement is enforced by the discriminated union at compile time — no runtime validator needed this story (import-file validation is 3.4's problem for a different surface).
- Component rendering is NOT unit-tested (no jsdom/testing-library — deferred). Testable logic lives in `content/` pure functions; keep components thin render-only.
- `npm run check` is the gate; Vercel build command runs the same script — red test = red deploy.

### Previous story intelligence (epic 1, stories 1.1–1.3 all done)

- **House rhythm:** red-green TDD; CSS module beside component, token-only `var()`; Vietnamese UI text inline; named exports; heavy Vietnamese comments citing invariant codes (AD-x, FR-x) — match this style.
- **Review lessons from 1.2/1.3:** guard edges early instead of waiting for review (empty/undefined params, listener cleanup); avoid layout jump (1.3 used min-width on changing text — irrelevant here but the reflex is: reserve space for dynamic content).
- **Story 1.3 adversarial review** applied touch/select hardening and aria labels — for this story: cards are plain `<Link>`s (native anchors — no custom key handling needed), breadcrumb gets `aria-label`, kind badge is text (not color-only — UX-DR11).
- **Deferred items that brush this story** (deferred-work.md — do NOT fix here, just don't make worse): SPA rewrite swallows asset 404s (irrelevant to data pages); skip-link still deferred; shortcut-focus quirk and SR announcements belong to MetronomeBlock surfaces.
- **Git pattern:** `feat(scope): story X.Y — mô tả` Vietnamese description; BMad bookkeeping commits `chore(...)`. Recent work (0ef762d) shows the expected shape: source files + colocated tests + module.css in one feature commit.

### Latest tech notes

No new libraries. Stack (React 19.2, react-router 8.1, TS 6.0, Vite 8.1, Vitest 4.1) was version-verified 2026-07-08 during architecture and is already installed and working in production. react-router 8 declarative APIs used here (`Link`, `useParams`) are the same ones already exercised by `AppLayout`/`LessonPage` stub — no breaking-change risk, no research required.

### Project Structure Notes

Target tree this story:

```text
src/core/
  types.ts                       # NEW — Phase/Week/LessonItem/Video/ExerciseSpec + LESSON_KIND_LABEL (no React)
src/content/
  phase-1.ts                     # NEW — giáo trình GĐ1, 3 tuần, ~13 items (replaces .gitkeep)
  index.ts                       # NEW — registry [phase1] + getPhases/getWeeks/getItemById(+location)
  index.test.ts                  # NEW — content API unit tests (Task 4)
src/features/roadmap/
  RoadmapPage.tsx                # UPDATE — stub → render getPhases()
  RoadmapPage.module.css         # NEW — cards, token-only
src/features/lesson/
  LessonPage.tsx                 # UPDATE — stub → lesson article + in-page 404
  LessonPage.module.css          # NEW — article layout, token-only
```

- Imports: content → core only; features → content API + core types + `app/routes` constants + react-router. No `@/` alias — relative paths.
- `content/index.ts` is the ONLY file that imports `phase-1.ts`; when GĐ2 arrives, it's the only file that changes (plus the new data file) — that inspection IS the AC #3 check.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.1] — story statement + 3 ACs verbatim; Epic 2 context
- [Source: _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/ARCHITECTURE-SPINE.md#AD-1, #AD-2, #AD-4, #AD-5, #AD-6, #AD-7] — layering, content-as-data + ID space, progress keys, tokens, route constants, Video type shape
- [Source: _bmad-output/planning-artifacts/prds/prd-drum-beginner-2026-07-08/prd.md#§2, #FR-1, #FR-2, #FR-4, #NFR-1, #SM-3] — curriculum scope, roadmap/lesson requirements, Vietnamese + English terms, extensibility metric
- [Source: _bmad-output/planning-artifacts/prds/prd-drum-beginner-2026-07-08/addendum.md#B] — verified video list → lesson homes (data lands in 2.2)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/EXPERIENCE.md#Information-Architecture, #Voice-and-Tone, #Key-Flows KF-1/KF-2, #Accessibility-Floor] — surface specs, xưng "bạn", gd1-t1-b1 anchor, contrast/keyboard floor
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/DESIGN.md#Components card] — card tokens (mapped in src/styles/tokens.css)
- [Source: src/app/routes.ts; src/app/AppLayout.tsx; src/features/roadmap/RoadmapPage.tsx; src/features/lesson/LessonPage.tsx] — existing wiring + stubs to replace
- [Source: _bmad-output/implementation-artifacts/1-3-metronome-block-hoan-chinh-trang-metronome-dung-duoc-that.md#Dev-Notes] — house conventions, review learnings
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — items to leave deferred

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created (claude-fable-5, 2026-07-09)

### File List
