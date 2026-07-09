# Story 2.2: Video YouTube trong bài học

Status: ready-for-dev

## Story

As a người mới hoàn toàn,
I want xem video hướng dẫn tiếng Việt (kèm video tiếng Anh có tóm tắt) ngay trong bài,
so that tôi nhìn được động tác thật thay vì chỉ đọc chữ.

## Acceptance Criteria

1. **Data video + VideoEmbed click-to-load**
   **Given** data video theo type `{youtubeId, lang, title, note?}` (note bắt buộc khi lang='en' — AR-7) và toàn bộ video đã verify từ addendum B gắn đúng bài (cầm dùi → Việt Thương/Tran Tin/Duy Phan; bộ trống → Việt Thương/Soul/Trung Drum/Pong Ơi; metronome → GIAO DRUM + EN; stick control → Pong Ơi/Duy Phan/Drumeo)
   **When** mở một bài có video
   **Then** `ui/VideoEmbed` render khung 16:9 với thumbnail `i.ytimg.com` + nút play + badge VI/EN, video VI đứng trước theo thứ tự data — component không sort (FR-5, UX-DR6)
   **And** iframe YouTube chỉ mount sau khi click (NFR-5); video EN hiển thị note tóm tắt tiếng Việt bên dưới.

2. **Fallback video hỏng**
   **Given** một video bị gỡ/lỗi tải
   **When** click play mà iframe/thumbnail lỗi
   **Then** khung fallback hiển thị thông báo + link mở tìm kiếm YouTube với từ khóa của bài — không bao giờ khung xám trống (NFR-5, UX-DR9).

## Tasks / Subtasks

- [ ] Task 1: Pure helpers URL YouTube — red-green, test trước (AC: #1, #2)
  - [ ] Viết test TRƯỚC: `src/ui/video-urls.test.ts` (vitest env node, model theo `src/ui/metronome-shortcuts.test.ts`): `youtubeThumbnailUrl('abc')` = `https://i.ytimg.com/vi/abc/hqdefault.jpg`; `youtubeEmbedUrl('abc')` = `https://www.youtube.com/embed/abc?autoplay=1`; `youtubeSearchUrl('cầm dùi trống')` encode đúng (`encodeURIComponent`, khoảng trắng/ký tự Việt không vỡ URL, prefix `https://www.youtube.com/results?search_query=`)
  - [ ] Tạo `src/ui/video-urls.ts` — module thuần kebab-case (không React), export 3 hàm trên. Chỉ được import từ `core/` nếu cần type (AD-1)
- [ ] Task 2: `ui/VideoEmbed` component + CSS module (AC: #1, #2)
  - [ ] NEW `src/ui/VideoEmbed.tsx` — named export `export function VideoEmbed({ video, searchQuery }: { video: Video; searchQuery: string })`. `import type { Video } from '../core/types'` (bắt buộc `import type` — verbatimModuleSyntax). Ba trạng thái nội bộ qua `useState`: `'idle' | 'playing' | 'thumbError'`
  - [ ] `idle`: khung 16:9 (`aspect-ratio: var(--video-embed-aspect-ratio)`) chứa MỘT `<button>` phủ toàn khung (touch target chắc chắn ≥44px), bên trong: `<img src={youtubeThumbnailUrl(video.youtubeId)} alt="" loading="lazy" onError={→ 'thumbError'}>` + icon play (SVG inline tự vẽ, tô `var(--color-amber)`) + `aria-label={'Phát video: ' + video.title}`. Badge góc trái trên: chữ "VI"/"EN" (`video.lang.toUpperCase()`), nền `var(--video-embed-badge-background)`, chữ `var(--video-embed-badge-color)` — badge là CHỮ, không truyền nghĩa chỉ bằng màu (UX-DR11)
  - [ ] Click → `'playing'`: mount `<iframe src={youtubeEmbedUrl(video.youtubeId)} title={video.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin">` chiếm trọn khung. `autoplay=1` trong URL hợp lệ vì iframe mount ngay sau user gesture — một click là video chạy
  - [ ] `'thumbError'` (AC #2): khung fallback CÙNG kích thước 16:9 (không sập layout): thông báo "Video này hiện không tải được." + `<a href={youtubeSearchUrl(searchQuery)} target="_blank" rel="noopener noreferrer">Tìm video thay thế trên YouTube ↗</a>` — không bao giờ khung xám trống (UX-DR9)
  - [ ] **Giới hạn nền tảng — KHÔNG cố detect lỗi iframe:** video bị gỡ vẫn trả `hqdefault.jpg` HTTP 200 (ảnh xám generic) nên `onError` của img KHÔNG bắt được video đã gỡ; lỗi bên trong iframe YouTube là cross-origin, không có event nào bắn ra. Giải pháp trong scope: (a) `onError` bắt lỗi mạng/thumbnail thật; (b) LUÔN render dòng link phụ dưới khung ở mọi trạng thái: "Video không xem được? Tìm trên YouTube ↗" (dùng cùng `youtubeSearchUrl`) — đây chính là đường thoát cho video đã gỡ mà iframe hiện "Video unavailable". Ghi rõ comment lý do trong code
  - [ ] Dưới khung: title video (`--font-size-small`, `--color-text-secondary`) + nếu `video.note` tồn tại → đoạn note (`--font-size-small`, `--color-text-secondary`, viền trái `var(--color-amber-dim)` như khối ghi chú — DESIGN.md amber-dim đúng vai "vùng nhấn tĩnh cường độ thấp"). Với `lang: 'en'` type đã ép note luôn có — hiển thị vô điều kiện cho EN (UX-DR6)
  - [ ] Component KHÔNG sort videos — nhận một video, render một khung; thứ tự do data quyết (AC #1)
  - [ ] NEW `src/ui/VideoEmbed.module.css` — token-only (AD-5): khung nền `var(--video-embed-background)`, viền `var(--video-embed-border)`, bo `var(--video-embed-radius)`; KHÔNG override `outline` (focus ring do global.css sở hữu); hover chỉ đổi màu (viền → `--color-amber`), không animation trang trí. Không cần media query — khung co theo cột bài viết (max-width 65ch có sẵn)
- [ ] Task 3: Đổ data video vào `content/phase-1.ts` (AC: #1)
  - [ ] UPDATE `src/content/phase-1.ts` — CHỈ sửa các mảng `videos`, không đụng id/title/theory/exercise. Gắn đủ 14 video addendum B theo bảng mapping ở Dev Notes, đúng thứ tự VI trước EN trong từng bài
  - [ ] Tự viết `note` tiếng Việt 1–2 câu cho 3 video EN (gợi ý sẵn trong bảng — chỉnh giọng theo UX-DR10: xưng "bạn", bạn tập cùng); video VI không cần note
  - [ ] Xóa comment dòng 3 đầu file (`// videos: [] toàn bộ story này — dữ liệu video vào ở story 2.2.`) — đã hết đúng
- [ ] Task 4: Test data video trong content — red-green (AC: #1)
  - [ ] Bổ sung describe block "video data" vào `src/content/index.test.ts` (vẫn pure node): mọi `youtubeId` match `/^[A-Za-z0-9_-]{11}$/`; tổng số video toàn phase = 14; trong MỖI item, không có video `vi` nào đứng SAU video `en` (hợp đồng "VI trước theo thứ tự data" — component không sort nên data phải đúng); mọi video `en` có `note` không rỗng (type đã ép nhưng test chốt chống sửa data ẩu); `youtubeId` không trùng trong cùng một item; các anchor: `gd1-t1-b1` có 4 video, `gd1-t1-b2` có 3, `gd1-t1-b3` có 3 (1 vi + 2 en), `gd1-t1-b4` có 1, `gd1-t2-b2` có 1, `gd1-t3-b1` có 2 (1 vi + 1 en)
- [ ] Task 5: LessonPage render section video (AC: #1)
  - [ ] UPDATE `src/features/lesson/LessonPage.tsx`: thêm section "Video hướng dẫn" GIỮA section lý thuyết và section "Thực hành" (đúng thứ tự FR-4: mục tiêu → lý thuyết → video → thực hành). Chỉ render khi `item.videos.length > 0` — bài không video KHÔNG có section rỗng. Map `item.videos` → `<VideoEmbed key={video.youtubeId} video={video} searchQuery={item.title} />` (từ khóa tìm kiếm = tiêu đề bài — AC #2 "từ khóa của bài"). Import `{ VideoEmbed }` từ `../../ui/VideoEmbed` (features → ui hợp lệ AD-1)
  - [ ] UPDATE `src/features/lesson/LessonPage.module.css` nếu cần khoảng cách giữa các khung video (gap bằng `--spacing-*`) — giữ token-only, không đổi layout hiện có
  - [ ] Giữ nguyên: breadcrumb, 404 in-page, heading outline, named export
- [ ] Task 6: Quality gate + verify tay + commit (AC: #1, #2)
  - [ ] `npm run check` xanh (tsc -b + oxlint + vitest run + vite build); toàn bộ 70 test hiện có vẫn xanh; ZERO thay đổi dưới `src/core/`, `src/app/`, `src/styles/`, `src/features/roadmap|metronome|practice|progress/`, `content/index.ts`
  - [ ] Verify tay trên `vite dev`: (a) `/bai-hoc/gd1-t1-b1` — 4 khung video thumbnail, badge VI, KHÔNG có request nào tới youtube.com trước khi click (kiểm tab Network — chỉ i.ytimg.com); (b) click play → iframe mount, video chạy ngay một click; (c) `/bai-hoc/gd1-t1-b3` — video GIAO DRUM (VI) đứng trước 2 video EN, 2 video EN có note tiếng Việt bên dưới; (d) giả lập lỗi thumbnail (DevTools chặn `i.ytimg.com` hoặc sửa tạm một id thành chuỗi rác) → khung fallback + link tìm kiếm mở đúng YouTube; (e) `/bai-hoc/gd1-t1-b5` (bài không video) — không có section "Video hướng dẫn"; (f) 375px: khung video không tràn ngang, nút play bấm được; (g) bàn phím: Tab tới từng nút play, focus ring hiện, Enter kích hoạt
  - [ ] Commit: `feat(lesson): story 2.2 — video YouTube click-to-load trong bài học`; push + verify Vercel deploy xanh

## Dev Notes

### Trạng thái code hiện tại — chạm gì, KHÔNG chạm gì

**Story này ~40% data, ~50% một component mới, ~10% gắn vào LessonPage. Nền móng đã xong từ 2.1:**

- `src/core/types.ts` — `Video` đã là discriminated union theo `lang`: note BẮT BUỘC khi `'en'`, optional khi `'vi'` (compile-time, không cần validate runtime). **Dùng, KHÔNG sửa.**
- `src/content/phase-1.ts` — 13 bài / 3 tuần, mọi bài đang `videos: []`. **Chỉ đổ data vào các mảng `videos`.**
- `src/content/index.ts` — lookup API xong. **Không sửa** (video nằm trong `item.videos`, API hiện có đủ).
- `src/features/lesson/LessonPage.tsx` + `.module.css` — trang bài học hoàn chỉnh (breadcrumb, mục tiêu, lý thuyết, thực hành, 404 in-page). **Chèn section video, giữ mọi thứ khác.**
- `src/styles/tokens.css` dòng 115–121 — **token `--video-embed-*` ĐÃ TỒN TẠI ĐỦ** (aspect-ratio, background, border, radius, badge-background, badge-color). **KHÔNG thêm/sửa token.** Đừng phát minh lại — đây là lỗi "reinvent" dễ mắc nhất của story này.
- `src/ui/` — precedent sẵn: `MetronomeBlock.tsx` + `MetronomeBlock.module.css` (component PascalCase), `metronome-shortcuts.ts` + test (module thuần kebab-case trong ui/ có unit test). `VideoEmbed` theo đúng khuôn này.
- **KHÔNG chạm:** `src/core/audio/*`, `src/app/*`, `src/ui/MetronomeBlock*`, `src/ui/useMetronome*`, `src/ui/metronome-shortcuts*`, `RoadmapPage`, `vercel.json`, `vite.config.ts`, `package.json` (zero dependency mới).

**Không phải Next.js.** Vite 8 + React 19 SPA, react-router 8 (`react-router`, KHÔNG phải `react-router-dom`). Không `'use client'`, không server component.

### Bảng mapping video — addendum B (đã verify 2026-07-08) → bài học

Đủ 14 video, thứ tự trong bảng = thứ tự trong mảng `videos` (VI trước EN). youtubeId chép NGUYÊN VĂN — một ký tự sai là khung xám:

| Bài | # | youtubeId | lang | title (giữ nguyên từ addendum) | note (EN — gợi ý, dev chỉnh giọng) |
|---|---|---|---|---|---|
| gd1-t1-b1 Làm quen bộ trống | 1 | `VI70TWXRKLM` | vi | Tìm hiểu các bộ phận và tiếng trong 1 bộ trống — Việt Thương Music | — |
| | 2 | `-W9qhBrw2Lk` | vi | Học trống - Thành phần của một bộ trống — Soul Institute of Arts | — |
| | 3 | `Doxa4nYB4yo` | vi | Trống Jazz - Cấu tạo, tính năng từng bộ phận — Trung Drum | — |
| | 4 | `LYNnF7iUE8U` | vi | Học TRỐNG cơ bản Bài 1: Làm quen với trống — Pong Ơi | — |
| gd1-t1-b2 Cầm dùi & tư thế | 1 | `Zvgpjio8n4c` | vi | Hướng dẫn đánh trống cơ bản: Cách cầm dùi trống — Việt Thương Music | — |
| | 2 | `h8rWFXOoSEc` | vi | Học trống căn bản Bài 2 - Tư Thế Ngồi, Cách Cầm Dùi Và Setup Bộ Trống — Tran Tin Drummer | — |
| | 3 | `mTkuxDQEnk4` | vi | Hướng dẫn tự học trống: Bài 2 - Cách cầm dùi — Duy Phan | — |
| gd1-t1-b3 Metronome | 1 | `8bcNVm9tut8` | vi | Bài 5: Bí mật làm chủ nhịp điệu trống: Tempo & Metronome cho người mới — GIAO DRUM | — |
| | 2 | `qc7wPNHCFnU` | en | Playing Drums To A Metronome — Drum Beats Online | "Video tiếng Anh: cách tập trống cùng metronome — bạn chỉ cần xem động tác và cách anh ấy đếm nhịp, không cần hiểu hết lời." |
| | 3 | `gSmf7W3DUjs` | en | 60 BPM Metronome (click track luyện tập) — Drumset Fundamentals | "Track metronome 60 bpm dài 30 phút, không lời — bật lên tập cùng khi bạn muốn đổi vị tiếng tick." |
| gd1-t1-b4 Single stroke @60 | 1 | `IpXHV9CUvho` | vi | Học Trống cơ bản Bài 2: Bài tập tay cơ bản (Single Stroke) — Pong Ơi | — |
| gd1-t2-b2 Double stroke @60 | 1 | `_wYDJjCFtNY` | vi | Học TRỐNG cơ bản Bài 3: Bài tập tay cơ bản (Double Stroke) — Pong Ơi | — |
| gd1-t3-b1 Paradiddle @60 | 1 | `nRJBK5_o5SM` | vi | Tự học trống: Paradiddle — Duy Phan | — |
| | 2 | `h0OoVP6VgBE` | en | How To Play A Paradiddle — Drum Rudiment Lesson — Drumeo | "Video 1 phút của Drumeo: nhìn rõ tay R-L-R-R L-R-L-L chậm rãi — xem động tác là đủ, không cần nghe hiểu." |

Các bài còn lại (`gd1-t1-b5`, `gd1-t2-b1/b3/b4`, `gd1-t3-b2/b3/b4`) giữ `videos: []` — FR-5 là "mỗi bài gắn 1–n video" cho bài CÓ video; bài luyện lặp không cần video riêng (video gốc đã ở bài giới thiệu kỹ thuật). LessonPage ẩn section khi rỗng.

`title` trong data có thể giữ dạng "Tên video — Kênh" như bảng (hiển thị người xem biết nguồn); title này cũng là `title` của iframe (a11y) và text hiển thị dưới khung.

### Guardrails kiến trúc (binding)

- **AD-1 layering:** `VideoEmbed` sống ở `ui/` (Structural Seed spine chỉ định rõ: "ui/ dùng chung: MetronomeBlock, PatternGrid, **VideoEmbed**, DrumMap"). `ui/` chỉ import `core/` (type `Video`) — KHÔNG import `content/`/`features/`/`app/`. `video-urls.ts` thuần, không React. [Source: ARCHITECTURE-SPINE.md#AD-1, #Structural-Seed]
- **AD-7 — ngoại lệ CDN duy nhất là YouTube:** thumbnail tĩnh `i.ytimg.com/vi/<id>/hqdefault.jpg` + iframe `youtube.com/embed/<id>` CHỈ mount sau click. Không thêm CDN nào khác (không lite-youtube-embed từ npm cũng không script bên thứ ba — tự viết, component này nhỏ). `note` bắt buộc khi `lang: 'en'` — type đã ép. Thứ tự hiển thị = thứ tự data, component không sort. [Source: ARCHITECTURE-SPINE.md#AD-7]
- **AD-5 tokens:** mọi giá trị có token phải qua `var()`. Token video-embed đã đủ trong `tokens.css` — không thêm token, không sửa `tokens.css`. Icon play SVG inline dùng `currentColor`/`var(--color-amber)`. [Source: ARCHITECTURE-SPINE.md#AD-5; src/styles/tokens.css:115-121]
- **Lỗi & trạng thái:** không throw xuyên tầng — trạng thái lỗi là state hiển thị fallback (Consistency Conventions). Fallback theo EXPERIENCE State Patterns: "Video hỏng → không bao giờ khung xám trống". [Source: ARCHITECTURE-SPINE.md#Consistency-Conventions; EXPERIENCE.md#State-Patterns]
- **UX-DR6 (DESIGN.md `video-embed`):** khung 16:9 nền `surface-overlay`, viền `border-subtle`, bo `rounded.lg`, badge VI/EN góc trái trên nền amber chữ tối. [Source: DESIGN.md#Components video-embed]
- **Accessibility floor (UX-DR11):** nút play là `<button>` thật với `aria-label` chứa tên video; iframe có `title`; badge là chữ; focus ring do `global.css` sở hữu — KHÔNG override outline; không autoplay khi chưa click (click-to-load thỏa luôn autoplay policy). [Source: EXPERIENCE.md#Accessibility-Floor]

### Gotchas TypeScript strict (fail `tsc -b` nếu quên)

- `verbatimModuleSyntax` — `import type { Video } from '../core/types'`.
- `erasableSyntaxOnly` — không enum, không parameter properties; union chữ + `as const`.
- `noUnusedLocals`/`noUnusedParameters` là error. Không path alias — import tương đối.
- Discriminated union `Video`: truy cập `video.note` an toàn ở cả hai nhánh (`'vi'` có `note?`, `'en'` có `note`) — render `{video.note && <p>...</p>}` là đủ, không cần narrow theo `lang`.

### Nền tảng YouTube — sự thật kỹ thuật dev PHẢI biết trước khi code

- **Thumbnail `hqdefault.jpg` (480×360) trả HTTP 200 kể cả khi video đã bị gỡ** (ảnh xám generic) → `onError` của `<img>` KHÔNG phải lưới an toàn cho video gỡ; nó chỉ bắt lỗi mạng/chặn domain. Đây là lý do dòng link phụ "Tìm trên YouTube" phải LUÔN hiển thị dưới mọi khung (Task 2). Đừng dùng `maxresdefault.jpg` (404 thật với nhiều video cũ — các video VI trong danh sách không chắc có bản 1080p).
- **Lỗi trong iframe không detect được:** embed cross-origin, không `onerror`, không postMessage mặc định. Video gỡ/chặn embed → YouTube tự hiển thị "Video unavailable" TRONG iframe. Chấp nhận — link phụ là đường thoát. KHÔNG thêm YouTube IFrame Player API (script CDN ngoài — vi phạm AD-7) chỉ để bắt lỗi.
- **`autoplay=1` sau click hợp lệ:** iframe mount trong event handler của user gesture nên trình duyệt cho phép autoplay có tiếng. Cần `allow="autoplay; encrypted-media; picture-in-picture"` trên iframe.
- **`loading="lazy"` trên `<img>` thumbnail:** bài có 4 video chỉ tải ảnh khi cuộn tới — NFR-5 trọn vẹn.
- Embed URL theo addendum: `youtube.com/embed/<id>` (giữ nguyên, không đổi sang `youtube-nocookie.com` — addendum/spine đã chốt shape URL; đổi privacy-domain là quyết định sản phẩm ngoài scope).

### Trí tuệ từ story trước (2.1 done, review pass 0 vòng lặp)

- **House rhythm:** red-green TDD (test đỏ trước, code sau); CSS module cạnh component, token-only; text tiếng Việt inline; named exports (zero default export toàn repo); comment tiếng Việt trích mã bất biến (AD-x, FR-x, UX-DRx) ngay tại nơi áp dụng — match đúng giọng này.
- **Bài học review 2.1:** dùng discriminated union thay vì optional field lỏng (đã áp cho `LessonItem` — `Video` cũng sẵn dạng này); key React theo giá trị ổn định khi có (video dùng `youtubeId` làm key — ổn định hơn index); giữ heading outline đúng cấp (section video dùng `<h2>` cùng cấp "Mục tiêu"/"Thực hành").
- **Bài học 1.2/1.3:** guard edge sớm (param rỗng, mảng rỗng) thay vì đợi review; chừa chỗ cho nội dung động để layout không nhảy (fallback giữ đúng khung 16:9 — cùng phản xạ).
- **Đã deferred, KHÔNG sửa ở story này** (deferred-work.md): SPA rewrite nuốt 404 asset (không liên quan — thumbnail là cross-origin); master gain stage cho AudioContext (chờ 2.3); skip-link (chờ pass a11y); shortcut-focus quirk (thuộc MetronomeBlock). Đừng làm tệ hơn là đủ.
- **Git pattern:** `feat(scope): story X.Y — mô tả tiếng Việt`; commit gộp source + test + css module một lần (xem 06f6014).

### Ghi chú tech mới nhất

Không dependency mới. Stack (React 19.2, react-router 8.1, TS 6.0, Vite 8.1, Vitest 4.1) verify 2026-07-08, đang chạy production. Bề mặt mới duy nhất là iframe embed YouTube — hành vi nền tảng đã ghi đủ ở mục trên, không cần research thêm.

### Project Structure Notes

Cây thay đổi story này:

```text
src/ui/
  VideoEmbed.tsx                 # NEW — khung 16:9 click-to-load, 3 trạng thái, badge, note
  VideoEmbed.module.css          # NEW — token-only (--video-embed-*)
  video-urls.ts                  # NEW — thuần: thumbnail/embed/search URL
  video-urls.test.ts             # NEW — unit test URL helpers (Task 1)
src/content/
  phase-1.ts                     # UPDATE — CHỈ các mảng videos (14 video addendum B)
  index.test.ts                  # UPDATE — thêm describe "video data" (Task 4)
src/features/lesson/
  LessonPage.tsx                 # UPDATE — section "Video hướng dẫn" giữa lý thuyết và Thực hành
  LessonPage.module.css          # UPDATE — (nếu cần) gap cho danh sách video
```

- Import: `VideoEmbed` → `core/types` + `./video-urls`; `LessonPage` → `../../ui/VideoEmbed`. Không alias, đường dẫn tương đối.
- `content/index.ts`, `core/types.ts` không đổi — API và type từ 2.1 đủ dùng, đó là chủ đích thiết kế của 2.1.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.2] — statement + 2 AC nguyên văn; Epic 2 context
- [Source: _bmad-output/planning-artifacts/prds/prd-drum-beginner-2026-07-08/addendum.md#B] — 14 video đã verify (title/kênh/lang/URL) — nguồn duy nhất của youtubeId
- [Source: _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/ARCHITECTURE-SPINE.md#AD-1, #AD-5, #AD-7, #Structural-Seed, #Consistency-Conventions] — layering, tokens, YouTube CDN exception + Video type, VideoEmbed sống ở ui/, lỗi không throw
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/DESIGN.md#Components video-embed] — spec khung/badge (đã map thành token)
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/EXPERIENCE.md#Component-Patterns "Video nhúng", #State-Patterns "Video hỏng", #Accessibility-Floor] — click-to-load, fallback, không autoplay
- [Source: src/core/types.ts; src/content/phase-1.ts; src/content/index.ts; src/features/lesson/LessonPage.tsx; src/styles/tokens.css:115-121] — code hiện trạng + token video-embed có sẵn
- [Source: _bmad-output/implementation-artifacts/2-1-giao-trinh-giai-doan-1-trang-lo-trinh-trang-bai-hoc.md#Dev-Notes; spec-2-1 §result] — house conventions, bài học review
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — các mục giữ nguyên deferred

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created (claude-fable-5, 2026-07-09)

### File List
