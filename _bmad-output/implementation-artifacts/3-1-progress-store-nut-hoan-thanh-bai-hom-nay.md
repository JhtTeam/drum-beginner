# Story 3.1: Progress store + nút "Hoàn thành bài hôm nay"

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a người tự học trống,
I want đánh dấu hoàn thành bài và thấy checkmark trên lộ trình còn nguyên sau khi đóng trình duyệt,
so that tôi biết mình đã đi đến đâu.

## Acceptance Criteria

**AC-1 — Store + hoàn thành bài + persist**

**Given** module `core/progress/` sở hữu key `drum-beginner:progress:v1` với envelope `{schemaVersion: 1, completedLessons, bestTempos, sessions}` (AR-5, không import React); mọi mutation qua API store; load phân biệt `empty | ok | corrupt`
**When** bấm nút primary "✓ Hoàn thành bài hôm nay" cuối trang bài học
**Then** `completedLessons[id]` ghi timestamp ISO (lần đầu — hoàn thành lại không đổi), `sessions` thêm một entry (chỉ ghi ở hành động này — AR-5), checkmark success hiện trên card lộ trình (FR-15, UX-DR8), không tự chuyển trang mà gợi ý bài kế tiếp
**And** reload trình duyệt: mọi trạng thái còn nguyên (FR-17).

**AC-2 — Ghi thất bại + dữ liệu corrupt**

**Given** localStorage ghi thất bại (mock)
**When** bấm Hoàn thành
**Then** UI giữ nguyên trạng thái, toast nhẹ "Chưa lưu được — thử lại", nút bấm lại được (UX-DR9)
**And** localStorage chứa dữ liệu corrupt khi mở app → cảnh báo + nút "Bắt đầu lại" (chỉ ghi đè khi user bấm) + gợi ý import file backup (UX-DR9).

**AC-3 — Unit test cho core/progress**

**Given** bộ unit test cho `core/progress` (AR-10)
**When** `vitest run`
**Then** test xanh cho: selector `getStreak` (ngày distinct theo local timezone, không so chuỗi UTC trực tiếp), `getNextItem` (item chưa hoàn thành đầu tiên theo thứ tự lộ trình), `getWeekProgress` ("N/M" với M = tổng item của tuần), load 3 trạng thái.

## Tasks / Subtasks

- [ ] **Task 1 — Envelope + kiểu dữ liệu store (AC: #1, #2)**
  - [ ] Định nghĩa trong `core/progress/` các kiểu: `ProgressEnvelope` = `{ schemaVersion: 1; completedLessons: Record<LessonItemId, IsoDateTime>; bestTempos: Record<LessonItemId, number>; sessions: IsoDateTime[] }` (khóa dùng `LessonItemId` từ `core/types`, AD-4)
  - [ ] Định nghĩa alias `IsoDateTime = string` (comment: `toISOString()` UTC — Conventions "Ngày giờ")
  - [ ] Hằng số `STORAGE_KEY = 'drum-beginner:progress:v1'` và `SCHEMA_VERSION = 1`; hàm `emptyEnvelope()` trả envelope rỗng hợp lệ (`{ schemaVersion: 1, completedLessons: {}, bestTempos: {}, sessions: [] }`)
- [ ] **Task 2 — Validate + load 3 trạng thái (AC: #1, #2, #3)**
  - [ ] Viết validator thuần `parseEnvelope(raw: string | null): LoadResult` trả discriminated union `{ status: 'empty' } | { status: 'ok'; data: ProgressEnvelope } | { status: 'corrupt'; raw: string }`
  - [ ] `empty` = `raw === null`; `corrupt` = JSON hỏng HOẶC shape sai (schemaVersion ≠ 1, thiếu/sai kiểu bất kỳ trường nào); `ok` = shape đúng đủ. Validate đầy đủ từng trường (không chỉ `typeof === 'object'`) — mirror yêu cầu import của story 3.4
  - [ ] KHÔNG throw xuyên tầng — trả kết quả tường minh (Conventions "Lỗi & trạng thái")
- [ ] **Task 3 — ProgressStore class với dependency injection (AC: #1, #2)**
  - [ ] Tạo class `ProgressStore` nhận `StorageLike = { getItem(key: string): string | null; setItem(key: string, value: string): void }` qua constructor (DI — mirror `MetronomeEngine`/`SamplePlayer`, vì test env `node` KHÔNG có `localStorage`)
  - [ ] Load một lần lúc khởi tạo qua `parseEnvelope`; giữ snapshot in-memory `{ status, data }` (corrupt → `data = emptyEnvelope()` cho phần đọc, nhưng giữ `status='corrupt'` để banner phản ứng)
  - [ ] `getSnapshot()` trả tham chiếu ổn định (chỉ thay object khi có mutation — bắt buộc cho `useSyncExternalStore`); `subscribe(cb)` trả hàm unsubscribe; mutation gọi listeners
  - [ ] `completeLesson(id, nowIso): WriteResult` — `WriteResult = { ok: true } | { ok: false; reason: 'write-failed' | 'corrupt' }`:
    - Nếu `status==='corrupt'` → trả `{ ok: false, reason: 'corrupt' }`, KHÔNG ghi (giữ bất biến "chỉ ghi đè corrupt khi user bấm Bắt đầu lại")
    - Ghi `completedLessons[id] = nowIso` CHỈ nếu chưa có (hoàn thành lại giữ timestamp lần đầu); luôn append `nowIso` vào `sessions`
    - Persist qua `setItem`; nếu `setItem` throw (quota/mock fail) → rollback snapshot in-memory về trước mutation, trả `{ ok: false, reason: 'write-failed' }`; thành công → cập nhật snapshot + emit, trả `{ ok: true }`
  - [ ] `reset(): WriteResult` — ghi đè `emptyEnvelope()` (đường DUY NHẤT overwrite dữ liệu corrupt); persist + emit
  - [ ] `isCompleted(id): boolean` tiện dụng đọc từ snapshot (hoặc để feature tự đọc `snapshot.data.completedLessons[id]`)
- [ ] **Task 4 — Selectors thuần (AC: #1, #3)**
  - [ ] Viết selectors là **hàm thuần trong `core/progress/`**, KHÔNG import `content/` (AD-1: core không import content) — nhận dữ liệu lộ trình qua tham số từ call site:
    - `getStreak(sessions: IsoDateTime[], now: Date): number` — đếm chuỗi ngày **local** distinct liên tiếp tính lùi từ hôm nay; nếu ngày gần nhất là hôm nay HOẶC hôm qua thì chuỗi còn sống, cách >1 ngày → 0. So sánh theo ngày local (year-month-day của `new Date(iso)`), KHÔNG so chuỗi UTC trực tiếp
    - `getNextItem(completedLessons, orderedItemIds: LessonItemId[]): LessonItemId | undefined` — id chưa-hoàn-thành ĐẦU TIÊN theo thứ tự truyền vào; tất cả xong → `undefined`
    - `getWeekProgress(completedLessons, weekItemIds: LessonItemId[]): { done: number; total: number }` — `total = weekItemIds.length`, `done` = số item trong tuần đã có trong `completedLessons`
  - [ ] Feature/hook chịu trách nhiệm lấy `orderedItemIds`/`weekItemIds` từ `content` (getPhases/getWeeks) rồi truyền vào selector — giữ AD-1 sạch
- [ ] **Task 5 — Public entry singleton `core/progress/index.ts` (AC: #1, #2)**
  - [ ] Export singleton `progress = new ProgressStore(realStorage)` với `realStorage` bọc `window.localStorage`, **guard `typeof window !== 'undefined'`** (mirror `core/audio/index.ts`) — import gián tiếp trong env node không được nổ ở side-effect cấp module; env không window → dùng in-memory storage fallback
  - [ ] Re-export các type/hằng cần cho feature/ui (`ProgressEnvelope`, `LoadResult`, `WriteResult`, selectors, `STORAGE_KEY`); feature/ui chỉ import từ `core/progress`, không import sâu file con
- [ ] **Task 6 — React binding `ui/useProgress.ts` (AC: #1, #2)**
  - [ ] Hook `useProgress()` bind snapshot qua `useSyncExternalStore(progress.subscribe, progress.getSnapshot)` — đặt ở `ui/` vì roadmap + lesson + progress + home đều tiêu thụ (AD-1: dùng chung hạ xuống ui/), mirror `ui/useMetronome.ts`
  - [ ] (Tùy chọn) helper `useProgressSelectors` bọc sẵn getNextItem/getWeekProgress với content — hoặc để feature tự gọi selector; giữ tối giản
- [ ] **Task 7 — Nút "Hoàn thành bài hôm nay" trong LessonPage (AC: #1, #2)**
  - [ ] Thêm section cuối `features/lesson/LessonPage.tsx`: nút primary "✓ Hoàn thành bài hôm nay" (áp dụng cho MỌI item, cả theory lẫn exercise)
  - [ ] Nếu đã hoàn thành: đổi trạng thái nút thành "Đã hoàn thành ✓" (vẫn cho bấm lại — append session hợp lệ nhiều lần/ngày, AR-5) HOẶC hiển thị trạng thái hoàn thành; chọn microcopy động từ (UX-DR10)
  - [ ] onClick gọi `progress.completeLesson(item.id, new Date().toISOString())`; đọc `WriteResult`:
    - `ok` → hiển thị gợi ý bài kế tiếp (link tới `getNextItem` qua `lessonPath`) — KHÔNG auto-navigate (AC-1); checkmark trên roadmap tự cập nhật qua snapshot
    - `reason==='write-failed'` → toast nhẹ "Chưa lưu được — thử lại", nút bấm lại được (UX-DR9)
    - `reason==='corrupt'` → không ghi; banner corrupt toàn cục (Task 9) đã hướng dẫn "Bắt đầu lại"
  - [ ] Toast: dùng element `role="status"` transient, tối giản (không thêm dependency) — có thể là state local trong LessonPage hoặc component nhỏ `ui/Toast`; tự ẩn sau vài giây
- [ ] **Task 8 — Checkmark trên card Lộ trình (AC: #1)**
  - [ ] `features/roadmap/RoadmapPage.tsx` đọc `useProgress()`, mỗi card kiểm `completedLessons[item.id]` → hiện checkmark success (UX-DR8: KHÔNG gạch ngang chữ, chỉ thêm checkmark)
  - [ ] Style qua token có sẵn (`--color-success`…) trong `RoadmapPage.module.css` — không hex/px trần (AD-5)
- [ ] **Task 9 — Banner corrupt toàn cục (AC: #2)**
  - [ ] Component `ui/ProgressCorruptBanner.tsx` đọc `useProgress()`; khi `status==='corrupt'` hiển thị cảnh báo + nút "Bắt đầu lại" (gọi `progress.reset()` — chỉ ghi đè ở click này) + dòng gợi ý import file backup (text trỏ tới trang Tiến độ; wiring import thật là story 3.4 — chỉ để gợi ý, không build UI import ở đây)
  - [ ] Mount banner trong `app/AppLayout.tsx` (trên `<Outlet/>`) để hiện "khi mở app" ở mọi trang; `status!=='corrupt'` → render null
  - [ ] Style qua token; giọng điệu không chê (UX-DR9/UX-DR10)
- [ ] **Task 10 — Unit tests core/progress (AC: #3)**
  - [ ] `core/progress/*.test.ts` (env node, DI — KHÔNG jsdom, model theo `sample-player.test.ts`):
    - `parseEnvelope`: empty (null) / ok (shape đúng) / corrupt (JSON hỏng, thiếu trường, sai kiểu, `schemaVersion` lạ, `{schemaVersion:1}` rỗng-nhưng-đúng-shape → ok)
    - `getStreak`: rỗng → 0; nhiều session cùng ngày → đếm 1 ngày; chuỗi liên tiếp kết thúc hôm nay → đúng; gãy giữa → dừng; ngày gần nhất là hôm qua → còn sống; ngày gần nhất >1 ngày trước → 0; **case biên timezone** (session UTC 23:00 và 01:00 rơi cùng/khác ngày local tùy TZ — chốt bằng ngày local)
    - `getNextItem`: chưa hoàn thành gì → item đầu; hoàn thành vài item giữa chừng → item chưa xong đầu tiên theo thứ tự; tất cả xong → undefined
    - `getWeekProgress`: 0/M; k/M; M/M
    - `ProgressStore`: `completeLesson` ghi completed+session, hoàn thành lại giữ timestamp lần đầu nhưng vẫn thêm session; `setItem` throw → `{ok:false, 'write-failed'}` + snapshot không đổi; corrupt → `completeLesson` trả `{ok:false,'corrupt'}` không ghi; `reset` ghi đè empty; subscribe nhận notify sau mutation

## Dev Notes

### Bối cảnh & giá trị

Đây là story ĐẦU của Epic 3 và là nền móng cho toàn epic: `core/progress/` mà story 3.2 (trang chủ "Hôm nay" + streak), 3.3 (trang Tiến độ + best tempo) và 3.4 (export/import) đều xây tiếp lên. Store + selectors + envelope phải đúng ngay từ 3.1 vì đổi shape sau sẽ kéo theo migrate. AR-5 và AR-10 là binding.

### Guardrails kiến trúc (BẮT BUỘC tuân thủ)

- **AD-1 (hướng phụ thuộc một chiều):** `core/progress/` KHÔNG import `react`, `app/`, `ui/`, `features/`, **và KHÔNG import `content/`** (đồ thị: `content → core`, không có chiều ngược). Hệ quả thiết kế: selectors nhận danh sách item của lộ trình **qua tham số**, feature/hook lấy từ `content` rồi truyền vào. [Source: ARCHITECTURE-SPINE.md#AD-1]
- **AD-4 (progress store một chủ):** một module sở hữu key `drum-beginner:progress:v1`; envelope đúng `{schemaVersion:1, completedLessons, bestTempos, sessions}`; mọi giá trị dẫn xuất (streak, bài tiếp theo, N/M) là **selector trong core/progress**, UI chỉ gọi selector không tự tính; load phân biệt `empty|ok|corrupt`; import validate đầy đủ rồi ghi đè sau xác nhận (import UI là 3.4). [Source: ARCHITECTURE-SPINE.md#AD-4]
- **Ngày giờ (Conventions):** lưu `toISOString()` (UTC); mọi so "cùng ngày"/streak quy về **ngày local** qua selector — KHÔNG so chuỗi UTC trực tiếp. Đây là bẫy chính của `getStreak`. [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions]
- **Lỗi & trạng thái:** store KHÔNG throw xuyên tầng UI — trả kết quả tường minh (`LoadResult`/`WriteResult`); UI hiển thị theo State Patterns (toast nhẹ, không chặn). [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions]
- **AD-5 (token-only):** component chỉ dùng `var(...)`, không hex/px trần cho giá trị đã có token. [Source: ARCHITECTURE-SPINE.md#AD-5]
- **AD-6 (routes hằng số):** mọi link dùng `ROUTES`/`lessonPath()` từ `app/routes.ts`, không string literal. [Source: src/app/routes.ts]
- **Test & quality gate:** `core/` bắt buộc unit test; `npm run check` = `tsc -b` + `oxlint src` + `vitest run` + `vite build` là quality gate — build đỏ khi test đỏ. [Source: package.json]

### Ràng buộc môi trường test (quan trọng — quyết định API shape)

Vitest chạy env `node` (`vite.config.ts`: `test.environment: 'node'`) — **KHÔNG có `localStorage`, KHÔNG jsdom**. Vì vậy `ProgressStore` PHẢI nhận storage qua **dependency injection** (giống `SamplePlayer`/`MetronomeEngine` nhận deps qua constructor), test truyền fake storage (một object `{getItem, setItem}` có Map bên trong + cờ `failWrite` để mô phỏng quota). KHÔNG được `import`/đụng `window.localStorage` trong file test được, và KHÔNG thêm dependency mới (jsdom) — cùng ràng buộc "zero dependency mới" như các story trước. [Source: vite.config.ts; src/core/audio/sample-player.test.ts]

Các React component (LessonPage, RoadmapPage, banner, hook) KHÔNG có test tự động — đây là khoảng trống đã biết của repo (chỉ module thuần `core/`/`ui/` được unit-test; không có harness component). Không phát sinh test component trong story này; test tập trung ở `core/progress`. [Source: deferred-work.md — mục 2.4 "Logic stateful không có test tự động"]

### Pattern tham chiếu trong code hiện có

- **Singleton + DI + guard window:** `src/core/audio/index.ts` — instance module-level, deps thật wiring chỉ ở entry, `if (typeof window !== 'undefined')` cho side-effect. Làm y hệt cho `core/progress/index.ts`.
- **useSyncExternalStore binding:** `src/ui/useMetronome.ts` (9 dòng) — mẫu chuẩn cho `ui/useProgress.ts`. Store phải expose `subscribe` + `getSnapshot` với snapshot tham chiếu ổn định.
- **Fake deps trong test (không mock module):** `src/core/audio/sample-player.test.ts` — fake context ghi lại lời gọi. Dùng cùng phong cách cho fake storage.
- **Discriminated union theo trạng thái:** `core/types.ts` (Video/LessonItem) và snapshot metronome — dùng cho `LoadResult`/`WriteResult`.

### Nơi chạm & hành vi phải giữ (đọc trước khi sửa)

- `src/features/lesson/LessonPage.tsx` (UPDATE): hiện render mục tiêu → lý thuyết → sơ đồ → video → luyện tập → **Thực hành**. Thêm section nút hoàn thành **sau** "Thực hành". Giữ nguyên nhánh 404 nội dung (`!found`) và toàn bộ thứ tự section hiện có. Component đã có comment mốc "(3.1 sẽ thêm link bài kế)" ở dòng 84 — đúng chỗ ta bổ sung gợi ý bài kế tiếp.
- `src/features/roadmap/RoadmapPage.tsx` (UPDATE): render card từ `getPhases()`. Thêm đọc `useProgress()` + checkmark; KHÔNG đổi cấu trúc link/card, chỉ thêm dấu hoàn thành (UX-DR8 không gạch ngang chữ).
- `src/app/AppLayout.tsx` (UPDATE): mount `<ProgressCorruptBanner/>` trên `<Outlet/>`. Giữ nguyên nav.
- `src/features/roadmap/HomePage.tsx` & `src/features/progress/ProgressPage.tsx`: là stub — story 3.2/3.3 xử lý, story 3.1 KHÔNG cần đụng (trừ khi muốn thêm dùng thử selector, không bắt buộc).
- `src/content/index.ts`: cung cấp `getPhases()`/`getWeeks()`/`getItemById()` để bridge content → selector. KHÔNG sửa content.

### Chi tiết selector `getStreak` (điểm dễ sai nhất)

- Chuẩn hóa mỗi session ISO → khóa ngày local `YYYY-MM-DD` bằng các getter local (`getFullYear/getMonth/getDate` của `new Date(iso)`), gom thành `Set` ngày distinct.
- Streak = số ngày liên tiếp lùi từ mốc: nếu tập chứa "hôm nay" → bắt đầu đếm từ hôm nay; nếu không nhưng chứa "hôm qua" → bắt đầu từ hôm qua (chuỗi chưa đứt vì hôm nay chưa tập); nếu ngày gần nhất cách >1 ngày → 0.
- Truyền `now: Date` vào selector (không gọi `new Date()` bên trong) để test tất định — mirror cách engine nhận `now` qua DI.

### Phạm vi & không làm (defer sang story sau)

- **Best tempo (`bestTempos`)**: envelope có sẵn trường nhưng ghi/hiển thị best tempo là **story 3.3** (FR-14). Story 3.1 chỉ khai báo trường trong type, không build UI ghi tempo.
- **Trang chủ "Hôm nay" + streak UI**: story 3.2 — 3.1 chỉ cung cấp selector đã test, không build thẻ "Hôm nay".
- **Export/Import UI + validator import**: story 3.4 — 3.1 build validator `parseEnvelope` (dùng chung shape) và nút "Bắt đầu lại"; UI import chỉ là dòng gợi ý text.
- **"Xong Tuần N 🎉" moment**: story 3.2 (UX-DR9) — không làm ở 3.1.

### Project Structure Notes

- File mới: `src/core/progress/index.ts`, `src/core/progress/store.ts` (hoặc gộp), `src/core/progress/envelope.ts` (types + parseEnvelope), `src/core/progress/selectors.ts`, kèm `*.test.ts`; `src/ui/useProgress.ts`, `src/ui/ProgressCorruptBanner.tsx` (+ `.module.css`); (tùy chọn) `src/ui/Toast.tsx`.
- Đặt tên theo Conventions: module thuần `kebab-case.ts`, component `PascalCase.tsx`, hook `useX.ts`, CSS module `PascalCase.module.css` cạnh component.
- Không mâu thuẫn Structural Seed: `core/progress/` đã được dành sẵn trong cây thư mục ARCHITECTURE-SPINE.
- Không chạm `styles/tokens.css` / `styles/global.css` (dùng token có sẵn); nếu cần token success cho checkmark mà chưa có → kiểm `tokens.css` trước, ưu tiên token đã tồn tại (`--color-success`).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.1] — user story + AC gốc
- [Source: _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/ARCHITECTURE-SPINE.md#AD-4] — progress store envelope + selectors + load 3 trạng thái
- [Source: ARCHITECTURE-SPINE.md#AD-1] — hướng phụ thuộc (core không import content/react)
- [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions] — ngày giờ ISO/local, lỗi trả kết quả tường minh, quality gate
- [Source: epics.md#UX-DR8] — checkmark success không gạch ngang, progress bar
- [Source: epics.md#UX-DR9] — state patterns: corrupt cảnh báo + "Bắt đầu lại", ghi thất bại toast
- [Source: epics.md#UX-DR10] — voice & tone: xưng "bạn", động từ, không chê
- [Source: src/core/audio/index.ts] — pattern singleton + DI + guard window
- [Source: src/ui/useMetronome.ts] — pattern useSyncExternalStore
- [Source: src/core/audio/sample-player.test.ts] — pattern fake deps trong test env node
- [Source: vite.config.ts] — test environment node (không localStorage)
- [Source: src/features/lesson/LessonPage.tsx#L84] — mốc "3.1 sẽ thêm link bài kế"
- [Source: deferred-work.md] — khoảng trống test component đã biết (không phát sinh ở story này)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
