---
title: "PRD — Drum Beginner: Website tự học trống cho người mới bắt đầu"
status: final
created: 2026-07-08
updated: 2026-07-08
---

# PRD — Drum Beginner

## 1. Tổng quan & Tầm nhìn

**Drum Beginner** là website cá nhân giúp một người chưa từng chơi trống tự học theo lộ trình có cấu trúc — kết hợp bài học lý thuyết, video YouTube tuyển chọn (ưu tiên tiếng Việt), công cụ luyện tập tương tác (metronome, bài tập stick control) và theo dõi tiến độ.

Vấn đề cần giải: người tự học trống thường bị "lạc" giữa hàng nghìn video YouTube rời rạc, không có lộ trình, không có công cụ luyện tập đi kèm và không biết mình đã tiến bộ đến đâu. Website này gom mọi thứ cho một buổi tập vào một chỗ: hôm nay học gì, xem video nào, luyện bài gì ở tempo bao nhiêu, và đánh dấu đã xong.

- **Người dùng:** chính chủ dự án (Anhndt) — người mới hoàn toàn, tự học tại nhà. `[ASSUMPTION]` Không cần hỗ trợ nhiều người dùng hay tài khoản đăng nhập.
- **Nền tảng:** web app ReactJS + TypeScript. `[ASSUMPTION]` Chạy tốt trên desktop trình duyệt là chính, responsive cho mobile để xem khi ngồi ở dàn trống.
- **Mức độ:** dự án hobby cá nhân; ưu tiên đơn giản, không backend — dữ liệu tiến độ lưu trên trình duyệt (localStorage).

## 2. Phạm vi

### Giai đoạn 1 (phạm vi PRD này) — "Làm quen và học nhịp cơ bản" (Tuần 1–3)

1. Học cách cầm dùi trống đúng tư thế.
2. Làm quen các bộ phận của bộ trống: snare, tom, kick, hi-hat, crash, ride.
3. Tập giữ nhịp với metronome (tempo 60–80 bpm).
4. Thực hành bài tập stick control — tăng kiểm soát lực tay và tốc độ.

### Ngoài phạm vi (các giai đoạn sau)

- Nội dung học nâng cao hơn Tuần 1–3 (beat cơ bản, fill, chơi theo bài hát…) — kiến trúc nội dung phải **mở rộng được** để thêm giai đoạn mới mà không phải sửa code lõi.
- Tài khoản người dùng, đồng bộ cloud, backend.
- Thu âm / nhận diện tiếng trống qua micro, chấm điểm tự động.
- Tự host video (chỉ nhúng YouTube).

## 3. Hành trình người dùng (một buổi tập điển hình)

**UJ-1 — Buổi tập 30 phút của Anhndt:** Tối thứ Ba, Anhndt mở website trên laptop cạnh bộ trống điện. Trang chủ hiển thị "Tuần 1 — Ngày 3" cùng tiến độ tổng. Anh mở bài học hôm nay: đọc phần lý thuyết ngắn về cách cầm dùi, xem video tiếng Việt nhúng ngay trong trang. Sau đó chuyển sang tab Luyện tập: bật metronome 60 bpm, làm bài single stroke 5 phút theo hướng dẫn hiển thị trên màn hình (R L R L…), tăng dần lên 70 bpm. Xong buổi, anh bấm "Hoàn thành bài hôm nay" — checklist tuần được tích, chuỗi ngày tập (streak) tăng lên. Lần sau mở web, mọi tiến độ vẫn còn nguyên.

## 4. Tính năng & Yêu cầu chức năng

### F1 — Lộ trình học (Curriculum)

- **FR-1:** Hiển thị lộ trình Giai đoạn 1 chia theo tuần (Tuần 1–3), mỗi tuần gồm danh sách bài học/bài tập có thứ tự.
- **FR-2:** Cấu trúc dữ liệu lộ trình được định nghĩa dạng khai báo (data file TypeScript/JSON), cho phép thêm giai đoạn/tuần/bài mới mà không sửa component. `[ASSUMPTION]` Nội dung biên soạn tĩnh trong repo, không cần CMS.
- **FR-3:** Trang chủ hiển thị "bài tiếp theo nên học" dựa trên tiến độ hiện tại.

### F2 — Bài học (Lesson)

- **FR-4:** Mỗi bài học gồm: tiêu đề, mục tiêu, nội dung lý thuyết ngắn (tiếng Việt), video YouTube nhúng, và hướng dẫn thực hành từng bước.
- **FR-5:** Mỗi bài có thể gắn 1–n video; mỗi video có nhãn ngôn ngữ (VI/EN). Video tiếng Việt hiển thị trước; video tiếng Anh là fallback/bổ sung, có ghi chú tóm tắt tiếng Việt nội dung chính (tác giả tự viết khi biên soạn bài học — đây là công việc nội dung, không phải tính năng dịch tự động). Danh sách video khởi tạo: xem `addendum.md`.
- **FR-6:** Bài "Làm quen bộ trống" có sơ đồ bộ trống tương tác: click/hover từng bộ phận (snare, tom, kick, hi-hat, crash, ride) để xem tên, vai trò và nghe âm thanh mẫu. `[ASSUMPTION]` Âm thanh mẫu dùng file audio ngắn miễn phí bản quyền đặt trong repo.

### F3 — Metronome tương tác

- **FR-7:** Metronome chạy trong trình duyệt (Web Audio API): tempo điều chỉnh 40–200 bpm (mặc định vùng luyện 60–80), start/stop (kèm phím tắt Space), tăng giảm ±1 và ±5 bpm, số BPM hiển thị to rõ.
- **FR-8:** Chỉ báo nhịp trực quan (beat hiện tại nhấp nháy/đổi màu) đồng bộ với âm thanh; phách 1 có âm khác biệt (accent).
- **FR-9:** Nhịp 4/4 là mặc định; hỗ trợ chọn số phách 2/4, 3/4, 4/4. `[ASSUMPTION]` Chưa cần subdivision (nốt móc đơn/kép) ở Giai đoạn 1 — để mở cho giai đoạn sau.
- **FR-10:** Tap tempo: gõ phím/click để ước lượng tempo mong muốn.
- **FR-11:** Metronome dùng được như công cụ độc lập (trang riêng) *và* nhúng ngay trong bài tập đang mở.

### F4 — Bài tập Stick Control

- **FR-12:** Thư viện bài tập stick control cơ bản: single stroke, double stroke, paradiddle (và biến thể theo lộ trình). Mỗi bài hiển thị pattern tay (R/L) đọc được từ khoảng cách ~2 mét (tư thế ngồi ở dàn trống, màn hình laptop).
- **FR-13:** Con trỏ pattern chạy theo metronome: ô R/L hiện tại được highlight đúng nhịp để người tập nhìn theo.
- **FR-14:** Mỗi bài tập có tempo mục tiêu (vd. "sạch ở 60 bpm → nâng dần 80 bpm") và ghi chú kỹ thuật (thả lỏng cổ tay, lực đều hai tay). Người tập tự ghi lại "tempo tốt nhất đã chơi sạch" cho từng bài (tự khai báo — không chấm điểm tự động).

### F5 — Theo dõi tiến độ

- **FR-15:** Đánh dấu hoàn thành từng bài học/bài tập; tiến độ hiển thị theo tuần và toàn giai đoạn (vd. "Tuần 1: 4/6 bài").
- **FR-16:** Nhật ký luyện tập tối giản: mỗi lần bấm hoàn thành lưu ngày giờ; hiển thị chuỗi ngày tập liên tiếp (streak). `[ASSUMPTION]` Không cần đo thời lượng tập chính xác.
- **FR-17:** Toàn bộ tiến độ lưu localStorage; có nút export/import JSON để sao lưu thủ công khi đổi máy/trình duyệt.

## 5. Yêu cầu phi chức năng

- **NFR-1 — Ngôn ngữ:** Toàn bộ UI và nội dung biên soạn bằng tiếng Việt. Không cần i18n framework.
- **NFR-2 — Độ chính xác nhịp:** Metronome giữ nhịp ổn định đo được: mỗi tick lệch không quá ±2 ms so với thời điểm lý thuyết, không trôi tích lũy sau 10 phút chạy liên tục (kiểm chứng bằng cách ghi âm và so khoảng cách tick). Dùng Web Audio API lookahead scheduling; không dùng `setInterval` thuần để phát âm thanh.
- **NFR-3 — Responsive:** Dùng được trên màn hình từ ~375px (điện thoại đặt cạnh dàn trống) đến desktop.
- **NFR-4 — Triển khai:** Static site, deploy miễn phí (GitHub Pages / Vercel / Netlify). `[ASSUMPTION]` Không cần domain riêng.
- **NFR-5 — Video:** Video YouTube nhúng lazy-load (click-to-load) để trang nhẹ; khi video bị gỡ/hỏng, UI hiển thị fallback kèm link tìm kiếm thay thế thay vì khung trống.
- **NFR-6 — Chất lượng code:** TypeScript strict; kiến trúc component cho phép thêm loại bài tập mới (giai đoạn sau) không phá vỡ cấu trúc hiện có.

## 6. Thước đo thành công

Dự án hobby — thành công đo bằng chính việc học:

- **SM-1:** Website được dùng thật cho ≥ 3 buổi tập/tuần trong 3 tuần của Giai đoạn 1 (streak là counter-metric tự nhiên: streak đứt nhiều tuần liên tiếp = website chưa đủ hữu ích hoặc lộ trình quá nặng).
- **SM-2:** Cuối Tuần 3: giữ được nhịp đều với metronome ở 60–80 bpm và chơi sạch single/double stroke ở 60 bpm.
- **SM-3:** Thêm được Giai đoạn 2 vào website chỉ bằng cách bổ sung data file nội dung (chứng minh kiến trúc mở rộng đúng).

## 7. Câu hỏi mở

- **OQ-1:** Có cần chế độ "tăng tempo tự động" cho metronome (vd. +5 bpm mỗi 2 phút) ngay Giai đoạn 1 không, hay để giai đoạn sau? *(khuynh hướng: để sau — non-blocker, chủ sở hữu: Anhndt, xem lại khi bắt đầu Giai đoạn 2)*
- **OQ-2:** Sơ đồ bộ trống tương tác (FR-6) dùng hình SVG tự vẽ hay ảnh thật có hotspot? *(quyết định lúc làm UX — non-blocker, chủ sở hữu: bước bmad-ux)*

## 8. Bảng giả định (Assumptions Index)

| # | Giả định | Vị trí | Rủi ro nếu sai |
|---|---|---|---|
| A1 | Một người dùng duy nhất, không cần tài khoản | §1 | Phải thêm backend/auth — ảnh hưởng kiến trúc lớn |
| A2 | Desktop-first, responsive mobile là đủ | §1 | Cần thiết kế lại UX mobile-first |
| A3 | Nội dung tĩnh trong repo, không cần CMS | FR-2 | Sửa nội dung phải rebuild — chấp nhận được với hobby |
| A4 | Âm thanh mẫu trống dùng file audio miễn phí bản quyền trong repo | FR-6 | Phải tìm nguồn khác hoặc bỏ tính năng nghe thử |
| A5 | Chưa cần subdivision cho metronome ở Giai đoạn 1 | FR-9 | Thêm sau — thiết kế metronome phải chừa chỗ |
| A6 | Không cần đo thời lượng tập chính xác | FR-16 | Thêm timer sau nếu cần |
| A7 | Không cần domain riêng, deploy static miễn phí | NFR-4 | Không đáng kể |
