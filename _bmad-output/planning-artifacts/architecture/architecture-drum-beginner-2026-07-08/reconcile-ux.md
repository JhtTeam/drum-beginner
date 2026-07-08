---
name: 'reconcile-ux — drum-beginner'
type: reconciliation-notes
status: draft
created: '2026-07-08'
sources:
  - ./ARCHITECTURE-SPINE.md
  - ../../ux-designs/ux-drum-beginner-2026-07-08/DESIGN.md
  - ../../ux-designs/ux-drum-beginner-2026-07-08/EXPERIENCE.md
---

# Đối soát UX ↔ Architecture Spine

Mục tiêu: tìm cam kết UX (DESIGN.md + EXPERIENCE.md) **không có chỗ đứng kiến trúc** trong ARCHITECTURE-SPINE.md — nơi hai dev agent có thể triển khai lệch nhau. Chỉ ghi khoảng trống thật; chi tiết đúng ra thuộc về code thì không tính (danh sách đã loại ở cuối file).

---

## GAP-1 — Khối metronome dùng chung (surface 3 & 4) không có nhà

**Cam kết UX:** EXPERIENCE.md IA ("khối metronome tái sử dụng ở surface 3 và 4") + Component Patterns: cùng một khối hành vi — start/stop, tempo 40–200 mặc định 60, ±1/±5, tap tempo, chọn nhịp 2/4·3/4·4/4, đổi tempo có hiệu lực từ ô nhịp kế tiếp, rời trang thì dừng & giải phóng audio — cộng Interaction Primitives (Space/↑↓/Shift/T, không cướp phím khi focus ở input) áp cho **cả hai** surface.

**Spine hiện có:** AD-3 chỉ định `MetronomeEngine` trong `core/audio/` (phần logic đã có nhà). Nhưng ở tầng UI:
- Đồ thị phụ thuộc AD-1 **không có cạnh `features → features`** — `features/metronome` và `features/practice` không được import lẫn nhau.
- Structural Seed cho `ui/` chỉ liệt kê `BeatDots`, `PatternGrid`… — **không có** component điều khiển metronome dùng chung (BPM display + transport + tempo controls + time signature) và **không có** hook phím tắt dùng chung.
- Spine cũng không nói `MetronomeEngine` là **một instance** dùng chung hay mỗi feature tự `new` (AD-3 chỉ nói "một class duy nhất" và "một AudioContext duy nhất" — hai cách đọc đều hợp lệ).

**Rủi ro phân kỳ:** dev agent A làm `features/metronome` tự viết cụm điều khiển + bind phím; dev agent B làm `features/practice` viết bản thứ hai — lệch nhau ở mặc định 60 bpm, hành vi Shift+↑, quy tắc "không cướp phím ở input", và lifecycle dừng-khi-rời-trang. Đây là đúng loại trùng lặp mà spine tồn tại để chặn.

**Đề xuất vá (một dòng vào spine là đủ):** thêm vào Structural Seed / AD-3: khối UI metronome (điều khiển + hiển thị + hook phím tắt, ví dụ `ui/MetronomeBlock` hoặc `features/metronome/` export block cho practice — chọn một) là **nơi duy nhất** hiện thực Interaction Primitives; engine instance được tạo/own ở một chỗ (module-level singleton trong `core/audio/` hoặc context ở `app/`) và ghi rõ.

---

## GAP-2 — Tab ẩn: cam kết "âm tiếp tục đúng nhịp" mâu thuẫn với timer ~25ms của AD-3

**Cam kết UX:** EXPERIENCE.md "Đồng bộ âm thanh – hình ảnh": *"Tab bị ẩn (background): âm tiếp tục đúng nhịp; visual bắt kịp lại ngay khi tab hiện — không dồn frame animation."*

**Spine hiện có:** AD-3 chốt lookahead "timer tick ~25ms lên lịch trước ~100ms". Vấn đề kỹ thuật thật: trình duyệt **throttle timer của tab ẩn xuống ≥ 1s** (Chrome còn gom vào chunk 1 phút). Timer 25ms + lookahead 100ms ⇒ khi tab ẩn, hàng đợi âm thanh cạn và metronome khựng — vi phạm trực tiếp cam kết UX **và** NFR-2 (±2ms). Spine không nói gì về tình huống này, trong khi đây là quyết định kiến trúc (không phải chi tiết code): hoặc chạy timer lên lịch trong **Web Worker** (worker không bị throttle như main thread), hoặc tăng lookahead khi `document.hidden`, hoặc chấp nhận dừng khi ẩn tab (nhưng thế thì phải sửa EXPERIENCE.md).

**Rủi ro phân kỳ:** một dev làm đúng theo chữ AD-3 và ship bug tab-ẩn; dev khác tự chế worker ngoài spine. Cả hai đều "đúng spine".

**Đề xuất vá:** AD-3 thêm một câu: timer lên lịch chạy trong Web Worker (hoặc cơ chế chống throttle tương đương) để giữ nhịp khi `document.hidden`; visual resync theo beat event mới nhất khi tab hiện lại, không replay frame cũ.

---

## GAP-3 — Accessibility Floor không được bind vào bất kỳ AD / convention nào

**Cam kết UX:** EXPERIENCE.md "Accessibility Floor" là một **sàn hành vi** có 6 điều khoản: contrast ≥ 4.5:1, không mã hóa chỉ bằng màu, focus ring `{colors.focus-ring}` trên mọi phần tử tương tác + điều hướng bàn phím đủ mọi flow, không autoplay âm thanh, `prefers-reduced-motion` (tắt nảy/phóng to nhưng **giữ đổi màu beat**), touch target ≥ 44px.

**Spine hiện có:** không có AD nào, không có dòng nào trong Consistency Conventions, không có mục test nào (hàng Test chỉ bắt buộc unit test `core/`) nhắc tới accessibility. AD-5 chỉ lo token → CSS var, không lo *cách dùng* (focus-visible, reduced-motion).

**Vì sao không phải "chi tiết code":** riêng lẻ từng điều là code detail, nhưng **sàn xuyên suốt mọi component thì cần một chỗ neo**, nếu không mỗi dev agent tự quyết có làm hay không. Đặc biệt hai điểm giao với kiến trúc:
- `prefers-reduced-motion` giao thẳng với AD-3: visual beat vẽ theo engine event — biến thể reduced-motion (đổi màu, không scale/glow) phải được hiện thực **một lần** ở component beat/pattern dùng chung, không phải per-page.
- Focus ring: cần quy ước toàn cục (một rule `:focus-visible` trong styles chung dùng `--color-focus-ring`), nếu không mỗi CSS module tự chế.

**Rủi ro phân kỳ:** feature làm sau không biết sàn này tồn tại (spine là build-substrate, dev agent đọc spine chứ không chắc đọc lại EXPERIENCE.md từng dòng); reduced-motion được làm ở trang này mà không ở trang kia.

**Đề xuất vá:** thêm một hàng Consistency Conventions: "Accessibility — sàn EXPERIENCE.md 'Accessibility Floor' bind mọi UI: `:focus-visible` toàn cục dùng `--color-focus-ring` (định nghĩa một lần trong `styles/`), `prefers-reduced-motion` xử lý tại component chuyển động dùng chung (BeatDots, PatternGrid, checkmark), touch target ≥ 44px, không autoplay."

---

## GAP-4 — Hợp đồng localStorage hỏng-khi-load và ghi-thất-bại chưa vào API của store

**Cam kết UX:** EXPERIENCE.md State Patterns:
- localStorage hỏng/không parse được: **giữ nguyên dữ liệu hỏng**, cảnh báo + nút "Bắt đầu lại" — chỉ ghi đè khi user bấm; gợi ý import backup.
- Ghi thất bại khi bấm "Hoàn thành": giữ nguyên UI, toast "Chưa lưu được — thử lại", nút bấm lại được.

**Spine hiện có:** AD-4 chốt owner + envelope + validate `schemaVersion` **khi import**, nhưng không nói gì về đường **load lúc khởi động**. Convention "Lỗi & trạng thái" ("store trả kết quả tường minh") che được vế ghi-thất-bại ở mức nguyên tắc. Còn thiếu: store phải phân biệt được ba trạng thái khởi động — *trống* (onboarding), *hợp lệ*, *hỏng* (giữ raw data, chờ user quyết) — và "Bắt đầu lại" là mutation ghi đè có chủ đích. Đây là **hình dạng API công khai của `core/progress/`** (kết quả load là union 3 nhánh; mutation ghi trả kết quả thành/bại), tức thuộc spine chứ không phải chi tiết bên trong feature.

**Rủi ro phân kỳ:** dev hiện thực store theo phản xạ phổ biến — parse lỗi thì `catch` và reset về mặc định (mất dữ liệu, vi phạm trực tiếp "chỉ ghi đè khi user bấm"); hoặc để throw xuyên lên UI (vi phạm convention Lỗi).

**Đề xuất vá:** AD-4 thêm một câu: load trả `{ status: 'empty' | 'ok' | 'corrupt' }` (corrupt giữ nguyên key, không tự ghi đè); mọi mutation ghi trả kết quả thành/bại tường minh để UI làm toast + retry theo EXPERIENCE State Patterns.

---

## GAP-5 (nhỏ) — Breakpoint 768px và biến thể token responsive nằm ngoài phạm vi AD-5

**Cam kết UX:** DESIGN.md + EXPERIENCE.md dùng **một breakpoint duy nhất 768px** làm trục mobile/desktop (nav đổi dạng, layout luyện tập đổi, `pattern-letter` 56px → 40px mobile). Đây là hợp đồng token/responsive thực thụ: lặp lại ở nhiều component.

**Spine hiện có:** AD-5 map frontmatter DESIGN.md → `tokens.css` 1-1, nhưng breakpoint và biến thể responsive (pattern-letter 40px) chỉ sống trong **prose** của UX, không có trong frontmatter ⇒ không được map, và luật "không giá trị trần cho thứ đã có token" không bắt được chúng. Media query không dùng được CSS var, nên "map 1-1" cũng không tự giải quyết.

**Rủi ro phân kỳ:** mỗi CSS module tự gõ `@media (min-width: 768px)` / `767px` / `48rem` lệch nhau; giá trị 40px mobile của pattern-letter bị bỏ sót vì không nằm trong tokens.css.

**Đề xuất vá:** một dòng trong AD-5 hoặc Conventions: breakpoint duy nhất 768px, quy ước viết thống nhất (vd. luôn `@media (max-width: 767px)` cho nhánh mobile — chọn một chiều); biến thể token responsive khai báo cạnh token gốc trong `tokens.css` (vd. `--font-size-pattern-letter` đổi giá trị trong media query) để component không tự hardcode 40px.

---

## Đã soát và KHÔNG tính là gap (deferred đúng chỗ)

- **Nav hành vi** (active theo route, Bài học giữ active "Lộ trình", tab bar 4 mục): có nhà rõ — `app/ (layout + nav)` + AD-6 route constants; chi tiết còn lại là code.
- **Ngân sách sync ≤ 50ms, audio là nguồn chân lý, lookahead**: AD-3 đã chép đúng và đủ (trừ vế tab-ẩn — GAP-2).
- **Đổi tempo mượt "từ ô nhịp kế tiếp"**: hành vi của `MetronomeEngine`, đã có nhà (AD-3) + unit test engine bắt buộc (Conventions Test) — đủ để không phân kỳ.
- **Token màu/typography/spacing/component tokens**: AD-5 map 1-1 là đủ; token tham chiếu chéo (`{colors.amber}` trong components) resolve được máy móc khi generate tokens.css.
- **State patterns thuần hiển thị** (onboarding một thẻ, tiến độ trống, video fallback, import lỗi không ghi đè): spine đã trỏ đích danh "hiển thị lỗi theo EXPERIENCE.md State Patterns" + AD-4 validate import + AD-7 video fallback — nhà đã có, nội dung là code/copy.
- **Voice & tone, microcopy, Key Flows**: chất liệu cho content/component text, không cần neo kiến trúc.
- **Drum-map dùng chung AudioContext, fail-silent khi thiếu file âm**: AD-3 (một AudioContext) + convention Lỗi đã che.
- **Shadow overlay `0 8px 24px` / glow beat**: giá trị một-chỗ-dùng trong DESIGN prose, chấp nhận là chi tiết CSS.
- **≥60% viewport cho vùng luyện tập, cụm điều khiển ghim đáy mobile**: layout nội bộ feature, code detail.

## Tổng kết

5 gap: 2 nặng (GAP-1 khối metronome dùng chung không có nhà + quyền sở hữu engine instance; GAP-2 mâu thuẫn tab-ẩn vs timer AD-3), 2 vừa (GAP-3 sàn accessibility không bind; GAP-4 hợp đồng corrupt/ghi-thất-bại chưa vào API store), 1 nhẹ (GAP-5 breakpoint/responsive token). Mỗi gap vá được bằng 1–2 câu thêm vào AD hoặc Conventions — không cần AD mới nào ngoài khả năng đặt tên nhà cho khối metronome UI.
