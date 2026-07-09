# Story 2.3: Sơ đồ bộ trống tương tác

Status: done

## Story

As a người mới hoàn toàn,
I want click từng bộ phận trên sơ đồ bộ trống để xem tên, vai trò và nghe âm thanh thật của nó,
so that tôi phân biệt được snare với tom bằng tai trước khi ngồi vào trống thật.

## Acceptance Criteria

1. **Click vùng → highlight + panel + âm phát một lần**
   **Given** bài "Làm quen bộ trống" và component `ui/DrumMap` — SVG tự vẽ flat theo token `drum-map` (UX-DR7)
   **When** click một trong 6 vùng (snare, tom, kick, hi-hat, crash, ride)
   **Then** vùng active đổi fill amber-dim + viền amber-bright, panel (style card, bên phải desktop / dưới mobile) hiển thị tên + vai trò tiếng Việt, và âm thanh mẫu phát đúng một lần không loop (FR-6)
   **And** âm mẫu là file tự host trong `public/sounds/` (miễn phí bản quyền — AR-7), phát qua AudioContext dùng chung của `core/audio` (AR-4).

2. **Hover chỉ highlight, không phát âm**
   **Given** desktop
   **When** hover một vùng (chưa click)
   **Then** chỉ viền đổi amber, không phát âm (UX-DR7).

3. **Âm lỗi → im lặng, không chặn; không autoplay**
   **Given** một file âm thanh tải lỗi
   **When** click vùng đó
   **Then** vẫn highlight + hiện panel bình thường, im lặng — không báo lỗi chặn (UX-DR7)
   **And** không có âm thanh nào autoplay khi mở trang (UX-DR11).

## Tasks / Subtasks

- [ ] Task 1: Sinh 6 file âm mẫu tự host (AC: #1)
  - [ ] NEW `scripts/generate-drum-samples.mjs` — script Node thuần (chạy `node scripts/generate-drum-samples.mjs`, Node ≥22, zero dependency) synthesize 6 file WAV mono 16-bit 44100Hz vào `public/sounds/`: `snare.wav`, `tom.wav`, `kick.wav`, `hihat.wav`, `crash.wav`, `ride.wav`. Synthesize = miễn phí bản quyền theo cấu trúc (PRD A4) và tái tạo được. Công thức gợi ý ở Dev Notes — nghe GỢI ĐÚNG bộ phận là đạt, không cần giống studio
  - [ ] Chạy script một lần, commit cả script lẫn 6 file WAV (tổng ≤ ~500KB); xóa `public/sounds/.gitkeep`. KHÔNG thêm script vào `package.json` (giữ file này untouched)
- [ ] Task 2: Shared AudioContext — refactor wiring `core/audio/index.ts` (AC: #1)
  - [ ] UPDATE `src/core/audio/index.ts`: thêm `let sharedCtx: AudioContext | null = null` + `function getSharedAudioContext(): AudioContext { sharedCtx ??= new AudioContext(); return sharedCtx }`; đổi `createAudioContext: () => new AudioContext()` thành `createAudioContext: getSharedAudioContext`. AudioContext thật thỏa cấu trúc `MetronomeAudioContext` — engine không đổi một dòng nào
  - [ ] Export instance `export const drumSamples = new SamplePlayer({ getContext: getSharedAudioContext, fetchArrayBuffer: (url) => fetch(url).then(...) })` (Task 3). Giữ nguyên: pagehide listener, guard `typeof window`, mọi re-export hiện có
- [ ] Task 3: `core/audio/sample-player.ts` — red-green, test TRƯỚC (AC: #1, #3)
  - [ ] Viết test TRƯỚC: NEW `src/core/audio/sample-player.test.ts` (vitest env node, model theo `metronome-engine.test.ts` — fake deps inject qua constructor): (a) `play(url)` lần đầu fetch + decode + tạo source → gain → destination + `start()`; (b) lần hai CÙNG url không fetch lại (cache AudioBuffer); (c) hai `play()` đồng thời cùng url chỉ fetch MỘT lần (in-flight dedup); (d) fetch reject / decode reject → `play()` resolve `false`, KHÔNG throw, và lần click sau thử lại (lỗi không bị cache vĩnh viễn); (e) ctx `state !== 'running'` → gọi `resume()` trước khi phát; (f) gain đặt `SAMPLE_GAIN` (0.9)
  - [ ] NEW `src/core/audio/sample-player.ts` — thuần TS, KHÔNG React, KHÔNG gọi `fetch`/`AudioContext` trực tiếp (AD-1 — deps inject như MetronomeEngine): interface deps `{ getContext(): SampleAudioContextLike; fetchArrayBuffer(url: string): Promise<ArrayBuffer> }`; class `SamplePlayer` với `play(url: string): Promise<boolean>`; cache `Map<string, AudioBufferLike>`; in-flight `Map<string, Promise<...>>`; mỗi lần phát tạo `AudioBufferSourceNode` MỚI (node single-use) → GainNode 0.9 → destination, `start()` không loop. Mọi lỗi nuốt trong class, trả `false` — không throw xuyên tầng (Consistency Conventions)
- [ ] Task 4: Data 6 bộ phận trống — `ui/drum-kit-parts.ts` (AC: #1)
  - [ ] Viết test TRƯỚC: NEW `src/ui/drum-kit-parts.test.ts` (node thuần): đúng 6 phần theo thứ tự FR-6 (snare, tom, kick, hi-hat, crash, ride); `id` không trùng; `soundUrl` match `/^\/sounds\/[a-z]+\.wav$/` và không trùng; `label`/`role` không rỗng
  - [ ] NEW `src/ui/drum-kit-parts.ts` — module thuần kebab-case: `export interface DrumKitPart { id: string; label: string; role: string; soundUrl: string }` + `export const DRUM_KIT_PARTS: readonly DrumKitPart[]`. Nội dung tiếng Việt theo bảng ở Dev Notes (giọng khớp theory bài `gd1-t1-b1` — NFR-1: thuật ngữ tiếng Anh + chú giải Việt)
- [ ] Task 5: `ui/DrumMap` component + CSS module (AC: #1, #2, #3)
  - [ ] NEW `src/ui/DrumMap.tsx` — named export `export function DrumMap()`, không props. State: `useState<string | null>(null)` cho vùng active. Import `DRUM_KIT_PARTS` + `drumSamples` từ `../core/audio` (ui → core hợp lệ AD-1)
  - [ ] SVG tự vẽ flat MỘT `<svg viewBox="0 0 640 400">` (gợi ý bố cục ở Dev Notes), mỗi bộ phận một `<g role="button" tabIndex={0} aria-label={label + ' — ' + role} aria-pressed={active === id}>` chứa hình (circle/ellipse) + `<text>` nhãn cạnh vùng (fill `var(--drum-map-label-color)`, không nhận pointer events) + một circle hit-area trong suốt r≥32 đảm bảo touch target ≥44px (UX-DR2) cho vùng dẹt (hi-hat/crash/ride)
  - [ ] Tương tác: `onClick` + `onKeyDown` (Enter/Space — Space cần `preventDefault()` chống cuộn trang) cùng một handler: set active + `void drumSamples.play(part.soundUrl)` fire-and-forget — kết quả `false` bỏ qua, panel vẫn hiện (AC #3). Hover CHỈ bằng CSS (đổi stroke), KHÔNG handler chuột nào phát âm (AC #2). KHÔNG phát gì khi mount (AC #3 — không autoplay; Network không được có request `.wav` trước click đầu tiên)
  - [ ] Panel: style card (`--card-*` tokens), desktop ≥768px nằm bên phải sơ đồ (grid 2 cột), mobile dưới sơ đồ (UX-DR7). Chưa click: hint "Chạm vào từng bộ phận để nghe thử" (`--color-text-muted`). Đã click: `label` (h3, text-primary) + `role` (body, text-secondary). Panel thêm `aria-live="polite"` để screen reader đọc khi đổi vùng (rẻ, không chặn — pass a11y sâu hơn vẫn deferred)
  - [ ] NEW `src/ui/DrumMap.module.css` — token-only (AD-5): vùng fill `var(--drum-map-region-fill)` viền `var(--drum-map-region-stroke)` (stroke-width 2); `:hover` viền `var(--drum-map-region-hover-stroke)`; class active fill `var(--drum-map-region-active-fill)` + viền `var(--drum-map-region-active-stroke)`; cursor pointer; KHÔNG override `outline` (global.css sở hữu `:focus-visible` — selector universal áp cả phần tử SVG có tabindex). Media query layout `(width >= 768px)` cho grid 2 cột được phép trong module (precedent MetronomeBlock kbd hint); giá trị TOKEN không được override ở đây (AD-5)
  - [ ] Chỉ đổi màu khi hover/active — không scale/animation, tự thỏa `prefers-reduced-motion` (UX-DR2)
- [ ] Task 6: Khai báo drum-map trong content — types + data + test (AC: #1)
  - [ ] UPDATE `src/core/types.ts`: thêm trường `interactive?: 'drum-map'` vào `LessonItemBase` kèm comment FR-6 (union chữ — mở rộng widget sau này không sửa component ngoài LessonPage; content-as-data AD-2). KHÔNG đổi gì khác trong file
  - [ ] UPDATE `src/content/phase-1.ts`: thêm `interactive: 'drum-map'` vào item `gd1-t1-b1` (comment anchor dòng 15 đã hứa đúng điều này). KHÔNG đụng bất kỳ trường/bài nào khác
  - [ ] UPDATE `src/content/index.test.ts`: thêm assert — toàn phase có ĐÚNG MỘT item `interactive === 'drum-map'` và đó là `gd1-t1-b1` (chốt hợp đồng data chống gắn nhầm bài)
- [ ] Task 7: LessonPage render section sơ đồ (AC: #1)
  - [ ] UPDATE `src/features/lesson/LessonPage.tsx`: thêm section "Sơ đồ bộ trống" (h2 `styles.sectionTitle` cùng cấp "Mục tiêu"/"Thực hành") GIỮA section lý thuyết và section video — đúng thứ tự KF-2: đọc lý thuyết → khám phá sơ đồ → xem video. Guard `{item.interactive === 'drum-map' && (...)}` — 12 bài còn lại không có section rỗng. Import `{ DrumMap }` từ `../../ui/DrumMap`
  - [ ] Giữ nguyên: breadcrumb, 404 in-page, guard videos, heading outline, named export. `LessonPage.module.css` chỉ sửa nếu cần khoảng cách (token-only)
- [ ] Task 8: Quality gate + verify tay + commit (AC: #1, #2, #3)
  - [ ] `npm run check` xanh (tsc -b + oxlint + vitest run + vite build); toàn bộ 83 test hiện có vẫn xanh + test mới (sample-player, drum-kit-parts, content). ZERO thay đổi dưới: `metronome-engine.ts`, `tick-worker.ts`, `src/app/*`, `src/styles/*`, `src/ui/Metronome*|useMetronome*|metronome-shortcuts*|Video*|video-urls*`, `content/index.ts`, `features/roadmap|metronome|practice|progress`, `vercel.json`, `vite.config.ts`, `package.json`
  - [ ] Verify tay trên `vite dev`: (a) `/bai-hoc/gd1-t1-b1` — section "Sơ đồ bộ trống" giữa lý thuyết và video; Network KHÔNG có request `.wav` khi mới mở trang; (b) click snare → highlight amber-dim/amber-bright + panel tên/vai trò + âm phát MỘT lần; click tiếp tom → active chuyển, âm tom phát; (c) hover ride chưa click → chỉ viền amber, im lặng; (d) DevTools chặn `/sounds/*` → click kick: panel + highlight bình thường, im lặng, không error UI; bỏ chặn → click lại phát được (lỗi không cache); (e) mở `/metronome` bấm Start rồi quay lại bài (metronome vẫn chạy xuyên route) → click crash: cả tick lẫn âm mẫu cùng phát, không vỡ tiếng rõ rệt; (f) bàn phím: Tab lần lượt 6 vùng có focus ring, Enter và Space kích hoạt, Space không cuộn trang; (g) 375px: panel nằm dưới sơ đồ, sơ đồ không tràn ngang, chạm từng vùng dễ trúng; (h) reload trang — không âm nào tự phát
  - [ ] Commit: `feat(lesson): story 2.3 — sơ đồ bộ trống tương tác`; push + verify Vercel deploy xanh; trên production mở trực tiếp `https://<domain>/sounds/snare.wav` xác nhận trả file audio (không phải HTML)

## Dev Notes

### Trạng thái code hiện tại — chạm gì, KHÔNG chạm gì

**Story này ~30% audio plumbing (core), ~40% một component SVG mới, ~15% asset âm thanh, ~15% gắn vào content/LessonPage:**

- `src/core/audio/index.ts` — wiring singleton, hiện `createAudioContext: () => new AudioContext()` tạo ctx RIÊNG cho engine. **Đây là file core duy nhất được sửa** (Task 2): tách `getSharedAudioContext()` để drum-map dùng chung đúng AR-4 ("MỘT AudioContext cho cả app — drum-map 2.3 dùng chung", comment đầu file đã hứa sẵn). Engine lazy-init ctx ở `start()` đầu tiên; SamplePlayer lazy-init ở click đầu tiên — bên nào chạm trước thì tạo, cả hai đều là user gesture hợp lệ (autoplay policy).
- `src/core/audio/metronome-engine.ts` + `tick-worker.ts` + test — **KHÔNG sửa.** Engine nhận deps qua constructor, `MetronomeAudioContext` là structural subset — `AudioContext` thật khớp sẵn. Click tick vẫn synthesize (sanctioned từ 1.2), KHÔNG chuyển sang sample.
- `src/core/types.ts` — thêm ĐÚNG MỘT trường optional `interactive?: 'drum-map'` vào `LessonItemBase`. `Video`/`ExerciseSpec`/`LessonItem` union giữ nguyên.
- `src/content/phase-1.ts` — chỉ thêm một dòng `interactive: 'drum-map'` vào `gd1-t1-b1`. Comment dòng 15 của file ("story 2.3 gắn DrumMap vào đúng bài này") có thể rút gọn thành ghi chú FR-6 sau khi làm xong.
- `src/features/lesson/LessonPage.tsx` — cấu trúc section đã ổn định từ 2.1/2.2 (mục tiêu → lý thuyết → video → thực hành). Chèn section sơ đồ giữa lý thuyết và video, mọi thứ khác giữ nguyên.
- `src/ui/` — precedent: `VideoEmbed.tsx` (component + CSS module token-only), `video-urls.ts` + test (module thuần trong ui/ có unit test), `useMetronome.ts` (ui import core). `DrumMap` + `drum-kit-parts` theo đúng khuôn. Structural Seed spine chỉ định rõ DrumMap sống ở `ui/`.
- `public/sounds/` — **hiện chỉ có `.gitkeep`, chưa có file âm nào.** Task 1 là điều kiện tiên quyết của mọi thứ nghe được.
- **KHÔNG chạm:** `src/app/*`, `src/styles/*` (token `--drum-map-*` ĐÃ TỒN TẠI ĐỦ 6 cái ở `tokens.css:123-129` — đừng phát minh lại), `MetronomeBlock*`, `VideoEmbed*`, `content/index.ts` (API lookup đủ dùng), `vercel.json`, `vite.config.ts`, `package.json` (zero dependency mới).

**Không phải Next.js.** Vite 8 + React 19 SPA, react-router 8. Không `'use client'`. Test env node thuần — repo KHÔNG có jsdom/@testing-library; component không có DOM test, logic tách vào module thuần để test (pattern nhất quán từ 1.2).

### Bảng 6 bộ phận — data cho `drum-kit-parts.ts`

Thứ tự = thứ tự FR-6. Giọng khớp theory bài `gd1-t1-b1` (xưng "bạn", thuật ngữ Anh + chú giải Việt — NFR-1):

| id | label | role (vai trò tiếng Việt) | soundUrl |
|---|---|---|---|
| `snare` | Snare (trống lẫy) | Trống chính ngay trước mặt bạn — tiếng đanh và gọn. Mọi bài tập tay của giai đoạn này chơi trên nó. | `/sounds/snare.wav` |
| `tom` | Tom (trống tròn) | Gắn phía trên hoặc đứng cạnh — tiếng trầm và tròn hơn snare, hay dùng để chuyển đoạn. | `/sounds/tom.wav` |
| `kick` | Kick (trống cái) | Trống to nhất, đạp bằng bàn đạp chân phải — giữ phần "thịch thịch" nền của bài nhạc. | `/sounds/kick.wav` |
| `hihat` | Hi-hat (chũm chọe đóng mở) | Cặp lá đóng mở bằng chân trái — âm "chíc chíc" đều đặn giữ nhịp cho cả bài. | `/sounds/hihat.wav` |
| `crash` | Crash (chũm chọe điểm nhấn) | Lá đánh điểm nhấn — tiếng "xoảng" bùng nổ khi mở đầu hoặc kết một đoạn. | `/sounds/crash.wav` |
| `ride` | Ride (chũm chọe lớn) | Lá lớn nhất bộ — gõ đều thay hi-hat khi bài nhạc cần màu sắc khác. | `/sounds/ride.wav` |

### Công thức synthesize âm mẫu (Task 1 — gợi ý, chỉnh tai tự do)

WAV mono 16-bit PCM 44100Hz; writer WAV ~30 dòng (header RIFF/fmt/data chuẩn). Peak amplitude ≤0.85 mỗi file (chừa headroom khi chồng tick metronome — xem mục gain bên dưới):

- `kick.wav` (~0.35s): sine sweep 120→45Hz (exponential), decay exponential nhanh, cộng transient click 5ms đầu.
- `snare.wav` (~0.25s): white noise (band ~1.5–8kHz, lọc thô bằng trộn/vi phân là đủ) + body triangle/sine ~190Hz, decay rất nhanh.
- `tom.wav` (~0.4s): sine sweep 160→110Hz, decay vừa — nghe "tròn, trầm hơn snare".
- `hihat.wav` (~0.12s): white noise thiên cao (highpass thô), decay cực nhanh — closed hat "chíc".
- `crash.wav` (~1.8s): noise + vài partial kim loại không hài hòa (vd 3.1k/4.7k/6.3kHz), decay chậm.
- `ride.wav` (~1.2s): ping — vài sine partial không hài hòa tần thấp-trung (vd 330/495/587Hz) + shimmer noise nhỏ, decay vừa.

Deterministic (seed PRNG tự viết hoặc chấp nhận noise không seed — file commit một lần là nguồn chân lý). File synthesize = tự sáng tác, miễn phí bản quyền theo cấu trúc (PRD A4). Muốn hay hơn về sau: thay file WAV cùng tên bằng sample CC0 thật (freesound.org) — zero code change, đó là chủ đích của quy ước đặt tên.

### Guardrails kiến trúc (binding)

- **AD-1 layering:** `sample-player.ts` thuần TS trong `core/audio`, deps inject (KHÔNG gọi `fetch`/`new AudioContext` trực tiếp trong class — wiring thật chỉ ở `index.ts`, y hệt quan hệ MetronomeEngine ↔ createWorkerTicker). `DrumMap` ở `ui/` import từ `core/audio` — hợp lệ; KHÔNG import `content/`/`features/`. [Source: ARCHITECTURE-SPINE.md#AD-1; src/core/audio/metronome-engine.ts:1-7]
- **AR-4/AD-3 — MỘT AudioContext:** cả metronome lẫn drum samples đi qua `getSharedAudioContext()`; lazy-init ở user gesture; `resume()` nếu suspended/interrupted (nuốt reject như engine đã làm — `index.ts:129-131` pattern); KHÔNG BAO GIỜ `close()`. [Source: ARCHITECTURE-SPINE.md#AD-3; src/core/audio/index.ts:1-9]
- **AR-7 — asset tự host:** âm mẫu trong `public/sounds/`, KHÔNG CDN nào mới (không sound library npm, không fetch từ domain ngoài). [Source: ARCHITECTURE-SPINE.md#AD-7]
- **AD-5 tokens:** 6 token `--drum-map-*` có sẵn `tokens.css:123-129` — dùng đủ, không thêm/sửa `tokens.css`. Panel dùng `--card-*`. Nhãn SVG: thuộc tính `fill` (SVG text không ăn `color`). [Source: src/styles/tokens.css:123-129; ARCHITECTURE-SPINE.md#AD-5]
- **Lỗi & trạng thái:** `play()` trả `boolean`, không throw xuyên tầng; UI bỏ qua kết quả — âm lỗi thì im lặng, highlight + panel vẫn chạy (UX-DR7). KHÔNG toast/console.error ồn ào cho việc này (một `console.warn` khi decode fail là chấp nhận được để debug, không bắt buộc). [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions; EXPERIENCE.md#Component-Patterns "Sơ đồ bộ trống"]
- **UX-DR11 accessibility floor:** mỗi vùng focusable (`tabIndex={0}` + `role="button"` + `aria-label`), Enter/Space kích hoạt, focus ring do `global.css` sở hữu (`:focus-visible` universal — áp cả SVG element, KHÔNG override outline); không autoplay; hover không phát âm nên mobile (không hover) không mất tính năng nào. [Source: EXPERIENCE.md#Accessibility-Floor; src/styles/global.css:54-58]
- **Gain khi trộn nguồn (deferred-work):** tick metronome đang chạy gain đỉnh 1.0 thẳng vào destination; SamplePlayer vì thế PHẢI qua GainNode riêng (0.9) + sample peak ≤0.85 để tick + sample chồng nhau không clip thô. Master gain stage đầy đủ cho cả app VẪN deferred — KHÔNG refactor metronome-engine ở story này. [Source: _bmad-output/implementation-artifacts/deferred-work.md (mục spec-1-2)]

### Sự thật nền tảng dev PHẢI biết trước khi code

- **`AudioBufferSourceNode` là node dùng-một-lần:** mỗi lần phát phải `createBufferSource()` mới rồi `start()`; gọi `start()` lần hai trên cùng node là exception. Cache là `AudioBuffer` (decode một lần), không phải source node.
- **`decodeAudioData` cần bytes thật:** Vercel serve file tĩnh TRƯỚC rewrite nên `/sounds/*.wav` tồn tại sẽ trả đúng file; nhưng nếu file THIẾU (quên commit, sai tên), SPA rewrite `/(.*)→/index.html` trả HTML với HTTP 200 → decode fail `EncodingError` chứ không phải 404 — đây là lý do bước verify production ở Task 8 mở thẳng URL file. Đã ghi ở deferred-work từ 1.1; KHÔNG sửa `vercel.json` ở story này. [Source: _bmad-output/implementation-artifacts/deferred-work.md]
- **Autoplay policy:** tạo/resume AudioContext trong click handler là gesture hợp lệ. Click đầu tiên có độ trễ fetch+decode (~50–200ms local) — chấp nhận được cho lần đầu mỗi vùng, các lần sau phát tức thì từ cache. KHÔNG preload khi mount (vi phạm tinh thần "không autoplay" ở mức network và NFR-5 lazy).
- **SVG focus/tabindex:** `tabIndex`/`role` trên `<g>` được mọi trình duyệt hiện đại hỗ trợ; `:focus-visible` outline của global.css vẽ theo bounding box. `<text>` nhãn cần `pointer-events: none` (hoặc nằm ngoài hit-area) để click nhãn không "hụt". Enter kích hoạt qua onKeyDown tự viết — SVG `g` KHÔNG có native activation như `<button>`.
- **Space trong DrumMap không đụng metronome:** `useMetronomeShortcuts` chỉ sống trong `MetronomeBlock`, mà bài `gd1-t1-b1` là `kind: 'theory'` — không có MetronomeBlock trên trang này (khối luyện tập là story 2.4, chỉ gắn bài exercise). Space trong handler của vùng SVG chỉ cần `preventDefault()` chống cuộn trang.
- **Metronome có thể ĐANG CHẠY khi user ở trang bài học** (state xuyên route — AD-3): shared context đã `running`, sample chồng lên tick là kịch bản thật → gain 0.9 + peak 0.85 ở trên. Test tay bước (e) Task 8 chính là kịch bản này.

### Gợi ý bố cục SVG (viewBox 0 0 640 400 — chỉnh tự do, flat, không cần giống ảnh thật)

- hi-hat: ellipse dẹt ~(90, 140), rx 55 — kèm hit-circle trong suốt r≥32
- crash: ellipse dẹt ~(200, 70), rx 60 — hit-circle
- tom: circle ~(320, 140), r 48
- ride: ellipse dẹt ~(470, 90), rx 70 — hit-circle
- snare: circle ~(210, 250), r 52
- kick: circle ~(380, 255), r 85 (to nhất — đúng vai trò)
- Chân/stand vẽ line mảnh `--drum-map-region-stroke` bên trong từng `<g>` cho gợi hình; nhãn `<text>` cạnh mỗi vùng. Toàn SVG `width: 100%`, `height: auto` — co theo cột bài viết, không tràn 375px.

### Gotchas TypeScript strict (fail `tsc -b` nếu quên)

- `verbatimModuleSyntax` — `import type` cho mọi type-only import.
- `erasableSyntaxOnly` — không enum, không parameter properties; union chữ + `as const`.
- `noUnusedLocals`/`noUnusedParameters` là error. Không path alias — import tương đối.
- `interactive?: 'drum-map'` là optional trên base — so sánh `item.interactive === 'drum-map'` narrow tự nhiên, không cần guard thêm.
- React SVG: `tabIndex` (camelCase), thuộc tính SVG như `strokeWidth` camelCase trong JSX.

### Trí tuệ từ story trước (2.2 done, 0 vòng lặp review)

- **House rhythm:** red-green TDD cho module thuần (test đỏ trước); CSS module cạnh component, token-only; text tiếng Việt inline; named exports (zero default export toàn repo); comment tiếng Việt trích mã bất biến (AD-x, FR-x, UX-DRx) tại nơi áp dụng; không semicolon, single quotes.
- **Bài học 2.2:** giới hạn nền tảng ghi rõ TRƯỚC khi code (ở đây: SPA rewrite nuốt 404 sounds, source node single-use, first-click latency) tránh loay hoay giữa chừng; data test chốt hợp đồng chống sửa ẩu (Task 6 test "đúng một bài có drum-map" cùng tinh thần test "VI trước EN").
- **Bài học 1.2:** deps inject cho mọi thứ chạm browser API — SamplePlayer copy đúng chiến thuật của MetronomeEngine để test node thuần; listener/promise lỗi phải nuốt có chủ đích, không unhandled rejection.
- **Đã deferred, KHÔNG sửa ở story này** (deferred-work.md): master gain stage đầy đủ (chỉ làm gain cục bộ SamplePlayer như trên); shortcut-focus quirk (thuộc MetronomeBlock); SR announce BPM (pass a11y); doc-drift tokens.css/RouterProvider. Đừng làm tệ hơn là đủ.
- **Git pattern:** `feat(scope): story X.Y — mô tả tiếng Việt`; commit gộp source + test + css + asset một lần.

### Ghi chú tech mới nhất

Không dependency mới. Stack (React 19.2, react-router 8.1, TS 6.0, Vite 8.1, Vitest 4.1) verify 2026-07-08, đang chạy production. Bề mặt mới: Web Audio `decodeAudioData`/`AudioBufferSourceNode` (API ổn định từ nhiều năm, hành vi đã ghi đủ ở trên) + file WAV tĩnh — không cần research thêm.

### Project Structure Notes

Cây thay đổi story này:

```text
scripts/
  generate-drum-samples.mjs      # NEW — script synthesize 6 WAV (chạy tay một lần)
public/sounds/
  snare.wav tom.wav kick.wav hihat.wav crash.wav ride.wav   # NEW — output script, tự host (AR-7); xóa .gitkeep
src/core/audio/
  index.ts                       # UPDATE — getSharedAudioContext() + export drumSamples
  sample-player.ts               # NEW — SamplePlayer thuần, deps inject (AD-1)
  sample-player.test.ts          # NEW — unit test cache/dedup/lỗi-im-lặng/resume (Task 3)
src/core/
  types.ts                       # UPDATE — interactive?: 'drum-map' trên LessonItemBase
src/content/
  phase-1.ts                     # UPDATE — CHỈ thêm interactive: 'drum-map' vào gd1-t1-b1
  index.test.ts                  # UPDATE — assert đúng một bài drum-map = gd1-t1-b1
src/ui/
  DrumMap.tsx                    # NEW — SVG 6 vùng + panel, click/keyboard, không autoplay
  DrumMap.module.css             # NEW — token-only (--drum-map-*, --card-*), grid 2 cột ≥768px
  drum-kit-parts.ts              # NEW — data 6 bộ phận (label/role/soundUrl)
  drum-kit-parts.test.ts         # NEW — unit test hợp đồng data (Task 4)
src/features/lesson/
  LessonPage.tsx                 # UPDATE — section "Sơ đồ bộ trống" giữa lý thuyết và video
```

- Import: `DrumMap` → `../core/audio` (drumSamples) + `./drum-kit-parts`; `LessonPage` → `../../ui/DrumMap`. Không alias, đường dẫn tương đối.
- `content/index.ts`, `metronome-engine.ts` không đổi — API/engine từ 2.1/1.2 đủ dùng, đó là chủ đích thiết kế.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.3] — statement + 3 AC nguyên văn; Epic 2 context
- [Source: _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/ARCHITECTURE-SPINE.md#AD-1, #AD-3, #AD-5, #AD-7, #Structural-Seed] — layering, MỘT AudioContext dùng chung, tokens, asset tự host, DrumMap sống ở ui/
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/DESIGN.md#Components drum-map] — SVG tự vẽ flat, hover/active/label spec (đã map thành token), panel style card phải/dưới
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/EXPERIENCE.md#Component-Patterns "Sơ đồ bộ trống", #Accessibility-Floor, #Key-Flows KF-2] — click/hover/lỗi-im-lặng, không autoplay, thứ tự sơ đồ trước video
- [Source: _bmad-output/planning-artifacts/prds/prd-drum-beginner-2026-07-08/prd.md#FR-6, §8 A4] — 6 bộ phận, âm mẫu miễn phí bản quyền trong repo
- [Source: src/core/audio/index.ts; src/core/audio/metronome-engine.ts; src/core/types.ts; src/content/phase-1.ts; src/features/lesson/LessonPage.tsx; src/styles/tokens.css:123-129; src/styles/global.css:54-58] — code hiện trạng + token drum-map có sẵn + focus ring universal
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — master gain (giải quyết cục bộ bằng gain 0.9), SPA rewrite nuốt 404 sounds (ghi chú debug, không sửa vercel.json)
- [Source: _bmad-output/implementation-artifacts/2-2-video-youtube-trong-bai-hoc.md#Dev-Notes; spec-2-2 §Auto-Run-Result] — house conventions, bài học review, git pattern

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created (claude-fable-5, 2026-07-09)

### File List
