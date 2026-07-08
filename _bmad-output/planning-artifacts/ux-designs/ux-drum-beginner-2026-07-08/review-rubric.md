# Spine Pair Review — drum-beginner

**Ngày review:** 2026-07-08 · **Phạm vi:** DESIGN.md + EXPERIENCE.md + mockups/mock-bai-hoc-luyen-tap.html, đối chiếu prd.md + addendum.md · **Hiệu chỉnh mức độ:** dự án hobby cá nhân, dark-theme-only là quyết định chủ đích, spine viết tiếng Việt (override đã log).

## Overall verdict

Cặp spine **đạt để tiêu thụ downstream sau khi vá 2 điểm high** — về mặt cơ học rất sạch: 100% tham chiếu `{path.to.token}` resolve, mọi màu có hex, mọi FR của PRD map được vào đúng surface, tên UJ/FR trích verbatim, mock không mồ côi và "spine thắng" được tuyên bố rõ. Hai lỗ hổng thực sự chặn source-extraction: (1) sơ đồ bộ trống (FR-6) có hành vi nhưng **không có spec thị giác nào** trong DESIGN.md và câu hỏi mở OQ-2 (SVG hay ảnh hotspot) — PRD giao cho chính bước UX quyết — vẫn chưa chốt; (2) `text-muted` chỉ đạt ~3.3:1 trên `surface-base`, mâu thuẫn với chính contrast floor ≥ 4.5:1 mà EXPERIENCE.md cam kết. Phần còn lại là mài giũa mức hobby.

## 1. Flow coverage — strong

Đã trích toàn bộ UJ/FR từ nguồn: PRD chỉ có một hành trình (UJ-1); EXPERIENCE.md có 3 Key Flows. KF-1 map verbatim "Buổi tập 30 phút của Anhndt (từ PRD UJ-1)", có nhân vật, 6 bước đánh số, climax đánh dấu rõ (bước 5), chi tiết khớp addendum (video Pong Ơi B4, streak, 3/6 → 4/6). KF-2 phủ onboarding + FR-6, KF-3 phủ FR-17. Không FR nào thiếu chỗ đứng: FR-1…FR-17, NFR-1/2/5 đều được trích đúng số tại IA/Component Patterns/section đồng bộ âm-hình.

### Findings
- **low** KF-2 và KF-3 không đánh số bước và KF-3 không có nhân vật được nêu tên; failure path của KF-3 (import JSON lỗi) tồn tại ở State Patterns nhưng flow không trỏ tới (EXPERIENCE.md, KF-2/KF-3). *Fix:* đánh số bước hai flow ngắn này và thêm một dòng "Failure: file không hợp lệ → xem State Patterns" vào KF-3.
- **low** KF-1 không có failure path inline; với sản phẩm không backend, rủi ro thật duy nhất là localStorage ghi thất bại khi bấm "Hoàn thành" — chưa nói ở đâu (EXPERIENCE.md KF-1). *Fix:* một câu ở State Patterns là đủ (giữ trạng thái UI, báo nhẹ, thử lại).

## 2. Token completeness — adequate

Đã trích 17 color tokens (tất cả có hex ✓), 6 vai trò typography, 4 mức rounded, 9 spacing, 8 component tokens. Toàn bộ ~40 tham chiếu `{path.to.token}` trong frontmatter components và prose (kể cả `{components.beat-dot.active-color}`) resolve đúng cấu trúc YAML — **không có tham chiếu gãy nào**. Contrast target (≥ 4.5:1 trên surface-base/raised) được tuyên bố ở EXPERIENCE.md Accessibility Floor. Kiểm tra tính toán các cặp chịu tải: text-primary ~15:1 ✓, text-secondary ~7.1:1 (base) / ~6.4:1 (raised) ✓, amber trên base ~9.7:1 ✓, text-on-amber trên amber ~10:1 ✓, hand-left teal ~9:1 ✓ — trừ một ngoại lệ dưới đây.

### Findings
- **high** `text-muted` `#6E6862` chỉ đạt ~3.3:1 trên `surface-base` và ~3.0:1 trên `surface-raised`, dưới floor ≥ 4.5:1 mà spine tự cam kết; token này lại dùng cho breadcrumb, hint phím tắt 13px, metadata — đúng loại chữ nhỏ (DESIGN.md dòng 20 / EXPERIENCE.md Accessibility Floor dòng 68; mock dùng ở `.breadcrumb`, `.hint`, `.target`). Consumer không thể vừa dùng token vừa đạt floor. *Fix:* nâng text-muted lên khoảng `#8B857E` trở lên, HOẶC ghi rõ trong DESIGN.md Colors rằng text-muted chỉ dành cho phần tử trang trí/không thiết yếu với mục tiêu 3:1 — nhưng khi đó phải đổi màu hint phím tắt và target tempo sang text-secondary.
- **low** `amber-dim` được định nghĩa nhưng không có story trong section Colors và không component nào tham chiếu; mock lại dùng nó (border-left của `.note-tech`) — consumer extract sẽ không biết nó để làm gì (DESIGN.md dòng 17, mock dòng 108). *Fix:* thêm một dòng vào Colors ("viền nhấn phụ cho khối ghi chú") hoặc xóa token.
- **low** `focus-ring` có trong frontmatter và được EXPERIENCE.md dùng, nhưng section Colors của DESIGN.md không nhắc; contrast target cũng chỉ sống ở EXPERIENCE.md chứ DESIGN.md không nêu (DESIGN.md Colors). *Fix:* một dòng cho focus-ring trong Colors; giữ contrast floor ở EXPERIENCE là chấp nhận được, chỉ cần nhất quán sau khi vá finding high ở trên.

## 3. Component coverage — adequate

Đã lập bảng chéo: DESIGN.md có button-primary, button-secondary, card, bpm-display, beat-dot, pattern-cell, progress-bar, checklist-item (frontmatter) + video-embed (body); EXPERIENCE.md có Metronome, Khối luyện tập, Sơ đồ bộ trống, Video nhúng, Đánh dấu hoàn thành — đều là luật thật, không phải mô tả một từ. Vòng lặp luyện tập cốt lõi (metronome + pattern + hoàn thành) được phủ hai chiều xuất sắc. Lỗ hổng nằm ở rìa.

### Findings
- **high** Sơ đồ bộ trống (FR-6) có spec hành vi đầy đủ trong EXPERIENCE.md nhưng **zero spec thị giác** trong DESIGN.md — không có component row, không màu highlight, không style panel tên/vai trò; đồng thời OQ-2 của PRD ("SVG tự vẽ hay ảnh hotspot — quyết định lúc làm UX, chủ sở hữu: bước bmad-ux") vẫn chưa được chốt dù đây chính là bước phải chốt. Surface này lại là spine-only (không mock), nghĩa là spine là nguồn duy nhất — và spine đang thiếu (EXPERIENCE.md Component Patterns "Sơ đồ bộ trống"; PRD §7 OQ-2). *Fix:* chốt OQ-2 (khuyến nghị SVG tự vẽ — khớp token dark theme, dễ highlight bằng `amber-bright`) và thêm component `drum-map` vào DESIGN.md: màu vùng mặc định/hover/active, style panel thông tin.
- **medium** Lệch hai chiều giữa frontmatter và body Components: `checklist-item` có token nhưng vắng trong body prose; `video-embed` có prose (16:9, badge VI/EN, click-to-load) nhưng không có token frontmatter — consumer extract theo một trong hai phía sẽ thiếu một component (DESIGN.md dòng 113–115 vs dòng 156–164). *Fix:* thêm dòng checklist-item vào body và block video-embed vào frontmatter.
- **medium** Header cố định (desktop) / bottom tab bar (mobile) là component điều hướng thật, được IA và Responsive nhắc đích danh, nhưng không có row thị giác lẫn hành vi ở cả hai spine (trạng thái active? chiều cao tab bar? sticky?); mock minh họa header nhưng "spine thắng" nghĩa là không có gì được cam kết (EXPERIENCE.md IA + Responsive; mock dòng 114–123). *Fix:* một row "nav" mỗi spine: active = text-primary + gạch chân amber (như mock), tab bar ghim đáy, item active màu amber.
- **low** Tempo mặc định khi mở metronome chưa chốt (FR-7 chỉ nói "vùng luyện 60–80"); story-dev sẽ phải tự bịa (EXPERIENCE.md Component Patterns "Metronome"). *Fix:* một chữ — "mặc định 60".

## 4. State coverage — adequate

Đã duyệt từng surface: Trang chủ (lần đầu mở ✓, có bài kế tiếp ✓), Bài học (video hỏng ✓, đang luyện ✓, hoàn thành ✓ + hoàn thành tuần ✓), toàn cục (localStorage hỏng ✓, import lỗi ✓, focus ring ✓, reduced-motion ✓, tab ẩn ✓ — section đồng bộ âm-hình xử lý đúng edge khó nhất). Lộ trình render từ data tĩnh nên không có empty state thật. Streak đứt được xử lý ở Voice and Tone với giọng trung tính — tốt.

### Findings
- **medium** Surface Tiến độ chưa có cold state: chưa hoàn thành bài nào thì checklist, lịch sử ngày tập và streak 0 hiển thị gì? Đây là surface duy nhất sống hoàn toàn bằng dữ liệu user mà lại không có empty state (EXPERIENCE.md State Patterns vs IA surface 5). *Fix:* một dòng — vd. "Chưa có buổi tập nào — hoàn thành bài đầu tiên để bắt đầu chuỗi 🔥".
- **low** Âm thanh mẫu của sơ đồ trống (file trong repo, PRD A4) không có fallback khi tải lỗi, trong khi video có fallback đầy đủ (EXPERIENCE.md Component Patterns "Sơ đồ bộ trống"). *Fix:* click vẫn highlight + panel, kèm ghi chú im lặng nếu audio lỗi.

## 5. Visual reference coverage — strong

`mockups/` có đúng 1 file `mock-bai-hoc-luyen-tap.html`; được link inline ở cả hai spine đúng chỗ (DESIGN.md cuối Components, EXPERIENCE.md IA surface 3), cả hai đều nêu rõ nó minh họa gì ("trang bài học + khối luyện tập") và "spine thắng nếu mock mâu thuẫn". `imports/` rỗng, không có `wireframes/` — không mock mồ côi, không tham chiếu mơ hồ. Các surface không có mock được khai báo tường minh là spine-only kèm ghi chú đã log quyết định. Đối chiếu mock với token: khớp gần như tuyệt đối (kể cả accent dot 28px = 20px × 1.4).

### Findings
- **low** Mock cho beat dot active một glow `box-shadow 0 0 16px` trong khi DESIGN.md Elevation tuyên bố "bóng đổ chỉ một mức, dành cho overlay" — spine thắng nên glow sẽ bị loại, nhưng glow lại phục vụ đúng luật "beat hiện tại sáng nhất màn hình" (mock dòng 83 vs DESIGN.md Elevation & Depth). *Fix:* hợp thức hóa — thêm vào beat-dot một ngoại lệ "glow amber khi active, không tính là elevation", hoặc bỏ glow khỏi mock.

## 6. Bloat & overspecification — strong

Cả hai file gọn đúng tầm hobby: DESIGN.md ~175 dòng, EXPERIENCE.md ~93 dòng, không section nào lặp thông tin của nhau (phân công "thị giác ở DESIGN / hành vi ở EXPERIENCE" được tuyên bố và tuân thủ). `[ASSUMPTION]` được gắn nhãn đúng chỗ (tự viết component, metronome không chạy xuyên trang, không PWA) thay vì đặc tả thừa. Không có finding.

## 7. Inheritance discipline — strong

Cả hai `sources` resolve đúng (`../../prds/prd-drum-beginner-2026-07-08/prd.md` + `addendum.md` tồn tại). Trích dẫn FR/NFR/UJ/SM đúng số và đúng nội dung ở mọi chỗ kiểm (FR-1/2/3/4/5/6/8/11/13/14/15/16/17, NFR-1/2/5, SM-1, UJ-1 verbatim). Dải tempo 40–200, ô nhịp 2/4·3/4·4/4, ±1/±5, Space/tap khớp FR-7/9/10. Video trong flow (Pong Ơi, Việt Thương) tồn tại trong addendum B2/B4. Mọi tham chiếu token từ EXPERIENCE.md (`{components.beat-dot}`, `{components.bpm-display}`, `{components.pattern-cell}`, `{components.button-primary.height}`, `{colors.focus-ring}`, `{colors.surface-base}`, `{colors.surface-raised}`, `{typography.pattern-letter}`) resolve theo tên vào DESIGN.md. UX patterns từ addendum §A (BPM to, tap tempo, ±5, streak, "học tiếp từ chỗ dừng") đều được tiêu hóa.

### Findings
- **low** EXPERIENCE.md frontmatter dùng khóa `title` trong khi quy ước example dùng `name` (EXPERIENCE.md dòng 2). *Fix:* đổi `title` → `name` cho consumer parse đồng nhất.

## 8. Shape fit — strong

DESIGN.md đúng thứ tự canonical đầy đủ 8 section: Brand & Style → Colors → Typography → Layout & Spacing → Elevation & Depth → Shapes → Components → Do's and Don'ts. EXPERIENCE.md có đủ các default: Foundation, IA, Voice and Tone, Component Patterns, State Patterns, Interaction Primitives, Accessibility Floor, Responsive & Platform, Key Flows. Section tự chế "Đồng bộ âm thanh – hình ảnh" **xứng đáng chỗ đứng** — đây là concern sản phẩm số một (ngân sách lệch ≤ 50ms, tab ẩn, âm thanh là nguồn chân lý) mà không default nào chứa được.

### Findings
- **low** Thiếu section "Inspiration & Anti-patterns" dù addendum §A có sẵn digest comparables; các pattern đã bác (chấm điểm qua mic kiểu Melodics, gamification XP kiểu Drumeo) hiện chỉ sống trong PRD out-of-scope — architecture/story-dev đọc spine sẽ không thấy ranh giới "cố tình không làm" (EXPERIENCE.md, so với experience-example-shadcn.md). *Fix:* 4–5 bullet "Lifted from / Rejected" là đủ.

## Mechanical notes

- **Không có tham chiếu gãy:** toàn bộ `{path.to.token}` (frontmatter + prose, 2 file) resolve; link mock 2 chiều resolve; sources 2 file resolve.
- **Tên nhất quán:** component names khớp giữa frontmatter ↔ body ↔ EXPERIENCE ↔ mock class (r/l/active/dot/accent), trừ cặp lệch checklist-item/video-embed đã nêu ở §3. Nav 4 mục nhất quán giữa mock header, IA và bottom tab bar (Bài học đúng là không có tab riêng — vào qua Lộ trình).
- **Frontmatter:** DESIGN.md đủ name/description/status/dates/sources; EXPERIENCE.md dùng `title` thay `name` (finding 7). Cả hai đang `status: draft` trong khi PRD `final` — nếu cặp spine này là contract chính thức cho architecture thì nâng lên `final` sau khi vá 2 finding high.
- **Số liệu khớp chéo đáng khen:** mock BPM 96px/700/-0.02em + tabular-nums, cell 56px/800, dot 20px/accent 28px, btn 44px, radius 6/10/16/9999, max-width 1080, gutter 24 — tất cả đúng từng giá trị với frontmatter DESIGN.md.
- **Tổng findings:** 0 critical · 2 high · 3 medium · 8 low.
