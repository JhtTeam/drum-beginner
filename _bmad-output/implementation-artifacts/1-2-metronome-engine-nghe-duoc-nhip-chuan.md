# Story 1.2: MetronomeEngine — nghe được nhịp chuẩn

Status: review

## Story

As a người tự học trống,
I want bật metronome ở tempo tùy chọn và nghe tick đều tuyệt đối kể cả khi chuyển tab,
so that tôi luyện giữ nhịp với nguồn nhịp đáng tin.

## Acceptance Criteria

1. **Engine + lookahead scheduling qua Web Worker**
   **Given** `core/audio/` export một instance duy nhất `metronome: MetronomeEngine` (AR-4, không import React)
   **When** bấm Start trên trang `/metronome` (UI tối giản: nút start/stop + ô nhập tempo)
   **Then** AudioContext được tạo lazy ở đúng gesture đó, tick phát theo lookahead scheduling với timer trong Web Worker (tick ~25ms, schedule ahead ~100ms theo `AudioContext.currentTime`)
   **And** phách 1 có âm accent khác biệt các phách còn lại (FR-8); nhịp mặc định 4/4, tempo mặc định 60 (FR-7, FR-9).

2. **Tab ẩn không gián đoạn + state xuyên route**
   **Given** metronome đang chạy
   **When** ẩn tab 60 giây rồi quay lại
   **Then** âm tick không gián đoạn/dồn cục trong lúc ẩn (Worker không bị throttle như main thread — UX-DR13)
   **And** engine phát beat event `{bar, beatInBar, audioTime}` qua subscribe (`useSyncExternalStore`), state (tempo, số phách, running) giữ nguyên khi đổi route trong phiên, rời trang chỉ `stop()` không bao giờ `close()` context (AR-4).

3. **Unit test core/audio xanh**
   **Given** bộ unit test cho `core/audio` (AR-10)
   **When** `vitest run`
   **Then** test xanh cho: lịch tick sinh đúng khoảng cách theo tempo (mock AudioContext), đổi tempo khi đang chạy có hiệu lực từ ô nhịp kế tiếp không giật, `tap()` trung bình ≤5 tap gần nhất và reset sau 2 giây im.

## Tasks / Subtasks

- [x] Task 1: MetronomeEngine framework-free với dependency injection (AC: #1, #3)
  - [x] `src/core/types.ts` hoặc `src/core/audio/metronome-engine.ts`: type `BeatEvent = { bar: number; beatInBar: number; audioTime: number }` (bar/beatInBar đếm từ 1) + snapshot `{ tempo, beatsPerBar, isRunning }`
  - [x] Class `MetronomeEngine` trong `src/core/audio/metronome-engine.ts` — constructor nhận deps injectable: `createAudioContext()`, `createTicker()` (interface start/stop), `now()` (ms, cho tap). KHÔNG import React, KHÔNG chạm `Worker`/`AudioContext` trực tiếp trong file này — để test được trong vitest môi trường `node` (không có DOM/Worker/AudioContext)
  - [x] Lookahead scheduler ("A Tale of Two Clocks"): mỗi lần ticker bắn (~25ms) chạy `while (nextNoteTime < ctx.currentTime + 0.1) { scheduleClick(nextNoteTime, beatInBar); emit beat event; nextNoteTime += 60/tempo; advance bar/beatInBar }`. Âm được đặt lịch bằng `osc.start(nextNoteTime)` trên audio clock — timer CHỈ bơm hàng đợi, không bao giờ phát âm trực tiếp trong callback (đó là cách đạt NFR-2 ±2ms)
  - [x] `setTempo(bpm)` clamp 40–200 (mặc định 60); `setBeatsPerBar(n: 2|3|4)` (mặc định 4). Đổi tempo khi đang chạy: KHÔNG hủy/reschedule tick đã đặt lịch — chỉ đổi bước nhảy `60/tempo` cho các beat chưa schedule ⇒ hiệu lực từ ô nhịp kế tiếp, không giật (lookahead 100ms bảo đảm tối đa ~1 beat đã nằm sẵn trong hàng đợi)
  - [x] Click synthesis qua OscillatorNode + GainNode: phách 1 accent tần số cao (880Hz), phách thường 440Hz; envelope gain ngắn (~50ms, ramp về 0) tránh pop — không cần file âm thanh (xem Dev Notes "Quyết định âm tick")
  - [x] `subscribe(listener)` / `getSnapshot()` cho `useSyncExternalStore`: snapshot là object cached bất biến — CHỈ tạo object mới khi state đổi rồi notify (trả object mới mỗi lần gọi → React loop vô hạn); beat event phát kèm qua cùng kênh subscribe hoặc callback `onBeat` riêng, payload đúng `{bar, beatInBar, audioTime}`
  - [x] `tap()`: buffer timestamp (từ `now()`); khoảng lặng > 2000ms → reset buffer bắt đầu chuỗi mới; giữ tối đa 5 tap gần nhất; ≥2 tap → tempo = round(60000 / trung bình khoảng cách) rồi qua `setTempo` (clamp)
  - [x] Expose `currentTime` (đọc `ctx.currentTime`) để story 1.3 tính delay visual — một getter, không logic
- [x] Task 2: Web Worker ticker + singleton wiring (AC: #1, #2)
  - [x] `src/core/audio/tick-worker.ts`: worker tối giản — nhận message `{type:'start', intervalMs}` → `setInterval(() => postMessage('tick'), intervalMs)`; `{type:'stop'}` → clearInterval. Worker KHÔNG bị throttle ≥1s như main thread khi tab ẩn — đây là toàn bộ lý do nó tồn tại (GAP-2 reconcile-ux)
  - [x] `src/core/audio/index.ts`: wiring thật — `createTicker` dùng `new Worker(new URL('./tick-worker.ts', import.meta.url), { type: 'module' })` (cú pháp Vite bundle worker); `createAudioContext` = `new AudioContext()`. Cả Worker lẫn AudioContext tạo LAZY ở lần `start()` đầu tiên (đúng user gesture — autoplay policy; tạo sớm ngoài gesture context sẽ bị suspended). Nếu `ctx.state === 'suspended'` khi start → `ctx.resume()` (iOS/Safari)
  - [x] Export module singleton: `export const metronome = new MetronomeEngine(realDeps)` — MỘT instance cho cả app (AR-4); drum-map story 2.3 sẽ dùng chung AudioContext này
  - [x] Lifecycle: `stop()` dừng ticker + reset cờ running — KHÔNG BAO GIỜ `ctx.close()`. Đăng ký `pagehide` → `metronome.stop()` (rời site/đóng tab); đổi route trong SPA KHÔNG stop — state tempo/số phách/running xuyên route (xem Dev Notes "Lifecycle — quyết định đã chốt")
- [x] Task 3: UI tối giản trên `/metronome` (AC: #1, #2)
  - [x] `src/ui/useMetronome.ts`: hook `useSyncExternalStore(metronome.subscribe, metronome.getSnapshot)` — đặt ở `ui/` vì story 1.3 (`ui/MetronomeBlock`) sẽ tái sử dụng (AD-1: thứ dùng chung ≥2 nơi hạ xuống `ui/`)
  - [x] `src/features/metronome/MetronomePage.tsx` (UPDATE — hiện là placeholder h1+p): nút start/stop (text "Bắt đầu"/"Dừng" — microcopy động từ UX-DR10) + `<input type="number" min={40} max={200}>` nhập tempo. Đủ dùng để verify AC — KHÔNG dựng BPM display 96px, beat dots, ±5/±1, nút Tap, chọn số phách, phím tắt (tất cả là story 1.3)
  - [x] Mọi giá trị style đã có token dùng `var(--...)` (AD-5); UI text tiếng Việt inline (NFR-1)
- [x] Task 4: Unit tests `core/audio` (AC: #3)
  - [x] `src/core/audio/metronome-engine.test.ts` — test class với fake deps (fake AudioContext có `currentTime` chỉnh tay + ghi lại lịch schedule; fake ticker bắn tay; fake `now()`). KHÔNG import `index.ts` trong test (wiring Worker không chạy trong node)
  - [x] Test 1 (AC bắt buộc): tempo 60 → tick cách đúng 1.000s; tempo 120 → 0.500s; không trôi tích lũy qua nhiều chu kỳ ticker
  - [x] Test 2 (AC bắt buộc): đang chạy đổi tempo — tick đã schedule giữ nguyên thời điểm, khoảng cách mới áp dụng từ beat kế tiếp
  - [x] Test 3 (AC bắt buộc): `tap()` 4 lần cách 500ms → tempo 120; tap thứ 6+ chỉ tính 5 gần nhất; im 2s+ rồi tap → chuỗi reset, không lẫn tap cũ
  - [x] Test thêm: beatInBar wrap đúng theo beatsPerBar (1→4→1 với 4/4; đổi 3/4 wrap 1→3); phách 1 schedule bằng âm accent khác phách thường; `setTempo` clamp 40–200; `stop()` không gọi `ctx.close()`; snapshot giữ nguyên reference khi không có gì đổi
- [x] Task 5: Quality gate + verify thủ công (AC: #1, #2)
  - [x] `npm run check` xanh (tsc -b + oxlint src + vitest run + vite build) — worker file phải build qua được cả tsc lẫn vite build
  - [ ] Verify tay trên `vite dev`: (a) bấm Bắt đầu → tick đều, phách 1 nghe khác biệt; (b) ẩn tab 60s (chuyển tab khác) → tick không khựng/dồn cục, quay lại visual không lỗi; (c) đổi tempo khi đang chạy → mượt từ nhịp kế; (d) đang chạy điều hướng sang `/lo-trinh` → tick tiếp tục, quay lại `/metronome` → UI phản ánh đúng tempo/running; (e) reload trang → engine về mặc định 60/4/4 (không persist — đúng, chưa có store)
  - [ ] Push + verify production Vercel deploy xanh (build = `npm run check`)

## Dev Notes

### Điều BẮT BUỘC — architecture guardrails cho story này

- **AD-3/AR-4 (binding, đọc kỹ nhất):** `core/audio/` export MỘT instance `metronome: MetronomeEngine` (module singleton) + MỘT `AudioContext` cho cả app, lazy-init ở user gesture đầu tiên. Tick timer trong **Web Worker** ~25ms, schedule ahead ~100ms theo `AudioContext.currentTime`. Engine là nguồn đếm duy nhất — phát `{bar, beatInBar, audioTime}`, UI không tự đếm tick. `tap()` là API engine. React bind qua `useSyncExternalStore`. **Âm thanh là nguồn chân lý**; `stop()` không bao giờ `close()`. [Source: architecture/.../ARCHITECTURE-SPINE.md#AD-3]
- **AD-1 layering:** `core/` KHÔNG import React. `metronome-engine.ts` cũng không nên chạm trực tiếp `Worker`/`AudioContext` (DI qua constructor) — vì vitest chạy môi trường **`node`** (xem vite.config.ts: `environment: 'node'`), không có DOM/Worker/AudioContext; engine phải test được thuần túy với fake deps. Wiring thật gom về `core/audio/index.ts`. [Source: ARCHITECTURE-SPINE.md#AD-1; vite.config.ts]
- **AR-10 test:** `core/` bắt buộc unit test — engine scheduling là mục đích danh. 3 test trong AC-3 là sàn tối thiểu, không phải trần. [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions hàng Test]
- **NFR-2 (±2ms, không trôi):** đạt được bằng đúng một nguyên tắc — âm đặt lịch trên audio clock (`osc.start(t)`, `gain.linearRampToValueAtTime(...)`), JS timer chỉ bơm hàng đợi. Đừng bao giờ phát âm ngay trong callback timer, đừng dùng `setInterval` main thread làm nguồn nhịp. [Source: prd.md#NFR-2; web.dev "A Tale of Two Clocks" — spine đã web-verify 2026-07-08]
- **UX-DR13:** tab ẩn âm vẫn đúng nhịp. Main thread timer bị throttle ≥1s (Chrome gom tới chunk 1 phút) → lookahead 100ms cạn hàng đợi nếu timer ở main thread. Worker KHÔNG bị throttle kiểu đó — timer 25ms phải sống trong worker. [Source: reconcile-ux.md#GAP-2; epics.md UX-DR13]

### Lifecycle — quyết định đã chốt (đọc trước khi viết stop/unmount)

Có mâu thuẫn giữa hai tài liệu, spine THẮNG (spine là binding, epics AC chép theo spine):

- EXPERIENCE.md Component Patterns viết "Rời trang → metronome dừng và giải phóng audio" `[ASSUMPTION]`.
- ARCHITECTURE-SPINE AD-3 (mới hơn, binding) viết: "Engine giữ state (**tempo, số phách, running**) **xuyên route trong phiên**"; và diễn giải lại "giải phóng audio khi rời trang" = `stop()` (có thể `suspend()`), không bao giờ `close()`. AC-2 của story này lặp đúng câu đó.

**Hành vi implement:** đổi route trong SPA → engine giữ nguyên mọi state kể cả đang chạy (KHÔNG gọi stop trong cleanup của MetronomePage); `pagehide` (đóng tab/rời site) → `stop()`. Điều này cũng là tiền đề cho AD-8 ở story 2.4 ("engine đang chạy → giữ nguyên tempo" khi mount khối luyện tập). Nếu user muốn hành vi EXPERIENCE (dừng khi rời trang metronome) thì đổi ở tầng feature sau — engine không đổi. [Source: ARCHITECTURE-SPINE.md#AD-3; EXPERIENCE.md#Component-Patterns]

### Quyết định âm tick: synthesize bằng OscillatorNode, không dùng file

Structural Seed có comment `public/sounds/ # âm thanh mẫu trống + tick metronome (tự host)`, nhưng AC story này không yêu cầu file, và AD-7 (binding) chỉ bắt buộc self-host cho **âm mẫu trống** (FR-6, story 2.3). Tick synthesize (accent 880Hz / thường 440Hz, envelope ~50ms) là chuẩn của pattern lookahead: zero asset, zero fetch-failure, sample-accurate. Gói phần tạo âm vào một hàm riêng (`scheduleClick(time, isAccent)`) để sau này thay bằng AudioBuffer sample nếu muốn mà không đụng scheduler. [Source: ARCHITECTURE-SPINE.md#Structural-Seed + #AD-7]

### Spec kỹ thuật engine (đủ để viết không phải đoán)

- **State mặc định:** tempo 60, beatsPerBar 4, isRunning false. `start()`: reset `bar=1, beatInBar=0`, `nextNoteTime = ctx.currentTime + 0.05` (epsilon nhỏ), ticker.start(25ms). `stop()`: ticker.stop(), isRunning=false — KHÔNG reset tempo/beatsPerBar.
- **Vòng scheduler** (chạy mỗi tick worker): `while (nextNoteTime < ctx.currentTime + scheduleAheadSec)` với `scheduleAheadSec = 0.1`. Trong vòng: advance beatInBar (wrap theo beatsPerBar, sang bar mới), schedule click, emit `{bar, beatInBar, audioTime: nextNoteTime}`, `nextNoteTime += 60 / tempo`.
- **Đổi tempo khi đang chạy:** chỉ ảnh hưởng increment — tick đã schedule (tối đa ~1 beat vì lookahead 100ms < 60/200bpm = 300ms) phát đúng lịch cũ; KHÔNG cancel node đã đặt.
- **Beat event timing caveat (ghi cho story 1.3, không phải việc của 1.2):** event phát tại thời điểm *schedule* (sớm hơn âm thật tối đa ~100ms); payload có `audioTime` + getter `currentTime` để 1.3 delay visual cho khớp ≤50ms. Story 1.2 chỉ cần bảo đảm payload đúng.
- **`useSyncExternalStore` caveat (đã web-verify):** `getSnapshot` phải trả cached object, chỉ thay reference khi state đổi — trả object mới mỗi lần gọi gây render loop vô hạn. Beat event ~vài Hz nên update snapshot theo beat là vô hại. [Source: reviews/review-versions.md#3 hàng useSyncExternalStore]
- **tap():** buffer timestamps ms. Mỗi lần gọi: nếu `now - last > 2000` → buffer = [now]; ngược lại push, cắt còn 5 phần tử cuối. Nếu buffer ≥ 2: `avg = (last - first) / (len - 1)`, `setTempo(round(60000/avg))`. Tap không tự start engine.
- **Worker file TS note:** tsconfig app dùng lib DOM (không có webworker lib). Giữ worker tối giản: `self.addEventListener('message', ...)` + `postMessage(msg)` typecheck được dưới DOM lib; nếu vướng type, một dòng cast cục bộ trong tick-worker.ts — KHÔNG thêm lib webworker vào tsconfig chung.
- **Vite worker:** `new Worker(new URL('./tick-worker.ts', import.meta.url), { type: 'module' })` — Vite tự bundle, hoạt động cả dev lẫn build. Tạo lazy cùng lần start() đầu.

### Previous story intelligence (story 1.1 — done, 13 review patch đã áp)

- Nếp đã thiết lập và PHẢI theo: red-green cho unit test (viết test đỏ trước); mọi path qua hằng số `ROUTES` (src/app/routes.ts — không sửa file này, story này không thêm route); CSS chỉ `var(--...)`; `lint` scope là `oxlint src` (user đã chỉnh — giữ nguyên); vitest include `src/**/*.test.{ts,tsx}` đã cover file test mới.
- Review 1.1 dạy: chuẩn hóa edge case ngay từ đầu (clamp, wrap, reference stability) thay vì chờ review; `tsconfig` strict cả app lẫn node config — code mới phải pass strict.
- `src/core/` hiện chỉ có `.gitkeep` — story này là code đầu tiên trong core; xóa `.gitkeep` khi có file thật.
- Deferred từ 1.1 KHÔNG kéo vào story này: composite token bpm-display (story 1.3), skip-link/focus management (1.3+), SPA rewrite nuốt 404 asset (2.3). [Source: implementation-artifacts/1-1-*.md#Dev-Agent-Record; deferred-work.md]

### Phạm vi — KHÔNG làm trong story này

- KHÔNG `ui/MetronomeBlock`, BPM display 96px, beat dots, nút ±1/±5/Tap, chọn số phách UI, hint kbd (Story 1.3). Engine PHẢI có sẵn API `setBeatsPerBar`, `tap()` — chỉ UI là chưa.
- KHÔNG `useMetronomeShortcuts` / phím Space/↑↓/T (Story 1.3 — AD-8 một chủ phím tắt duy nhất; đừng addEventListener keydown ở đâu cả trong 1.2).
- KHÔNG PatternGrid/practice (2.4), KHÔNG drum-map sample player (2.3 — nhưng AudioContext singleton này chính là context nó sẽ dùng), KHÔNG persist tempo vào localStorage (không có trong spec — progress store là 3.1 và không chứa tempo metronome).
- KHÔNG subdivision, KHÔNG per-beat accent editing (PRD A5 — deferred GĐ2; `beatsPerBar` là chỗ chừa sẵn).
- KHÔNG cài npm dependency mới — Web Audio API + Worker là API trình duyệt, `useSyncExternalStore` có sẵn trong React 19, vitest đã cài. `package.json` không đổi.

### Testing

- Vitest 4.1.x, môi trường `node` — engine test bằng fake deps hoàn toàn, không jsdom, không mock module (DI làm việc đó). Fake AudioContext tối thiểu: `{ currentTime, createOscillator(), createGain(), destination, state, resume() }` với oscillator/gain stub ghi lại `start(time)`/frequency — assert trên danh sách lịch đã ghi.
- Fake ticker: object `{ start(cb), stop(), fire() }` — test chủ động `fire()` sau khi chỉnh `currentTime` tay để mô phỏng thời gian trôi.
- `tap()` test với fake `now()` — không cần `vi.useFakeTimers` nếu `now` là dep inject (sạch hơn).
- KHÔNG cài `@testing-library/react` (vẫn deferred); MetronomePage không cần UI test ở story này — logic nằm hết trong engine đã test.

### Project Structure Notes

- Cây đích story này (Structural Seed):

  ```text
  src/core/audio/
    metronome-engine.ts        # class + types, DI, KHÔNG React/Worker/AudioContext trực tiếp
    metronome-engine.test.ts   # unit tests (AC-3)
    tick-worker.ts             # worker setInterval tối giản
    index.ts                   # wiring thật + export const metronome (singleton)
  src/ui/useMetronome.ts       # hook useSyncExternalStore (1.3 tái sử dụng)
  src/features/metronome/MetronomePage.tsx   # UPDATE: placeholder → start/stop + input tempo
  ```

- Naming theo Conventions: module thuần `kebab-case.ts`, hook `useX.ts`. `index.ts` trong `core/audio` là entry public — feature/ui chỉ import từ `core/audio` (index), không import sâu `metronome-engine.ts`.
- File UPDATE duy nhất: `MetronomePage.tsx` (hiện 8 dòng placeholder h1 + p — thay toàn bộ nội dung, giữ export name `MetronomePage` vì `App.tsx` import theo tên đó). Không đụng `App.tsx`, `routes.ts`, `AppLayout.*`, `tokens.css`, `global.css`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.2] — story + AC gốc; UX-DR13
- [Source: _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/ARCHITECTURE-SPINE.md#AD-3] — engine singleton, lookahead, Worker, beat event, tap, stop-không-close, xuyên route
- [Source: _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/reconcile-ux.md#GAP-2] — vì sao timer phải ở Worker (throttle tab ẩn)
- [Source: _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/reviews/review-versions.md#3] — web-verify 2026-07-08: "A Tale of Two Clocks" (25ms/100ms), useSyncExternalStore caveat snapshot immutable
- [Source: _bmad-output/planning-artifacts/prds/prd-drum-beginner-2026-07-08/prd.md#NFR-2, FR-7..FR-10] — ±2ms, tempo 40–200 mặc định 60, accent, 2/4·3/4·4/4, tap
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/EXPERIENCE.md#Đồng-bộ-âm-thanh] — audio là nguồn chân lý, tab ẩn, ≤50ms
- [Source: _bmad-output/implementation-artifacts/1-1-khung-du-an-design-tokens-nav-va-deploy.md] — nếp code, review learnings, cấu trúc hiện có

## Dev Agent Record

### Agent Model Used

claude-fable-5 (Claude Code, bmad-dev-auto unattended run)

### Debug Log References

- Red-green: engine test suite đỏ ("Cannot find module './metronome-engine'") trước khi implement → 19/19 xanh.
- Sau review patch: 24/24 engine tests, `npm run check` exit 0 (32 tests tổng, worker bundle qua vite build: dist/assets/tick-worker-*.js).

### Completion Notes List

- Thực hiện qua bmad-dev-auto: spec + auto run result tại `spec-1-2-metronome-engine-nghe-duoc-nhip-chuan.md` (cùng thư mục).
- Review 2 layer (Blind Hunter + Edge Case Hunter): 8 patch áp trong phiên — catch-up guard chống burst click sau device sleep/worker treo (threshold 0.25s + 2 test), try/catch quanh beat/snapshot listener (listener lỗi không phá scheduler + test), rework tempo input (draft state — gõ "45" không còn bị clamp thành 40/200, blur mới clamp), resume() cover 'interrupted' + nuốt rejection, guard `typeof window` cho pagehide side effect, worker error listener + validate intervalMs, setBeatsPerBar runtime guard + setTempo làm tròn bpm nguyên, min-width nút toggle chống nhảy layout. 1 defer (master gain stage cho AudioContext dùng chung — story 2.3) → deferred-work.md. 6 reject.
- suspended→resume đặt trong engine start() (không phải index.ts) vì engine sở hữu ctx tạo lazy qua factory inject — hành vi đúng ý spec, có test.
- Thêm `MetronomePage.module.css` (convention CSS module per component, AD-5 token-only).
- CHƯA làm (chờ user): verify tay trên vite dev (tick đều/accent/tab ẩn 60s/xuyên route) + push GitHub/verify production Vercel — 2 subtask cuối Task 5 để trống.

### File List

- src/core/audio/metronome-engine.ts (mới — engine DI, lookahead scheduler, tap, snapshot, catch-up guard)
- src/core/audio/metronome-engine.test.ts (mới — 24 unit tests, fake deps thuần node)
- src/core/audio/tick-worker.ts (mới — worker setInterval, validate intervalMs)
- src/core/audio/index.ts (mới — wiring Vite worker + AudioContext lazy, singleton `metronome`, pagehide)
- src/ui/useMetronome.ts (mới — hook useSyncExternalStore)
- src/features/metronome/MetronomePage.tsx (sửa — placeholder → start/stop + tempo input draft-commit)
- src/features/metronome/MetronomePage.module.css (mới — style token-only)
- src/core/.gitkeep, src/ui/.gitkeep (xóa)
