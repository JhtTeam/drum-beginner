---
baseline_commit: 9600f7533cd1b64e0c5144e134c484bc383e7907
---

# Story 1.1: Khung dự án, design tokens, nav và deploy

Status: done

## Story

As a người tự học trống,
I want mở được website trên URL công khai với điều hướng 5 trang và giao diện "Sân khấu tối",
so that nền móng sẵn sàng và mỗi thay đổi sau này tự động lên production.

## Acceptance Criteria

1. **Scaffold + quality gate xanh**
   **Given** máy dev có Node ≥ 22.12
   **When** scaffold bằng `npm create vite@latest -- --template react-ts` (Vite 8.1, React 19.2, TS 6.0 strict) và dựng cây thư mục theo Structural Seed của ARCHITECTURE-SPINE (AR-1, AR-2)
   **Then** `npm run check` (tsc --noEmit + oxlint + vitest run + vite build) chạy xanh
   **And** ESLint config không tồn tại — lint là oxlint theo starter default.

2. **5 routes + layout nav + tokens**
   **Given** app đã scaffold
   **When** mở bất kỳ route nào trong `/`, `/lo-trinh`, `/bai-hoc/:id`, `/metronome`, `/tien-do` (hằng số trong `app/routes.ts` — AR-6)
   **Then** trang placeholder tương ứng render trong layout chung: header sticky 60px (desktop ≥768px) với item active có gạch chân amber, bottom tab bar 56px 4 mục (mobile <768px), trang Bài học giữ active ở "Lộ trình" (UX-DR3)
   **And** `styles/tokens.css` chứa đủ token DESIGN.md (màu, typography, rounded, spacing, component tokens) + media query 768px đổi `--font-size-pattern-letter` 56→40px; `styles/global.css` set nền `--surface-base`, font Be Vietnam Pro (@fontsource — AR-7), `:focus-visible` ring, `prefers-reduced-motion`, touch target ≥44px (UX-DR1, UX-DR2)
   **And** không component nào dùng hex/px trần cho giá trị đã có token (AD-5).

3. **Deploy Vercel với SPA fallback + gate hoạt động**
   **Given** repo có `vercel.json` rewrites `/(.*) → /index.html` và Vercel build command = `npm run check` (AR-9)
   **When** push lên GitHub và deploy Vercel
   **Then** mở deep link `https://<domain>/lo-trinh` trực tiếp không bị 404
   **And** một test đỏ làm build đỏ (quality gate hoạt động).

## Tasks / Subtasks

- [x] Task 1: Scaffold dự án từ starter (AC: #1)
  - [x] Verify Node ≥ 22.12 (`node -v`). → v22.19.0 ✓
  - [x] Chạy `npm create vite@latest . -- --template react-ts` — CLI không nhận thư mục non-empty → scaffold ra thư mục tạm rồi copy config files vào root (per contingency trong story)
  - [x] Verify starter ship: Vite ^8.1.1, React ^19.2.7, TypeScript ~6.0.2, oxlint ^1.71.0 + `.oxlintrc.json`. Không cài ESLint ✓
  - [x] TS strict: template KHÔNG có `"strict": true` (khác dự đoán story) → đã thêm thủ công vào `tsconfig.app.json`
  - [x] Cài deps: `react-router@^8.1.0`, `@fontsource/be-vietnam-pro@^5.2.8`, `vitest@^4.1.10` (devDep)
  - [x] Boilerplate starter (App.css, logo, counter demo) không copy vào repo — src viết mới hoàn toàn
- [x] Task 2: Dựng cây thư mục Structural Seed (AC: #1, #2)
  - [x] Tạo `src/app/`, `src/ui/`, `src/features/{roadmap,lesson,practice,metronome,progress}/`, `src/core/`, `src/content/`, `src/styles/`, `public/sounds/` (`.gitkeep` cho thư mục trống)
  - [x] `src/app/routes.ts`: hằng số 5 route + `lessonPath(id)` + `activeNavPath(pathname)` (viết test trước — red — rồi implement — green)
- [x] Task 3: Design tokens + global styles (AC: #2)
  - [x] `src/styles/tokens.css`: đủ 17 colors, 6 typography roles, 4 rounded (DEFAULT → `--rounded-default`), 9 spacing, 11 component groups + `--shadow-overlay`, tên giữ nguyên DESIGN.md
  - [x] Media query `max-width: 767.98px`: `--font-size-pattern-letter: 40px` — override sống trong tokens.css (AD-5)
  - [x] `src/styles/global.css`: @import fontsource 400/600/700/800; body nền/chữ/font từ token; `:focus-visible` ring; `prefers-reduced-motion` block; button min-height 44px
  - [x] Import thứ tự tokens.css → global.css trong `main.tsx`
- [x] Task 4: Layout + nav + placeholder pages (AC: #2)
  - [x] `src/app/App.tsx` (`<Routes>` declarative) + `AppLayout.tsx` (nav + `<Outlet/>`), `BrowserRouter` ở `main.tsx`
  - [x] Nav desktop ≥768px: header sticky 60px, active = chữ text-primary + gạch chân 2px amber
  - [x] Nav mobile <768px: bottom tab bar 56px fixed, active màu amber, touch target 44px
  - [x] Active qua `activeNavPath()` (unit-tested): `/bai-hoc/:id` → active "Lộ trình" (UX-DR3)
  - [x] 5 placeholder pages trong `features/*`; mọi path qua hằng số `ROUTES` — không string literal
  - [x] CSS module `AppLayout.module.css` chỉ dùng `var(--...)`
- [x] Task 5: Quality gate `npm run check` + placeholder test (AC: #1, #3)
  - [x] `"check": "tsc -b && oxlint && vitest run && vite build"` — dùng `tsc -b` thay `tsc --noEmit` vì template dùng project references (tsconfig.json `files: []` + references; cả 2 sub-config đã `noEmit: true` nên `tsc -b` chính là bước typecheck không emit)
  - [x] 6 unit tests cho `app/routes.ts` (ROUTES shape, lessonPath, activeNavPath 4 cases) — vượt yêu cầu ≥1 test
  - [x] `npm run check` xanh local (exit 0)
- [x] Task 6: Deploy Vercel (AC: #3)
  - [x] `vercel.json` tại root: rewrites `/(.*) → /index.html` + `buildCommand: "npm run check"` + `outputDirectory: "dist"` baked in (Vercel đọc từ file — không cần config dashboard)
  - [x] Verify gate local: thêm test đỏ tạm → `npm run check` exit 1; revert → exit 0
  - [x] Verify SPA fallback local: `vite preview` → GET `/lo-trinh` trả 200 + đúng title app
  - [x] Push GitHub (JhtTeam/drum-beginner) + Vercel project linked (user setup) — push auto-deploy Ready
  - [x] Verify production: https://drum-beginner.vercel.app/lo-trinh → 200, /bai-hoc/gd1-t1-b1 → 200, đúng title app (2026-07-08)

### Review Findings

- [x] [Review][Patch] Không có catch-all 404 route — URL lạ render màn hình trống hoàn toàn, không nav, không lối thoát [src/app/App.tsx:14]
- [x] [Review][Patch] App dark-theme không khai báo `color-scheme: dark` — flash trắng khi load + scrollbar/form control sáng [src/styles/global.css, index.html]
- [x] [Review][Patch] Bottom tab bar bỏ qua iOS safe-area inset (`env(safe-area-inset-bottom)` + `viewport-fit=cover`) [src/app/AppLayout.module.css:8, index.html:6]
- [x] [Review][Patch] `activeNavPath` nghiêm ngặt hơn router matcher — trailing slash (`/lo-trinh/`) và khác hoa-thường render trang nhưng mất active tab; `/bai-hoc` không id lại active "Lộ trình" trên trang trống [src/app/routes.ts:21-29]
- [x] [Review][Patch] `LESSON_BASE` lặp lại prefix của `ROUTES.lesson` — hai nguồn chân lý, vi phạm tinh thần AD-6 [src/app/routes.ts:8,14]
- [x] [Review][Patch] `lessonPath(id)` không encode id — id chứa `/`,`?`,`#` sinh URL chết [src/app/routes.ts:16-18]
- [x] [Review][Patch] Vitest `include` bỏ sót `.test.tsx` — test component tương lai bị skip im lặng, gate xanh giả [vite.config.ts:10]
- [x] [Review][Patch] Dead zone 0.02px giữa hai breakpoint (`max-width: 767.98px` vs `min-width: 768px`) — dùng range syntax `width < 768px` hai phía [src/styles/tokens.css:141, src/app/AppLayout.module.css:47]
- [x] [Review][Patch] `min-height: 100vh` → `100dvh` (dynamic toolbar mobile) [src/app/AppLayout.module.css:2]
- [x] [Review][Patch] `tsconfig.node.json` thiếu `strict: true` — vite.config.ts compile non-strict [tsconfig.node.json]
- [x] [Review][Patch] `package.json` thiếu `engines.node >= 22.12` (AR-1) — máy Node cũ fail khó hiểu thay vì bị chặn rõ ràng [package.json]
- [x] [Review][Patch] `lib` thiếu `DOM.Iterable` — for...of trên NodeList/URLSearchParams sau này fail typecheck khó hiểu [tsconfig.app.json:5]
- [x] [Review][Patch] Touch target chỉ enforce `min-height` cho `button`, thiếu `min-width` [src/styles/global.css:57]
- [x] [Review][Defer] SPA rewrite nuốt 404 của asset thiếu (trả HTML 200) — config đúng theo AR-9; xem lại khi load âm thanh thật (story 2.3) — deferred, spec-prescribed
- [x] [Review][Defer] Component token composite `bpm-display.typography`/`pattern-cell.typography` chưa map riêng (role tokens đã đủ) — map khi MetronomeBlock/PatternGrid tiêu thụ (story 1.3/2.4) — deferred
- [x] [Review][Defer] ARCHITECTURE-SPINE Structural Seed ghi "RouterProvider" mâu thuẫn AD-6 declarative — cần sửa doc spine, không phải code — deferred, doc reconciliation
- [x] [Review][Defer] Skip link + focus management khi đổi route (Accessibility Floor) — thêm khi flow thật xuất hiện (story 1.3+) — deferred

## Dev Notes

### Điều BẮT BUỘC — architecture guardrails cho story này

- **AR-1/Stack (đã web-verify 2026-07-08):** Node ≥ 22.12 LTS · Vite 8.1.x (create-vite, Rolldown) · React 19.2.x · TypeScript 6.0.x strict · react-router 8.1.x (package `react-router`, declarative mode) · Vitest 4.1.x · oxlint ~1.7x (starter default) · @fontsource/be-vietnam-pro 5.2.x. Registry latest tại ngày verify: vite 8.1.3, react 19.2.7, typescript 6.0.3, react-router 8.1.0, vitest 4.1.10, @fontsource/be-vietnam-pro 5.2.8. [Source: architecture/.../ARCHITECTURE-SPINE.md#Stack, reviews/review-versions.md#1]
- **Lint = oxlint, KHÔNG ESLint.** Template react-ts hiện ship `oxlint + .oxlintrc.json`, không còn ESLint (vitejs/vite#22025). AC-1 khẳng định "ESLint config không tồn tại". Đừng "sửa" điều này. [Source: reviews/review-versions.md#F-2; epics.md Story 1.1 AC1]
- **AD-1 layering (một chiều):** `app → features → ui/core/content`, `ui → core`, `content → core`. `core/` + `content/` không import React. `features/` không import lẫn nhau. Story này chỉ tạo skeleton thư mục — đừng đặt code sai tầng ngay từ đầu (nav/layout thuộc `app/`, không phải `ui/`). [Source: ARCHITECTURE-SPINE.md#AD-1]
- **AD-5 tokens là nguồn styling duy nhất:** token DESIGN.md → `styles/tokens.css` 1-1, tên giữ nguyên; breakpoint 768px + responsive override sống TRONG tokens.css; component chỉ `var(...)`; plain CSS modules per component — KHÔNG Tailwind, KHÔNG CSS-in-JS. [Source: ARCHITECTURE-SPINE.md#AD-5]
- **AD-6 routes:** 5 path hằng số trong `app/routes.ts`: `/`, `/lo-trinh`, `/bai-hoc/:id`, `/metronome`, `/tien-do`. Mọi Link/navigate/Route tham chiếu hằng số. [Source: ARCHITECTURE-SPINE.md#AD-6]
- **AD-7 asset tự host:** font qua `@fontsource/be-vietnam-pro` bundle (KHÔNG Google Fonts CDN, KHÔNG `<link>` font). [Source: ARCHITECTURE-SPINE.md#AD-7]
- **AR-9 deploy:** Vercel static; `vercel.json` rewrites bắt buộc (deep link 404 nếu thiếu — docs Vercel xác nhận SPA fallback KHÔNG native); build command = `npm run check` để quality gate chạy trong build. Một môi trường duy nhất (production), deploy = git push. [Source: ARCHITECTURE-SPINE.md#Stack+Vận-hành, reviews/review-versions.md#F-1]

### Token map — DESIGN.md frontmatter → tokens.css (đủ danh sách, không tự bịa giá trị)

Quy ước tên: `--color-*`, `--font-*`/`--font-size-*`, `--rounded-*`, `--spacing-*`, component `--<component>-*`. Giá trị lấy VERBATIM từ DESIGN.md frontmatter:

- **Colors (17):** surface-base `#17171A`, surface-raised `#202024`, surface-overlay `#2A2A30`, border-subtle `#33333A`, amber `#FFB020`, amber-bright `#FFC94D`, amber-dim `#7A5A1A`, text-primary `#F2EFE9`, text-secondary `#A8A29E`, text-muted `#918B83`, text-on-amber `#1A1206`, hand-right `#FFB020`, hand-left `#5EC8D8`, beat-inactive `#3A3A42`, success `#4ADE80`, danger `#F87171`, focus-ring `#FFC94D`
- **Typography (6 vai trò):** display-bpm 96px/700/-0.02em · pattern-letter 56px/800 (→ 40px mobile qua `--font-size-pattern-letter`) · h1 32px/700/1.25 · h2 24px/600/1.3 · body 16px/400/1.6 · small 14px/400/1.5 — tất cả font-family `'Be Vietnam Pro', system-ui, sans-serif`
- **Rounded (4):** sm 6px, DEFAULT 10px, lg 16px, full 9999px
- **Spacing (9):** 1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px, 12=48px, gutter=24px, page-max-width=1080px
- **Components (12 nhóm):** button-primary, button-secondary, card, bpm-display, beat-dot (size 20px, accent-scale 1.4), pattern-cell, progress-bar (height 8px), checklist-item, video-embed (aspect 16/9), drum-map, nav (height-desktop 60px, height-mobile-tabbar 56px, item-active-indicator 2px solid amber) — token tham chiếu chéo (`{colors.amber}`) resolve thành `var(--color-amber)`
- Bóng đổ duy nhất cho overlay: `0 8px 24px rgba(0,0,0,0.4)` (chưa cần dùng ở story này)

[Source: ux-designs/ux-drum-beginner-2026-07-08/DESIGN.md frontmatter + #Colors + #Components]

### Nav spec (hành vi)

- Desktop ≥768px: header ngang sticky top, 60px, nền surface-base + viền dưới border-subtle. Mobile <768px: bottom tab bar 56px ghim đáy. 4 mục: **Trang chủ · Lộ trình · Metronome · Tiến độ** (đúng thứ tự, UI text tiếng Việt inline — NFR-1, không i18n).
- Active = route hiện tại; `/bai-hoc/:id` không có tab riêng → active giữ ở "Lộ trình" (cần custom match, NavLink default không cover case này).
- Touch target ≥ 44px cho tab items. [Source: EXPERIENCE.md#Component-Patterns nav, DESIGN.md#Components nav, epics.md UX-DR3]

### Phạm vi — KHÔNG làm trong story này

- KHÔNG MetronomeEngine / AudioContext / Web Worker (Story 1.2). KHÔNG MetronomeBlock UI (Story 1.3).
- KHÔNG content data, types Phase/Week/LessonItem (Story 2.1). KHÔNG progress store/localStorage (Story 3.1 — "create when needed", readiness report xác nhận không front-load).
- Placeholder pages chỉ cần h1 + text tối giản trong layout — đừng dựng UI thật của từng trang.
- KHÔNG cài `@testing-library/react` (Deferred — thêm khi UI test đầu tiên có giá trị); test 1.1 là pure TS test cho routes.

### Testing

- Vitest 4.1.x, chạy trong `npm run check`. Story này cần tối thiểu 1 unit test thật (đề xuất: `app/routes.ts` constants/builder) để AC-3 "test đỏ → build đỏ" verify được. `core/` unit tests bắt buộc bắt đầu từ Story 1.2 (AR-10). [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions test row; implementation-readiness-report#issue-3]

### Conventions áp dụng ngay

- Component `PascalCase.tsx`, module thuần `kebab-case.ts`, hook `useX.ts`, CSS module `PascalCase.module.css` cạnh component.
- UI text tiếng Việt inline; thuật ngữ trống giữ tiếng Anh.
- Không throw xuyên tầng UI (chưa có store/engine ở story này, nhưng đặt nền nếp).
[Source: ARCHITECTURE-SPINE.md#Consistency-Conventions]

### Project Structure Notes

- Repo root hiện chỉ có `_bmad/`, `_bmad-output/`, `docs/`, `prompt.md` — chưa có code. Scaffold Vite vào ROOT repo (package.json ở root), không lồng thư mục con.
- Cây `src/` đích (Structural Seed): `main.tsx`, `app/` (router+layout+routes.ts), `ui/`, `features/{roadmap,lesson,practice,metronome,progress}/`, `core/` (trống, có types.ts sau), `content/` (trống), `styles/{tokens.css,global.css}`; `public/sounds/`; `vercel.json` root.
- `.oxlintrc.json` của starter giữ nguyên; `_bmad*/` không cần lint — thêm ignore nếu oxlint quét phải.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.1] — story + AC gốc
- [Source: _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/ARCHITECTURE-SPINE.md] — AD-1, AD-5, AD-6, AD-7, AR-9, Stack, Structural Seed, Conventions
- [Source: _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/reviews/review-versions.md] — versions verified 2026-07-08, F-1 (vercel.json bắt buộc), F-2 (oxlint), F-3 (Node 22.12)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/DESIGN.md] — token frontmatter verbatim, nav visual spec
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/EXPERIENCE.md] — IA 5 surfaces, nav behavior, Accessibility Floor
- [Source: _bmad-output/planning-artifacts/implementation-readiness-report-2026-07-08.md] — issue 3: placeholder test cho quality gate

## Dev Agent Record

### Agent Model Used

claude-fable-5 (Claude Code)

### Debug Log References

- Red-green cho routes: `vitest run` đỏ khi `routes.ts` chưa tồn tại → implement → 6/6 xanh.
- Gate proof: test đỏ tạm (`gate-proof.test.ts`) → `npm run check` exit 1; xóa → exit 0.
- Smoke test: `vite preview` port 4173 → `GET /` 200, `GET /lo-trinh` 200, title "Drum Beginner — Tự học trống".

### Completion Notes List

- **Deviation 1 (đã ghi trong task):** template react-ts hiện tại KHÔNG bật `"strict": true` — đã thêm thủ công vào `tsconfig.app.json` để thỏa AR-1/NFR-6.
- **Deviation 2:** `check` dùng `tsc -b` thay `tsc --noEmit` — template dùng TS project references (root tsconfig `files: []`), `tsc --noEmit` không typecheck gì ở cấu hình này; `tsc -b` với cả 2 sub-config `noEmit: true` là bước typecheck tương đương đúng ý AC.
- **Deviation 3:** scaffold qua thư mục tạm rồi copy vào root (CLI Vite từ chối thư mục non-empty) — đúng contingency ghi sẵn trong story.
- `vercel.json` bake sẵn `buildCommand`/`outputDirectory` — import repo vào Vercel là chạy được, không cần config dashboard.
- Token map: DESIGN.md frontmatter có 11 component groups (story ước lượng "12" — con số 12 của UX-DR1 tính cả shadow-overlay; đã thêm `--shadow-overlay`).
- `.gitignore` repo đã có sẵn và đủ (node_modules, dist, .vercel) — giữ nguyên, không lấy bản của template.
- **Code review round 1 (2026-07-08):** 3 layer adversarial (Blind Hunter, Edge Case Hunter, Acceptance Auditor) — 13 patch findings applied trong cùng phiên: catch-all 404 route (`NotFoundPage` trong layout), `color-scheme: dark` + theme-color meta, safe-area inset cho bottom tab bar + `viewport-fit=cover`, normalize pathname trong `activeNavPath` (trailing slash/case khớp router matcher, `/bai-hoc` trần → null), derive `ROUTES.lesson` từ `LESSON_BASE`, `encodeURIComponent` trong `lessonPath`, vitest include `.test.{ts,tsx}`, breakpoint range syntax (`width < 768px` / `width >= 768px`) hai phía, `100dvh` + fallback, strict cho tsconfig.node.json, `engines.node >=22.12`, `DOM.Iterable`, button `min-width: 44px`. Tests 6 → 8. Gate xanh sau patch. 4 defer ghi vào deferred-work.md, 7 dismiss.
- User đã đổi `lint`/`check` sang `oxlint src` (scope lint vào src) — giữ nguyên.

### File List

- package.json (mới — name drum-beginner, scripts check/test, deps react-router + fontsource + vitest)
- package-lock.json (mới)
- index.html (mới — lang vi, title app)
- vite.config.ts (mới — plugin react + vitest config)
- vercel.json (mới — rewrites + buildCommand + outputDirectory)
- tsconfig.json / tsconfig.app.json / tsconfig.node.json (mới từ template; app.json thêm "strict": true)
- .oxlintrc.json (mới từ template, giữ nguyên)
- public/favicon.svg (mới từ template)
- public/sounds/.gitkeep (mới)
- src/main.tsx (mới)
- src/app/routes.ts (mới)
- src/app/routes.test.ts (mới — 6 tests)
- src/app/App.tsx (mới)
- src/app/NotFoundPage.tsx (mới — review patch: catch-all 404)
- src/app/AppLayout.tsx (mới)
- src/app/AppLayout.module.css (mới)
- src/styles/tokens.css (mới)
- src/styles/global.css (mới)
- src/features/roadmap/HomePage.tsx (mới)
- src/features/roadmap/RoadmapPage.tsx (mới)
- src/features/lesson/LessonPage.tsx (mới)
- src/features/metronome/MetronomePage.tsx (mới)
- src/features/progress/ProgressPage.tsx (mới)
- src/features/practice/.gitkeep (mới)
- src/core/.gitkeep (mới)
- src/content/.gitkeep (mới)
- src/ui/.gitkeep (mới)

## Change Log

- 2026-07-08: Scaffold Vite 8.1 react-ts vào repo root, TS strict, oxlint giữ nguyên; Structural Seed tree; tokens.css + global.css theo DESIGN.md; router 5 routes + nav responsive + 5 placeholder pages; quality gate `npm run check` (proven: test đỏ → gate đỏ); vercel.json SPA rewrites. Còn lại: push GitHub + deploy Vercel (user action).
- 2026-07-08: Addressed code review findings — 13 items resolved (404 catch-all, color-scheme dark, iOS safe-area, nav-active normalization, route single-source, id encoding, vitest tsx include, breakpoint range syntax, 100dvh, node tsconfig strict, engines, DOM.Iterable, touch min-width); 4 deferred → deferred-work.md; tests 6 → 8; gate xanh.
