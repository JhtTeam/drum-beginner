# PRD Quality Review — Drum Beginner (2026-07-08)

> Stakes: hobby/solo (website tự học trống cho chính tác giả, React+TypeScript, không backend). Độ sâu ~2 trang + addendum là đúng kỳ vọng. PRD viết tiếng Việt theo override đã log — review giữ thuật ngữ rubric bằng tiếng Anh.

## Overall verdict

PRD này vượt mức yêu cầu cho stakes hobby: có thesis rõ ("gom mọi thứ cho một buổi tập vào một chỗ"), các quyết định được nêu thẳng thay vì né (không backend, localStorage, không chấm điểm tự động), và addendum chứa nghiên cứu comparables + danh sách video đã xác minh — chất liệu thật, không phải trang trí. Rủi ro còn lại tập trung ở dimension Done-ness: hai chỗ dùng tính từ thay vì ngưỡng đo được (độ ổn định metronome, độ dễ đọc pattern), và bộ máy traceability (Assumptions Index, ID cho Success Metrics) hơi nhẹ so với việc PRD này sẽ feed UX/architecture/epics. Không có finding nào chặn việc đi tiếp.

## Decision-readiness — strong

Các quyết định được phát biểu như quyết định, kèm cái đã đánh đổi. §1: "ưu tiên đơn giản, không backend — dữ liệu tiến độ lưu trên trình duyệt (localStorage)" — và FR-17 thừa nhận hệ quả của lựa chọn đó bằng export/import JSON thủ công. §2 Ngoài phạm vi loại bỏ rõ mic/chấm điểm tự động, và addendum §A đóng đinh lại: "chấm điểm bằng audio/mic là ngoài phạm vi; tempo goal tự khai báo... là đủ" — quyết định có căn cứ từ nghiên cứu, không phải né việc khó. Hai Open Questions (§7) là câu hỏi mở thật, có khuynh hướng nêu rõ và gắn nhãn non-blocker — đúng dạng rubric yêu cầu.

*(Không có finding.)*

## Substance over theater — strong

Không có persona theater: một người dùng thật (Anhndt), một UJ duy nhất, và UJ-1 thực sự lái thiết kế (metronome nhúng trong bài tập → FR-11; "mọi tiến độ vẫn còn nguyên" → FR-17). NFR không phải boilerplate: NFR-2 chỉ định cơ chế cụ thể ("Web Audio API lookahead scheduling, không dùng `setInterval` thuần"), NFR-5 xử lý tình huống thật của sản phẩm (video YouTube bị gỡ → fallback kèm link tìm kiếm). Addendum §B là 14 video đã xác minh qua oEmbed với kênh/thời lượng cụ thể — đây là loại nội dung earned hiếm thấy ở PRD hobby.

*(Không có finding.)*

## Strategic coherence — strong

Thesis nêu ở §1 ("người tự học... bị 'lạc' giữa hàng nghìn video rời rạc... Website này gom mọi thứ cho một buổi tập vào một chỗ") và cả 5 nhóm tính năng F1–F5 đều phục vụ vòng lặp buổi tập đó — không có feature lạc đàn. Success Metrics (§6) đo đúng thesis thay vì đo activity: dùng thật ≥3 buổi/tuần, kết quả kỹ năng cuối Tuần 3, và metric kiến trúc (thêm Giai đoạn 2 chỉ bằng data file) khớp với yêu cầu mở rộng ở §2/FR-2. Counter-metric được nêu tường minh ("streak đứt nhiều tuần liên tiếp = website chưa đủ hữu ích hoặc lộ trình quá nặng").

*(Không có finding.)*

## Done-ness clarity — adequate

Phần lớn FR có hệ quả kiểm chứng được: FR-7 nêu dải tempo, phím tắt, bước ±1/±5; FR-14 nêu định dạng tempo mục tiêu cụ thể ("sạch ở 60 bpm → nâng dần 80 bpm"); FR-17 nêu cơ chế sao lưu cụ thể. Nhưng đúng chỗ rubric bảo "be unforgiving" thì còn vài tính từ chưa quy ra ngưỡng — đáng kể nhất là chất lượng nhịp, vốn là trái tim của sản phẩm.

### Findings
- **medium** Độ ổn định metronome không có ngưỡng đo được (§5 NFR-2, §4 FR-8) — "không trôi/giật khi tab chạy lâu" và "đồng bộ với âm thanh" là mô tả định tính; cơ chế (lookahead scheduling) được chỉ định nhưng không có tiêu chí nghiệm thu để biết khi nào đạt. *Fix:* thêm ngưỡng, vd. "chạy 10 phút liên tục ở 60 bpm không lệch tích lũy nghe được (< ±5 ms/beat); chỉ báo hình ảnh lệch âm thanh < 50 ms".
- **low** FR-12 dùng tính từ thay vì bound (§4) — "pattern tay (R/L) to, rõ, dễ nhìn từ xa" không kiểm chứng được. *Fix:* quy ra điều kiện, vd. "đọc được ở khoảng cách ~1,5–2 m khi ngồi ở dàn trống" hoặc cỡ chữ tối thiểu.
- **low** FR-5 tạo ra deliverable nội dung không có nguồn (§4) — video EN "có ghi chú tóm tắt tiếng Việt nội dung chính", nhưng addendum §B chỉ liệt kê video, chưa có tóm tắt nào; khối lượng biên soạn này chưa được ghi nhận ở đâu. *Fix:* thêm một dòng vào FR-5 hoặc §2 xác nhận tóm tắt là việc biên soạn thủ công per-video thuộc scope Giai đoạn 1 (hiện có 4 video EN).

## Scope honesty — strong

§2 "Ngoài phạm vi" làm việc thật: liệt kê đích danh những thứ dễ bị ngầm định (tài khoản, cloud sync, tự host video, mic). 7 tag `[ASSUMPTION]` inline đặt đúng chỗ suy luận chưa được xác nhận trực tiếp (vd. FR-2 "không cần CMS", FR-9 "chưa cần subdivision... để mở cho giai đoạn sau"). Mật độ open-items (2 OQ + 7 ASSUMPTION) là hợp lý cho stakes thấp. Điểm trừ duy nhất: các assumption không được gom thành index cuối tài liệu như quy ước — chuyển xuống Mechanical notes vì ở quy mô 2 trang, tác hại thấp.

*(Không có finding — xem Mechanical notes.)*

## Downstream usability — adequate

PRD này là chain-top (addendum tự nhận: "dành cho các bước downstream (UX, architecture, epics)"), nên dimension này có trọng lượng. Mặt được: FR-1..17 liên tục và duy nhất, UJ-1 có protagonist tên riêng, cross-ref duy nhất (FR-5 → addendum.md) resolve được, và danh từ miền (bài học/bài tập, giai đoạn/tuần, streak) dùng nhất quán xuyên suốt. Mặt thiếu: không có Glossary, và ba Success Metrics (§6) là bullet không ID — downstream muốn trace "epic này phục vụ metric nào" sẽ phải trỏ bằng văn xuôi.

### Findings
- **low** Success Metrics không có ID, không có Glossary (§6, toàn tài liệu) — với ~10 danh từ miền dùng nhất quán thì Glossary gần như hình thức, nhưng SM không ID sẽ làm bước epics khó tham chiếu. *Fix:* đánh số SM-1..SM-3; Glossary tùy chọn.

## Shape fit — strong

Đúng shape hobby/solo theo rubric: "rigor light, substance bar still applies" — và substance bar được vượt. Một UJ duy nhất cho single-operator là liều lượng đúng (không over-formalize), FR viết dạng capability spec gọn, SM đo bằng kết quả học thật thay vì vanity metrics. Việc tách addendum (nghiên cứu + danh mục video) khỏi thân PRD giữ thân đúng ~2 trang mà không vứt bỏ chất liệu — cấu trúc hai tầng này là lựa chọn shape tốt.

*(Không có finding.)*

## Mechanical notes

- **Assumptions Index thiếu:** 7 tag `[ASSUMPTION]` inline (§1 ×2, FR-2, FR-6, FR-9, FR-16, NFR-4) không được gom thành index cuối PRD. Roundtrip không kiểm được vì index không tồn tại. Fix 5 phút, nên làm trước khi feed architecture.
- **ID continuity:** FR-1..17 liên tục, không trùng; F1–F5, UJ-1, OQ-1..2, NFR-1..6 đều sạch. SM chưa có ID (đã nêu ở Downstream usability).
- **Cross-ref:** FR-5 → `addendum.md` resolve đúng (§B). FR-6 liệt kê 6 bộ phận trống khớp nguyên văn với §2 mục 2 — không drift.
- **Glossary drift:** không đáng kể; "bài học/bài tập" được phân biệt nhất quán (FR-15 gọi cả hai). "Giai đoạn 1" / "Tuần 1–3" dùng thống nhất giữa §2, §4, §6.
- **Addendum vặt:** bảng B3, video "Playing Drums To A Metronome" (Drum Beats Online) thiếu thời lượng ("—") trong khi mọi hàng khác có — vô hại.
- **Sections cho stakes đã thỏa thuận:** đủ (Vision, Scope, UJ, FR, NFR, SM, OQ). Không thiếu section nào mà stakes hobby đòi hỏi.
