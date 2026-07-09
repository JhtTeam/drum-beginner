---
baseline_commit: db11bc54fccfd8735feddd205703c4c571e1f8ec
---

# Story 3.2: Trang chủ "Hôm nay" + streak

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a người tự học trống,
I want mở web là thấy ngay hôm nay tập bài gì và chuỗi ngày tập của mình,
so that tôi vào buổi tập trong một cú click, có động lực giữ chuỗi.

## Acceptance Criteria

**AC-1 — Onboarding lần đầu (chưa có tiến độ)**

**Given** localStorage trống (lần đầu mở — chưa hoàn thành bài nào)
**When** vào `/`
**Then** một thẻ onboarding duy nhất: "Chào bạn! Bắt đầu với Tuần 1 · Bài 1: {tiêu đề bài đầu}" với nút/link dẫn thẳng vào bài đầu lộ trình — KHÔNG wizard nhiều bước, KHÔNG hiển thị streak (UX-DR9, EXPERIENCE State Patterns).

**AC-2 — Thẻ "Hôm nay" khi đã có tiến độ**

**Given** đã có tiến độ (ít nhất một bài hoàn thành)
**When** vào `/`
**Then** thẻ "Hôm nay" hiển thị: bài tiếp theo (từ selector `getNextItem` — FR-3, UI KHÔNG tự tính) là link vào bài đó + streak 🔥 (từ selector `getStreak`) + tiến độ tuần của bài kế "Tuần N · X/M bài" (từ `getWeekProgress`); giọng điệu UX-DR10 (xưng "bạn", số liệu thẳng, không phần trăm)
**And** khi streak = 0 (chuỗi đã đứt) hiển thị trung tính "Bắt đầu chuỗi mới hôm nay" — KHÔNG chê, KHÔNG "bỏ tập N ngày" (UX-DR10)
**And** khi đã hoàn thành hết lộ trình (`getNextItem` trả `undefined`): thẻ báo hoàn thành lộ trình + streak, không có link "bài kế" gãy.

**AC-3 — Khoảnh khắc "Xong Tuần N 🎉"**

**Given** đang ở trang bài học, bài đang mở là item CHƯA hoàn thành và là item cuối cùng còn thiếu của tuần
**When** bấm "✓ Hoàn thành bài hôm nay"
**Then** ngoài checkmark + gợi ý bài kế (đã có ở 3.1), hiển thị MỘT LẦN khoảnh khắc "Xong Tuần N 🎉" (checkmark/thông điệp nảy nhẹ một lần, không confetti kéo dài) — UX-DR9
**And** khi `prefers-reduced-motion`: chỉ hiện thông điệp/đổi màu, KHÔNG nảy/scale (UX-DR2)
**And** hoàn thành LẠI một bài đã xong (tuần vốn đã đủ) KHÔNG kích hoạt lại khoảnh khắc này.

## Tasks / Subtasks

- [x] **Task 1 — Helper thứ tự lộ trình dùng chung trong `content/` (AC: #1, #2)**
  - [x] Thêm `getOrderedItemIds(): LessonItemId[]` vào `src/content/index.ts` — trả id mọi item theo đúng thứ tự lộ trình (phase → week → item), là NGUỒN DUY NHẤT của "thứ tự bài" (AD-2: content là lookup API, feature không tự duyệt cây)
  - [x] Refactor `src/features/lesson/LessonPage.tsx`: thay `const orderedItemIds = getPhases().flatMap(...)` ở module-scope bằng `getOrderedItemIds()` — bỏ trùng lặp logic thứ tự (giữ hành vi y hệt, chỉ đổi nguồn)
  - [x] Thêm test trong `src/content/index.test.ts`: `getOrderedItemIds` trả đúng số lượng và đúng thứ tự (item đầu = `gd1-t1-b1` hoặc id bài Tuần 1 đầu tiên; thứ tự khớp duyệt phase→week→item)
- [x] **Task 2 — HomePage: khung + phân nhánh onboarding / "Hôm nay" (AC: #1, #2)**
  - [x] Viết lại `src/features/roadmap/HomePage.tsx` (hiện là stub) đọc `useProgress()`; `const { data } = useProgress()`
  - [x] Xác định `hasProgress` = `Object.keys(data.completedLessons).length > 0` (chưa có tiến độ → nhánh onboarding). Cách này bao trùm cả `status==='empty'` LẪN sau `reset()` (envelope rỗng nhưng `status==='ok'`) — robust hơn so status đơn thuần
  - [x] Lấy bài kế: `const nextId = getNextItem(data.completedLessons, getOrderedItemIds())`; `const next = nextId ? getItemById(nextId) : undefined` (selector core + lookup content, KHÔNG tự tính — AD-4)
  - [x] KHÔNG xử lý riêng trạng thái `corrupt` ở HomePage: khi corrupt `data` là `emptyEnvelope()` nên nhánh onboarding hiện tự nhiên, còn `ProgressCorruptBanner` (đã mount ở AppLayout) đã cảnh báo phía trên — giữ tối giản
- [x] **Task 3 — Nhánh onboarding (AC: #1)**
  - [x] Khi `!hasProgress`: render một thẻ (card token) "Chào bạn! Bắt đầu với Tuần {week} · Bài {ordinal}: {next.item.title}" + nút primary/link `Link to={lessonPath(next.item.id)}` "Bắt đầu Tuần {week} · Bài {ordinal}" (microcopy động từ — UX-DR10)
  - [x] `next` về lý thuyết luôn tồn tại khi chưa có tiến độ (bài đầu lộ trình); vẫn guard `next` để type-safe, fallback an toàn nếu content rỗng
  - [x] KHÔNG hiển thị streak ở onboarding (streak = 0, không có ý nghĩa động viên lúc này)
- [x] **Task 4 — Nhánh thẻ "Hôm nay" (AC: #2)**
  - [x] Khi `hasProgress`:
    - [x] Streak: `const streak = getStreak(data.sessions, new Date())` (gọi selector ở call-site UI, truyền `now` vào — AD-4). `streak > 0` → dòng "🔥 Chuỗi {streak} ngày"; `streak === 0` → "Bắt đầu chuỗi mới hôm nay" (trung tính — UX-DR10)
    - [x] Nếu `next` tồn tại: thẻ "Hôm nay" hiển thị "Tuần {week} · Bài {ordinal}: {next.item.title}" là `Link` vào `lessonPath(next.item.id)`, kèm nhãn kind (`LESSON_KIND_LABEL`) tùy chọn
    - [x] Tiến độ tuần: lấy các item của tuần chứa bài kế — `getWeeks(next.phaseId).find(w => w.weekNumber === next.weekNumber)?.items.map(i => i.id)` → truyền vào `getWeekProgress(data.completedLessons, weekItemIds)` → hiển thị "Tuần {week} · {done}/{total} bài" (số liệu thẳng — UX-DR10)
    - [x] Nếu `next === undefined` (xong hết lộ trình): thẻ báo "Bạn đã hoàn thành hết lộ trình Giai đoạn 1 🎉" + streak; link về `/lo-trinh` hoặc `/tien-do`, KHÔNG link bài kế gãy
- [x] **Task 5 — CSS HomePage (AC: #1, #2)**
  - [x] Tạo `src/features/roadmap/HomePage.module.css` token-only (AD-5): dùng `--card-*`, `--button-primary-*`, `--spacing-*`, `--color-*`, `--font-size-*`… Không hex/px trần
  - [x] Single-column tự nhiên, không cần media query (giống RoadmapPage); touch target nút ≥44px (đã có từ `button`/`--button-primary-height`)
  - [x] Streak dùng `--color-success` cho điểm nhấn chuỗi (DESIGN.md: success chỉ cho hoàn thành/streak); dòng "bắt đầu chuỗi mới" dùng `--color-text-secondary` (trung tính)
- [x] **Task 6 — Khoảnh khắc "Xong Tuần N 🎉" trong LessonPage (AC: #3)**
  - [x] Trong `src/features/lesson/LessonPage.tsx`, thêm state cục bộ `const [weekDone, setWeekDone] = useState<number | null>(null)`
  - [x] Trong `handleComplete`, TRƯỚC khi gọi `completeLesson`, chụp `const wasCompleted = Object.hasOwn(data.completedLessons, item.id)` (dùng snapshot render hiện tại)
  - [x] Sau khi `result.ok` VÀ `!wasCompleted`: đọc snapshot MỚI `progress.getSnapshot().data.completedLessons` (đã emit đồng bộ), tính `weekItemIds` của tuần `found.weekNumber` qua `getWeeks(found.phaseId)`, gọi `getWeekProgress` → nếu `total > 0 && done === total` thì `setWeekDone(found.weekNumber)`
  - [x] `weekDone` reset về `null` khi đổi bài (thêm vào `useEffect([id])` đang dọn `saveError`, hoặc effect riêng) — tránh khoảnh khắc "dính" khi chuyển sang bài khác
  - [x] Tự ẩn khoảnh khắc sau vài giây (mirror `useEffect` auto-tắt `saveError`) — transient, không kéo dài
  - [x] Render khối "Xong Tuần {weekDone} 🎉" trong section completion khi `weekDone !== null` (dùng `role="status"` để screen reader đọc)
- [x] **Task 7 — CSS khoảnh khắc "Xong Tuần N" (AC: #3)**
  - [x] Trong `src/features/lesson/LessonPage.module.css`: class `.weekDone` hiển thị thông điệp (màu `--color-success` hoặc `--color-amber`), base state luôn hiện chữ + màu (không phụ thuộc motion)
  - [x] Nảy nhẹ MỘT LẦN chỉ trong `@media (prefers-reduced-motion: no-preference)` — mirror pattern MetronomeBlock `.dotActive` glow: `@keyframes` scale 1→1.08→1 `animation-iteration-count: 1`. reduced-motion: global.css đã trung hòa animation, và motion chỉ nằm trong `no-preference` nên tự tắt (UX-DR2)
- [x] **Task 8 — Verify quality gate & manual (AC: #1, #2, #3)**
  - [x] `npm run check` (tsc -b + oxlint src + vitest run + vite build) xanh — gồm test mới của `getOrderedItemIds`
  - [x] Manual: localStorage trống → `/` hiện onboarding một thẻ; hoàn thành một bài → `/` hiện thẻ "Hôm nay" (bài kế + 🔥 1 + "Tuần 1 · 1/M"); hoàn thành đủ item một tuần → LessonPage hiện "Xong Tuần N 🎉" một lần; bấm lại bài đã xong → KHÔNG hiện lại; bật reduced-motion (DevTools) → không nảy

### Review Findings

_Code review 2026-07-09 (3 lớp: Blind Hunter, Edge Case Hunter, Acceptance Auditor). AC-1/2/3 + guardrails AD-1/2/4/5/6 đều pass — không có vi phạm AC._

- [x] [Review][Decision→Patch] Hai thông điệp 🎉 chồng nhau khi hoàn thành bài CUỐI của lộ trình — bài cuối tuần cuối vừa thỏa `done===total` ("Xong Tuần N 🎉") vừa thỏa `nextItem===undefined` ("Bạn đã hoàn thành hết các bài trong lộ trình. 🎉"). **Đã fix:** guard `roadmapDone = getNextItem(...) === undefined` — không `setWeekDone` khi vừa xong hết lộ trình. `src/features/lesson/LessonPage.tsx` handleComplete.
- [x] [Review][Patch] Tách helper `getWeekItemIds(phaseId, weekNumber)` vào `content/index.ts` — bỏ lặp logic duyệt cây ở HomePage + LessonPage (AD-2). **Đã fix.**
- [x] [Review][Patch] Bỏ assertion thừa `toHaveLength(expected.length)` sau `toEqual(expected)`. **Đã fix.** [src/content/index.test.ts]
- [x] [Review][Defer] `.saveError` (danger) và `.nextHint` (secondary) bị `.article p` (0-1-1) đè màu → render nhầm `--color-text-primary` [src/features/lesson/LessonPage.module.css:140,147] — deferred, pre-existing (từ story 3.1, dev đã tự flag). Fix trivial: scope `.completion .saveError` / `.completion .nextHint` như `.weekDone`.
- [x] [Review][Defer] Nhãn "Tuần N" / "Giai đoạn 1" hardcode, nhập nhằng khi phase 2 ship (phase 2 cũng đánh số tuần từ 1) [src/features/roadmap/HomePage.tsx:302] + [src/features/lesson/LessonPage.tsx:87] — deferred, khớp microcopy spec, chỉ có 1 phase hôm nay.
- [x] [Review][Defer] `role="status"` mount có điều kiện (`weekDone !== null`) — một số screen reader chỉ đọc tin cậy khi text đổi TRONG live region đã có sẵn [src/features/lesson/LessonPage.tsx:183-187] — deferred, convention toàn app (giống `saveError` 3.1), không phải hồi quy của story này.

## Dev Notes

### Bối cảnh & giá trị

Story 3.2 biến `/` thành "màn hình khởi động buổi tập" (KF-1 bước 1, KF-2 bước 1): mở web là thấy ngay hôm nay tập gì + streak → vào bài trong một cú click. Đây là lớp động lực đầu tiên nhìn thấy được. Toàn bộ dữ liệu dẫn xuất (bài kế, streak, N/M) đã có sẵn dạng selector đã test từ story 3.1 — **story này CHỦ YẾU là UI tiêu thụ selector**, không thêm logic domain mới (trừ helper thứ tự lộ trình ở `content/`). Đồng thời hoàn tất khoảnh khắc "Xong Tuần N 🎉" mà 3.1 cố ý để lại (UX-DR9).

### Nền tảng có sẵn từ story 3.1 (ĐỌC — không xây lại)

Store + selectors + hook đã build và test (143 tests xanh). TÁI SỬ DỤNG, KHÔNG viết lại:

- **`core/progress` (public entry, chỉ import từ đây — AD-1):** singleton `progress`, `getNextItem(completedLessons, orderedItemIds)`, `getStreak(sessions, now)`, `getWeekProgress(completedLessons, weekItemIds)`, types `ProgressSnapshot`/`ProgressEnvelope`. [Source: src/core/progress/index.ts, selectors.ts]
- **`ui/useProgress()`** → `ProgressSnapshot = { status, data }` qua `useSyncExternalStore`; snapshot phản ứng khi `completeLesson` emit. [Source: src/ui/useProgress.ts]
- **Selector nhận danh sách qua tham số** (AD-1: core KHÔNG import content). Feature phải lấy `orderedItemIds`/`weekItemIds` từ `content` rồi truyền vào — pattern đã dùng ở LessonPage. [Source: src/features/lesson/LessonPage.tsx#L15-L17]
- **`content/index.ts`:** `getPhases()`, `getWeeks(phaseId)`, `getItemById(id) → { item, phaseId, weekNumber, ordinal }`. [Source: src/content/index.ts]
- **`getStreak` quy NGÀY LOCAL:** hoàn thành hôm nay → streak ≥ 1 (session ghi hôm nay); streak = 0 nghĩa buổi gần nhất > 1 ngày trước. Truyền `new Date()` làm `now` ở call-site UI. [Source: src/core/progress/selectors.ts]

### Guardrails kiến trúc (BẮT BUỘC)

- **AD-1 (phụ thuộc một chiều):** `HomePage`/`LessonPage` (features) ĐƯỢC import `content/`, `core/`, `ui/`; KHÔNG import feature khác. `core/progress` KHÔNG import content — selector nhận list qua tham số. [Source: ARCHITECTURE-SPINE.md#AD-1]
- **AD-4 (một chủ store + derived = selector):** UI CHỈ gọi selector, KHÔNG tự tính streak/next/N-M. Bài kế, streak, tiến độ tuần đều qua selector 3.1. [Source: ARCHITECTURE-SPINE.md#AD-4]
- **AD-5 (token-only):** mọi giá trị styling qua `var(...)`; không hex/px trần. [Source: src/styles/tokens.css]
- **AD-6 (routes hằng số):** link qua `ROUTES`/`lessonPath()` từ `app/routes.ts`, không string literal. [Source: src/app/routes.ts]
- **Quality gate:** `npm run check` = `tsc -b` + `oxlint src` + `vitest run` + `vite build`; build đỏ khi test đỏ. TypeScript strict. [Source: package.json]

### Nơi chạm & hành vi phải giữ (đọc trước khi sửa)

- **`src/features/roadmap/HomePage.tsx` (UPDATE, hiện là stub):** viết lại toàn bộ nội dung. Giữ export `HomePage` (App.tsx route `ROUTES.home` import named). [Source: src/app/App.tsx]
- **`src/features/lesson/LessonPage.tsx` (UPDATE):** thêm khoảnh khắc "Xong Tuần N". GIỮ NGUYÊN: nhánh 404 nội dung (`!found`), thứ tự section, `handleComplete` hiện có (chỉ BỔ SUNG nhánh phát hiện tuần xong sau `result.ok`, không đổi đường write-failed/corrupt), gợi ý bài kế + toast. Hook gọi vô điều kiện TRƯỚC early-return (rules of hooks) — thêm `weekDone` state cùng chỗ `saveError`. [Source: src/features/lesson/LessonPage.tsx]
- **`src/content/index.ts` (UPDATE):** THÊM `getOrderedItemIds()`; giữ nguyên `getPhases`/`getWeeks`/`getItemById` và `itemLocationById`. [Source: src/content/index.ts]
- **`src/content/index.test.ts` (UPDATE):** thêm case cho helper mới. [Source: src/content/index.test.ts]
- **KHÔNG chạm:** `styles/tokens.css`/`global.css` (dùng token + `@media reduced-motion` có sẵn); `core/progress/*` (selectors đã đủ — không sửa store/envelope); `RoadmapPage`/`ProgressCorruptBanner`/`AppLayout` (đã đúng).

### Chi tiết phát hiện "tuần vừa xong" (điểm dễ sai của story này)

- Khoảnh khắc phải kích hoạt trên **transition** (bài cuối tuần vừa được đánh dấu), KHÔNG phải mỗi lần bấm. Vì `completeLesson` cho phép hoàn thành lại (append session), phải chụp `wasCompleted` TRƯỚC khi gọi và chỉ fire khi `!wasCompleted && done===total`. Nếu bỏ guard `wasCompleted`, bấm lại một bài trong tuần đã xong sẽ nháy lại "Xong Tuần N" sai.
- Đọc `done/total` từ snapshot MỚI (`progress.getSnapshot()` sau khi `completeLesson` trả `ok`) — không dùng `data` cũ của render (chưa gồm item vừa xong). `completeLesson` đã emit đồng bộ nên snapshot đã cập nhật trong cùng lượt click.
- `getWeekProgress` đã tính `total = weekItemIds.length`, `done` = số item tuần đã có trong `completedLessons` → `done === total` là "tuần xong". Không cần selector mới; nếu muốn tường minh có thể bọc `isWeekComplete` nhưng không bắt buộc — giữ tối giản, tính tại call-site.

### Ràng buộc onboarding vs "Hôm nay" (phân nhánh)

- `hasProgress = Object.keys(data.completedLessons).length > 0`. Không dựa `status==='empty'` đơn thuần vì `reset()` (từ banner corrupt "Bắt đầu lại") tạo envelope rỗng với `status==='ok'` — vẫn phải hiện onboarding. `sessions.length > 0` cũng tương đương nhưng `completedLessons` khớp trực tiếp khái niệm "đã học bài nào".
- Onboarding LUÔN có bài kế (bài đầu lộ trình) vì `getNextItem` với `completedLessons` rỗng trả item đầu tiên. Vẫn guard `next` để type-safe.
- SM-1/EXPERIENCE có nhắc "tiến độ giai đoạn" ở trang chủ, nhưng AC-2 (nguồn chuẩn) chốt **tiến độ tuần** "Tuần N · X/M". Làm theo AC: hiển thị tiến độ tuần của bài kế. [Source: epics.md#Story-3.2; EXPERIENCE.md#IA]

### Ràng buộc test

- Vitest env `node` — KHÔNG jsdom/localStorage. React component (HomePage, LessonPage) KHÔNG có test tự động (khoảng trống repo đã biết — cấm thêm dependency jsdom). Test story này tập trung ở logic thuần: `getOrderedItemIds` trong `content/index.test.ts` (env node, thuần data). Selector đã được 3.1 test. [Source: vite.config.ts; deferred-work.md]
- KHÔNG phát sinh test component; verify UI bằng manual checks (Task 8).

### Pattern tham chiếu trong code hiện có

- **Feature đọc snapshot + selector:** `RoadmapPage.tsx` (`const { data } = useProgress()` rồi `Object.hasOwn(data.completedLessons, id)`), `LessonPage.tsx` (dựng `orderedItemIds`, gọi `getNextItem`). Mirror y hệt cho HomePage. [Source: src/features/roadmap/RoadmapPage.tsx, src/features/lesson/LessonPage.tsx]
- **Toast/khoảnh khắc transient:** `saveError` trong LessonPage (state + `useEffect` timeout tự ẩn + reset theo `id`). Dùng cùng khuôn cho `weekDone`. [Source: src/features/lesson/LessonPage.tsx]
- **Animation gated reduced-motion:** `MetronomeBlock.module.css` — đổi màu NGOÀI media query, hiệu ứng chuyển động (glow/scale) trong `@media (prefers-reduced-motion: no-preference)`. [Source: src/ui/MetronomeBlock.module.css#L36-L48]
- **Card token:** `RoadmapPage.module.css` `.card` (`--card-*`, padding `--spacing-4`, radius `--card-radius`). [Source: src/features/roadmap/RoadmapPage.module.css]

### Microcopy (UX-DR10 — xưng "bạn", động từ, không chê)

- Onboarding: "Chào bạn! Bắt đầu với Tuần 1 · Bài 1: {tiêu đề}" / nút "Bắt đầu".
- Streak sống: "🔥 Chuỗi {N} ngày". Streak đứt: "Bắt đầu chuỗi mới hôm nay" (KHÔNG "bỏ tập N ngày").
- Tiến độ tuần: "Tuần {N} · {done}/{total} bài" (số liệu thẳng, không %).
- Xong hết lộ trình: "Bạn đã hoàn thành hết lộ trình Giai đoạn 1 🎉".
- Khoảnh khắc: "Xong Tuần {N} 🎉".

### Phạm vi & KHÔNG làm (defer)

- **Trang Tiến độ `/tien-do` + ghi best tempo:** story 3.3 — 3.2 KHÔNG chạm `ProgressPage`.
- **Export/Import UI:** story 3.4.
- **Không thêm selector/logic vào `core/progress`** — đã đủ; chỉ thêm `getOrderedItemIds` ở `content/`.
- **Không đổi RoadmapPage/banner/AppLayout.**

### Project Structure Notes

- File mới: `src/features/roadmap/HomePage.module.css`.
- File sửa: `src/features/roadmap/HomePage.tsx`, `src/features/lesson/LessonPage.tsx` (+ `.module.css`), `src/content/index.ts` (+ `index.test.ts`).
- Đặt tên theo Conventions: component `PascalCase.tsx`, CSS module `PascalCase.module.css` cạnh component, module thuần `kebab-case.ts`.
- Không mâu thuẫn Structural Seed; `features/roadmap/` đã chứa HomePage + RoadmapPage (cùng nhóm lộ trình).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.2] — user story + AC gốc (onboarding, thẻ Hôm nay, Xong Tuần N)
- [Source: ARCHITECTURE-SPINE.md#AD-4] — progress store: derived = selector, UI chỉ gọi
- [Source: ARCHITECTURE-SPINE.md#AD-1] — hướng phụ thuộc (core không import content; feature không import feature)
- [Source: epics.md#UX-DR8] — thẻ "Hôm nay" (bài tiếp theo + streak 🔥), progress bar
- [Source: epics.md#UX-DR9] — onboarding một thẻ, "Xong Tuần N 🎉" không confetti kéo dài
- [Source: epics.md#UX-DR10] — voice & tone: xưng "bạn", động từ, streak đứt trung tính, số liệu thẳng
- [Source: EXPERIENCE.md#Information-Architecture] — Trang chủ = thẻ "Hôm nay" + streak, đích quay về mặc định
- [Source: EXPERIENCE.md#State-Patterns] — onboarding trống, hoàn thành bài/tuần, ghi thất bại
- [Source: EXPERIENCE.md#Key-Flows] — KF-1 (thẻ Hôm nay Tuần 1·Bài 3, streak 🔥, 3/6→4/6), KF-2 (onboarding lần đầu)
- [Source: src/core/progress/selectors.ts] — getNextItem/getStreak/getWeekProgress (đã test ở 3.1)
- [Source: src/ui/useProgress.ts] — useSyncExternalStore binding
- [Source: src/features/roadmap/RoadmapPage.tsx] — pattern feature đọc snapshot + checkmark
- [Source: src/features/lesson/LessonPage.tsx] — orderedItemIds, getNextItem, toast transient, handleComplete
- [Source: src/content/index.ts] — getPhases/getWeeks/getItemById lookup API
- [Source: src/ui/MetronomeBlock.module.css] — animation gated prefers-reduced-motion
- [Source: src/styles/tokens.css] — token card/button/success/spacing dùng cho HomePage
- [Source: deferred-work.md] — khoảng trống test component (không phát sinh test component ở story này)

## Dev Agent Record

### Agent Model Used

claude-fable-5 (Claude Fable 5)

### Debug Log References

- `npm run check` xanh toàn bộ: tsc -b + oxlint src + vitest run (145 tests / 9 files) + vite build.
- Verify UI tự động qua Chrome headless + CDP (vite preview :4173): 22/22 checks pass phủ AC-1/AC-2/AC-3, gồm cả emulate `prefers-reduced-motion: reduce` (animation-name = none, chữ + màu vẫn hiện) và motion bình thường (`weekDonePop`, iteration-count 1). Script: scratchpad `verify-story-3-2.mjs` (tạm, không thuộc repo).

### Completion Notes List

- **Task 1:** `getOrderedItemIds()` thêm vào `content/index.ts`, derive từ `itemLocationById` (Map giữ insertion order phase→week→item) — một nguồn thứ tự duy nhất. LessonPage refactor bỏ `getPhases().flatMap(...)` module-scope, hành vi giữ nguyên. TDD: 2 test mới viết trước (RED) rồi implement (GREEN).
- **Task 2–5:** HomePage viết lại từ stub: phân nhánh `hasProgress` theo `Object.keys(data.completedLessons).length > 0` (phủ cả empty lẫn sau `reset()`); onboarding một thẻ không streak (AC-1); thẻ "Hôm nay" = link bài kế (getNextItem) + streak (getStreak, truyền `new Date()` tại call-site) + "Tuần N · X/M bài" (getWeekProgress) (AC-2); nhánh xong-hết-lộ-trình không link bài kế gãy. CSS module mới token-only, single-column, touch target 44px, streak `--color-success`, chuỗi đứt `--color-text-secondary`.
- **Task 6–7:** LessonPage thêm `weekDone` state — fire CHỈ trên transition: chụp `wasCompleted` trước `completeLesson`, đọc snapshot mới `progress.getSnapshot()` sau `result.ok`, `done === total` → `setWeekDone(weekNumber)`; reset khi đổi bài + auto-ẩn 4s (mirror `saveError`). Render `role="status"`. CSS: base state luôn hiện chữ + màu success; nảy scale 1→1.08→1 một lần chỉ trong `@media (prefers-reduced-motion: no-preference)`.
- **Phát hiện khi verify (đã fix trong scope):** selector `.article p` (specificity 0-1-1) đè `color` của `.weekDone` (0-1-0) → đổi thành `.completion .weekDone` (0-2-0). Xác nhận lại bằng CDP: computed color = `rgb(74, 222, 128)` (--color-success).
- **Quan sát ngoài scope (defer, không sửa):** `.saveError` và `.nextHint` có sẵn từ story 3.1 cũng bị `.article p` đè `color` tương tự (hiển thị text-primary thay vì danger/secondary). Không chạm vì ngoài phạm vi story 3.2 — nên xử lý ở code review/story sau.
- Không thêm dependency; không chạm `core/progress`, tokens, RoadmapPage, AppLayout (đúng ràng buộc story).

### File List

- `src/content/index.ts` — thêm `getOrderedItemIds()`
- `src/content/index.test.ts` — 2 test mới cho `getOrderedItemIds`
- `src/features/roadmap/HomePage.tsx` — viết lại từ stub: onboarding / thẻ "Hôm nay"
- `src/features/roadmap/HomePage.module.css` — MỚI: CSS token-only cho HomePage
- `src/features/lesson/LessonPage.tsx` — refactor `orderedItemIds` + khoảnh khắc "Xong Tuần N 🎉"
- `src/features/lesson/LessonPage.module.css` — thêm `.completion .weekDone` + `@keyframes weekDonePop`
- `_bmad-output/implementation-artifacts/3-2-trang-chu-hom-nay-streak.md` — story file (checkboxes, record)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — trạng thái story

## Change Log

- 2026-07-09: Story 3.2 hoàn thành — HomePage "Hôm nay" (onboarding + thẻ bài kế/streak/tiến độ tuần) qua selector 3.1, helper `getOrderedItemIds()` trong content, khoảnh khắc "Xong Tuần N 🎉" gated reduced-motion trong LessonPage. 145 tests + build xanh; 22/22 checks UI tự động (CDP) pass. Status → review.
