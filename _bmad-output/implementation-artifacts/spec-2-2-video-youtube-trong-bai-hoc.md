---
title: 'Story 2.2: Video YouTube trong bài học'
type: 'feature'
created: '2026-07-09'
status: 'done'
baseline_revision: '580f89ed1355dc940f4b251a93664f8944ae4ed9'
final_revision: '86657b55a8c2505dfd2ac3d0b393441062b7e6e3'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/2-2-video-youtube-trong-bai-hoc.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-2-context.md'
warnings: [oversized]
---

<intent-contract>

## Intent

**Vấn đề:** Bài học chỉ có chữ — người mới không nhìn được động tác thật. Data video đã verify (addendum B, 14 video) nhưng `phase-1.ts` đang `videos: []` toàn bộ và chưa có component render video.

**Cách làm:** Component mới `ui/VideoEmbed` (khung 16:9 click-to-load: thumbnail `i.ytimg.com` + nút play + badge VI/EN; iframe YouTube chỉ mount sau click — NFR-5), helpers URL thuần `ui/video-urls.ts`, đổ 14 video addendum B vào các mảng `videos` của `content/phase-1.ts`, và LessonPage render section "Video hướng dẫn" giữa lý thuyết và Thực hành (FR-4, FR-5).

## Boundaries & Constraints

**Always:**
- AD-1 layering: `VideoEmbed` sống ở `src/ui/`, chỉ import `core/` (type `Video` qua `import type`) + `./video-urls`; `video-urls.ts` thuần không React. `LessonPage` (features) import từ `ui/` — hợp lệ.
- AD-7: CDN duy nhất là YouTube — thumbnail `https://i.ytimg.com/vi/<id>/hqdefault.jpg` (KHÔNG dùng `maxresdefault`), embed `https://www.youtube.com/embed/<id>?autoplay=1` (giữ nguyên domain, không đổi `youtube-nocookie`), search `https://www.youtube.com/results?search_query=<encodeURIComponent>`. Iframe chỉ mount sau click; `allow="autoplay; encrypted-media; picture-in-picture"` + `allowFullScreen` + `title={video.title}` + `referrerPolicy="strict-origin-when-cross-origin"`.
- AD-5: CSS module token-only, dùng đủ 6 token `--video-embed-*` có sẵn trong `tokens.css:115-121`; KHÔNG thêm/sửa token; KHÔNG override `outline` (focus ring do `global.css` sở hữu); hover chỉ đổi màu viền → `--color-amber`.
- Component KHÔNG sort videos — thứ tự = thứ tự data (VI trước EN do data đảm bảo, test chốt); key React = `youtubeId`.
- UX-DR11: nút play là `<button type="button">` phủ toàn khung (≥44px) với `aria-label={'Phát video: ' + video.title}`; badge VI/EN là CHỮ (`video.lang.toUpperCase()`), không truyền nghĩa chỉ bằng màu; icon play SVG inline tự vẽ (`aria-hidden`), tô `var(--color-amber)`.
- UX-DR9: LUÔN render dòng link phụ "Video không xem được? Tìm trên YouTube ↗" dưới khung ở MỌI trạng thái (đường thoát cho video đã gỡ mà iframe hiện "Video unavailable" — không detect được cross-origin); ghi comment tiếng Việt lý do trong code.
- Dưới khung: title video (`--font-size-small`, `--color-text-secondary`); nếu `video.note` tồn tại → đoạn note viền trái `var(--color-amber-dim)` — render `{video.note && …}`, không cần narrow theo `lang`.
- Red-green TDD: test viết TRƯỚC ở Task 1 và Task 4. youtubeId chép NGUYÊN VĂN từ bảng mapping trong story file (14 video, 6 bài); 3 video EN tự viết `note` tiếng Việt 1–2 câu giọng UX-DR10 (xưng "bạn").
- House style: named exports, không semicolon, single quotes, comment tiếng Việt trích mã bất biến; `import type` (verbatimModuleSyntax); không enum; import tương đối.

**Block If:**
- 6 token `--video-embed-*` hóa ra thiếu/sai tên khi dùng thật, buộc sửa `tokens.css`.
- Fulfil AC buộc thêm dependency mới hoặc sửa `package.json`, `vite.config.ts`, `vercel.json`.

**Never:**
- KHÔNG lite-youtube-embed/npm package/script bên thứ ba/YouTube IFrame Player API (vi phạm AD-7) — tự viết, component nhỏ.
- KHÔNG cố detect lỗi bên trong iframe (cross-origin, không có event); `onError` của `<img>` chỉ bắt lỗi mạng/thumbnail thật.
- KHÔNG đụng: `src/core/*`, `src/app/*`, `src/styles/*`, `src/content/index.ts`, `src/ui/Metronome*`/`useMetronome*`/`metronome-shortcuts*`, `RoadmapPage`, `features/metronome|practice|progress`. Trong `phase-1.ts` CHỈ sửa các mảng `videos` + xóa comment dòng 3.
- KHÔNG jsdom/@testing-library — test node thuần cho helpers + data; component không có DOM test.
- KHÔNG sort/lọc video trong component; KHÔNG media query riêng (khung co theo cột 65ch).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Bài có video | mở `/bai-hoc/gd1-t1-b1` | Section "Video hướng dẫn" (h2 cùng cấp) giữa lý thuyết và Thực hành; 4 khung 16:9 thumbnail + play + badge; zero request youtube.com trước click | Không lỗi |
| Click play | click nút play (state `idle` → `playing`) | Iframe mount ngay trong gesture, `autoplay=1` hợp lệ — một click video chạy | Không lỗi |
| Video EN | video `lang: 'en'` | Badge EN + note tiếng Việt bên dưới (type ép note luôn có) | Không lỗi |
| Thumbnail lỗi thật | `<img>` bắn `onError` (mạng/chặn domain) | State `thumbError`: khung fallback CÙNG 16:9 — "Video này hiện không tải được." + link `youtubeSearchUrl(item.title)` mở tab mới | Không bao giờ khung xám trống (UX-DR9) |
| Video đã gỡ | thumbnail 200 (ảnh xám), iframe hiện "Video unavailable" | Không detect được — link phụ "Tìm trên YouTube ↗" luôn hiển thị dưới khung là đường thoát | Chấp nhận giới hạn nền tảng |
| Bài không video | mở `/bai-hoc/gd1-t1-b5` | KHÔNG có section "Video hướng dẫn" (guard `item.videos.length > 0`) | Không lỗi |
| Từ khóa tiếng Việt | `youtubeSearchUrl('cầm dùi trống')` | URL encode đúng qua `encodeURIComponent`, không vỡ URL | Không lỗi |

</intent-contract>

## Code Map

- `src/ui/video-urls.ts` -- NEW: module thuần kebab-case, export `youtubeThumbnailUrl`, `youtubeEmbedUrl`, `youtubeSearchUrl`
- `src/ui/video-urls.test.ts` -- NEW: unit test 3 helpers (viết TRƯỚC — model theo `metronome-shortcuts.test.ts`)
- `src/ui/VideoEmbed.tsx` -- NEW: named export `VideoEmbed({ video, searchQuery })`; state `'idle' | 'playing' | 'thumbError'` qua `useState`
- `src/ui/VideoEmbed.module.css` -- NEW: token-only, khung `aspect-ratio: var(--video-embed-aspect-ratio)`
- `src/content/phase-1.ts` -- UPDATE: CHỈ các mảng `videos` (14 video, 6 bài: b1=4, t1-b2=3, t1-b3=1vi+2en, t1-b4=1, t2-b2=1, t3-b1=1vi+1en) + xóa comment dòng 3
- `src/content/index.test.ts` -- UPDATE: thêm describe "video data" (viết TRƯỚC khi đổ data)
- `src/features/lesson/LessonPage.tsx` -- UPDATE: section video giữa theory (hết ~dòng 52) và "Thực hành" (~dòng 54); `searchQuery={item.title}`
- `src/features/lesson/LessonPage.module.css` -- UPDATE nếu cần gap (`--spacing-*`)
- `src/styles/tokens.css:115-121` -- READ-ONLY: 6 token `--video-embed-*` đã đủ
- `src/core/types.ts` -- READ-ONLY: `Video` discriminated union theo `lang` đã sẵn

## Tasks & Acceptance

**Execution:**
- [x] `src/ui/video-urls.test.ts` -- test đỏ trước: thumbnail = `https://i.ytimg.com/vi/abc/hqdefault.jpg`; embed = `https://www.youtube.com/embed/abc?autoplay=1`; search encode đúng ký tự Việt/khoảng trắng với prefix `https://www.youtube.com/results?search_query=` -- red-green
- [x] `src/ui/video-urls.ts` -- implement 3 helpers thuần -- xanh test Task 1
- [x] `src/ui/VideoEmbed.tsx` + `VideoEmbed.module.css` -- component 3 trạng thái + badge + note + link phụ luôn hiển thị -- AC #1 #2
- [x] `src/content/index.test.ts` -- test đỏ trước describe "video data": mọi `youtubeId` match `/^[A-Za-z0-9_-]{11}$/`; tổng = 14; không video `vi` nào đứng SAU `en` trong cùng item; mọi `en` có `note` không rỗng; `youtubeId` không trùng trong item; anchors: `gd1-t1-b1`=4, `gd1-t1-b2`=3, `gd1-t1-b3`=3, `gd1-t1-b4`=1, `gd1-t2-b2`=1, `gd1-t3-b1`=2 -- chốt hợp đồng data
- [x] `src/content/phase-1.ts` -- đổ 14 video theo bảng mapping story file (id NGUYÊN VĂN), viết note VI cho 3 video EN, xóa comment dòng 3 -- xanh test Task 4
- [x] `src/features/lesson/LessonPage.tsx` (+ `.module.css` nếu cần) -- section "Video hướng dẫn" chỉ khi `videos.length > 0`, map `<VideoEmbed key={youtubeId} video={v} searchQuery={item.title} />` -- AC #1
- [x] Quality gate -- `npm run check` xanh (70 test cũ + mới → 83 test); git diff xác nhận zero thay đổi ngoài 8 file Code Map -- hàng rào Never

**Acceptance Criteria:**
- Given data video đã đổ đúng addendum B, when mở một bài có video, then mỗi video là khung 16:9 thumbnail `i.ytimg.com` + nút play + badge VI/EN, VI đứng trước theo thứ tự data (component không sort), và KHÔNG có request nào tới youtube.com trước khi click.
- Given khung video ở trạng thái idle, when click nút play, then iframe YouTube mount và video chạy ngay một click; video EN hiển thị note tóm tắt tiếng Việt bên dưới.
- Given một video bị gỡ/lỗi tải, when click play mà thumbnail/iframe lỗi, then hiển thị fallback + link mở tìm kiếm YouTube với từ khóa của bài — không bao giờ khung xám trống.
- Given bài không có video, when mở bài đó, then không render section "Video hướng dẫn" rỗng.
- Given toàn bộ suite, when chạy `npm run check`, then tsc -b + oxlint + vitest + vite build đều xanh.

## Spec Change Log

## Review Triage Log

### 2026-07-09 — Review pass (user review)
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none

Ghi chú: cặp reviewer tự động (Blind Hunter + Edge Case Hunter) không chạy được trong phiên này do hạ tầng phân loại an toàn của harness gián đoạn tạm thời (Agent tool bị chặn, đã retry 6 lần trong ~10 phút). Anhndt đã review trực tiếp và xác nhận OK — user review thay thế review pass tự động, story chốt `done` theo chỉ thị người dùng.

## Design Notes

- Ba trạng thái nội bộ đủ (`idle`/`playing`/`thumbError`) — lỗi là state hiển thị, không throw xuyên tầng (Consistency Conventions).
- Giới hạn nền tảng đã chốt trước: `hqdefault.jpg` trả HTTP 200 kể cả video đã gỡ → `onError` không phải lưới an toàn cho video gỡ; lỗi trong iframe là cross-origin không event. Vì vậy link phụ dưới khung ở mọi trạng thái là thiết kế chủ đích, không phải phòng hờ thừa.
- `loading="lazy"` trên thumbnail — bài 4 video chỉ tải ảnh khi cuộn tới (NFR-5).
- Bảng mapping 14 video (youtubeId/lang/title/note gợi ý) nằm trong story file `2-2-video-youtube-trong-bai-hoc.md` §"Bảng mapping video" — nguồn duy nhất, chép nguyên văn.

## Verification

**Commands:**
- `npm run check` -- expected: tsc -b, oxlint, vitest (70 test cũ + video-urls + video data mới) và vite build đều xanh
- `git diff --stat` -- expected: chỉ 8 file trong Code Map thay đổi

**Manual checks (if no CLI):**
- `vite dev`: `/bai-hoc/gd1-t1-b1` — 4 thumbnail, Network chỉ có `i.ytimg.com` trước click; click → iframe chạy; `/bai-hoc/gd1-t1-b3` — VI trước 2 EN có note; chặn `i.ytimg.com` → fallback + link search; `/bai-hoc/gd1-t1-b5` — không section video; 375px không tràn ngang; Tab tới nút play có focus ring, Enter kích hoạt

## Auto Run Result

**Status:** done — final_revision `86657b5` (user review passed)

**Summary:** Story 2.2 đưa video vào bài học: component mới `ui/VideoEmbed` (khung 16:9 click-to-load — thumbnail i.ytimg.com + nút play + badge VI/EN, iframe YouTube chỉ mount sau click), 3 helpers URL thuần trong `ui/video-urls.ts`, 14 video addendum B đổ vào 6 bài của `content/phase-1.ts` (3 video EN kèm note tiếng Việt tự viết), và LessonPage render section "Video hướng dẫn" giữa lý thuyết và Thực hành — bài không video không có section rỗng.

**Files changed:**
- `../../src/ui/video-urls.ts` — NEW: 3 helpers URL thuần (thumbnail/embed/search), không React
- `../../src/ui/video-urls.test.ts` — NEW: 6 unit test (red-green, viết trước)
- `../../src/ui/VideoEmbed.tsx` — NEW: component 3 trạng thái idle/playing/thumbError; fallback UX-DR9 + link phụ "Tìm trên YouTube" luôn hiển thị
- `../../src/ui/VideoEmbed.module.css` — NEW: token-only, dùng đủ 6 token `--video-embed-*`, không override outline
- `../../src/content/phase-1.ts` — UPDATE: chỉ các mảng `videos` (14 video nguyên văn addendum B) + xóa comment placeholder dòng 3
- `../../src/content/index.test.ts` — UPDATE: describe "video data" 7 test chốt hợp đồng data (viết trước khi đổ data)
- `../../src/features/lesson/LessonPage.tsx` — UPDATE: section "Video hướng dẫn" guard `videos.length > 0`, key theo youtubeId
- `../../src/features/lesson/LessonPage.module.css` — UPDATE: thêm `.videoList` (gap token)

**Review findings breakdown:** review pass tự động không chạy được (hạ tầng harness gián đoạn — xem Review Triage Log); Anhndt review trực tiếp và duyệt OK. 0 patch, 0 defer, 0 reject.

**Follow-up review:** không khuyến nghị — không có thay đổi nào phát sinh từ review; diff gọn, đúng 8 file Code Map.

**Verification:** `npm run check` xanh toàn bộ (chạy lại ngay trước commit): tsc -b, oxlint, vitest `5 files / 83 tests passed` (70 cũ + 13 mới), vite build OK. 14/14 youtubeId đối chiếu nguyên văn khớp bảng mapping story, đúng thứ tự VI trước EN. Diff xác nhận zero thay đổi ngoài 8 file Code Map; các đường cấm (`src/core/`, `src/app/`, `src/styles/`, configs) không bị chạm.

**Residual risks:** verify tay trên trình duyệt (click-to-load thật, Network không gọi youtube.com trước click, fallback khi chặn i.ytimg.com, 375px, bàn phím) do người dùng đảm nhận qua review — đã pass theo xác nhận. Lỗi "Video unavailable" bên trong iframe là giới hạn nền tảng đã chấp nhận (link phụ là đường thoát). Khuyến nghị kiểm tra Vercel deploy sau push.
