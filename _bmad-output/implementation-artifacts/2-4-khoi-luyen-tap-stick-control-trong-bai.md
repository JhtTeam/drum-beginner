---
baseline_commit: 289d05d7c10efae804b7b878adf14b4d21c56b7c
---

# Story 2.4: Khối luyện tập stick control trong bài

Status: review

## Story

As a người tự học trống,
I want pattern R/L chạy sáng theo đúng tick metronome ngay trong bài tập,
so that tôi nhìn màn hình từ xa và tập single/double stroke, paradiddle đúng nhịp.

## Acceptance Criteria

1. **Mở bài tập → khối luyện tập render đầy đủ + mount rule AD-8**
   **Given** bài tập stick control trong content có pattern (R/L), tempo mục tiêu và ghi chú kỹ thuật (AR-3) — tối thiểu: single stroke, double stroke, paradiddle (FR-12)
   **When** mở bài tập
   **Then** khối luyện tập render: `ui/PatternGrid` (ô R amber / L teal, 56px đậm — đọc được từ ~2m, luôn kèm chữ cái không chỉ màu — UX-DR5) + `ui/MetronomeBlock` nhúng (FR-11) + dòng tempo mục tiêu ("sạch ở 60 → nâng dần 80") + ghi chú kỹ thuật (FR-14 hiển thị)
   **And** mount theo AD-8: engine không chạy → set tempo bắt đầu của bài; đang chạy → giữ tempo hiện tại.

2. **Con trỏ pattern chạy đúng theo beat event, loop vô hạn**
   **Given** metronome đang chạy
   **When** quan sát PatternGrid
   **Then** ô hiện tại highlight (nền overlay + viền amber-bright) tiến đúng theo beat event `{bar, beatInBar}` của engine — UI không tự đếm tick (AR-4), pattern loop vô hạn đến khi dừng (FR-13)
   **And** đổi tempo giữa chừng không làm con trỏ nhảy sai ô.

3. **Layout luyện tập desktop ≥60% viewport / mobile ghim điều khiển đáy**
   **Given** viewport desktop ≥768px
   **When** mở khối luyện tập
   **Then** vùng pattern + beat dots + BPM chiếm ≥60% chiều cao viewport, phần chữ đẩy xuống dưới (UX-DR12)
   **And** mobile <768px: cụm điều khiển tempo ghim đáy trong tầm ngón cái, pattern wrap 4 ô/hàng, chữ pattern 40px (token responsive).

## Tasks / Subtasks

- [x] Task 1: `ui/pattern-cursor.ts` — logic con trỏ thuần, test TRƯỚC (AC: #2)
  - [x] Viết test TRƯỚC: NEW `src/ui/pattern-cursor.test.ts` (vitest env node, model theo `metronome-shortcuts.test.ts` — module thuần không React): (a) `{bar:1, beatInBar:1}` → index 0; (b) tiến tuần tự trong một bar 4/4: beat 1→0, 2→1, 3→2, 4→3; (c) wrap theo pattern: pattern 4 ô, `{bar:2, beatInBar:1}` (beatsPerBar 4) → 0; pattern 8 ô, `{bar:2, beatInBar:4}` → 7 rồi `{bar:3, beatInBar:1}` → 0; (d) pattern 16 ô đi hết 4 bar rồi wrap; (e) KHÔNG phụ thuộc tempo — hàm không nhận tempo, chốt bằng chữ ký; (f) beatsPerBar 3: `{bar:2, beatInBar:1}` → 3 (con trỏ vẫn tiến liên tục); (g) patternLength ≤ 0 → trả 0 (guard degenerate, không NaN/âm)
  - [x] NEW `src/ui/pattern-cursor.ts` — module thuần kebab-case (AD-1, không React): `export function patternIndexForBeat(event: { bar: number; beatInBar: number }, beatsPerBar: number, patternLength: number): number` = `((bar - 1) * beatsPerBar + (beatInBar - 1)) % patternLength` + guard patternLength ≤ 0. Comment trích AR-4: UI suy vị trí từ payload — stateless, không đếm event (tab ẩn/hiện bắt kịp ngay, UX-DR13)
- [x] Task 2: Test hợp đồng data exercise trong content (AC: #1)
  - [x] UPDATE `src/content/index.test.ts` — thêm asserts (KHÔNG sửa `phase-1.ts`, data đã đủ): mọi item `kind === 'exercise'` có `pattern.length ≥ 4`, `targetTempo.from ≤ targetTempo.to`, cả hai trong [40, 200] (dải TEMPO_MIN/MAX của engine), `techniqueNotes.length ≥ 1`; toàn phase tồn tại đủ 3 rudiment FR-12 theo pattern join: `'RLRL'` (single), `'RRLL'` (double), `'RLRRLRLL'` (paradiddle) — chốt hợp đồng chống sửa ẩu data (tinh thần test "đúng một bài drum-map" của 2.3)
- [x] Task 3: `ui/PatternGrid` — component trình bày + CSS module (AC: #1, #2, #3)
  - [x] NEW `src/ui/PatternGrid.tsx` — named export `export function PatternGrid({ pattern, activeIndex }: { pattern: ReadonlyArray<'R' | 'L'>; activeIndex: number | null })`. Thuần trình bày, KHÔNG subscribe engine (PracticeBlock lo). Mỗi ô render CHỮ `R`/`L` thật (SR đọc được, không chỉ màu — UX-DR5/UX-DR11); key theo index hợp lệ (pattern tĩnh, không reorder)
  - [x] NEW `src/ui/PatternGrid.module.css` — token-only (AD-5): grid `grid-template-columns: repeat(4, minmax(0, 1fr))` — 4 ô/hàng MỌI viewport (trong dải "4–8 ô/hàng khớp số phách" UX-DR5; 4 = beatsPerBar mặc định nên mỗi hàng đúng một ô nhịp; pattern 8 → 2 hàng, 16 → 4 hàng; mobile "wrap 4 ô/hàng" AC #3 tự thỏa); ô vuông `aspect-ratio: 1`, chữ `var(--font-size-pattern-letter)` + `var(--font-weight-pattern-letter)` (role tokens — nghị quyết deferred-work mục pattern-cell.typography; 56→40px mobile ĐÃ có sẵn trong tokens.css media query, KHÔNG thêm gì vào styles/); màu R `var(--pattern-cell-right-color)`, L `var(--pattern-cell-left-color)`; ô active nền `var(--pattern-cell-active-background)` + outline `var(--pattern-cell-active-outline)`, radius `var(--pattern-cell-radius)`
  - [x] Active CHỈ đổi nền/viền — không scale/animation, tự thỏa `prefers-reduced-motion` (UX-DR2, precedent DrumMap)
- [x] Task 4: `ui/PracticeBlock` — compose khối luyện tập (AC: #1, #2, #3)
  - [x] NEW `src/ui/PracticeBlock.tsx` — named export `export function PracticeBlock({ exercise }: { exercise: ExerciseSpec })` (`import type { ExerciseSpec } from '../core/types'`). Compose `<PatternGrid>` + dòng tempo mục tiêu + `<MetronomeBlock />` + khối ghi chú kỹ thuật. Sống ở `ui/` — KHÔNG phải `features/practice` (quyết định kiến trúc, xem Dev Notes). TUYỆT ĐỐI không gọi `useMetronomeShortcuts` — MetronomeBlock đã sở hữu (AD-8 một chủ phím tắt); trang bài tập chỉ có MỘT MetronomeBlock nên không double-register
  - [x] Mount rule AD-8: `useEffect(() => { if (!metronome.getSnapshot().isRunning) metronome.setTempo(exercise.targetTempo.from) }, [])` — chạy một lần khi mount; StrictMode double-invoke vô hại (idempotent). KHÔNG BAO GIỜ `metronome.stop()` khi unmount — state xuyên route (AD-3, precedent MetronomePage)
  - [x] Con trỏ: effect `[]` subscribe `metronome.onBeat`; bù delay `Math.max(0, (event.audioTime - metronome.currentTime) * 1000)` rồi setTimeout đặt `activeIndex = patternIndexForBeat(event, metronome.getSnapshot().beatsPerBar, pattern.length)` — MỘT pending timer duy nhất, timer mới thay timer cũ; cleanup unsubscribe + clearTimeout. Copy đúng khuôn `MetronomeBlock.tsx:25-44` — duplication ~12 dòng là sanctioned (xem Dev Notes), KHÔNG refactor MetronomeBlock để share hook
  - [x] Effect theo `isRunning`: dừng → clearTimeout + `setActiveIndex(null)` (không ô nào sáng — "loop đến khi dừng", giống dots MetronomeBlock)
  - [x] Dòng tempo mục tiêu (FR-14 hiển thị): "Mục tiêu: sạch ở **{from}** → nâng dần **{to}** bpm" — small, `--color-text-muted`, số nhấn `--color-text-secondary` (theo mock). KHÔNG có "Tempo tốt nhất"/nút ghi — đó là story 3.3
  - [x] Ghi chú kỹ thuật: khối note dưới card — nền `var(--color-surface-raised)`, viền trái 3px `var(--color-amber-dim)` (DESIGN.md: amber-dim đúng vai trò "viền trái khối ghi chú kỹ thuật"), radius phải `var(--rounded-default)`, chữ small `--color-text-secondary`; render `<ul>` từ `techniqueNotes` (3 mục/bài), nhãn "💡 Ghi chú kỹ thuật"
  - [x] NEW `src/ui/PracticeBlock.module.css` — token-only; card `--card-*` tokens chứa PatternGrid + target + MetronomeBlock. Desktop `@media (width >= 768px)`: card `min-height: 60vh` + flex column căn giữa (AC #3 — vùng pattern+dots+BPM ≥60% viewport). Mobile `@media (width < 768px)`: wrapper `.dock` quanh MetronomeBlock `position: sticky; bottom: calc(var(--nav-height-mobile-tabbar) + env(safe-area-inset-bottom, 0px) + var(--spacing-2))`, nền `var(--color-surface-raised)` (cùng nền card — nội dung cuộn phía sau không lộ) — cụm điều khiển luôn trong tầm ngón cái khi cuộn pattern dài (tab bar mobile là `position: fixed` — xem AppLayout.module.css:8-18). Media query layout trong module được phép (precedent MetronomeBlock kbd hint, DrumMap grid); giá trị TOKEN không override ở đây (AD-5)
- [x] Task 5: LessonPage render section Luyện tập (AC: #1)
  - [x] UPDATE `src/features/lesson/LessonPage.tsx`: thêm section "Luyện tập" (h2 `styles.sectionTitle` cùng cấp các section khác) GIỮA section video và section "Thực hành" — đúng KF-1: đọc lý thuyết → xem video → cuộn xuống khối luyện tập; phần chữ hướng dẫn (Thực hành) đẩy xuống dưới (UX-DR12). Guard `{item.kind === 'exercise' && (...)}` — discriminated union narrow nên `item.exercise` có type đầy đủ, KHÔNG cần cast; 6 bài theory không có section rỗng
  - [x] Render `<PracticeBlock key={item.id} exercise={item.exercise} />` — `key={item.id}` BẮT BUỘC: đổi route giữa hai bài tập không unmount LessonPage (React tái sử dụng element cùng vị trí), key ép remount để mount rule AD-8 chạy lại cho bài mới (story 3.1 sẽ thêm link "bài kế tiếp" — chuẩn bị sẵn). Import `{ PracticeBlock }` từ `../../ui/PracticeBlock`
  - [x] Cập nhật comment thứ tự section trong LessonPage thành thứ tự đầy đủ mới (bài học review 2.3: comment kể thứ tự cũ bị flag) — mục tiêu → lý thuyết → sơ đồ (nếu có) → video → luyện tập (nếu exercise) → thực hành. Giữ nguyên: breadcrumb, 404 in-page, guard videos/drum-map, heading outline, named export. `LessonPage.module.css` chỉ sửa nếu cần khoảng cách (token-only)
- [x] Task 6: Quality gate + verify tay + commit (AC: #1, #2, #3)
  - [x] `npm run check` xanh (tsc -b + oxlint + vitest run + vite build); toàn bộ 98 test hiện có vẫn xanh + test mới (pattern-cursor, content contract). ZERO thay đổi dưới: `src/core/*` (types.ts, audio/* — engine, worker, sample-player, index.ts), `src/content/phase-1.ts`, `src/content/index.ts`, `src/ui/MetronomeBlock*|useMetronome*|useMetronomeShortcuts*|metronome-shortcuts*|Video*|video-urls*|DrumMap*|drum-kit-parts*`, `src/app/*`, `src/styles/*`, `src/features/roadmap|metronome|progress`, `public/sounds/*`, `vercel.json`, `vite.config.ts`, `package.json`
  - [x] Verify tay trên `vite dev`: (a) `/bai-hoc/gd1-t1-b4` — section "Luyện tập" giữa video và Thực hành: 4 ô R L R L khổng lồ (R amber, L teal), dòng "Mục tiêu: sạch ở 60 → nâng dần 65 bpm", khối ghi chú 3 dòng viền trái amber-dim; (b) bấm Bắt đầu → ô sáng tiến từng ô theo tick, ô 1 trùng phách accent, hết 4 ô quay lại ô 1 vô hạn; bấm Dừng → không ô nào sáng; (c) đang chạy bấm +5/−5/tap → nhịp đổi mượt, con trỏ KHÔNG nhảy sai ô (AC #2); (d) Space/↑↓/Shift+↑↓/T hoạt động, không double-fire; (e) mount rule: mở `/metronome` set 90 bpm đang chạy → vào `/bai-hoc/gd1-t1-b4` giữ nguyên 90; Dừng, reload trang bài → BPM tự về 60 (tempo bắt đầu của bài); (f) `/bai-hoc/gd1-t3-b1` (paradiddle 8 nhát) → 2 hàng × 4 ô; `/bai-hoc/gd1-t3-b3` (16 nhát) → 4 hàng, con trỏ chạy hết 4 bar mới wrap; (g) bài theory (`gd1-t1-b1`, `gd1-t2-b1`, `gd1-t3-b4`) KHÔNG có section Luyện tập; (h) desktop ≥768px: card luyện tập ≥60% chiều cao viewport; (i) 375px: chữ pattern 40px, 4 ô/hàng không tràn ngang, cuộn trong bài tập dài → cụm điều khiển ghim trên tab bar, bấm được bằng ngón cái; (j) DevTools emulate `prefers-reduced-motion` → ô active chỉ đổi màu/viền; (k) ẩn tab ~30s khi đang chạy, quay lại → con trỏ hiện đúng ô ngay lập tức, không tua dồn (stateless — UX-DR13)
  - [x] Commit: `feat(practice): story 2.4 — khối luyện tập stick control trong bài`; push + verify Vercel deploy xanh; trên production mở `/bai-hoc/gd1-t1-b4` bấm chạy thử một vòng

## Dev Notes

### Trạng thái code hiện tại — chạm gì, KHÔNG chạm gì

**Story này ~100% lớp UI: KHÔNG sửa một dòng nào trong `core/`, `content/` (trừ test), `app/`, `styles/`.** Mọi nền tảng đã sẵn:

- `src/content/phase-1.ts` — **data exercise ĐÃ ĐẦY ĐỦ**: 8 bài `kind: 'exercise'` có `pattern`/`targetTempo`/`techniqueNotes` (bảng bên dưới). KHÔNG thêm/sửa bài nào — Task 2 chỉ thêm test chốt hợp đồng vào `content/index.test.ts`.
- `src/core/types.ts` — `ExerciseSpec { pattern, targetTempo: {from, to}, techniqueNotes }` đã tồn tại; `LessonItem` là discriminated union: `kind === 'exercise'` ⇒ `exercise` bắt buộc (narrow tự nhiên trong LessonPage). KHÔNG sửa.
- `src/core/audio/` — engine phát beat event `{bar, beatInBar, audioTime}` (bar/beatInBar đếm TỪ 1), `metronome.onBeat(listener)` trả unsubscribe, `metronome.currentTime` getter đọc audio clock, `getSnapshot()` cho `{tempo, beatsPerBar, isRunning}`, `setTempo` clamp 40–200. Đủ dùng nguyên trạng — **KHÔNG sửa file nào trong core/audio**.
- `src/ui/MetronomeBlock.tsx` — component hoàn chỉnh, không props, đã sở hữu `useMetronomeShortcuts` bên trong (AD-8). Comment đầu file hứa sẵn: "features/practice compose ở story 2.4". **KHÔNG sửa** — PracticeBlock chỉ compose.
- `src/features/lesson/LessonPage.tsx` — cấu trúc section ổn định (mục tiêu → lý thuyết → sơ đồ → video → thực hành); comment dòng 2 hứa sẵn "Story này KHÔNG render pattern-tempo-MetronomeBlock (2.4)" — giờ là lúc gỡ câu đó. Article `max-width: 65ch` (~690px): 4 ô/hàng + gap vừa vặn, không cần phá layout.
- `src/styles/tokens.css` — token pattern-cell (`--pattern-cell-right-color/left-color/active-background/active-outline/radius`, dòng 97-102) + role typography (`--font-size-pattern-letter` 56px, `--font-weight-pattern-letter` 800, dòng 31-32) + **responsive 56→40px ĐÃ CÓ SẴN** (media query dòng 143-147). KHÔNG thêm token nào.
- `src/features/practice/` — hiện chỉ có `.gitkeep`. **GIỮ NGUYÊN, không đặt code vào đây** (xem quyết định kiến trúc bên dưới).
- **KHÔNG chạm:** `metronome-engine.ts`, `tick-worker.ts`, `sample-player*`, `core/audio/index.ts`, `useMetronome.ts`, `useMetronomeShortcuts.ts`, `metronome-shortcuts.ts`, `VideoEmbed*`, `DrumMap*`, `drum-kit-parts*`, `src/app/*`, `src/styles/*`, `vercel.json`, `vite.config.ts`, `package.json` (zero dependency mới).

**Không phải Next.js.** Vite 8 + React 19 SPA, react-router 8, StrictMode bật (main.tsx). Test env node thuần — repo KHÔNG có jsdom/@testing-library; component không có DOM test, logic tách vào module thuần (`pattern-cursor.ts`) để test — pattern nhất quán từ 1.2/2.3.

### Quyết định kiến trúc: PracticeBlock sống ở `ui/`, KHÔNG phải `features/practice`

Structural Seed của spine ghi `features/practice/ # khối luyện tập stick control (F4)` — nhưng khối này **nhúng trong trang bài học** (`/bai-hoc/:id` do `features/lesson` sở hữu; EXPERIENCE IA #3), và **AD-1 (binding) cấm features import lẫn nhau**. `features/lesson` không được import `features/practice` — mâu thuẫn nội tại của seed. Giải quyết theo đúng cơ chế AD-1 quy định: hạ xuống `ui/`.

- Tiền lệ đã established: `ui/MetronomeBlock` (chính là kết luận của reconcile-ux GAP về hai bộ điều khiển), `ui/DrumMap` (2.3 — widget nhúng trong lesson, một nơi dùng), `ui/PatternGrid` (spine seed tự liệt kê ở ui/).
- AD-8 mô tả khối luyện tập là "chỉ thêm PatternGrid + tempo mục tiêu quanh MetronomeBlock" — cả cụm sống cạnh nhau ở ui/ là tự nhiên.
- `ui/` import `core/` (types, metronome) hợp lệ; PracticeBlock nhận `ExerciseSpec` qua **props** từ LessonPage — KHÔNG import `content/` từ ui/ (AD-1).
- `features/practice/.gitkeep` giữ nguyên (seed vẫn liệt kê thư mục; giai đoạn sau nếu có surface luyện tập độc lập thì dùng). Story 3.3 sẽ mở rộng PracticeBlock tại chỗ (nút "Ghi tempo tốt nhất" — ui → core/progress hợp lệ).

Đây là variance có chủ đích so với chữ nghĩa seed — AD-1 là invariant binding, seed là sketch ("Cấu trúc chi tiết bên trong mỗi feature — code sở hữu", spine Deferred). Ghi lại đúng lý do này nếu review hỏi.

### Bảng data exercise có sẵn (phase-1.ts — nguồn verify tay)

| id | pattern | targetTempo | ghi chú |
|---|---|---|---|
| `gd1-t1-b4` | R L R L (4) | 60→65 | single stroke — bài verify chính |
| `gd1-t1-b5` | R L R L (4) | 60→70 | |
| `gd1-t2-b2` | R R L L (4) | 60→65 | double stroke |
| `gd1-t2-b3` | R L R L R R L L (8) | 60→70 | single+double xen kẽ |
| `gd1-t2-b4` | R R L L (4) | 60→70 | |
| `gd1-t3-b1` | R L R R L R L L (8) | 60→65 | paradiddle |
| `gd1-t3-b2` | R L R R L R L L (8) | 60→70 | |
| `gd1-t3-b3` | 16 nhát tổng hợp | 70→80 | 4 hàng × 4 ô |

6 bài theory (`gd1-t1-b1..b3`, `gd1-t2-b1`, `gd1-t3-b4`) KHÔNG có exercise — guard `kind === 'exercise'` loại tự nhiên.

### Sự thật nền tảng dev PHẢI biết trước khi code

- **Beat event phát SỚM tối đa ~100ms** (engine schedule lookahead — event bắn tại thời điểm schedule, không phải lúc âm vang). Visual phải bù: `delayMs = Math.max(0, (event.audioTime - metronome.currentTime) * 1000)` rồi setTimeout — **copy đúng khuôn `MetronomeBlock.tsx:25-44`** (một pending timer, timer mới thay cũ, cleanup khi unmount, clear khi dừng). Duplication ~12 dòng này là **sanctioned**: hai consumer độc lập của beat event; trích hook chung = sửa MetronomeBlock đã review 2 vòng — không đáng rủi ro cho 12 dòng. Khi có consumer thứ ba mới cân nhắc trích (ghi nhận ở Change Log nếu review flag).
- **Con trỏ là DẪN XUẤT stateless từ payload, không phải counter**: `((bar-1) × beatsPerBar + (beatInBar-1)) % pattern.length`. Vì thế: đổi tempo giữa chừng không lệch ô (bar/beatInBar tiến tuyến tính bất kể tempo — AC #2 tự thỏa theo cấu trúc); tab ẩn rồi hiện → event kế tiếp đặt đúng ô ngay, không tua dồn (UX-DR13). ĐÂY là lý do AR-4 cấm UI tự đếm tick — một counter cục bộ sẽ trôi khi timer bị throttle lúc tab ẩn.
- **Đổi `beatsPerBar` giữa chừng làm index nhảy** (công thức đổi hệ số) — chấp nhận được, ngoài AC; engine cũng wrap lại beatInBar khi giảm số phách (advanceBeat dùng ≥). KHÔNG chống, KHÔNG crash là đủ (modulo luôn cho giá trị hợp lệ vì bar/beatInBar ≥ 1).
- **React KHÔNG remount khi chỉ đổi route param**: `/bai-hoc/A` → `/bai-hoc/B` giữ nguyên instance LessonPage lẫn PracticeBlock cùng vị trí — mount rule AD-8 sẽ không chạy cho bài mới nếu thiếu `key={item.id}`. Hiện chưa có link bài→bài nhưng story 3.1 thêm "gợi ý bài kế tiếp"; key rẻ, đặt ngay từ giờ.
- **StrictMode (bật trong main.tsx) chạy effect 2 lần ở dev**: mount-tempo idempotent (set cùng giá trị, engine bỏ qua nếu không đổi), subscribe/unsubscribe cân bằng — theo đúng khuôn MetronomeBlock thì tự an toàn.
- **KHÔNG `metronome.stop()` khi unmount** — state xuyên route (AD-3); chỉ pagehide listener trong core/audio/index.ts được stop. Precedent: MetronomePage comment dòng 2.
- **Space trong bài tập KHÔNG double-fire**: `useMetronomeShortcuts` chỉ sống trong MetronomeBlock, trang bài tập có đúng MỘT MetronomeBlock. PracticeBlock/PatternGrid không addEventListener phím nào (AD-8). Quirk "focus kẹt trên button chặn phím tắt" là deferred từ 1.3 — KHÔNG sửa ở story này.
- **Tab bar mobile là `position: fixed` đáy, cao `--nav-height-mobile-tabbar` (56px) + safe-area** (AppLayout.module.css:8-18) — dock sticky phải cộng offset này, nếu không cụm điều khiển chui xuống dưới tab bar.

### Guardrails kiến trúc (binding)

- **AD-1 layering:** `pattern-cursor.ts` thuần TS trong ui/ (unit test node — precedent `metronome-shortcuts.ts`, `video-urls.ts`); `PracticeBlock`/`PatternGrid` ở ui/ import core hợp lệ, **KHÔNG import content/ hay features/** — ExerciseSpec đi qua props. [Source: ARCHITECTURE-SPINE.md#AD-1]
- **AR-4/AD-3 — engine là nguồn đếm duy nhất:** UI suy vị trí pattern từ beat event payload, không rAF loop, không CSS animation theo tempo, không tự đếm. Âm là chân lý, visual đuổi theo ≤50ms (đã bù audioTime). [Source: ARCHITECTURE-SPINE.md#AD-3; src/ui/MetronomeBlock.tsx:3-5]
- **AD-8 — một khối, một chủ phím tắt:** compose `ui/MetronomeBlock` nguyên trạng; khối luyện tập CHỈ thêm PatternGrid + tempo mục tiêu + ghi chú quanh nó; mount rule engine-idle-set/running-keep. [Source: ARCHITECTURE-SPINE.md#AD-8]
- **AD-5 tokens:** pattern-cell tokens + role typography tokens ĐÃ ĐỦ trong tokens.css (dòng 31-32, 97-102, 143-147) — dùng đủ, KHÔNG thêm/sửa tokens.css. Kích thước ô: `aspect-ratio: 1` + grid track (không cần raw px; mock 88px chỉ là tham chiếu). Card dùng `--card-*`. Media query layout trong module hợp lệ (precedent MetronomeBlock/DrumMap), token value không override. [Source: src/styles/tokens.css; ARCHITECTURE-SPINE.md#AD-5]
- **UX-DR5 — không bao giờ chỉ mã hóa bằng màu:** ô LUÔN kèm chữ R/L; R amber / L teal nhất quán tuyệt đối (token, không hardcode). [Source: epics.md#UX-DR5; DESIGN.md#Do's]
- **UX-DR12/13:** desktop card ≥60vh; mobile dock sticky + pattern 4 ô/hàng + chữ 40px (token tự đổi); visual bù delay theo audioTime. [Source: epics.md#UX-DR12, #UX-DR13]
- **Lỗi & trạng thái:** không throw xuyên tầng — listener onBeat của PracticeBlock không được ném lỗi ra ngoài (engine đã try/catch nhưng đừng dựa vào đó). [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions]

### Bố cục section (mock tham chiếu: mock-bai-hoc-luyen-tap.html — spine thắng nếu mâu thuẫn)

Thứ tự trong bài tập: mục tiêu → lý thuyết → video → **Luyện tập** → Thực hành (chữ đẩy xuống dưới — UX-DR12/KF-1). Trong section Luyện tập:

1. Card (`--card-*`): PatternGrid → dòng tempo mục tiêu → MetronomeBlock (dots + BPM + transport + picker + hints — nguyên khối).
2. Dưới card: khối ghi chú kỹ thuật (viền trái amber-dim, `<ul>` 3 mục).

Mock đặt dòng target giữa BPM và controls — không khả thi vì MetronomeBlock là khối nguyên không props; đặt giữa PatternGrid và MetronomeBlock là biến thể hợp lệ (spine không quy định vị trí dòng này). Mock có "Tempo tốt nhất của bạn: —" và nút "Ghi tempo tốt nhất" — **KHÔNG làm**, đó là story 3.3 (epic-3 sẽ gắn vào PracticeBlock). Nút "Hoàn thành bài hôm nay" trong mock là story 3.1 — KHÔNG làm.

### Gotchas TypeScript strict (fail `tsc -b` nếu quên)

- `verbatimModuleSyntax` — `import type { ExerciseSpec }`, `import type` cho mọi type-only import.
- `erasableSyntaxOnly` — không enum, không parameter properties; union chữ + `as const`.
- `noUnusedLocals`/`noUnusedParameters` là error. Không path alias — import tương đối (`../core/types`, `./PatternGrid`).
- Discriminated union: trong guard `item.kind === 'exercise'`, `item.exercise` narrow đầy đủ — KHÔNG cần `!` hay cast.
- `ReadonlyArray<'R' | 'L'>` cho props pattern — khớp type `ExerciseSpec.pattern` sẵn có.

### Trí tuệ từ story trước (2.3 done, review 2 vòng — 8+3 patch, học được gì)

- **House rhythm:** red-green TDD cho module thuần (test đỏ TRƯỚC); CSS module cạnh component, token-only; text tiếng Việt inline; named exports (zero default export toàn repo); comment tiếng Việt trích mã bất biến (AD-x, FR-x, UX-DRx) tại nơi áp dụng; không semicolon, single quotes.
- **Bài học review 2.3:** (1) type state theo union hẹp — ở đây `useState<number | null>` cho activeIndex là đúng rồi, đừng dùng string; (2) comment kể thứ tự section phải cập nhật khi chèn section mới (bị flag ở 2.3 — Task 5 đã gồm); (3) data test chốt hợp đồng chống sửa ẩu (Task 2 cùng tinh thần); (4) guard chống input dồn dập — ở đây không phát âm theo click nên không cần MIN_REPLAY; auto-repeat phím đã do `resolveShortcutAction` xử lý (`repeat` chỉ chặn toggle).
- **Bài học 1.2/1.3:** mọi thứ chạm browser API đi qua khuôn có sẵn (compensation timer của MetronomeBlock); listener/timer dọn sạch khi unmount; snapshot đọc TRONG handler chống stale closure (`metronome.getSnapshot()` ngay lúc cần, không capture từ render).
- **Đã deferred, KHÔNG sửa ở story này** (deferred-work.md): master gain stage (không liên quan — story này không thêm nguồn âm); shortcut-focus quirk (thuộc MetronomeBlock); SR announce BPM (pass a11y); nhãn SVG DrumMap nhỏ; doc-drift tokens.css/RouterProvider. Đừng làm tệ hơn là đủ.
- **Git pattern:** `feat(scope): story X.Y — mô tả tiếng Việt`; commit gộp source + test + css một lần.

### Ghi chú tech mới nhất

Không dependency mới. Stack (React 19.2, react-router 8.1, TS 6.0, Vite 8.1, Vitest 4.1) verify 2026-07-08, đang chạy production. Bề mặt mới: KHÔNG có browser API mới — chỉ compose engine/component sẵn có + CSS grid/sticky (ổn định nhiều năm). Không cần research thêm.

### Project Structure Notes

Cây thay đổi story này:

```text
src/ui/
  pattern-cursor.ts           # NEW — patternIndexForBeat thuần (AR-4: dẫn xuất stateless)
  pattern-cursor.test.ts      # NEW — unit test index/wrap/beatsPerBar/degenerate (Task 1)
  PatternGrid.tsx             # NEW — grid ô R/L trình bày, props {pattern, activeIndex}
  PatternGrid.module.css      # NEW — token-only, 4 ô/hàng, role typography tokens
  PracticeBlock.tsx           # NEW — compose PatternGrid + MetronomeBlock + target + ghi chú; mount rule AD-8; cursor bù audioTime
  PracticeBlock.module.css    # NEW — card ≥60vh desktop, dock sticky mobile, note viền amber-dim
src/features/lesson/
  LessonPage.tsx              # UPDATE — section "Luyện tập" giữa video và Thực hành, key={item.id}
  LessonPage.module.css       # UPDATE nếu cần khoảng cách (token-only) — có thể không đổi
src/content/
  index.test.ts               # UPDATE — asserts hợp đồng exercise data + 3 rudiment FR-12 (Task 2)
```

- Import: `PracticeBlock` → `./PatternGrid`, `./MetronomeBlock`, `./pattern-cursor`, `../core/audio` (metronome), `../core/types` (type ExerciseSpec); `LessonPage` → `../../ui/PracticeBlock`. Không alias, đường dẫn tương đối.
- `features/practice/.gitkeep` giữ nguyên — KHÔNG đặt code vào (quyết định kiến trúc ở trên).
- `core/`, `content/phase-1.ts`, `app/`, `styles/` không đổi — API/engine/token từ 1.2/1.3/2.3 đủ dùng, đó là chủ đích thiết kế.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.4] — statement + 3 AC nguyên văn; Epic 2 context; UX-DR5/12/13
- [Source: _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/ARCHITECTURE-SPINE.md#AD-1, #AD-3, #AD-5, #AD-8, #Structural-Seed, #Capability-Map F4] — layering, beat event là nguồn đếm duy nhất, tokens, một MetronomeBlock/một chủ phím tắt, mount rule
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/DESIGN.md#Components pattern-cell, #Layout, #Do's] — R amber/L teal luôn kèm chữ, grid 4–8 ô/hàng, ≥60% viewport, amber-dim cho viền ghi chú kỹ thuật
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/EXPERIENCE.md#Component-Patterns "Khối luyện tập", #Responsive, #Key-Flows KF-1] — con trỏ đồng bộ tick, loop vô hạn, mobile ghim điều khiển, flow buổi tập
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/mockups/mock-bai-hoc-luyen-tap.html] — tham chiếu thị giác khối luyện tập (spine thắng nếu mâu thuẫn; phần best-tempo/hoàn-thành là story 3.x)
- [Source: _bmad-output/planning-artifacts/prds/prd-drum-beginner-2026-07-08/prd.md#FR-11..FR-14, UJ-1] — nhúng metronome, pattern đọc từ 2m, con trỏ theo metronome, tempo mục tiêu + ghi chú
- [Source: src/core/audio/metronome-engine.ts (BeatEvent, onBeat, currentTime, getSnapshot); src/ui/MetronomeBlock.tsx:25-44 (khuôn bù delay); src/ui/useMetronomeShortcuts.ts (AD-8 — không đăng ký thêm); src/features/lesson/LessonPage.tsx; src/styles/tokens.css:31-32,97-102,143-147; src/app/AppLayout.module.css:8-18 (tab bar fixed)] — code hiện trạng
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — pattern-cell.typography tiêu thụ role tokens (nghị quyết có sẵn); shortcut-focus quirk KHÔNG sửa; master gain không liên quan
- [Source: _bmad-output/implementation-artifacts/2-3-so-do-bo-trong-tuong-tac.md#Dev-Notes; spec-2-3 §Review-Triage-Log, §Auto-Run-Result] — house conventions, bài học review, git pattern
- [Source: _bmad-output/implementation-artifacts/epic-2-context.md] — practice block nhúng MetronomeBlock, mount rule, Epic 3 sẽ gắn best-tempo vào block này (giữ ID ổn định, block mở cho affordance 3.3)

## Dev Agent Record

### Agent Model Used

claude-fable-5 (Claude Fable 5)

### Debug Log References

- Red-green Task 1: `pattern-cursor.test.ts` 8/8 đỏ với placeholder → 8/8 xanh sau implement.
- `npm run check` xanh toàn bộ: tsc -b, oxlint 0 warning, vitest **8 files / 108 tests** (98 cũ + 8 pattern-cursor + 2 content contract), vite build OK.
- Verify runtime bằng headless Chrome (playwright-core, scratchpad — không thêm dependency vào repo) trên `vite dev`: 18/18 check + 6 probe pass. Đáng chú ý: (a) thứ tự section Mục tiêu → Video → Luyện tập → Thực hành đúng; (b) mount rule cả hai nhánh — idle → 60 (bài 60→65) / 70 (bài 70→80), engine đang chạy 90 bpm xuyên route (client-side nav) → giữ 90; (c) đổi tempo +5 giữa chừng con trỏ không nhảy sai ô; (d) đổi 3/4 giữa chừng con trỏ vẫn hợp lệ, không crash; (e) pattern 8 ô loop đủ {0..7}; (f) Dừng → 0 ô sáng; (g) mobile 375px: chữ 40px, 4 ô/hàng, không tràn ngang, dock sticky ghim trên tab bar; (h) desktop card = 69% viewport (≥60%); (i) bài theory không có section Luyện tập; (j) Space/↑/Shift+↑ hoạt động từ body; Space khi focus trên button toggle đúng MỘT lần (native activation, hook bị resolver chặn — đúng intent contract 1.3, không double-fire); (k) không pageerror.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created (claude-fable-5, 2026-07-09)
- Task 1 ✅ `pattern-cursor.ts`: `patternIndexForBeat` — dẫn xuất stateless `((bar-1)×beatsPerBar + (beatInBar-1)) % patternLength` + guard degenerate; 8 unit test (index/wrap 4-8-16/beatsPerBar 3/độc lập tempo).
- Task 2 ✅ `content/index.test.ts`: +2 test hợp đồng — mọi exercise pattern ≥4 nhát & ≥1 ghi chú; tồn tại đủ RLRL/RRLL/RLRRLRLL (FR-12). KHÔNG sửa `phase-1.ts`.
- Task 3 ✅ `ui/PatternGrid`: grid 4 ô/hàng mọi viewport (mỗi hàng = một ô nhịp 4/4), chữ role tokens 56→40px, R amber/L teal luôn kèm chữ, active chỉ đổi nền/viền (reduced-motion tự thỏa).
- Task 4 ✅ `ui/PracticeBlock`: compose MetronomeBlock nguyên trạng (không useMetronomeShortcuts thứ hai) + PatternGrid + tempo mục tiêu + ghi chú kỹ thuật (viền trái amber-dim); mount rule AD-8 (effect `[exercise]` — thỏa lint exhaustive-deps, remount qua key nên tương đương `[]`); con trỏ bù delay audioTime theo khuôn MetronomeBlock (duplication sanctioned); dừng → null. Desktop card min-height 60vh; mobile dock sticky trên tab bar fixed. Selector kép `.block .target` thắng `.article p` (tiền lệ DrumMap `.panel .hint`).
- Task 5 ✅ `LessonPage`: section "Luyện tập" giữa video và Thực hành, guard `kind === 'exercise'` (union narrow, không cast), `key={item.id}` ép remount cho mount rule; comment thứ tự section cập nhật đầy đủ. `LessonPage.module.css` KHÔNG cần sửa (article gap sẵn có).
- Task 6 ✅ gate + verify runtime + commit (chi tiết ở Debug Log). Diff chỉ chạm đúng Code Map — zero thay đổi `core/`, `styles/`, `app/`, `MetronomeBlock*`, `phase-1.ts`, configs.
- Quyết định trong lúc dev (khớp Dev Notes): mount rule dùng deps `[exercise]` thay `[]` để thỏa react-hooks lint — ngữ nghĩa AD-8 giữ nguyên (chạy lại khi đổi bài = đúng ý; engine đang chạy → no-op).

### File List

- `src/ui/pattern-cursor.ts` — NEW: `patternIndexForBeat` thuần (AR-4 stateless)
- `src/ui/pattern-cursor.test.ts` — NEW: 8 unit test con trỏ
- `src/ui/PatternGrid.tsx` — NEW: grid ô R/L trình bày, props `{pattern, activeIndex}`
- `src/ui/PatternGrid.module.css` — NEW: token-only, 4 ô/hàng, role typography tokens
- `src/ui/PracticeBlock.tsx` — NEW: compose PatternGrid + MetronomeBlock + target + ghi chú; mount rule AD-8; cursor bù audioTime
- `src/ui/PracticeBlock.module.css` — NEW: card ≥60vh desktop, dock sticky mobile, note viền amber-dim
- `src/features/lesson/LessonPage.tsx` — UPDATE: section "Luyện tập" giữa video và Thực hành, `key={item.id}`, comment thứ tự
- `src/content/index.test.ts` — UPDATE: +2 test hợp đồng exercise data (FR-12)
- `_bmad-output/implementation-artifacts/2-4-khoi-luyen-tap-stick-control-trong-bai.md` — story file (checkbox, record, status)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status 2-4: backlog → ready-for-dev → in-progress → review

## Change Log

- 2026-07-09: Story 2.4 implement hoàn chỉnh — khối luyện tập stick control nhúng trong bài tập (PatternGrid + PracticeBlock ở ui/, con trỏ stateless theo beat event, mount rule AD-8, layout ≥60vh desktop / dock sticky mobile). 108 test xanh, verify runtime headless Chrome 18 check + 6 probe pass. Status → review.
