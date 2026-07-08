---
name: "EXPERIENCE.md — Drum Beginner"
status: final
created: 2026-07-08
updated: 2026-07-08
sources:
  - ../../prds/prd-drum-beginner-2026-07-08/prd.md
  - ../../prds/prd-drum-beginner-2026-07-08/addendum.md
design: ./DESIGN.md
---

# EXPERIENCE.md — Drum Beginner

## Foundation

- **Form-factor:** web app, desktop-first (laptop đặt cạnh dàn trống), responsive xuống 375px. Breakpoint chính 768px.
- **UI system:** không dùng UI framework có sẵn; component tự viết theo [DESIGN.md](./DESIGN.md) — nhận diện thị giác tra ở đó, file này chỉ đặc tả hành vi. `[ASSUMPTION]` Hobby scale, ít component, tự viết rẻ hơn học API framework.
- **Ngôn ngữ:** toàn bộ UI tiếng Việt (PRD NFR-1). Thuật ngữ trống giữ nguyên tiếng Anh (snare, hi-hat, paradiddle…), chú thích tiếng Việt ở lần xuất hiện đầu trong mỗi bài.
- **Dữ liệu:** không backend; tiến độ ở localStorage (PRD FR-17). Mọi màn hình phải render được ngay từ dữ liệu tĩnh + localStorage, không có trạng thái "đang tải từ server".

## Information Architecture

5 surface, điều hướng qua header cố định (desktop) / bottom tab bar (mobile):

1. **Trang chủ `/`** — thẻ "Hôm nay" (bài tiếp theo nên học — FR-3) + streak + tiến độ giai đoạn (SM-1). Đích quay về mặc định.
2. **Lộ trình `/lo-trinh`** — Giai đoạn 1 chia Tuần 1–3 (FR-1); mỗi tuần là danh sách card bài học/bài tập có checkmark hoàn thành. Cấu trúc render từ data file (FR-2).
3. **Bài học `/bai-hoc/:id`** — lý thuyết ngắn + video nhúng (FR-4, FR-5) + hướng dẫn thực hành. Bài "Làm quen bộ trống" nhúng thêm **sơ đồ bộ trống tương tác** (FR-6). Bài tập stick control nhúng **khối luyện tập** (F4) ngay trong trang. Layout tham khảo: [mockups/mock-bai-hoc-luyen-tap.html](./mockups/mock-bai-hoc-luyen-tap.html) (mock trang bài học + khối luyện tập; spine thắng nếu mock mâu thuẫn).
4. **Metronome `/metronome`** — metronome độc lập toàn màn hình (FR-11).
5. **Tiến độ `/tien-do`** — checklist theo tuần (FR-15), lịch sử ngày tập + streak (FR-16), export/import JSON và reset (FR-17).

Đóng surface: mọi FR của PRD đều có mặt ở đúng một surface chính; khối metronome tái sử dụng ở surface 3 và 4. Các surface 1, 2, 4, 5 và sơ đồ bộ trống là **spine-only** (build từ đặc tả trong file này, không có mock — quyết định đã log).

## Voice and Tone

- Xưng hô: gọi người dùng là "bạn", giọng bạn tập cùng — ngắn, động viên, không giáo điều. Vd: "Sạch ở 60 bpm rồi — thử 65 nhé."
- Microcopy hành động dùng động từ: "Bắt đầu", "Hoàn thành bài hôm nay", "Tập lại".
- Không chê: bỏ lỡ streak hiển thị trung tính ("Bắt đầu chuỗi mới hôm nay"), không "Bạn đã bỏ tập N ngày".
- Số liệu nói thẳng: "Tuần 1 · 4/6 bài", không phần trăm trừu tượng.

## Component Patterns (hành vi)

- **Điều hướng (nav)**: header desktop sticky / bottom tab bar mobile theo spec `{components.nav}`; mục active phản ánh route hiện tại; trang Bài học không có tab riêng — active giữ ở "Lộ trình".
- **Metronome** (dùng chung surface 3 & 4): start/stop, tempo 40–200 (mặc định mở ở **60**), ±1/±5, tap tempo, chọn 2/4·3/4·4/4. Visual: hàng `{components.beat-dot}` + số BPM `{components.bpm-display}`. Âm phách 1 khác biệt (FR-8). Đổi tempo khi đang chạy có hiệu lực từ ô nhịp kế tiếp, không giật. Rời trang → metronome dừng và giải phóng audio. `[ASSUMPTION]` Không cần metronome chạy xuyên trang ở Giai đoạn 1.
- **Khối luyện tập stick control**: pattern R/L dạng grid `{components.pattern-cell}`, con trỏ ô chạy đồng bộ tick (FR-13); vòng lặp vô hạn đến khi dừng. Dưới pattern: tempo mục tiêu + nút ghi "tempo tốt nhất" (FR-14, tự khai báo — một cú click lưu BPM hiện tại).
- **Sơ đồ bộ trống** (`{components.drum-map}`, SVG tự vẽ — OQ-2 của PRD đã chốt): 6 vùng click (snare, tom, kick, hi-hat, crash, ride); click → highlight vùng + panel tên/vai trò + phát âm thanh mẫu một lần (không loop). Hover (desktop) chỉ highlight, không phát âm. Nếu file âm thanh tải lỗi: click vẫn highlight + hiện panel bình thường, im lặng — không báo lỗi chặn.
- **Video nhúng**: click-to-load thumbnail (NFR-5); badge VI/EN; video VI đứng trước. Video lỗi/gỡ → khung fallback với thông báo + link tìm kiếm YouTube thay thế.
- **Đánh dấu hoàn thành**: nút primary cuối mỗi bài; bấm → checkmark, ghi timestamp vào nhật ký, cập nhật streak, điều hướng gợi ý bài kế tiếp (không tự chuyển trang).

## State Patterns

- **Lần đầu mở (localStorage trống):** trang chủ hiển thị onboarding một thẻ: "Chào bạn! Bắt đầu với Tuần 1 · Bài 1" — không wizard nhiều bước.
- **Đang luyện (metronome chạy):** mọi thứ ngoài vùng luyện tập giảm độ nổi bật; beat hiện tại là điểm sáng nhất (DESIGN.md Do's).
- **Hoàn thành bài:** khoảnh khắc đắt giá nhất — checkmark nảy nhẹ một lần + progress bar chạy tới; nếu hoàn thành cả tuần: thông điệp "Xong Tuần N 🎉". Không confetti kéo dài.
- **Video hỏng:** fallback như Component Patterns; không bao giờ khung xám trống.
- **localStorage hỏng/không parse được:** giữ nguyên dữ liệu hỏng, hiển thị cảnh báo + nút "Bắt đầu lại" (chỉ ghi đè khi user bấm); gợi ý import từ file backup nếu có.
- **Import JSON không hợp lệ:** báo lỗi cụ thể, không ghi đè dữ liệu hiện tại.
- **Tiến độ trống (chưa tập buổi nào):** surface Tiến độ hiển thị "Chưa có buổi tập nào — hoàn thành bài đầu tiên để bắt đầu chuỗi 🔥" + nút dẫn về bài 1; không hiển thị bảng/lịch rỗng vô hồn.
- **Ghi localStorage thất bại khi bấm "Hoàn thành":** giữ nguyên trạng thái UI, toast nhẹ "Chưa lưu được — thử lại", nút giữ nguyên để bấm lại.

## Interaction Primitives

Trên surface có metronome (3, 4):

- `Space` — start/stop (không cướp phím khi focus đang ở input).
- `↑`/`↓` — ±1 bpm; `Shift+↑`/`Shift+↓` — ±5 bpm.
- `T` — tap tempo.
- Mọi thao tác đều có nút bấm tương đương — phím tắt là tăng tốc, không phải cách duy nhất (mobile không có bàn phím).

## Accessibility Floor

- Chữ đạt contrast ≥ 4.5:1 trên nền (kiểm với `{colors.surface-base}`/`{colors.surface-raised}`).
- Beat và tay R/L không bao giờ mã hóa chỉ bằng màu: luôn kèm chữ cái, hình dạng hoặc chuyển động.
- Focus ring `{colors.focus-ring}` hiển thị rõ trên mọi phần tử tương tác; điều hướng bàn phím đủ cho mọi flow.
- Âm thanh chỉ phát khi user chủ động bấm (không autoplay — cũng là ràng buộc autoplay policy của trình duyệt).
- `prefers-reduced-motion`: tắt animation nảy/phóng to, giữ đổi màu beat (vẫn cần chỉ báo nhịp).
- Touch target ≥ 44px (khớp `{components.button-primary.height}`).

## Đồng bộ âm thanh – hình ảnh (concern riêng của sản phẩm)

- Âm thanh là nguồn chân lý của nhịp (Web Audio clock); visual đuổi theo âm thanh, không ngược lại. Sai lệch visual cho phép ≤ 50ms (mắt không nhận ra ở 60–80 bpm); âm giữ chuẩn NFR-2 (±2ms).
- Tab bị ẩn (background): âm tiếp tục đúng nhịp; visual bắt kịp lại ngay khi tab hiện — không dồn frame animation.

## Inspiration & Anti-patterns

Từ digest comparables (addendum §A của PRD):

- **Lấy từ Drumeo:** lộ trình tuyến tính đánh số + thẻ "học tiếp từ chỗ dừng" trên trang chủ.
- **Lấy từ Melodics:** streak + cảm giác "xong mục tiêu hôm nay"; **bác bỏ** chấm điểm qua mic/MIDI và XP/trophy — quá nặng cho hobby, tempo tốt nhất tự khai báo là đủ.
- **Lấy từ rudiment trainers (DRT):** hiển thị sticking R/L trực quan, không yêu cầu đọc nhạc; **bác bỏ** thư viện 40 rudiment — chỉ đúng các bài trong lộ trình.
- **Lấy từ metronome web:** BPM to + tap tempo + Space + chấm phách kiêm visual indicator; **bác bỏ** per-beat accent editing và subdivision ở Giai đoạn 1 (PRD A5).

## Responsive & Platform

- **Desktop (≥768px):** header ngang; trang luyện tập hai khối dọc — pattern + beat dots chiếm ≥60% viewport, điều khiển tempo ngay dưới.
- **Mobile (<768px):** bottom tab bar 4 mục (Trang chủ · Lộ trình · Metronome · Tiến độ); ở trang luyện tập, cụm điều khiển tempo (±, start/stop) ghim đáy màn hình trong tầm ngón cái; pattern grid wrap 4 ô/hàng; `{typography.pattern-letter}` giảm còn 40px.
- Không cần PWA/offline cache ở Giai đoạn 1. `[ASSUMPTION]` Có mạng khi tập (video cần mạng); metronome và pattern hoạt động được khi mất mạng vì là static assets đã tải.

## Key Flows

**KF-1 — Buổi tập 30 phút của Anhndt (từ PRD UJ-1).** Tối thứ Ba, Anhndt mở laptop cạnh trống điện. (1) Trang chủ: thẻ "Hôm nay — Tuần 1 · Bài 3: Single stroke @ 60 bpm", streak 🔥 4. (2) Click → trang bài học: đọc 2 đoạn lý thuyết, xem video Pong Ơi (VI) nhúng. (3) Cuộn xuống khối luyện tập: bấm "Bắt đầu" (hoặc Space) — beat dots chạy, ô R/L sáng theo tick ở 60 bpm; anh tập nhìn màn hình từ xa 2m, chữ vẫn rõ. (4) Sau 5 phút sạch, bấm `Shift+↑` hai lần → 70 bpm, tập tiếp. (5) **Climax:** bấm "Hoàn thành bài hôm nay" — checkmark nảy, progress Tuần 1 chạy 3/6 → 4/6, streak lên 🔥 5. (6) Trang chủ đã trỏ sẵn bài kế tiếp cho ngày mai. Đóng máy.

**KF-2 — Ngày đầu tiên của Anhndt.** (1) Mở web lần đầu, localStorage trống: trang chủ onboarding một thẻ. (2) Bấm "Bắt đầu Tuần 1 · Bài 1: Làm quen bộ trống". (3) Sơ đồ trống tương tác: click từng bộ phận nghe thử âm — **climax "à ra thế"**: phân biệt được snare với tom bằng tai trước khi từng ngồi vào trống thật. (4) Xem video Việt Thương Music. (5) Bấm "Hoàn thành" → streak 🔥 1 bắt đầu.

**KF-3 — Anhndt đổi máy.** (1) Máy cũ: Tiến độ → "Xuất dữ liệu" tải file JSON. (2) Máy mới: Tiến độ → "Nhập dữ liệu" chọn file. (3) Xác nhận ghi đè (hiển thị tóm tắt: "12 bài hoàn thành, streak 9"). (4) **Climax:** toàn bộ tiến độ hiện về đúng. *Failure path:* file không hợp lệ → xem State Patterns "Import JSON không hợp lệ" — dữ liệu máy mới không bị đụng.
