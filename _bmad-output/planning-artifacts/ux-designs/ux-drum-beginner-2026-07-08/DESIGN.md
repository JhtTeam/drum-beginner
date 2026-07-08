---
name: "Drum Beginner — Sân khấu tối"
description: "Dark theme ánh đèn sân khấu cho website tự học trống: nền than đen, accent amber, tối ưu đọc từ xa khi ngồi ở dàn trống."
status: final
created: 2026-07-08
updated: 2026-07-08
sources:
  - ../../prds/prd-drum-beginner-2026-07-08/prd.md
  - ../../prds/prd-drum-beginner-2026-07-08/addendum.md
colors:
  surface-base: '#17171A'
  surface-raised: '#202024'
  surface-overlay: '#2A2A30'
  border-subtle: '#33333A'
  amber: '#FFB020'
  amber-bright: '#FFC94D'
  amber-dim: '#7A5A1A'
  text-primary: '#F2EFE9'
  text-secondary: '#A8A29E'
  text-muted: '#918B83'
  text-on-amber: '#1A1206'
  hand-right: '#FFB020'
  hand-left: '#5EC8D8'
  beat-inactive: '#3A3A42'
  success: '#4ADE80'
  danger: '#F87171'
  focus-ring: '#FFC94D'
typography:
  display-bpm:
    fontFamily: "'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: '96px'
    fontWeight: 700
    letterSpacing: '-0.02em'
  pattern-letter:
    fontFamily: "'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: '56px'
    fontWeight: 800
  h1:
    fontFamily: "'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: '32px'
    fontWeight: 700
    lineHeight: 1.25
  h2:
    fontFamily: "'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: '24px'
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: '16px'
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "'Be Vietnam Pro', system-ui, sans-serif"
    fontSize: '14px'
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: '6px'
  DEFAULT: '10px'
  lg: '16px'
  full: '9999px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '6': '24px'
  '8': '32px'
  '12': '48px'
  gutter: '24px'
  page-max-width: '1080px'
components:
  button-primary:
    background: '{colors.amber}'
    color: '{colors.text-on-amber}'
    hover-background: '{colors.amber-bright}'
    radius: '{rounded.DEFAULT}'
    height: '44px'
  button-secondary:
    background: 'transparent'
    border: '1px solid {colors.border-subtle}'
    color: '{colors.text-primary}'
    radius: '{rounded.DEFAULT}'
    height: '44px'
  card:
    background: '{colors.surface-raised}'
    border: '1px solid {colors.border-subtle}'
    radius: '{rounded.lg}'
    padding: '{spacing.6}'
  bpm-display:
    typography: '{typography.display-bpm}'
    color: '{colors.amber}'
  beat-dot:
    size: '20px'
    active-color: '{colors.amber-bright}'
    accent-scale: 1.4
    inactive-color: '{colors.beat-inactive}'
    radius: '{rounded.full}'
  pattern-cell:
    typography: '{typography.pattern-letter}'
    right-color: '{colors.hand-right}'
    left-color: '{colors.hand-left}'
    active-background: '{colors.surface-overlay}'
    active-outline: '2px solid {colors.amber-bright}'
    radius: '{rounded.DEFAULT}'
  progress-bar:
    track: '{colors.beat-inactive}'
    fill: '{colors.amber}'
    complete-fill: '{colors.success}'
    height: '8px'
    radius: '{rounded.full}'
  checklist-item:
    done-icon-color: '{colors.success}'
    pending-icon-color: '{colors.text-muted}'
  video-embed:
    aspect-ratio: '16 / 9'
    background: '{colors.surface-overlay}'
    border: '1px solid {colors.border-subtle}'
    radius: '{rounded.lg}'
    badge-background: '{colors.amber}'
    badge-color: '{colors.text-on-amber}'
  drum-map:
    region-fill: '{colors.surface-overlay}'
    region-stroke: '{colors.border-subtle}'
    region-hover-stroke: '{colors.amber}'
    region-active-fill: '{colors.amber-dim}'
    region-active-stroke: '{colors.amber-bright}'
    label-color: '{colors.text-secondary}'
  nav:
    height-desktop: '60px'
    height-mobile-tabbar: '56px'
    background: '{colors.surface-base}'
    border: '1px solid {colors.border-subtle}'
    item-color: '{colors.text-secondary}'
    item-active-color: '{colors.text-primary}'
    item-active-indicator: '2px solid {colors.amber}'
---

# Drum Beginner — Sân khấu tối

## Brand & Style

Website là **phòng tập buổi tối có ánh đèn sân khấu ấm**: nền than đen lùi về sau, nội dung đang luyện — số BPM, pattern R/L, chấm nhịp — bắt sáng amber như được rọi đèn. Aesthetic phục vụ một tình huống duy nhất: người tập ngồi ở dàn trống, màn hình cách ~2 mét, cần liếc là thấy. Vì vậy: ít yếu tố trên màn hình, cái gì đang "sống" (beat hiện tại, ô pattern đang chạy) phải là thứ sáng nhất. Không trang trí thừa, không gradient ồn ào — năng lượng đến từ chuyển động đúng nhịp, không phải từ hiệu ứng.

## Colors

- `{colors.surface-base}` — nền toàn trang, than đen hơi ấm (không phải đen tuyền, đỡ mỏi mắt buổi tối). Không dùng làm nền component.
- `{colors.surface-raised}` / `{colors.surface-overlay}` — card và lớp nổi (modal, dropdown). Phân tầng bằng tông, không bằng bóng đổ đậm.
- `{colors.amber}` — màu thương hiệu duy nhất: hành động chính, số BPM, tiến độ, tay phải (R). Dùng tiết chế — mỗi màn hình chỉ một vùng amber lớn.
- `{colors.amber-bright}` — trạng thái "đang sống": beat hiện tại, ô pattern active, hover, focus ring. Sáng hơn amber thường để chuyển động nhịp nổi bật.
- `{colors.hand-left}` — teal lạnh, chỉ dành cho ký hiệu tay trái (L) trong pattern, đối trọng nhiệt độ với amber của tay phải (R). Không dùng cho bất kỳ mục đích nào khác.
- `{colors.amber-dim}` — amber trầm cho vùng nhấn tĩnh cường độ thấp: viền trái khối ghi chú kỹ thuật, nền vùng active của sơ đồ trống. Không dùng cho phần tử tương tác chính.
- `{colors.focus-ring}` — viền focus bàn phím trên mọi phần tử tương tác (cùng giá trị amber-bright, tách token để đổi độc lập nếu cần).
- `{colors.success}` — chỉ cho hoàn thành: checkmark bài đã xong, progress bar đầy, streak.
- `{colors.danger}` — chỉ cho hành động phá hủy (reset tiến độ) và lỗi.
- Chữ ba cấp: `{colors.text-primary}` (nội dung), `{colors.text-secondary}` (phụ đề, nhãn), `{colors.text-muted}` (metadata). Không dùng amber cho chữ dài.

## Typography

Một font duy nhất: **Be Vietnam Pro** (Google Fonts, hỗ trợ đầy đủ dấu tiếng Việt, self-host trong repo). Vai trò:

- `{typography.display-bpm}` — số BPM, dùng tabular numerals (`font-variant-numeric: tabular-nums`) để số không nhảy ngang khi thay đổi.
- `{typography.pattern-letter}` — chữ R/L trong bài tập stick control; đậm nhất trang, đọc được từ 2 m (yêu cầu FR-12 của PRD).
- `{typography.h1}` / `{typography.h2}` — tiêu đề trang / khối.
- `{typography.body}` / `{typography.small}` — nội dung bài học và metadata. Body tối thiểu 16px; line-height 1.6 vì tiếng Việt có dấu chồng cao.

## Layout & Spacing

Thang 4px (`{spacing.1}` → `{spacing.12}`). Nội dung gói trong container `{spacing.page-max-width}` căn giữa, gutter `{spacing.gutter}`. Trang bài học một cột (đọc tuần tự); trang luyện tập ưu tiên vùng pattern + metronome chiếm ≥ 60% chiều cao viewport, phần chữ hướng dẫn đẩy xuống dưới. Breakpoint chính: 768px (mobile ↓ / desktop ↑).

## Elevation & Depth

Phân tầng chủ yếu bằng tông nền (base → raised → overlay) + viền `{colors.border-subtle}`. Bóng đổ chỉ một mức, dành cho overlay: `0 8px 24px rgba(0,0,0,0.4)`. Không dùng bóng cho card thường.

## Shapes

Bo góc mềm vừa: card `{rounded.lg}`, nút và ô pattern `{rounded.DEFAULT}`, chấm nhịp và progress bar `{rounded.full}`. Không có góc vuông sắc — không khí phòng nhạc, không phải dashboard tài chính.

## Components

- **button-primary** — nền amber, chữ tối `{colors.text-on-amber}`; mỗi màn hình tối đa một nút primary ("Bắt đầu", "Hoàn thành bài hôm nay").
- **bpm-display** — số BPM khổng lồ màu amber, luôn kèm nhãn "bpm" nhỏ `{colors.text-secondary}` bên cạnh.
- **beat-dot** — hàng chấm tròn theo số phách; phách hiện tại chuyển `{components.beat-dot.active-color}` và phóng to, kèm glow `0 0 16px` amber mờ — ngoại lệ chủ đích duy nhất của luật "bóng chỉ dành cho overlay" (Elevation), vì beat active phải là thứ sáng nhất màn hình; phách 1 (accent) to hơn 1.4× các phách thường ngay cả khi không active.
- **pattern-cell** — ô chữ R (amber) / L (teal); ô đang chạy có nền `{colors.surface-overlay}` + viền `{colors.amber-bright}`. Grid 4 hoặc 8 ô mỗi hàng khớp với số phách.
- **progress-bar** — track tối, fill amber; khi đạt 100% chuyển `{colors.success}`.
- **card** — khối bài học/bài tập trong lộ trình; trạng thái hoàn thành có checkmark `{colors.success}` góc phải trên.
- **video-embed** — khung 16:9 nền `{colors.surface-overlay}` với thumbnail + nút play (click-to-load, NFR-5 của PRD); badge ngôn ngữ "VI"/"EN" góc trái trên, nền `{components.video-embed.badge-background}`.
- **checklist-item** — dòng bài học trong lộ trình/tiến độ: icon tròn trái (done: `{colors.success}`, chưa: `{colors.text-muted}`), tên bài `{typography.body}`, gạch ngang nhẹ khi hoàn thành thì KHÔNG dùng — bài xong vẫn đọc được bình thường, chỉ khác icon.
- **drum-map** — sơ đồ bộ trống **SVG tự vẽ, flat** (quyết định OQ-2 của PRD): 6 vùng path (snare, tom, kick, hi-hat, crash, ride) fill `{components.drum-map.region-fill}`, viền `{components.drum-map.region-stroke}`; hover đổi viền `{colors.amber}`; active fill `{colors.amber-dim}` + viền `{colors.amber-bright}`; nhãn tên đặt cạnh từng vùng màu `{colors.text-secondary}`. Panel thông tin bên phải (desktop) / dưới (mobile) dùng style **card**.
- **nav** — header ngang 60px (desktop) sticky top, nền `{colors.surface-base}` + viền dưới `{colors.border-subtle}`; item active: chữ `{colors.text-primary}` + gạch chân 2px `{colors.amber}`. Mobile: bottom tab bar 56px ghim đáy, 4 mục, item active màu `{colors.amber}`.

Minh họa tổng thể ngôn ngữ thị giác: [mockups/mock-bai-hoc-luyen-tap.html](./mockups/mock-bai-hoc-luyen-tap.html) — trang bài học + khối luyện tập, dùng đúng token ở frontmatter. Spine này thắng nếu mock mâu thuẫn.

## Do's and Don'ts

- ✅ Beat hiện tại và ô pattern active luôn là thứ sáng nhất màn hình khi metronome chạy.
- ✅ R luôn amber, L luôn teal — nhất quán tuyệt đối ở mọi nơi pattern xuất hiện, kèm chữ cái (không bao giờ chỉ dùng màu).
- ✅ Số BPM dùng tabular-nums; thay đổi tempo không được làm layout nhảy.
- ❌ Không dùng amber cho đoạn văn dài hoặc quá một vùng nhấn mỗi màn hình.
- ❌ Không animation trang trí không gắn với nhịp; mọi chuyển động khi metronome chạy phải đồng bộ với tick.
- ❌ Không nền trắng sáng đột ngột (kể cả modal) — giữ không khí phòng tối xuyên suốt.
