# Story 3.3: Trang Tiến độ + ghi tempo tốt nhất

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a người tự học trống,
I want xem toàn cảnh tiến độ theo tuần và lưu kỷ lục tempo từng bài tập,
so that tôi thấy mình tiến bộ thật qua từng buổi.

## Acceptance Criteria

**AC-1 — Trang Tiến độ khi đã có buổi tập**

**Given** đã có tiến độ (ít nhất một buổi tập trong `sessions`)
**When** mở `/tien-do`
**Then** hiển thị:
- Checklist theo tuần: mỗi tuần liệt kê các item (theo thứ tự lộ trình) với trạng thái đã/chưa hoàn thành — kèm ký tự ✓, KHÔNG chỉ mã hóa bằng màu (FR-15, UX-DR11).
- Streak hiện tại (từ selector `getStreak`) + lịch sử ngày tập (các ngày distinct đã luyện, từ selector mới `getPracticeDays`) (FR-16).
- Progress bar mỗi tuần fill amber → chuyển `--color-success` khi đạt 100% (UX-DR8), dùng token `--progress-bar-*`.
**And** giọng điệu UX-DR10: xưng "bạn", số liệu thẳng ("Tuần N · X/M bài"), không phần trăm; streak = 0 hiển thị trung tính "Bắt đầu chuỗi mới hôm nay" — KHÔNG chê.

**AC-2 — Empty state (chưa có buổi tập nào)**

**Given** chưa có buổi tập nào (`sessions` rỗng — kể cả sau `reset()` hoặc khi `corrupt` → data là `emptyEnvelope()`)
**When** mở `/tien-do`
**Then** empty state "Chưa có buổi tập nào — hoàn thành bài đầu tiên để bắt đầu chuỗi 🔥" + nút/link dẫn về bài đầu lộ trình (item đầu của `getOrderedItemIds()`) — KHÔNG bảng rỗng vô hồn, KHÔNG checklist/streak (UX-DR9).

**AC-3 — Ghi tempo tốt nhất trong khối luyện tập**

**Given** đang ở khối luyện tập (`ui/PracticeBlock` trong một bài `kind:'exercise'`) với metronome ở tempo T
**When** bấm "Ghi tempo tốt nhất: T"
**Then** `bestTempos[id]` = T qua API store mới `setBestTempo(id, T)` (FR-14 — tự khai báo, một click; `id` là `LessonItemId` của bài, KHÔNG phải ID exercise riêng — AD-2), hiển thị lại NGAY trong khối luyện tập ("Tempo tốt nhất của bạn: T") và trong `/tien-do` (badge cạnh item exercise)
**And** chỉ ghi khi T LỚN HƠN kỷ lục cũ; T bằng/nhỏ hơn → GIỮ kỷ lục, thông báo nhẹ trung tính (UX-DR10), không ghi đè, không append session (AR-5: `sessions` chỉ ghi khi "Hoàn thành")
**And** ghi thất bại (localStorage lỗi) → toast nhẹ "Chưa lưu được — thử lại", nút bấm lại được (UX-DR9); `corrupt` → banner toàn cục xử lý (không ghi cục bộ).

**AC-4 — Unit test cho core (AR-10)**

**Given** bộ unit test cho `core/progress`
**When** `vitest run`
**Then** test xanh cho:
- `setBestTempo`: ghi mới khi chưa có kỷ lục; T > cũ → ghi đè; T = cũ / T < cũ → giữ kỷ lục + `recorded:false` + KHÔNG persist/emit; corrupt → `{ok:false,'corrupt'}`; write-failed → `{ok:false,'write-failed'}` snapshot không đổi; KHÔNG đụng `sessions`/`completedLessons`.
- `getPracticeDays`: rỗng → `[]`; nhiều session cùng ngày local → 1 ngày; nhiều ngày → distinct, sắp mới-nhất-trước; biên timezone quy về ngày local (không so chuỗi UTC).

## Tasks / Subtasks

- [ ] **Task 1 — `setBestTempo` trong ProgressStore (AC: #3, #4)**
  - [ ] Thêm type `BestTempoResult` trong `src/core/progress/store.ts`:
    `{ ok: true; recorded: boolean; best: number } | { ok: false; reason: 'write-failed' | 'corrupt' }`
    (`recorded:false` = đã có kỷ lục ≥ T, giữ nguyên; `best` = kỷ lục hiện hành sau thao tác).
  - [ ] Thêm method `setBestTempo(id: LessonItemId, tempo: number): BestTempoResult`:
    - `status === 'corrupt'` → `{ ok:false, reason:'corrupt' }` (không ghi — mirror `completeLesson`).
    - `const current = this.snapshot.data.bestTempos[id]`; nếu `current !== undefined && tempo <= current` → `{ ok:true, recorded:false, best: current }` (KHÔNG commit, KHÔNG emit — snapshot ổn định).
    - Ngược lại: `next = { ...previous.data, bestTempos: { ...previous.data.bestTempos, [id]: tempo } }`, gọi `this.commit(previous, next)`; nếu `!result.ok` → trả `result` (write-failed); nếu ok → `{ ok:true, recorded:true, best: tempo }`.
    - GIỮ NGUYÊN `completedLessons` và `sessions` (chỉ đụng `bestTempos`) — ghi best tempo KHÔNG phải một buổi tập (AR-5).
    - Precondition: `tempo` là số hữu hạn hợp lệ (caller truyền từ `metronome` snapshot 40–200) — mirror hợp đồng "trust" của `completeLesson(nowIso)`. KHÔNG thêm nhánh validate tempo (giữ union sạch).
  - [ ] Export `BestTempoResult` từ `src/core/progress/index.ts` (thêm vào dòng `export type ... from './store'`).
- [ ] **Task 2 — Selector `getPracticeDays` (AC: #1, #4)**
  - [ ] Trong `src/core/progress/selectors.ts` thêm type `PracticeDay = { year: number; month: number; day: number }` (month/day 1-based cho hiển thị) và selector `getPracticeDays(sessions: IsoDateTime[]): PracticeDay[]`.
  - [ ] Dedup theo NGÀY LOCAL (tái dùng khái niệm `localDayKey`: `getFullYear/getMonth/getDate` của `new Date(iso)` — KHÔNG so chuỗi UTC, AD-4/Conventions), trả các ngày distinct sắp xếp MỚI-NHẤT-TRƯỚC. Thuần, tất định — KHÔNG gọi `new Date()` không tham số bên trong.
  - [ ] Export `getPracticeDays` + type `PracticeDay` từ `src/core/progress/index.ts` (thêm vào `export { getNextItem, getStreak, getWeekProgress } from './selectors'` và dòng type).
- [ ] **Task 3 — Test core (AC: #4) — viết TRƯỚC (TDD RED → GREEN)**
  - [ ] `src/core/progress/progress.test.ts` — thêm `describe('setBestTempo')`: (a) chưa có kỷ lục → `recorded:true`, `best=T`, persist thật (parse lại storage), snapshot đổi tham chiếu; (b) T > cũ → ghi đè `recorded:true`; (c) T === cũ → `recorded:false`, `best=cũ`, `setCalls` KHÔNG tăng, snapshot ref KHÔNG đổi, không emit; (d) T < cũ → `recorded:false`, giữ cũ; (e) `sessions`/`completedLessons` KHÔNG đổi sau ghi best; (f) `failWrite=true` → `{ok:false,'write-failed'}`, snapshot không đổi; (g) storage seed `'{bad'` corrupt → `{ok:false,'corrupt'}`, không ghi đè raw.
  - [ ] `src/core/progress/progress.test.ts` — thêm `describe('getPracticeDays')`: rỗng → `[]`; hai session cùng ngày local → 1 phần tử; ba ngày khác nhau → 3 phần tử mới-nhất-trước; biên TZ (tái dùng khuôn `getStreak` test: `new Date(2026,6,8,23,0)` và `new Date(2026,6,9,1,0)` → 2 ngày distinct).
- [ ] **Task 4 — PracticeBlock: nút ghi + hiển thị tempo tốt nhất (AC: #3)**
  - [ ] Thêm prop `itemId: LessonItemId` vào `PracticeBlock({ itemId, exercise })` (bestTempos khóa theo `LessonItemId` bài — exercise không có ID riêng, AD-2). Cập nhật comment header nếu cần.
  - [ ] Import `progress` + `useProgress` từ tầng đúng: `import { progress } from '../core/progress'` và `import { useProgress } from './useProgress'`. Lấy `const { data } = useProgress()` → `const best = data.bestTempos[itemId]` (number | undefined).
  - [ ] Lấy tempo hiện tại: mở rộng destructure `useMetronome()` → `const { isRunning, tempo } = useMetronome()`.
  - [ ] Nút "Ghi tempo tốt nhất: {tempo}" (secondary button token) → `onClick` gọi `progress.setBestTempo(itemId, tempo)`; xử lý kết quả:
    - `ok && recorded` → best cập nhật qua snapshot (useProgress emit) → dòng "Tempo tốt nhất của bạn: {best}" tự đổi; clear notice/toast.
    - `ok && !recorded` → set notice trung tính "Kỷ lục vẫn là {result.best} bpm — cứ giữ sạch rồi tăng dần" (UX-DR10, không chê).
    - `!ok && reason==='write-failed'` → toast "Chưa lưu được — thử lại" (mirror LessonPage `saveError`).
    - `!ok && reason==='corrupt'` → không làm gì (banner toàn cục).
  - [ ] Hiển thị "Tempo tốt nhất của bạn: {best} bpm" khi `best !== undefined` (dưới dòng tempo mục tiêu, trong `.card`).
  - [ ] State transient cho notice + toast: `const [tempoNotice, setTempoNotice] = useState<string | null>(null)` + `useEffect` auto-ẩn ~4s (mirror `saveError` LessonPage). Reset notice khi `itemId` đổi (PracticeBlock đã remount theo `key={item.id}` ở LessonPage nên state tự mới — vẫn không cần effect reset; xác nhận remount bằng key).
  - [ ] Sửa comment dòng 76 hiện tại (`{/* ... ghi best tempo là story 3.3, KHÔNG làm ở đây */}`) cho khớp việc story 3.3 nay đã thêm.
- [ ] **Task 5 — CSS PracticeBlock cho best tempo + notice (AC: #3)**
  - [ ] `src/ui/PracticeBlock.module.css`: thêm `.block .bestTempo` (màu `--color-success` — kỷ lục là "thành tựu", DESIGN.md dành success cho hoàn thành/streak) và `.block .tempoNotice` (`--color-text-secondary`, trung tính) + `.block .saveError` (`--color-danger`). **BẮT BUỘC dùng selector kép `.block .X`** để thắng `.article p` (0-1-1) của LessonPage — PracticeBlock render bên trong `.article`; tiền lệ `.block .target` cùng file (dòng 32). Token-only (AD-5).
  - [ ] Nút ghi: dùng class token secondary (mirror `--button-secondary-*` hoặc class `.recordButton` với `--button-secondary-border/color/radius`), touch target ≥44px.
- [ ] **Task 6 — LessonPage: truyền `itemId` vào PracticeBlock (AC: #3)**
  - [ ] `src/features/lesson/LessonPage.tsx` dòng render PracticeBlock: `<PracticeBlock key={item.id} itemId={item.id} exercise={item.exercise} />` (giữ `key` để mount rule AD-8 chạy lại khi đổi bài).
- [ ] **Task 7 — ProgressPage: viết lại từ stub (AC: #1, #2)**
  - [ ] `src/features/progress/ProgressPage.tsx` (hiện là stub) đọc `useProgress()`; `const { data } = useProgress()`.
  - [ ] Phân nhánh empty theo `data.sessions.length === 0` (AC-2: "chưa có buổi tập nào" = không session). Bao trùm empty/reset/corrupt (corrupt → data là `emptyEnvelope()`, `sessions` rỗng → empty state hiện tự nhiên; banner corrupt đã mount ở AppLayout).
  - [ ] Empty state: thông điệp "Chưa có buổi tập nào — hoàn thành bài đầu tiên để bắt đầu chuỗi 🔥" + `Link` style nút primary tới `lessonPath(getOrderedItemIds()[0])` (guard mảng rỗng → fallback link `ROUTES.roadmap`).
  - [ ] Nhánh có tiến độ:
    - Streak: `const streak = getStreak(data.sessions, new Date())` (call-site UI truyền `now` — AD-4). `streak > 0` → "🔥 Chuỗi {streak} ngày" (`--color-success`); `=== 0` → "Bắt đầu chuỗi mới hôm nay" (`--color-text-secondary`).
    - Checklist theo tuần: `getPhases().map` → `phase.weeks.map` → `week.items.map` (mirror RoadmapPage) — hiển thị ✓ khi `Object.hasOwn(data.completedLessons, item.id)` (aria-label "Đã hoàn thành", role="img" — UX-DR11), tiêu đề, nhãn kind (`LESSON_KIND_LABEL`), và badge "Tempo tốt nhất: {data.bestTempos[item.id]} bpm" khi có (AC-3 hiển thị trong /tien-do).
    - Progress bar mỗi tuần: lấy `weekItemIds = getWeekItemIds(phase.id, week.weekNumber)` → `getWeekProgress(data.completedLessons, weekItemIds)` → `{done,total}` → dòng "Tuần N · done/total bài" + thanh `.track > .fill` width `calc(done/total * 100%)` (guard total>0), class `.fillComplete` khi `done===total` (đổi sang `--progress-bar-complete-fill`). Số liệu thẳng, KHÔNG %.
    - Lịch sử ngày tập: `getPracticeDays(data.sessions).map(...)` → hiển thị "DD/MM/YYYY" (pad `String(d.day).padStart(2,'0')` v.v.). Danh sách mới-nhất-trước.
  - [ ] Chỉ import từ `content/`, `core/`, `ui/`, `app/routes` — KHÔNG import feature khác (AD-1). Giữ export named `ProgressPage` (App.tsx route import named).
- [ ] **Task 8 — CSS ProgressPage (AC: #1, #2)**
  - [ ] Tạo `src/features/progress/ProgressPage.module.css` token-only (AD-5). ProgressPage KHÔNG nằm trong `.article` nên không cần selector kép chống trap; vẫn dùng `var()` toàn bộ.
  - [ ] Progress bar: `.track` nền `--progress-bar-track`, cao `--progress-bar-height`, radius `--progress-bar-radius`, overflow hidden; `.fill` nền `--progress-bar-fill`, height 100%, `transition` width (đổi màu khi reduced-motion vẫn ok, transition width nhẹ chấp nhận — global.css trung hòa nếu cần); `.fillComplete` nền `--progress-bar-complete-fill`.
  - [ ] Checklist: mirror RoadmapPage `.card`/`.doneMark`/`.kindBadge`; badge tempo dùng `--color-surface-overlay` + chữ `--color-text-secondary` (hoặc `--color-success` cho số kỷ lục). Streak success/neutral như HomePage. Empty state nút primary `--button-primary-*`. Single-column, touch target ≥44px, responsive tự nhiên 375px→desktop (không cần media query như RoadmapPage/HomePage).
- [ ] **Task 9 — Verify quality gate & manual (AC: #1, #2, #3, #4)**
  - [ ] `npm run check` (tsc -b + oxlint src + vitest run + vite build) xanh — gồm test mới `setBestTempo` + `getPracticeDays`.
  - [ ] Manual: (1) localStorage trống → `/tien-do` hiện empty state + nút về bài 1; (2) hoàn thành vài bài → `/tien-do` hiện checklist tuần + ✓ + progress bar (fill amber, chuyển success khi 1 tuần đủ) + streak 🔥 + lịch sử ngày; (3) mở một bài exercise, chỉnh tempo T, bấm "Ghi tempo tốt nhất: T" → hiện "Tempo tốt nhất của bạn: T" trong khối + badge trong `/tien-do`; (4) bấm lại với T nhỏ hơn/bằng → giữ kỷ lục + thông báo nhẹ, không đổi số; (5) bấm với T lớn hơn → cập nhật; (6) mock write lỗi → toast "Chưa lưu được".

## Dev Notes

### Bối cảnh & giá trị

Story 3.3 hoàn tất vòng lặp động lực của Epic 3: sau khi 3.1 dựng store + selectors và 3.2 làm trang chủ "Hôm nay", story này cho người dùng **toàn cảnh tiến độ** (`/tien-do`) và **kỷ lục tempo tự khai** cho từng bài tập. Đây là nơi người học "nhìn lại chặng đường" — checklist tuần, streak, lịch sử ngày, và con số tempo tốt nhất tăng dần qua các buổi. Phần lớn dữ liệu dẫn xuất đã có selector từ 3.1; story này thêm **một mutation mới** (`setBestTempo`) và **một selector mới** (`getPracticeDays`), còn lại là UI tiêu thụ selector + một trang mới.

### Nền tảng có sẵn (ĐỌC — không xây lại)

Store + selectors + hook đã build và test (145 tests xanh sau 3.2). TÁI SỬ DỤNG:

- **`core/progress` (public entry duy nhất — AD-1):** singleton `progress` với `completeLesson`/`reset`/`isCompleted`/`getSnapshot`/`subscribe`; selectors `getNextItem`/`getStreak`/`getWeekProgress`; `emptyEnvelope`/`parseEnvelope`; types `ProgressSnapshot`/`ProgressEnvelope`/`WriteResult`/`IsoDateTime`. Envelope ĐÃ có trường `bestTempos: Record<LessonItemId, number>` (định nghĩa từ 3.1) — story này chỉ thêm **đường GHI** cho trường đó. [Source: src/core/progress/index.ts, store.ts, selectors.ts, envelope.ts]
- **`commit(previous, next)` private trong ProgressStore:** đã lo persist + rollback khi setItem throw + emit. `setBestTempo` TÁI DÙNG `commit` (không tự viết persist). [Source: src/core/progress/store.ts#L90-L101]
- **`ui/useProgress()`** → `ProgressSnapshot` qua `useSyncExternalStore`; đổi khi mutation emit. PracticeBlock + ProgressPage cùng dùng. [Source: src/ui/useProgress.ts]
- **`ui/useMetronome()`** → `MetronomeSnapshot` gồm `tempo`, `beatsPerBar`, `isRunning`. PracticeBlock đã destructure `isRunning`; chỉ thêm `tempo`. [Source: src/ui/MetronomeBlock.tsx#L17, src/ui/useMetronome.ts]
- **`content/index.ts`:** `getPhases()`, `getWeeks(phaseId)`, `getItemById(id)`, `getOrderedItemIds()`, `getWeekItemIds(phaseId, weekNumber)`. ProgressPage duyệt tuần qua `getPhases()` (mirror RoadmapPage) và đếm bằng `getWeekProgress(completedLessons, getWeekItemIds(...))`. [Source: src/content/index.ts]
- **Token đã có sẵn cho trang này (KHÔNG cần thêm token):** `--progress-bar-track/fill/complete-fill/height/radius`, `--checklist-item-done-icon-color/pending-icon-color` — design system đã dự phòng đúng trang Tiến độ. [Source: src/styles/tokens.css#L104-L113]

### Guardrails kiến trúc (BẮT BUỘC)

- **AD-1 (phụ thuộc một chiều):** `PracticeBlock` sống ở `ui/` (không phải features) nên được `features/lesson` import mà không vi phạm "features không import features" — nhận `itemId`/`exercise` qua props, ui/ KHÔNG import content/. `ProgressPage` (feature) ĐƯỢC import `content/`+`core/`+`ui/`; KHÔNG import feature khác. `core/progress` KHÔNG import content — selector nhận list qua tham số. [Source: ARCHITECTURE-SPINE.md#AD-1; src/ui/PracticeBlock.tsx header]
- **AD-2 (một không gian ID):** `bestTempos` khóa theo `LessonItemId` của BÀI (exercise nhúng KHÔNG có ID riêng). PracticeBlock phải nhận `itemId` từ LessonPage, KHÔNG tự bịa id. [Source: src/core/types.ts#L17-L23]
- **AD-4 (một chủ store + derived = selector):** `setBestTempo` là mutation của store (chủ sở hữu duy nhất). "Chỉ ghi khi T > cũ" là **write-semantics thuộc store** (mirror "completedLessons chỉ set khi chưa có" của `completeLesson`) — UI KHÔNG tự so sánh rồi quyết định ghi. `getPracticeDays`/`getStreak` là selector; UI chỉ gọi. [Source: ARCHITECTURE-SPINE.md#AD-4; src/core/progress/store.ts#L64-L82]
- **AR-5 (ngữ nghĩa ghi):** `sessions` chỉ +1 khi "Hoàn thành bài hôm nay". Ghi best tempo KHÔNG thêm session, KHÔNG đụng `completedLessons`. [Source: ARCHITECTURE-SPINE.md#AR-5; epic-3-context.md]
- **AD-5 (token-only):** mọi styling qua `var(...)`; không hex/px trần (ngoại lệ đã ghi nhận riêng ở file khác, story này không phát sinh raw mới). [Source: src/styles/tokens.css]
- **AD-6 (routes hằng số):** link qua `ROUTES`/`lessonPath()`, không string literal. [Source: src/app/routes.ts]
- **Quality gate:** `npm run check` = `tsc -b` + `oxlint src` + `vitest run` + `vite build`; build đỏ khi test đỏ. TypeScript strict. [Source: package.json]

### Nơi chạm & hành vi phải giữ (đọc trước khi sửa)

- **`src/core/progress/store.ts` (UPDATE):** THÊM `BestTempoResult` + `setBestTempo`. GIỮ NGUYÊN `completeLesson`/`reset`/`commit`/`emit`/`getSnapshot` (tham chiếu ổn định cho `useSyncExternalStore` — chỉ đổi khi mutation thành công). `setBestTempo` khi `recorded:false` KHÔNG được gọi `commit` (nếu gọi sẽ đổi tham chiếu snapshot vô ích → re-render thừa và có thể emit sai). [Source: src/core/progress/store.ts]
- **`src/core/progress/selectors.ts` (UPDATE):** THÊM `getPracticeDays` + type `PracticeDay`. GIỮ `getStreak`/`getNextItem`/`getWeekProgress` và helper `localDayKey` (tái dùng cùng khái niệm ngày-local). [Source: src/core/progress/selectors.ts]
- **`src/core/progress/index.ts` (UPDATE):** export thêm `setBestTempo` KHÔNG áp dụng (method của instance, không export riêng) — chỉ export TYPE `BestTempoResult` (từ store) + `getPracticeDays`/`PracticeDay` (từ selectors). [Source: src/core/progress/index.ts]
- **`src/ui/PracticeBlock.tsx` (UPDATE):** thêm prop `itemId`, nút ghi + hiển thị best. GIỮ NGUYÊN: mount rule AD-8 (`useEffect` set tempo khi engine không chạy), con trỏ pattern stateless theo beat event, cleanup timer/subscription, KHÔNG gọi `useMetronomeShortcuts` (block con sở hữu — AD-8). [Source: src/ui/PracticeBlock.tsx]
- **`src/ui/PracticeBlock.module.css` (UPDATE):** thêm class best/notice/toast/nút với **selector kép `.block .X`** (chống `.article p` — tiền lệ `.block .target`). [Source: src/ui/PracticeBlock.module.css#L1-L7,L32]
- **`src/features/lesson/LessonPage.tsx` (UPDATE):** chỉ THÊM prop `itemId={item.id}` vào `<PracticeBlock>`. Không đụng phần còn lại. [Source: src/features/lesson/LessonPage.tsx#L156]
- **`src/features/progress/ProgressPage.tsx` (UPDATE — viết lại từ stub):** trang Tiến độ đầy đủ. Giữ export named. [Source: src/features/progress/ProgressPage.tsx, src/app/App.tsx#L19]
- **`src/features/progress/ProgressPage.module.css` (NEW).**
- **`src/core/progress/progress.test.ts` (UPDATE):** thêm `describe('setBestTempo')` + `describe('getPracticeDays')`. Dùng `createFakeStorage` sẵn có (Map + `failWrite` + `setCalls`). [Source: src/core/progress/progress.test.ts#L15-L38]
- **KHÔNG chạm:** `styles/tokens.css`/`global.css` (token đã đủ); `envelope.ts` (shape `bestTempos` đã có — KHÔNG đổi validator; ISO-validity/import-validator là việc của story 3.4, đã defer); `RoadmapPage`/`HomePage`/`ProgressCorruptBanner`/`AppLayout`; `MetronomeBlock` (chỉ đọc snapshot qua hook).

### Điểm dễ sai của story này

- **`setBestTempo` khi không cải thiện KHÔNG được commit:** nếu vẫn gọi `commit` với envelope "giống hệt", `getSnapshot()` trả object MỚI → `useSyncExternalStore` coi là đổi → re-render + emit thừa, và về mặt ngữ nghĩa "đã ghi" là sai (AC-3: "bằng/nhỏ hơn → giữ kỷ lục"). Đường `recorded:false` phải return SỚM trước khi tạo `next`/`commit`.
- **`bestTempos[id]` là number | undefined:** guard `current !== undefined` trước khi so `tempo <= current`. `undefined` = chưa có kỷ lục → luôn ghi (recorded:true). `bestTempos[id]` có thể là `0`? Không — metronome min 40, không bao giờ 0; nhưng dùng `!== undefined` (không dùng falsy) cho đúng.
- **Empty state theo `sessions`, KHÔNG theo `completedLessons`:** AC-2 nói "chưa có buổi tập nào". `completeLesson` luôn +1 session nên hai điều kiện tương đương thực tế, nhưng bám đúng chữ AC → dùng `sessions.length === 0`. (Khác HomePage 3.2 dùng `completedLessons` vì ngữ cảnh "đã học bài nào".)
- **Progress bar guard `total > 0`:** tuần rỗng (lý thuyết không xảy ra với content hiện tại) → tránh chia 0. Width qua `calc()` inline style hoặc CSS custom property; đổi màu `--progress-bar-complete-fill` chỉ khi `done === total && total > 0`.
- **`getPracticeDays` sắp mới-nhất-trước:** sort giảm dần theo (year, month, day). Vì `PracticeDay` là ngày local, sort bằng so sánh số từng trường (year rồi month rồi day) hoặc tạo key số `year*10000+month*100+day` giảm dần.
- **CSS trap `.article p`:** mọi `<p>` mới trong PracticeBlock (best/notice/toast) bị `.article p` (0-1-1) của LessonPage đè `color`. Bắt buộc scope `.block .bestTempo`… (0-2-0). Đây đúng là cái bẫy 3.2 đã gặp và 3.1 để lại defer cho `.saveError`/`.nextHint` — ĐỪNG lặp lại. [Source: deferred-work.md "Deferred from: code review of 3-2"]

### Ràng buộc test

- Vitest env `node` — KHÔNG jsdom/localStorage. React component (PracticeBlock, ProgressPage) KHÔNG có test tự động (khoảng trống repo đã biết — cấm thêm dependency jsdom/@testing-library). Test story này CHỈ ở logic thuần core: `setBestTempo` (qua `ProgressStore` + fake storage) và `getPracticeDays` (thuần data) trong `progress.test.ts`. [Source: vite.config.ts; deferred-work.md]
- KHÔNG phát sinh test component; verify UI bằng manual checks (Task 9). Nếu môi trường có Chrome headless như story 3.2 dùng, có thể tái dùng để verify (không bắt buộc, không thuộc repo).

### Pattern tham chiếu trong code hiện có

- **Mutation store + WriteResult + commit:** `completeLesson` (chụp previous, tạo next, `this.commit(previous, next)`, đọc kết quả). `setBestTempo` mirror y hệt nhưng thêm nhánh "không cải thiện → return sớm". [Source: src/core/progress/store.ts#L64-L101]
- **Selector ngày-local:** `getStreak` + `localDayKey`. `getPracticeDays` tái dùng cùng cách quy ngày. [Source: src/core/progress/selectors.ts#L9-L40]
- **Feature duyệt tuần + checkmark:** `RoadmapPage` (`getPhases().map` → weeks → items, `Object.hasOwn(data.completedLessons, id)`, `.doneMark` aria-label). ProgressPage mirror + thêm progress bar & tempo badge. [Source: src/features/roadmap/RoadmapPage.tsx]
- **Streak success/neutral + nút primary link:** `HomePage` (`.streak`/`.streakNew`, `.startButton`). Empty state ProgressPage mirror `.startButton`. [Source: src/features/roadmap/HomePage.tsx, HomePage.module.css#L37-L72]
- **Toast transient (write-failed):** `saveError` trong LessonPage (state + `useEffect` timeout tự ẩn). PracticeBlock `tempoNotice` dùng cùng khuôn. [Source: src/features/lesson/LessonPage.tsx#L26-L42]
- **Test store với fake storage:** `createFakeStorage` (Map + `failWrite` + `setCalls`), `fullEnvelopeRaw`. [Source: src/core/progress/progress.test.ts#L15-L38]

### Microcopy (UX-DR10 — xưng "bạn", động từ, không chê)

- Nút ghi: "Ghi tempo tốt nhất: {tempo}".
- Hiển thị kỷ lục: "Tempo tốt nhất của bạn: {best} bpm".
- Không cải thiện: "Kỷ lục vẫn là {best} bpm — cứ giữ sạch rồi tăng dần" (trung tính, khích lệ, KHÔNG "tempo của bạn thấp hơn").
- Ghi lỗi: "Chưa lưu được — thử lại".
- Empty state Tiến độ: "Chưa có buổi tập nào — hoàn thành bài đầu tiên để bắt đầu chuỗi 🔥" + nút "Bắt đầu bài đầu tiên".
- Streak sống: "🔥 Chuỗi {N} ngày". Streak đứt: "Bắt đầu chuỗi mới hôm nay".
- Tiến độ tuần: "Tuần {N} · {done}/{total} bài" (số liệu thẳng, không %).

### Phạm vi & KHÔNG làm (defer)

- **Export/Import JSON:** story 3.4 — 3.3 KHÔNG thêm nút export/import, KHÔNG đụng validator import/`parseEnvelope`.
- **Kiểm ISO-validity trong `parseEnvelope`:** đã defer về 3.4 (thêm `Date.parse` check chung với import validator). KHÔNG làm ở đây. [Source: deferred-work.md "Deferred from: code review of 3-1"]
- **Tổng quát hóa nhãn "Tuần N"/"Giai đoạn 1" theo phase:** đã defer (chỉ 1 phase hôm nay). Story 3.3 giữ nhãn khớp spec verbatim. [Source: deferred-work.md "Deferred from: code review of 3-2"]
- **Không thêm token mới** (progress-bar/checklist token đã có). Không đụng `MetronomeBlock`/`PatternGrid`.

### Project Structure Notes

- File mới: `src/features/progress/ProgressPage.module.css`.
- File sửa: `src/core/progress/store.ts`, `selectors.ts`, `index.ts`, `progress.test.ts`; `src/ui/PracticeBlock.tsx` (+ `.module.css`); `src/features/lesson/LessonPage.tsx`; `src/features/progress/ProgressPage.tsx`.
- Đặt tên theo Conventions: component `PascalCase.tsx`, CSS module `PascalCase.module.css` cạnh component, module thuần `kebab-case.ts` (selectors/store/envelope giữ nguyên tên).
- Không mâu thuẫn Structural Seed; `features/progress/` đã tồn tại với ProgressPage stub.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.3] — user story + AC gốc (trang Tiến độ, empty state, ghi best tempo)
- [Source: _bmad-output/implementation-artifacts/epic-3-context.md] — quyết định kỹ thuật Epic 3 (envelope bestTempos, ghi khi T>cũ, selector = derived)
- [Source: ARCHITECTURE-SPINE.md#AD-4] — progress store: một chủ, derived = selector, write-semantics thuộc store
- [Source: ARCHITECTURE-SPINE.md#AD-1] — hướng phụ thuộc (core không import content; feature không import feature; PracticeBlock ở ui/)
- [Source: ARCHITECTURE-SPINE.md#AD-2] — bestTempos khóa theo LessonItemId (exercise không ID riêng)
- [Source: ARCHITECTURE-SPINE.md#AR-5] — sessions chỉ ghi khi "Hoàn thành"; ghi best tempo không phải buổi tập
- [Source: ARCHITECTURE-SPINE.md#AR-10] — core bắt buộc unit test (selectors, mutation)
- [Source: epics.md#FR-14] — tự khai báo "tempo tốt nhất đã chơi sạch", một click
- [Source: epics.md#FR-15/FR-16] — tiến độ tuần/giai đoạn; nhật ký sessions + streak
- [Source: epics.md#UX-DR8] — progress bar amber → success khi 100%, checkmark hoàn thành
- [Source: epics.md#UX-DR9] — empty state "Chưa có buổi tập nào…" + nút về bài 1
- [Source: epics.md#UX-DR10] — voice & tone: xưng "bạn", số liệu thẳng, không chê
- [Source: epics.md#UX-DR11] — trạng thái không chỉ bằng màu (✓ kèm chữ)
- [Source: src/core/progress/store.ts] — completeLesson/commit pattern để mirror cho setBestTempo
- [Source: src/core/progress/selectors.ts] — getStreak/localDayKey để mirror cho getPracticeDays
- [Source: src/core/progress/envelope.ts] — bestTempos đã có trong shape (chỉ thêm đường ghi)
- [Source: src/core/progress/progress.test.ts] — createFakeStorage/fullEnvelopeRaw để viết test mới
- [Source: src/ui/PracticeBlock.tsx] — khối luyện tập, nơi thêm nút ghi + hiển thị best (prop itemId)
- [Source: src/ui/useMetronome.ts, src/ui/MetronomeBlock.tsx] — snapshot tempo hiện tại
- [Source: src/features/roadmap/RoadmapPage.tsx] — pattern duyệt tuần + checkmark cho checklist Tiến độ
- [Source: src/features/roadmap/HomePage.tsx] — streak success/neutral + nút primary link cho empty state
- [Source: src/styles/tokens.css#L104-L113] — token progress-bar + checklist-item đã có sẵn
- [Source: deferred-work.md] — cái bẫy `.article p` (3.2), ISO-validity & import (defer về 3.4), nhãn phase (defer)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2026-07-10: Story 3.3 tạo bởi create-story (context engine) — Status ready-for-dev. Ultimate context engine analysis completed - comprehensive developer guide created.
