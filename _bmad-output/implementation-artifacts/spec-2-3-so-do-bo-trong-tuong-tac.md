---
title: 'Story 2.3: Sơ đồ bộ trống tương tác'
type: 'feature'
created: '2026-07-09'
status: 'done'
baseline_revision: '495f0b9775a11ae733ff335a8a17a7afd138144f'
final_revision: 'fcafd843d978b5ca836d8c5ad921bda3eeae6266'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/2-3-so-do-bo-trong-tuong-tac.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Vấn đề:** Bài "Làm quen bộ trống" (`gd1-t1-b1`) chỉ có chữ + video — người mới không phân biệt được snare với tom bằng tai. FR-6 yêu cầu sơ đồ bộ trống tương tác: click từng bộ phận → tên, vai trò, âm thanh thật; chưa có gì trong code (`public/sounds/` rỗng, chưa có SamplePlayer/DrumMap).

**Cách làm:** Script Node zero-dep synthesize 6 file WAV tự host (`public/sounds/*.wav` — AR-7, miễn phí bản quyền PRD A4); `core/audio/sample-player.ts` thuần deps-inject (cache AudioBuffer, in-flight dedup, lỗi → `false` im lặng); refactor wiring `core/audio/index.ts` sang `getSharedAudioContext()` (MỘT AudioContext cho cả app — AR-4/AD-3) + export instance `drumSamples`; component `ui/DrumMap` (SVG flat tự vẽ 6 vùng, click/keyboard phát âm một lần, hover chỉ highlight, panel tên/vai trò); khai báo `interactive: 'drum-map'` trong content data (AD-2) và LessonPage render section giữa lý thuyết và video (KF-2).

## Boundaries & Constraints

**Always:**
- AD-1 layering: `sample-player.ts` thuần TS trong `core/audio`, KHÔNG React, KHÔNG gọi `fetch`/`new AudioContext` trực tiếp — deps inject `{ getContext(): SampleAudioContextLike; fetchArrayBuffer(url): Promise<ArrayBuffer> }`, wiring thật chỉ ở `index.ts` (y hệt MetronomeEngine ↔ createWorkerTicker). `DrumMap` ở `ui/` import `core/audio` + `./drum-kit-parts` — hợp lệ; KHÔNG import `content/`/`features/`.
- AR-4/AD-3: cả metronome lẫn samples đi qua `getSharedAudioContext()` (`sharedCtx ??= new AudioContext()`); AudioContext thật thỏa structural `MetronomeAudioContext` — engine không đổi một dòng. `play()` gọi `resume()` nếu `state !== 'running'`; KHÔNG BAO GIỜ `close()`. Giữ nguyên pagehide listener, guard `typeof window`, mọi re-export hiện có của `index.ts`.
- SamplePlayer: cache `Map<string, AudioBufferLike>` (decode một lần); in-flight `Map` dedup fetch đồng thời; lỗi fetch/decode → resolve `false`, KHÔNG throw, KHÔNG cache lỗi (click sau thử lại); mỗi lần phát tạo `AudioBufferSourceNode` MỚI (node single-use) → GainNode `SAMPLE_GAIN` 0.9 → destination, `start()` không loop (tick metronome gain 1.0 có thể chồng — headroom chống clip; master gain stage vẫn deferred).
- DrumMap: MỘT `<svg viewBox="0 0 640 400">` flat, 6 `<g role="button" tabIndex={0} aria-label={label + ' — ' + role} aria-pressed>`; hit-area trong suốt r≥32 cho vùng dẹt (touch ≥44px — UX-DR2); `<text>` nhãn `pointer-events: none`, fill `var(--drum-map-label-color)`; onClick + onKeyDown Enter/Space chung handler (Space `preventDefault()` chống cuộn), `void drumSamples.play(url)` fire-and-forget; hover CHỈ bằng CSS; KHÔNG phát/preload gì khi mount (không request `.wav` trước click đầu — UX-DR11/NFR-5).
- Panel: card tokens (`--card-*`), `aria-live="polite"`; desktop ≥768px grid 2 cột bên phải, mobile dưới sơ đồ (UX-DR7); chưa click → hint "Chạm vào từng bộ phận để nghe thử" (`--color-text-muted`); đã click → `label` (h3) + `role`.
- AD-5: CSS module token-only, dùng 6 token `--drum-map-*` có sẵn `tokens.css:123-129`; KHÔNG override `outline` (global.css sở hữu `:focus-visible` universal); chỉ đổi màu hover/active — không scale/animation (tự thỏa reduced-motion).
- Data 6 bộ phận đúng thứ tự FR-6 (snare, tom, kick, hi-hat, crash, ride) với label/role tiếng Việt NGUYÊN VĂN bảng trong story file §"Bảng 6 bộ phận"; `soundUrl` = `/sounds/<id>.wav`.
- Red-green TDD cho module thuần (sample-player, drum-kit-parts, content test viết TRƯỚC); test env node, fake deps qua constructor theo `metronome-engine.test.ts` — KHÔNG jsdom/@testing-library; component không DOM test.
- House style: named exports, không semicolon, single quotes, `import type` (verbatimModuleSyntax), không enum (erasableSyntaxOnly), import tương đối, comment tiếng Việt trích mã bất biến (AD-x/FR-x/UX-DRx).
- Script WAV: `scripts/generate-drum-samples.mjs` Node ≥22 zero-dep, output mono 16-bit 44100Hz, peak ≤0.85/file, tổng 6 file ≤ ~500KB; chạy một lần, commit cả script lẫn WAV, xóa `public/sounds/.gitkeep`; công thức gợi ý ở story file §"Công thức synthesize" — nghe GỢI ĐÚNG bộ phận là đạt.

**Block If:**
- 6 token `--drum-map-*` hóa ra thiếu/sai khi dùng thật, buộc sửa `tokens.css`.
- Fulfil AC buộc thêm dependency mới hoặc sửa `package.json`, `vite.config.ts`, `vercel.json`.
- Sample WAV synthesize không thể đạt "gợi đúng bộ phận" ở mức chấp nhận được, buộc lấy file từ nguồn ngoài (bản quyền phải người dùng quyết).

**Never:**
- KHÔNG đụng: `metronome-engine.ts`, `tick-worker.ts`, `src/app/*`, `src/styles/*`, `src/ui/Metronome*|useMetronome*|metronome-shortcuts*|VideoEmbed*|video-urls*`, `content/index.ts`, `features/roadmap|metronome|practice|progress`, `vercel.json`, `vite.config.ts`, `package.json` (kể cả KHÔNG thêm script npm).
- Trong `types.ts` CHỈ thêm `interactive?: 'drum-map'` vào `LessonItemBase`; trong `phase-1.ts` CHỈ thêm dòng `interactive` vào `gd1-t1-b1` (comment anchor dòng 15 có thể rút gọn thành ghi chú FR-6).
- KHÔNG sound library npm/CDN ngoài (AR-7); KHÔNG chuyển tick metronome sang sample; KHÔNG master-gain refactor (deferred); KHÔNG preload/autoplay; KHÔNG handler chuột nào phát âm khi hover.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mở bài | `/bai-hoc/gd1-t1-b1` | Section "Sơ đồ bộ trống" (h2 cùng cấp) GIỮA lý thuyết và video; panel hint; Network zero request `.wav` | Không lỗi |
| Click vùng | click snare (lần đầu) | Fill amber-dim + viền amber-bright, panel tên/vai trò, âm phát ĐÚNG MỘT lần không loop; fetch+decode một lần rồi cache | Không lỗi |
| Click vùng khác | đang active snare, click tom | Active chuyển sang tom, âm tom phát | Không lỗi |
| Click lại cùng url | click snare lần hai | Không fetch lại — phát từ cache (source node mới) | Không lỗi |
| Hai click đồng thời cùng url | double-click nhanh | Fetch đúng MỘT lần (in-flight dedup) | Không lỗi |
| Âm lỗi | fetch/decode fail (chặn `/sounds/*`) | Highlight + panel bình thường, im lặng, `play()` → `false` | Không throw, không cache lỗi — bỏ chặn click lại phát được |
| Ctx suspended | `state !== 'running'` khi click | `resume()` trước khi phát | Nuốt reject như engine |
| Hover desktop | hover vùng chưa click | Chỉ viền amber, KHÔNG phát âm | Không lỗi |
| Bàn phím | Tab → Enter/Space trên vùng | Focus ring global, kích hoạt như click, Space không cuộn trang | Không lỗi |
| Bài khác | `/bai-hoc/gd1-t1-b2` | KHÔNG có section sơ đồ (guard `interactive === 'drum-map'`) | Không lỗi |
| Reload/mount | mở trang bất kỳ | Không âm nào tự phát | Không lỗi |

</intent-contract>

## Code Map

- `scripts/generate-drum-samples.mjs` -- NEW: script synthesize 6 WAV (thư mục `scripts/` chưa tồn tại — tạo mới)
- `public/sounds/{snare,tom,kick,hihat,crash,ride}.wav` -- NEW: output script, commit; xóa `.gitkeep`
- `src/core/audio/index.ts` -- UPDATE: `getSharedAudioContext()` thay `() => new AudioContext()` (dòng 44) + export `drumSamples`; comment đầu file (dòng 2-3) đã hứa việc này
- `src/core/audio/sample-player.ts` -- NEW: class `SamplePlayer` deps-inject, `play(url): Promise<boolean>`
- `src/core/audio/sample-player.test.ts` -- NEW: test TRƯỚC — cache/dedup/lỗi-im-lặng/retry/resume/gain (model `metronome-engine.test.ts`)
- `src/ui/drum-kit-parts.ts` -- NEW: `DrumKitPart` + `DRUM_KIT_PARTS` (module thuần kebab-case, precedent `video-urls.ts`)
- `src/ui/drum-kit-parts.test.ts` -- NEW: test TRƯỚC — 6 phần đúng thứ tự FR-6, id/soundUrl không trùng, url match `/^\/sounds\/[a-z]+\.wav$/`
- `src/ui/DrumMap.tsx` + `DrumMap.module.css` -- NEW: component SVG + panel (precedent `VideoEmbed`); bố cục gợi ý ở story file §"Gợi ý bố cục SVG"
- `src/core/types.ts` -- UPDATE: `interactive?: 'drum-map'` vào `LessonItemBase` (dòng 25-32)
- `src/content/phase-1.ts` -- UPDATE: một dòng `interactive: 'drum-map'` vào `gd1-t1-b1` (dòng 14-45)
- `src/content/index.test.ts` -- UPDATE: assert đúng MỘT item `interactive === 'drum-map'` = `gd1-t1-b1` (cạnh test anchor KF-2 dòng ~75)
- `src/features/lesson/LessonPage.tsx` -- UPDATE: section "Sơ đồ bộ trống" giữa theory (hết dòng 53) và video (dòng 57); `.article` đã có gap flex — CSS module có thể không cần sửa
- `src/styles/tokens.css:123-129`, `src/styles/global.css:54-58` -- READ-ONLY: token drum-map + focus-visible universal

## Tasks & Acceptance

**Execution:**
- [x] `scripts/generate-drum-samples.mjs` -- viết script + chạy `node scripts/generate-drum-samples.mjs` sinh 6 WAV vào `public/sounds/`, xóa `.gitkeep` -- AR-7, tiên quyết mọi thứ nghe được
- [x] `src/core/audio/sample-player.test.ts` -- test đỏ TRƯỚC: (a) play lần đầu fetch+decode+source→gain→destination+start; (b) cùng url không fetch lại; (c) đồng thời dedup một fetch; (d) lỗi → `false` không throw, không cache lỗi; (e) suspended → resume; (f) gain 0.9 -- red-green
- [x] `src/core/audio/sample-player.ts` -- implement `SamplePlayer` -- xanh test trên
- [x] `src/core/audio/index.ts` -- `getSharedAudioContext()` + `export const drumSamples = new SamplePlayer({...})` -- AR-4, engine untouched
- [x] `src/ui/drum-kit-parts.test.ts` rồi `drum-kit-parts.ts` -- data 6 bộ phận nguyên văn bảng story file -- red-green, NFR-1
- [x] `src/ui/DrumMap.tsx` + `DrumMap.module.css` -- SVG 6 vùng + panel + tương tác click/keyboard, token-only -- AC #1 #2 #3
- [x] `src/content/index.test.ts` (test TRƯỚC) rồi `src/core/types.ts` + `src/content/phase-1.ts` -- khai báo drum-map trong data -- AD-2, chốt hợp đồng chống gắn nhầm bài
- [x] `src/features/lesson/LessonPage.tsx` -- section guard `item.interactive === 'drum-map'` giữa lý thuyết và video -- KF-2
- [x] Quality gate -- `npm run check` xanh (97/97 test: 83 cũ + 14 mới); `git diff` zero thay đổi ngoài Code Map -- hàng rào Never

**Acceptance Criteria:**
- Given bài `gd1-t1-b1`, when click một trong 6 vùng, then vùng đổi fill amber-dim + viền amber-bright, panel hiện tên + vai trò tiếng Việt, âm mẫu tự host phát đúng một lần không loop qua AudioContext dùng chung (FR-6, AR-4, AR-7).
- Given desktop, when hover vùng chưa click, then chỉ viền đổi amber, không phát âm (UX-DR7).
- Given file âm tải lỗi, when click vùng đó, then highlight + panel bình thường, im lặng không báo lỗi chặn; và không âm nào autoplay khi mở trang (UX-DR7, UX-DR11).
- Given metronome đang chạy xuyên route, when click vùng trên trang bài học, then tick + sample cùng phát qua MỘT AudioContext, không vỡ tiếng rõ rệt.
- Given toàn suite, when `npm run check`, then tsc -b + oxlint + vitest + vite build đều xanh.

## Spec Change Log

## Review Triage Log

### 2026-07-09 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 8: (high 0, medium 2, low 6)
- defer: 0
- reject: 9: (high 0, medium 0, low 9)
- addressed_findings:
  - `[medium]` `[patch]` Giữ Enter/Space auto-repeat chồng source node liên thanh — thêm guard `event.repeat` trong `DrumMap.handleKeyDown` (vẫn `preventDefault` để Space không cuộn)
  - `[medium]` `[patch]` Fetch treo vô hạn kẹt trong in-flight map → vùng câm vĩnh viễn — thêm `AbortSignal.timeout(10_000)` vào wiring `fetchArrayBuffer` ở `core/audio/index.ts`
  - `[low]` `[patch]` Script generate chết ENOENT nếu `public/sounds/` chưa tồn tại — thêm `mkdirSync(outDir, { recursive: true })`
  - `[low]` `[patch]` Hit-circle r=40 chỉ đạt ~43px ở 375px (dưới ngưỡng 44px UX-DR2) — nâng `HIT_AREA_RADIUS` lên 44 (~47px thực tế), sửa comment tính toán
  - `[low]` `[patch]` `REGION_GEOMETRY: Record<string,...>` + guard `if (!geo) return null` — vùng thiếu geometry lặng lẽ biến mất; đổi sang union `DrumKitPartId` + `Record<DrumKitPartId,...>`, bỏ guard (lỗi compile thay vì lỗi im lặng)
  - `[low]` `[patch]` `:hover` dính trên thiết bị cảm ứng (viền amber kẹt lại trên vùng chạm trước) — bọc rule hover trong `@media (hover: hover)`
  - `[low]` `[patch]` Comment FR-4 trong LessonPage kể thứ tự section cũ, mâu thuẫn với section sơ đồ mới chèn — cập nhật comment thành thứ tự đầy đủ
  - `[low]` `[patch]` Regex cắt tên ngắn trong DrumMap giả định label dạng `Tên (chú giải)` nhưng không test nào chốt — thêm assert định dạng label vào `drum-kit-parts.test.ts`

Ghi chú reject (9, noise): WAV "untracked" là artifact của review chạy trước commit (Finalize add đủ); BASE_URL/subpath trái hợp đồng spec (deploy Vercel root); `aria-pressed` do spec chỉ định, pass a11y sâu đã deferred từ trước; dedup logic resume đòi sửa `metronome-engine.ts` (Never); component không DOM test là quy ước repo (spec ghi rõ); Safari SVG focus là suy đoán không bằng chứng; `play()` trả true khi resume reject — caller bỏ qua kết quả by design; `interactive` trên base + test chốt id là thiết kế spec; script không vào `package.json` là ràng buộc Never.

## Design Notes

- **Sự thật nền tảng** (chi tiết ở story file §"Sự thật nền tảng"): `AudioBufferSourceNode` single-use — cache là AudioBuffer, không phải node; Vercel SPA rewrite trả HTML 200 cho `.wav` thiếu → decode fail `EncodingError` chứ không 404 (verify production mở thẳng URL file); SVG `<g>` không có native activation — Enter/Space tự viết; `useMetronomeShortcuts` không sống trên trang bài theory nên Space không xung đột.
- **Gain 0.9 + peak 0.85** là giải pháp cục bộ cho kịch bản tick (gain 1.0) chồng sample; master gain stage toàn app vẫn nằm ở deferred-work — không refactor engine.
- Muốn âm hay hơn về sau: thay WAV cùng tên bằng sample CC0 thật — zero code change (chủ đích quy ước đặt tên).
- LessonPage `.article` đã `flex` + `gap: var(--spacing-6)` — section mới tự có khoảng cách; theory section hiện không có h2, section sơ đồ dùng h2 `styles.sectionTitle` như Video/Thực hành.

## Verification

**Commands:**
- `node scripts/generate-drum-samples.mjs` -- expected: 6 file WAV trong `public/sounds/`, mỗi file phát được, tổng ≤ ~500KB
- `npm run check` -- expected: tsc -b, oxlint, vitest (83 test cũ + sample-player + drum-kit-parts + content mới) và vite build đều xanh
- `git diff --stat` -- expected: chỉ các file trong Code Map thay đổi

**Manual checks (if no CLI):**
- `vite dev` theo Task 8 story file: section đúng vị trí, zero `.wav` request trước click, click → highlight + panel + âm một lần, hover im lặng, chặn `/sounds/*` → im lặng rồi retry được, metronome chạy song song không vỡ tiếng, Tab/Enter/Space hoạt động (Space không cuộn), 375px panel xuống dưới không tràn ngang, reload không tự phát âm

## Auto Run Result

**Status:** done — final_revision `fcafd84`

**Summary:** Story 2.3 đưa sơ đồ bộ trống tương tác vào bài "Làm quen bộ trống": 6 file WAV tự synthesize (script Node zero-dep, deterministic — 364KB tự host, AR-7), `SamplePlayer` thuần deps-inject trong `core/audio` (cache AudioBuffer + in-flight dedup + timeout 10s, lỗi → im lặng), MỘT AudioContext dùng chung cho cả metronome lẫn samples (AR-4), component `ui/DrumMap` (SVG flat 6 vùng theo token drum-map, click/Enter/Space phát âm một lần, hover chỉ highlight, panel card aria-live, không autoplay/preload), khai báo `interactive: 'drum-map'` trong content data và LessonPage render section giữa lý thuyết và video (KF-2).

**Files changed:**
- `../../scripts/generate-drum-samples.mjs` — NEW: synthesize 6 WAV mono 16-bit 44100Hz, seed PRNG deterministic, mkdir output
- `../../public/sounds/{snare,tom,kick,hihat,crash,ride}.wav` — NEW: âm mẫu tự host, peak 0.85, tổng 364KB; xóa `.gitkeep`
- `../../src/core/audio/sample-player.ts` — NEW: class `SamplePlayer` deps-inject, `play(url): Promise<boolean>`, gain 0.9
- `../../src/core/audio/sample-player.test.ts` — NEW: 9 test node thuần (red-green, viết trước) — cache/dedup/lỗi-không-cache/resume/gain
- `../../src/core/audio/index.ts` — UPDATE: `getSharedAudioContext()` (metronome chuyển sang dùng chung), export `drumSamples` wired fetch + timeout
- `../../src/ui/drum-kit-parts.ts` + `.test.ts` — NEW: data 6 bộ phận nguyên văn story (union `DrumKitPartId`), 5 test hợp đồng data
- `../../src/ui/DrumMap.tsx` + `DrumMap.module.css` — NEW: SVG 6 vùng + panel, token-only, hit-area r=44, guard `event.repeat`, hover bọc `(hover: hover)`
- `../../src/core/types.ts` — UPDATE: `interactive?: 'drum-map'` trên `LessonItemBase` (FR-6)
- `../../src/content/phase-1.ts` — UPDATE: một dòng `interactive: 'drum-map'` vào `gd1-t1-b1`
- `../../src/content/index.test.ts` — UPDATE: assert đúng MỘT item drum-map = `gd1-t1-b1`
- `../../src/features/lesson/LessonPage.tsx` — UPDATE: section "Sơ đồ bộ trống" guard interactive, giữa lý thuyết và video

**Review findings breakdown:** Blind Hunter + Edge Case Hunter chạy song song, 17 finding sau dedup → 8 patch đã sửa (2 medium: guard `event.repeat` chống chồng âm khi giữ phím, timeout 10s chống fetch treo kẹt in-flight; 6 low: mkdir script, hit-area 44, `Record<DrumKitPartId>` compile-safe, hover media query, comment FR-4, test định dạng label), 0 defer, 9 reject (chi tiết ở Review Triage Log). 0 intent_gap, 0 bad_spec — không loopback.

**Follow-up review:** không khuyến nghị — 8 patch đều cục bộ, không đổi hành vi/API công khai, chủ yếu hardening edge case; gate chạy lại xanh sau patch.

**Verification:** `npm run check` xanh toàn bộ sau patch: tsc -b, oxlint 0 warning, vitest `7 files / 98 tests passed` (83 cũ + 15 mới), vite build OK. Diff xác nhận chỉ file trong Code Map thay đổi; `metronome-engine.ts`, `tick-worker.ts`, `src/app/*`, `src/styles/*`, configs không bị chạm. Script generate chạy thật, WAV verify phát được (afplay) và vite preview serve `audio/wav` 200.

**Residual risks:** verify tay trên trình duyệt (nghe thử 6 âm có "gợi đúng bộ phận", hover/keyboard/375px, metronome chồng sample không vỡ tiếng, Network zero `.wav` trước click) thuộc review người dùng — checklist đầy đủ ở Task 8 story file. Sau push cần kiểm tra Vercel deploy và mở thẳng `https://<domain>/sounds/snare.wav` xác nhận trả file audio (SPA rewrite trả HTML 200 nếu file thiếu — giới hạn đã ghi ở deferred-work). Chất lượng thẩm mỹ âm synthesize là chấp nhận-được-chứ-không-studio; thay bằng sample CC0 cùng tên là zero code change.
