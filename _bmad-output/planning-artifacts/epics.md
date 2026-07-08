---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-drum-beginner-2026-07-08/prd.md
  - _bmad-output/planning-artifacts/prds/prd-drum-beginner-2026-07-08/addendum.md
  - _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-drum-beginner-2026-07-08/EXPERIENCE.md
  - _bmad-output/planning-artifacts/architecture/architecture-drum-beginner-2026-07-08/ARCHITECTURE-SPINE.md
---

# drum-beginner - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for drum-beginner, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR-1: Hiển thị lộ trình Giai đoạn 1 chia theo tuần (Tuần 1–3), mỗi tuần gồm danh sách bài học/bài tập có thứ tự.
- FR-2: Cấu trúc dữ liệu lộ trình định nghĩa dạng khai báo (data file TS); thêm giai đoạn/tuần/bài mới không sửa component.
- FR-3: Trang chủ hiển thị "bài tiếp theo nên học" dựa trên tiến độ hiện tại.
- FR-4: Mỗi bài học gồm: tiêu đề, mục tiêu, lý thuyết ngắn (tiếng Việt), video YouTube nhúng, hướng dẫn thực hành từng bước.
- FR-5: Mỗi bài gắn 1–n video có nhãn ngôn ngữ VI/EN; VI hiển thị trước; video EN có ghi chú tóm tắt tiếng Việt (tác giả tự viết trong data).
- FR-6: Bài "Làm quen bộ trống" có sơ đồ bộ trống tương tác: click/hover từng bộ phận (snare, tom, kick, hi-hat, crash, ride) xem tên/vai trò và nghe âm thanh mẫu.
- FR-7: Metronome trong trình duyệt (Web Audio API): tempo 40–200 bpm (mặc định 60), start/stop (+phím Space), ±1 và ±5 bpm, số BPM hiển thị to rõ.
- FR-8: Chỉ báo nhịp trực quan đồng bộ âm thanh; phách 1 có âm accent khác biệt.
- FR-9: Nhịp 4/4 mặc định; hỗ trợ 2/4, 3/4, 4/4 (chưa cần subdivision — GĐ sau).
- FR-10: Tap tempo (gõ phím/click để ước lượng tempo).
- FR-11: Metronome dùng được như trang độc lập VÀ nhúng trong bài tập đang mở.
- FR-12: Thư viện bài tập stick control (single stroke, double stroke, paradiddle); pattern R/L đọc được từ ~2 mét.
- FR-13: Con trỏ pattern chạy theo metronome: ô R/L hiện tại highlight đúng nhịp.
- FR-14: Mỗi bài tập có tempo mục tiêu + ghi chú kỹ thuật; user tự ghi "tempo tốt nhất đã chơi sạch" (tự khai báo).
- FR-15: Đánh dấu hoàn thành từng bài; tiến độ hiển thị theo tuần và toàn giai đoạn (vd. "Tuần 1: 4/6 bài").
- FR-16: Nhật ký luyện tập tối giản: mỗi lần bấm hoàn thành lưu timestamp; hiển thị streak (chuỗi ngày tập liên tiếp).
- FR-17: Tiến độ lưu localStorage; nút export/import JSON để sao lưu thủ công.

### NonFunctional Requirements

- NFR-1: Toàn bộ UI và nội dung tiếng Việt; không i18n framework; thuật ngữ trống giữ tiếng Anh.
- NFR-2: Metronome ổn định đo được: mỗi tick lệch ≤ ±2ms so với lịch, không trôi tích lũy sau 10 phút; Web Audio lookahead scheduling, không setInterval thuần cho âm thanh.
- NFR-3: Responsive từ ~375px đến desktop; breakpoint chính 768px.
- NFR-4: Static site, deploy miễn phí (Vercel).
- NFR-5: Video YouTube lazy-load (click-to-load); video hỏng → fallback + link tìm kiếm thay thế, không khung trống.
- NFR-6: TypeScript strict; kiến trúc thêm loại bài tập mới không phá cấu trúc.

### Additional Requirements

Từ ARCHITECTURE-SPINE.md (binding cho mọi story):

- AR-1: **Starter template: `npm create vite@latest -- --template react-ts`** (Vite 8.1/Rolldown, React 19.2, TS 6.0 strict, oxlint theo starter) — quyết định Epic 1 Story 1. Node ≥ 22.12.
- AR-2: Layered deps một chiều (AD-1): `core/` + `content/` không import React; `features/` không import lẫn nhau — thứ dùng chung hạ xuống `ui/` hoặc `core/`.
- AR-3: Content-as-data (AD-2): một không gian ID `gd1-t2-b3` cho mọi item (bài học lẫn bài tập, phân biệt bằng `kind`); `content/` export API lookup; thêm giai đoạn = thêm data file.
- AR-4: Audio engine (AD-3): MỘT instance `MetronomeEngine` + MỘT `AudioContext` (lazy-init theo user gesture, dùng chung với drum-map); tick timer trong **Web Worker**; beat event `{bar, beatInBar, audioTime}`; `tap()` là API engine; React bind qua `useSyncExternalStore`; rời trang = `stop()`, cấm `close()`.
- AR-5: Progress store (AD-4): key `drum-beginner:progress:v1`, envelope `{schemaVersion, completedLessons, bestTempos, sessions}`; sessions chỉ ghi khi bấm "Hoàn thành"; streak/"bài tiếp theo"/"N-trên-M" là **selector trong core/progress**; load 3 trạng thái empty/ok/corrupt; import validate đầy đủ rồi ghi đè sau xác nhận.
- AR-6: Routes hằng số trong `app/routes.ts` (AD-6): `/`, `/lo-trinh`, `/bai-hoc/:id`, `/metronome`, `/tien-do`; react-router 8 declarative.
- AR-7: Asset tự host (AD-7): font @fontsource/be-vietnam-pro, âm mẫu `public/sounds/`; ngoại lệ CDN duy nhất = YouTube (thumbnail i.ytimg.com + iframe sau click); video type `{youtubeId, lang, title, note?}` — note bắt buộc khi lang='en'.
- AR-8: `ui/MetronomeBlock` duy nhất dùng chung surface metronome + practice (AD-8); một hook `useMetronomeShortcuts` duy nhất sở hữu Space/↑↓/Shift+↑↓/T; mount cùng bài tập: engine không chạy → set tempo bắt đầu, đang chạy → giữ.
- AR-9: Deploy Vercel + `vercel.json` rewrites `/(.*) → /index.html` (SPA fallback không native); build command = `npm run check` (tsc --noEmit + oxlint + vitest run + vite build) — quality gate ngay trong build.
- AR-10: `core/` bắt buộc unit test (engine scheduling, selectors/streak, import validate); ngày giờ ISO 8601 UTC, so "cùng ngày" theo local qua selector.

### UX Design Requirements

- UX-DR1: `styles/tokens.css` ánh xạ 1-1 frontmatter DESIGN.md (17 màu, 6 vai trò typography, 4 rounded, 9 spacing, 12 component tokens) + responsive override trong media query 768px (pattern-letter 56→40px); component chỉ dùng `var()`.
- UX-DR2: `styles/global.css`: nền `--surface-base`, chữ Be Vietnam Pro (@fontsource), `:focus-visible` ring `--color-focus-ring`, `prefers-reduced-motion` (beat đổi màu không scale), touch target ≥44px.
- UX-DR3: Component `nav`: header 60px sticky desktop (item active: chữ sáng + gạch chân amber 2px) / bottom tab bar 56px mobile 4 mục (Trang chủ · Lộ trình · Metronome · Tiến độ); trang Bài học giữ active ở "Lộ trình".
- UX-DR4: `ui/MetronomeBlock`: BPM display 96px amber tabular-nums + nhãn "bpm"; hàng beat-dot (phách 1 to 1.4×, active = amber-bright + glow, ngoại lệ elevation hợp thức); nút −5/−1/start-stop/+1/+5/tap; hint phím tắt dạng kbd; đổi tempo khi đang chạy hiệu lực từ ô nhịp kế tiếp.
- UX-DR5: `ui/PatternGrid`: ô R (amber) / L (teal) 56px đậm, KHÔNG bao giờ chỉ mã hóa bằng màu (luôn kèm chữ); ô active nền overlay + viền amber-bright; grid 4–8 ô/hàng khớp số phách; loop vô hạn đến khi dừng.
- UX-DR6: `ui/VideoEmbed`: khung 16:9 click-to-load (thumbnail + nút play), badge VI/EN góc trái, video lỗi → fallback thông báo + link tìm YouTube; VI đứng trước theo thứ tự data.
- UX-DR7: `ui/DrumMap`: SVG tự vẽ flat 6 vùng (snare, tom, kick, hi-hat, crash, ride) theo token drum-map (hover viền amber, active fill amber-dim + viền amber-bright); click → highlight + panel tên/vai trò (style card) + phát âm mẫu 1 lần; hover không phát âm; audio lỗi → im lặng, vẫn highlight + panel.
- UX-DR8: Card bài học trong lộ trình: checkmark success khi hoàn thành (không gạch ngang chữ); progress-bar fill amber → success khi 100%; thẻ "Hôm nay" trên trang chủ (bài tiếp theo + streak 🔥).
- UX-DR9: State patterns: onboarding một thẻ khi localStorage trống; trang Tiến độ empty state ("Chưa có buổi tập nào…" + nút về bài 1); localStorage corrupt → cảnh báo + "Bắt đầu lại" (chỉ ghi đè khi bấm) + gợi ý import; ghi thất bại → toast "Chưa lưu được — thử lại"; hoàn thành bài → checkmark nảy 1 lần + progress chạy; xong tuần → "Xong Tuần N 🎉" không confetti kéo dài.
- UX-DR10: Voice & tone: xưng "bạn", giọng bạn tập cùng, không chê (streak đứt → "Bắt đầu chuỗi mới hôm nay"); microcopy động từ ("Bắt đầu", "Hoàn thành bài hôm nay"); số liệu thẳng ("Tuần 1 · 4/6 bài").
- UX-DR11: Accessibility floor: contrast ≥4.5:1 (token đã pass), beat/R-L không chỉ bằng màu, điều hướng bàn phím đủ mọi flow, âm thanh không autoplay.
- UX-DR12: Responsive: desktop ≥768px vùng luyện tập ≥60% viewport; mobile cụm điều khiển tempo ghim đáy tầm ngón cái, pattern wrap 4 ô/hàng.
- UX-DR13: Đồng bộ âm-hình: visual đuổi theo audio ≤50ms; tab ẩn âm vẫn đúng nhịp, tab hiện visual bắt kịp ngay không dồn frame.

### FR Coverage Map

- FR-1: Epic 2 — Lộ trình Tuần 1–3 theo tuần
- FR-2: Epic 2 — Content-as-data (data file TS, AR-3)
- FR-3: Epic 3 — Trang chủ "bài tiếp theo" (selector)
- FR-4: Epic 2 — Trang bài học (lý thuyết + video + hướng dẫn)
- FR-5: Epic 2 — Video VI/EN + note tiếng Việt
- FR-6: Epic 2 — Sơ đồ bộ trống tương tác (DrumMap)
- FR-7: Epic 1 — Metronome 40–200 bpm, Space, ±1/±5
- FR-8: Epic 1 — Beat dots đồng bộ + accent phách 1
- FR-9: Epic 1 — 2/4, 3/4, 4/4
- FR-10: Epic 1 — Tap tempo
- FR-11: Epic 1 (trang độc lập) + Epic 2 (nhúng trong bài tập)
- FR-12: Epic 2 — Thư viện stick control + PatternGrid
- FR-13: Epic 2 — Con trỏ pattern chạy theo beat event
- FR-14: Epic 2 (hiển thị tempo mục tiêu + ghi chú) + Epic 3 (ghi/hiển thị best tempo)
- FR-15: Epic 3 — Hoàn thành bài + tiến độ tuần/giai đoạn
- FR-16: Epic 3 — Nhật ký sessions + streak
- FR-17: Epic 3 — localStorage + export/import JSON
- Xuyên suốt: NFR-1/3/6, UX-DR11 (accessibility), UX-DR13 (đồng bộ âm-hình ≤50ms)

## Epic List

### Epic 1: Luyện nhịp với Metronome
Người dùng mở website (đã deploy Vercel) và luyện giữ nhịp 60–80 bpm với metronome đầy đủ: beat dots đồng bộ âm thanh, accent phách 1, tap tempo, phím tắt — giá trị dùng được thật ngay khi epic đóng, đồng thời dựng nền móng (scaffold, tokens, nav, engine, deploy) cho mọi epic sau.
**FRs covered:** FR-7, FR-8, FR-9, FR-10, FR-11 (trang độc lập) · NFR-2, NFR-4 · AR-1, AR-2, AR-4, AR-6, AR-8, AR-9 · UX-DR1, UX-DR2, UX-DR3, UX-DR4

### Epic 2: Học theo lộ trình Giai đoạn 1
Người dùng xem lộ trình Tuần 1–3, mở từng bài học với lý thuyết tiếng Việt, video YouTube tuyển chọn (VI trước, EN kèm note), sơ đồ bộ trống tương tác có âm thanh mẫu, và khối luyện tập stick control (single/double stroke, paradiddle) chạy đồng bộ metronome ngay trong bài.
**FRs covered:** FR-1, FR-2, FR-4, FR-5, FR-6, FR-11 (nhúng), FR-12, FR-13, FR-14 (hiển thị) · NFR-5 · AR-3, AR-7 · UX-DR5, UX-DR6, UX-DR7, UX-DR12

### Epic 3: Tiến độ, streak và trang chủ "Hôm nay"
Người dùng bấm "Hoàn thành bài hôm nay" để tích checklist, nuôi streak 🔥, xem "Tuần 1: 4/6 bài"; trang chủ luôn trỏ sẵn bài kế tiếp; ghi "tempo tốt nhất" cho từng bài tập; export/import JSON khi đổi máy.
**FRs covered:** FR-3, FR-14 (ghi best tempo), FR-15, FR-16, FR-17 · AR-5, AR-10 · UX-DR8, UX-DR9, UX-DR10

## Epic 1: Luyện nhịp với Metronome

Người dùng mở website (đã deploy Vercel) và luyện giữ nhịp với metronome đầy đủ: beat dots đồng bộ âm thanh, accent phách 1, tap tempo, phím tắt. Epic này đồng thời dựng nền móng cho toàn dự án: scaffold theo starter, design tokens, nav shell, audio engine và pipeline deploy có quality gate.

### Story 1.1: Khung dự án, design tokens, nav và deploy

As a người tự học trống,
I want mở được website trên URL công khai với điều hướng 5 trang và giao diện "Sân khấu tối",
So that nền móng sẵn sàng và mỗi thay đổi sau này tự động lên production.

**Acceptance Criteria:**

**Given** máy dev có Node ≥ 22.12
**When** scaffold bằng `npm create vite@latest -- --template react-ts` (Vite 8.1, React 19.2, TS 6.0 strict) và dựng cây thư mục theo Structural Seed của ARCHITECTURE-SPINE (AR-1, AR-2)
**Then** `npm run check` (tsc --noEmit + oxlint + vitest run + vite build) chạy xanh
**And** ESLint config không tồn tại — lint là oxlint theo starter default.

**Given** app đã scaffold
**When** mở bất kỳ route nào trong `/`, `/lo-trinh`, `/bai-hoc/:id`, `/metronome`, `/tien-do` (hằng số trong `app/routes.ts` — AR-6)
**Then** trang placeholder tương ứng render trong layout chung: header sticky 60px (desktop ≥768px) với item active có gạch chân amber, bottom tab bar 56px 4 mục (mobile <768px), trang Bài học giữ active ở "Lộ trình" (UX-DR3)
**And** `styles/tokens.css` chứa đủ token DESIGN.md (màu, typography, rounded, spacing, component tokens) + media query 768px đổi `--font-size-pattern-letter` 56→40px; `styles/global.css` set nền `--surface-base`, font Be Vietnam Pro (@fontsource — AR-7), `:focus-visible` ring, `prefers-reduced-motion`, touch target ≥44px (UX-DR1, UX-DR2)
**And** không component nào dùng hex/px trần cho giá trị đã có token (AD-5).

**Given** repo có `vercel.json` rewrites `/(.*) → /index.html` và Vercel build command = `npm run check` (AR-9)
**When** push lên GitHub và deploy Vercel
**Then** mở deep link `https://<domain>/lo-trinh` trực tiếp không bị 404
**And** một test đỏ làm build đỏ (quality gate hoạt động).

### Story 1.2: MetronomeEngine — nghe được nhịp chuẩn

As a người tự học trống,
I want bật metronome ở tempo tùy chọn và nghe tick đều tuyệt đối kể cả khi chuyển tab,
So that tôi luyện giữ nhịp với nguồn nhịp đáng tin.

**Acceptance Criteria:**

**Given** `core/audio/` export một instance duy nhất `metronome: MetronomeEngine` (AR-4, không import React)
**When** bấm Start trên trang `/metronome` (UI tối giản: nút start/stop + ô nhập tempo)
**Then** AudioContext được tạo lazy ở đúng gesture đó, tick phát theo lookahead scheduling với timer trong Web Worker (tick ~25ms, schedule ahead ~100ms theo `AudioContext.currentTime`)
**And** phách 1 có âm accent khác biệt các phách còn lại (FR-8); nhịp mặc định 4/4, tempo mặc định 60 (FR-7, FR-9).

**Given** metronome đang chạy
**When** ẩn tab 60 giây rồi quay lại
**Then** âm tick không gián đoạn/dồn cục trong lúc ẩn (Worker không bị throttle như main thread — UX-DR13)
**And** engine phát beat event `{bar, beatInBar, audioTime}` qua subscribe (`useSyncExternalStore`), state (tempo, số phách, running) giữ nguyên khi đổi route trong phiên, rời trang chỉ `stop()` không bao giờ `close()` context (AR-4).

**Given** bộ unit test cho `core/audio` (AR-10)
**When** `vitest run`
**Then** test xanh cho: lịch tick sinh đúng khoảng cách theo tempo (mock AudioContext), đổi tempo khi đang chạy có hiệu lực từ ô nhịp kế tiếp không giật, `tap()` trung bình ≤5 tap gần nhất và reset sau 2 giây im.

### Story 1.3: MetronomeBlock hoàn chỉnh — trang metronome dùng được thật

As a người tự học trống,
I want điều khiển metronome trực quan từ xa 2 mét: số BPM khổng lồ, chấm nhịp sáng theo tick, chỉnh nhanh bằng nút hoặc phím tắt,
So that buổi luyện nhịp 60–80 bpm thoải mái như dùng app chuyên dụng.

**Acceptance Criteria:**

**Given** component `ui/MetronomeBlock` (AR-8) compose trong `features/metronome`
**When** trang `/metronome` render
**Then** hiển thị: BPM 96px amber tabular-nums + nhãn "bpm", hàng beat dots (phách 1 to 1.4×, dot active chuyển amber-bright + glow), nút −5/−1/■·▶/+1/+5/Tap tempo, chọn số phách 2/4·3/4·4/4, hint phím tắt dạng `kbd` (UX-DR4)
**And** dải tempo giới hạn 40–200; số BPM đổi không làm layout nhảy (tabular-nums).

**Given** metronome đang chạy
**When** quan sát beat dots
**Then** dot active đổi đúng theo beat event của engine (audio là nguồn chân lý, lệch cảm nhận ≤50ms — UX-DR13)
**And** khi `prefers-reduced-motion`: dot chỉ đổi màu, không scale/glow động (UX-DR2).

**Given** focus không nằm trong input/button khác
**When** nhấn Space / ↑ / ↓ / Shift+↑ / Shift+↓ / T
**Then** start-stop / +1 / −1 / +5 / −5 / tap tempo tương ứng — đăng ký duy nhất qua hook `useMetronomeShortcuts` trong MetronomeBlock (AR-8)
**And** khi focus ở button khác, Space không toggle metronome (không double-fire)
**And** mọi thao tác đều làm được bằng nút bấm trên mobile (không có bàn phím).

## Epic 2: Học theo lộ trình Giai đoạn 1

Người dùng xem lộ trình Tuần 1–3, mở từng bài học với lý thuyết tiếng Việt, video YouTube tuyển chọn, sơ đồ bộ trống tương tác và khối luyện tập stick control chạy đồng bộ metronome ngay trong bài.

### Story 2.1: Giáo trình Giai đoạn 1 + trang Lộ trình + trang Bài học

As a người mới hoàn toàn,
I want xem lộ trình 3 tuần và đọc nội dung từng bài bằng tiếng Việt,
So that tôi luôn biết hôm nay học gì và học như thế nào.

**Acceptance Criteria:**

**Given** `core/types.ts` định nghĩa Phase/Week/LessonItem (một không gian ID `gd1-t2-b3`, phân biệt `kind` — AR-3) và `content/phase-1.ts` chứa đủ giáo trình GĐ1 theo PRD §2 (cầm dùi, bộ phận trống, metronome 60–80, stick control) phân bổ vào Tuần 1–3
**When** mở `/lo-trinh`
**Then** thấy 3 tuần, mỗi tuần là danh sách card bài theo thứ tự (FR-1); card hiển thị tiêu đề + kind
**And** `content/index.ts` export `getItemById`, `getWeeks(phaseId)` — feature không tự duyệt cây (AR-3).

**Given** một item bất kỳ trong lộ trình
**When** click card
**Then** điều hướng `/bai-hoc/:id` hiển thị: breadcrumb (Lộ trình → Tuần N → Bài M), tiêu đề, mục tiêu, lý thuyết ngắn tiếng Việt, hướng dẫn thực hành từng bước (FR-4); thuật ngữ trống giữ tiếng Anh, chú thích lần đầu (NFR-1)
**And** ID không tồn tại → trang thông báo "Không tìm thấy bài" + link về Lộ trình (một kiểu 404 duy nhất).

**Given** giáo trình cần mở rộng sau này
**When** thêm file `content/phase-2.ts` và đăng ký
**Then** lộ trình hiển thị giai đoạn mới mà không sửa component nào (FR-2, SM-3 — kiểm bằng review cấu trúc, không cần build GĐ2 thật).

### Story 2.2: Video YouTube trong bài học

As a người mới hoàn toàn,
I want xem video hướng dẫn tiếng Việt (kèm video tiếng Anh có tóm tắt) ngay trong bài,
So that tôi nhìn được động tác thật thay vì chỉ đọc chữ.

**Acceptance Criteria:**

**Given** data video theo type `{youtubeId, lang, title, note?}` (note bắt buộc khi lang='en' — AR-7) và toàn bộ video đã verify từ addendum B gắn đúng bài (cầm dùi → Việt Thương/Tran Tin/Duy Phan; bộ trống → Việt Thương/Soul/Pong Ơi; metronome → GIAO DRUM + EN; stick control → Pong Ơi/Duy Phan/Drumeo)
**When** mở một bài có video
**Then** `ui/VideoEmbed` render khung 16:9 với thumbnail `i.ytimg.com` + nút play + badge VI/EN, video VI đứng trước theo thứ tự data — component không sort (FR-5, UX-DR6)
**And** iframe YouTube chỉ mount sau khi click (NFR-5); video EN hiển thị note tóm tắt tiếng Việt bên dưới.

**Given** một video bị gỡ/lỗi tải
**When** click play mà iframe/thumbnail lỗi
**Then** khung fallback hiển thị thông báo + link mở tìm kiếm YouTube với từ khóa của bài — không bao giờ khung xám trống (NFR-5, UX-DR9).

### Story 2.3: Sơ đồ bộ trống tương tác

As a người mới hoàn toàn,
I want click từng bộ phận trên sơ đồ bộ trống để xem tên, vai trò và nghe âm thanh thật của nó,
So that tôi phân biệt được snare với tom bằng tai trước khi ngồi vào trống thật.

**Acceptance Criteria:**

**Given** bài "Làm quen bộ trống" và component `ui/DrumMap` — SVG tự vẽ flat theo token `drum-map` (UX-DR7)
**When** click một trong 6 vùng (snare, tom, kick, hi-hat, crash, ride)
**Then** vùng active đổi fill amber-dim + viền amber-bright, panel (style card, bên phải desktop / dưới mobile) hiển thị tên + vai trò tiếng Việt, và âm thanh mẫu phát đúng một lần không loop (FR-6)
**And** âm mẫu là file tự host trong `public/sounds/` (miễn phí bản quyền — AR-7), phát qua AudioContext dùng chung của `core/audio` (AR-4).

**Given** desktop
**When** hover một vùng (chưa click)
**Then** chỉ viền đổi amber, không phát âm (UX-DR7).

**Given** một file âm thanh tải lỗi
**When** click vùng đó
**Then** vẫn highlight + hiện panel bình thường, im lặng — không báo lỗi chặn (UX-DR7)
**And** không có âm thanh nào autoplay khi mở trang (UX-DR11).

### Story 2.4: Khối luyện tập stick control trong bài

As a người tự học trống,
I want pattern R/L chạy sáng theo đúng tick metronome ngay trong bài tập,
So that tôi nhìn màn hình từ xa và tập single/double stroke, paradiddle đúng nhịp.

**Acceptance Criteria:**

**Given** bài tập stick control trong content có pattern (R/L), tempo mục tiêu và ghi chú kỹ thuật (AR-3) — tối thiểu: single stroke, double stroke, paradiddle (FR-12)
**When** mở bài tập
**Then** khối luyện tập render: `ui/PatternGrid` (ô R amber / L teal, 56px đậm — đọc được từ ~2m, luôn kèm chữ cái không chỉ màu — UX-DR5) + `ui/MetronomeBlock` nhúng (FR-11) + dòng tempo mục tiêu ("sạch ở 60 → nâng dần 80") + ghi chú kỹ thuật (FR-14 hiển thị)
**And** mount theo AD-8: engine không chạy → set tempo bắt đầu của bài; đang chạy → giữ tempo hiện tại.

**Given** metronome đang chạy
**When** quan sát PatternGrid
**Then** ô hiện tại highlight (nền overlay + viền amber-bright) tiến đúng theo beat event `{bar, beatInBar}` của engine — UI không tự đếm tick (AR-4), pattern loop vô hạn đến khi dừng (FR-13)
**And** đổi tempo giữa chừng không làm con trỏ nhảy sai ô.

**Given** viewport desktop ≥768px
**When** mở khối luyện tập
**Then** vùng pattern + beat dots + BPM chiếm ≥60% chiều cao viewport, phần chữ đẩy xuống dưới (UX-DR12)
**And** mobile <768px: cụm điều khiển tempo ghim đáy trong tầm ngón cái, pattern wrap 4 ô/hàng, chữ pattern 40px (token responsive).

## Epic 3: Tiến độ, streak và trang chủ "Hôm nay"

Người dùng bấm "Hoàn thành bài hôm nay" để tích checklist, nuôi streak, xem tiến độ tuần; trang chủ luôn trỏ sẵn bài kế tiếp; ghi "tempo tốt nhất"; export/import khi đổi máy.

### Story 3.1: Progress store + nút "Hoàn thành bài hôm nay"

As a người tự học trống,
I want đánh dấu hoàn thành bài và thấy checkmark trên lộ trình còn nguyên sau khi đóng trình duyệt,
So that tôi biết mình đã đi đến đâu.

**Acceptance Criteria:**

**Given** module `core/progress/` sở hữu key `drum-beginner:progress:v1` với envelope `{schemaVersion: 1, completedLessons, bestTempos, sessions}` (AR-5, không import React); mọi mutation qua API store; load phân biệt `empty | ok | corrupt`
**When** bấm nút primary "✓ Hoàn thành bài hôm nay" cuối trang bài học
**Then** `completedLessons[id]` ghi timestamp ISO (lần đầu — hoàn thành lại không đổi), `sessions` thêm một entry (chỉ ghi ở hành động này — AR-5), checkmark success hiện trên card lộ trình (FR-15, UX-DR8), không tự chuyển trang mà gợi ý bài kế tiếp
**And** reload trình duyệt: mọi trạng thái còn nguyên (FR-17).

**Given** localStorage ghi thất bại (mock)
**When** bấm Hoàn thành
**Then** UI giữ nguyên trạng thái, toast nhẹ "Chưa lưu được — thử lại", nút bấm lại được (UX-DR9)
**And** localStorage chứa dữ liệu corrupt khi mở app → cảnh báo + nút "Bắt đầu lại" (chỉ ghi đè khi user bấm) + gợi ý import file backup (UX-DR9).

**Given** bộ unit test cho `core/progress` (AR-10)
**When** `vitest run`
**Then** test xanh cho: selector `getStreak` (ngày distinct theo local timezone, không so chuỗi UTC trực tiếp), `getNextItem` (item chưa hoàn thành đầu tiên theo thứ tự lộ trình), `getWeekProgress` ("N/M" với M = tổng item của tuần), load 3 trạng thái.

### Story 3.2: Trang chủ "Hôm nay" + streak

As a người tự học trống,
I want mở web là thấy ngay hôm nay tập bài gì và chuỗi ngày tập của mình,
So that tôi vào buổi tập trong một cú click, có động lực giữ chuỗi.

**Acceptance Criteria:**

**Given** localStorage trống (lần đầu mở)
**When** vào `/`
**Then** một thẻ onboarding duy nhất: "Chào bạn! Bắt đầu với Tuần 1 · Bài 1" — không wizard nhiều bước (UX-DR9).

**Given** đã có tiến độ
**When** vào `/`
**Then** thẻ "Hôm nay" hiển thị bài tiếp theo (từ selector `getNextItem` — FR-3, không tự tính) + streak 🔥 + tiến độ tuần "Tuần 1 · 4/6 bài" (giọng điệu UX-DR10: xưng "bạn", số liệu thẳng)
**And** streak đứt hiển thị trung tính "Bắt đầu chuỗi mới hôm nay" — không chê (UX-DR10).

**Given** hoàn thành item cuối cùng của một tuần
**When** bấm Hoàn thành
**Then** khoảnh khắc "Xong Tuần N 🎉" hiển thị một lần (checkmark nảy nhẹ, progress bar chạy, không confetti kéo dài — UX-DR9)
**And** khi `prefers-reduced-motion`: chỉ đổi màu, không nảy.

### Story 3.3: Trang Tiến độ + ghi tempo tốt nhất

As a người tự học trống,
I want xem toàn cảnh tiến độ theo tuần và lưu kỷ lục tempo từng bài tập,
So that tôi thấy mình tiến bộ thật qua từng buổi.

**Acceptance Criteria:**

**Given** đã có tiến độ
**When** mở `/tien-do`
**Then** hiển thị checklist theo tuần (item + trạng thái — FR-15), lịch sử ngày tập + streak hiện tại (FR-16), progress bar tuần fill amber → success khi 100% (UX-DR8).

**Given** chưa có buổi tập nào
**When** mở `/tien-do`
**Then** empty state "Chưa có buổi tập nào — hoàn thành bài đầu tiên để bắt đầu chuỗi 🔥" + nút dẫn về bài 1 — không bảng rỗng vô hồn (UX-DR9).

**Given** đang ở khối luyện tập với metronome ở tempo T
**When** bấm "Ghi tempo tốt nhất: T"
**Then** `bestTempos[id]` = T qua API store (FR-14 — tự khai báo, một click), hiển thị lại ngay trong khối luyện tập ("Tempo tốt nhất của bạn: T") và trong `/tien-do`
**And** chỉ ghi khi T lớn hơn kỷ lục cũ; bằng/nhỏ hơn → giữ kỷ lục, thông báo nhẹ.

### Story 3.4: Export / Import tiến độ

As a người tự học trống,
I want tải tiến độ ra file JSON và nạp lại trên máy khác,
So that đổi máy/trình duyệt không mất công sức đã tích lũy.

**Acceptance Criteria:**

**Given** đã có tiến độ
**When** bấm "Xuất dữ liệu" trong `/tien-do`
**Then** tải file JSON đúng envelope `drum-beginner:progress:v1` (FR-17, AR-5).

**Given** file export hợp lệ từ máy khác
**When** bấm "Nhập dữ liệu" và chọn file
**Then** hiển thị xác nhận với tóm tắt ("12 bài hoàn thành, streak 9") trước khi ghi đè toàn bộ — không merge (AR-5, KF-3)
**And** sau xác nhận, mọi trang phản ánh dữ liệu mới ngay.

**Given** file không hợp lệ (JSON hỏng, thiếu trường, schemaVersion lạ)
**When** import
**Then** validate shape đầy đủ từ chối với thông báo lỗi cụ thể, dữ liệu hiện tại không bị đụng (UX-DR9, AR-5)
**And** unit test cho validator: hợp lệ / thiếu trường / sai kiểu / `{schemaVersion:1}` rỗng-nhưng-đúng-shape đều xử lý đúng (AR-10).
