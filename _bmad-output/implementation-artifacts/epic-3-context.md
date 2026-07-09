# Epic 3 Context: Tiến độ, streak và trang chủ "Hôm nay"

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Epic này biến các thao tác luyện tập rời rạc thành một vòng lặp có động lực: người dùng bấm "Hoàn thành bài hôm nay" để tích checklist, nuôi chuỗi ngày tập (streak), và xem tiến độ theo tuần ("Tuần 1: 4/6 bài"). Trang chủ luôn trỏ sẵn bài kế tiếp nên mỗi buổi tập bắt đầu trong một cú click; người dùng cũng tự ghi "tempo tốt nhất đã chơi sạch" cho từng bài tập và export/import JSON để không mất tiến độ khi đổi máy. Đây là lớp giữ chân người dùng — biến website từ tập công cụ thành người bạn tập theo dõi hành trình học trống.

## Stories

- Story 3.1: Progress store + nút "Hoàn thành bài hôm nay"
- Story 3.2: Trang chủ "Hôm nay" + streak
- Story 3.3: Trang Tiến độ + ghi tempo tốt nhất
- Story 3.4: Export / Import tiến độ

## Requirements & Constraints

- Đánh dấu hoàn thành từng bài; hiển thị tiến độ theo tuần và toàn giai đoạn.
- Nhật ký tối giản: mỗi lần bấm "Hoàn thành" lưu timestamp; hiển thị streak (chuỗi ngày tập liên tiếp). Không đo thời lượng buổi tập.
- Trang chủ hiển thị "bài tiếp theo nên học" dựa trên tiến độ hiện tại.
- Người dùng tự khai báo "tempo tốt nhất đã chơi sạch" cho từng bài tập — một click, không chấm điểm tự động.
- Toàn bộ tiến độ lưu localStorage; export/import JSON để sao lưu thủ công.
- Toàn bộ UI/nội dung tiếng Việt (không i18n framework); thuật ngữ trống giữ tiếng Anh. Responsive 375px→desktop, breakpoint 768px. TypeScript strict.
- Không có backend/tài khoản/cloud sync (out-of-scope) — dữ liệu chỉ sống trên trình duyệt.

## Technical Decisions

- **Một chủ sở hữu store:** module `core/progress/` sở hữu key localStorage `drum-beginner:progress:v1`; không nơi nào khác đọc/ghi localStorage cho tiến độ. `core/` không import React.
- **Envelope có version:** `{ schemaVersion: 1, completedLessons: Record<LessonItemId, IsoDateTime>, bestTempos: Record<LessonItemId, number>, sessions: IsoDateTime[] }`. Khóa là content ID theo không gian ID chung `gd1-t2-b3` (bài học lẫn bài tập; Exercise/pattern KHÔNG có ID riêng trong progress).
- **Ngữ nghĩa ghi:** `sessions` chỉ được thêm entry khi user bấm "Hoàn thành bài hôm nay" (nhiều lần/ngày là hợp lệ); hoàn thành lại một bài giữ nguyên timestamp lần đầu trong `completedLessons`.
- **Mọi giá trị dẫn xuất là selector trong `core/progress`** — UI chỉ gọi, không tự tính:
  - `getStreak`: đếm ngày distinct quy về **local timezone**, không so sánh chuỗi UTC trực tiếp.
  - `getNextItem`: item chưa hoàn thành đầu tiên theo thứ tự lộ trình.
  - `getWeekProgress`: "N/M" với M = tổng item của tuần.
- **Ngày giờ:** ISO 8601 string (`toISOString()`, UTC); mọi so sánh "cùng ngày"/streak quy về ngày local qua selector.
- **Load 3 trạng thái:** `empty | ok | corrupt`. Corrupt → giữ nguyên raw, chỉ ghi đè khi user bấm "Bắt đầu lại". Write trả về kết quả thành công/thất bại để UI phản ứng (toast).
- **Import = ghi đè toàn bộ, không merge:** validate shape đầy đủ (schemaVersion + kiểu từng trường) rồi ghi đè sau xác nhận. Export = xuất đúng envelope.
- **Unit test bắt buộc cho `core/progress`** (chạy trong `npm run check` quality gate): selectors/streak, load 3 trạng thái, và import validator (hợp lệ / thiếu trường / sai kiểu / `{schemaVersion:1}` rỗng-nhưng-đúng-shape).
- **Layer:** logic ở `core/progress`; UI trang tiến độ + export/import ở `features/progress`. Features không import lẫn nhau.

## UX & Interaction Patterns

- **Trang chủ "Hôm nay":** localStorage trống → một thẻ onboarding duy nhất ("Bắt đầu với Tuần 1 · Bài 1"), không wizard. Có tiến độ → thẻ bài tiếp theo (từ `getNextItem`) + streak 🔥 + tiến độ tuần.
- **Streak đứt:** hiển thị trung tính "Bắt đầu chuỗi mới hôm nay" — không chê.
- **Hoàn thành bài:** checkmark success nảy nhẹ một lần trên card lộ trình (không gạch ngang chữ), progress bar chạy; không tự chuyển trang mà gợi ý bài kế tiếp. Xong item cuối tuần → khoảnh khắc "Xong Tuần N 🎉" một lần, không confetti kéo dài.
- **Ghi thất bại:** giữ nguyên state, toast nhẹ "Chưa lưu được — thử lại", nút bấm lại được. Corrupt khi mở app → cảnh báo + "Bắt đầu lại" (chỉ ghi đè khi bấm) + gợi ý import backup.
- **Trang Tiến độ:** checklist theo tuần, lịch sử ngày tập + streak, progress bar tuần fill amber → success khi 100%. Empty state khi chưa có buổi tập nào + nút về bài 1 (không bảng rỗng).
- **Ghi tempo tốt nhất:** chỉ ghi khi T lớn hơn kỷ lục cũ; bằng/nhỏ hơn → giữ và báo nhẹ. Hiển thị lại ngay trong khối luyện tập và trong `/tien-do`.
- **Voice & tone:** xưng "bạn", giọng bạn tập cùng, không chê; microcopy dùng động từ; số liệu thẳng ("Tuần 1 · 4/6 bài"). `prefers-reduced-motion` → chỉ đổi màu, không nảy/scale.

## Cross-Story Dependencies

- Story 3.1 (progress store + selectors) là nền tảng cho 3.2, 3.3, 3.4 — làm trước.
- Selector `getNextItem` (3.2) và checklist tuần (3.3) đọc thứ tự lộ trình + danh sách item từ `content/` (Epic 2). Story 3.3 "ghi tempo tốt nhất" gắn vào khối luyện tập `ui/MetronomeBlock`/`PatternGrid` của Epic 2 Story 2.4.
- Export/import (3.4) phụ thuộc envelope + validator do 3.1 định nghĩa.
