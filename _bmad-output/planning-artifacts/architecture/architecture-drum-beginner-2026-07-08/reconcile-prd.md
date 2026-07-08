# Reconcile — PRD/Addendum ↔ ARCHITECTURE-SPINE

Ngày: 2026-07-08. Đối chiếu `prd.md` + `addendum.md` với `ARCHITECTURE-SPINE.md`.
Nguyên tắc lọc: chỉ báo gap khiến **hai builder có thể làm khác nhau** hoặc requirement **không có chỗ ở**; không báo chi tiết mà spine chủ đích nhường cho code/UX.

## Kết luận nhanh

Spine phủ tốt: 17 FR và 6 NFR đều truy vết được vào AD-1..7 / Conventions / Capability Map. Tìm thấy **4 gap thật** (2 ở mức data-shape, 2 ở mức ranh giới sở hữu) và 2 điểm ghi nhận không cần hành động.

---

## GAP-1 — FR-5: shape dữ liệu video thiếu trường "ghi chú tóm tắt tiếng Việt" và quy tắc VI-trước-EN không có chủ

**PRD FR-5:** mỗi video có nhãn ngôn ngữ; video EN phải kèm *ghi chú tóm tắt tiếng Việt* do tác giả tự viết; video VI **hiển thị trước**.

**Spine AD-7:** quy định shape verbatim `{ youtubeId, lang: 'vi' | 'en', title }` — **không có trường summary/note**. Builder bám đúng spine sẽ tạo type thiếu trường này, và nội dung tóm tắt tiếng Việt (yêu cầu tường minh của FR-5) không có chỗ ở trong data model.

Ngoài ra quy tắc "VI hiển thị trước" không rõ chủ sở hữu: (a) tác giả nội dung tự sắp thứ tự trong `content/phase-1.ts`, hay (b) component sort theo `lang`? Hai builder sẽ chọn khác nhau; nếu chọn (b) thì thứ tự biên tập trong addendum B bị ghi đè.

**Đề xuất:** sửa AD-7 shape thành `{ youtubeId, lang, title, note? }` (note bắt buộc khi `lang: 'en'` — có thể enforce bằng union type) và ghi một câu: thứ tự hiển thị = thứ tự trong data, content author chịu trách nhiệm đặt VI trước.

## GAP-2 — FR-3: logic "bài tiếp theo nên học" không có nhà

**PRD FR-3:** trang chủ hiển thị "bài tiếp theo nên học" dựa trên tiến độ hiện tại. Đây là phép dẫn xuất **cắt ngang** hai tầng: cần cả giáo trình (`content/`) lẫn tiến độ (`core/progress/`).

**Spine:** AD-4 nói rõ streak là giá trị dẫn xuất trong store, nhưng next-lesson thì không được nhắc. Capability Map đặt F1 vào `features/roadmap` + `content/`, governed by AD-2/AD-6 — **không nhắc AD-4** dù FR-3 phụ thuộc progress. Hai builder có thể diverge: một người viết selector trong `core/` (thuần, test được), người kia tính inline trong component roadmap — và khi cả trang chủ lẫn trang lộ trình đều cần nó, logic bị nhân đôi với hai định nghĩa "tiếp theo" khác nhau (bài chưa hoàn thành đầu tiên theo thứ tự? bài sau bài hoàn thành gần nhất?).

**Đề xuất:** thêm một dòng vào AD-4 hoặc Capability Map: next-lesson là hàm dẫn xuất thuần trong `core/` (nhận curriculum + progress), định nghĩa = bài đầu tiên chưa hoàn thành theo thứ tự giáo trình; thêm AD-4 vào hàng F1 của map.

## GAP-3 — Exercise vs Lesson: envelope key bằng `LessonId` nhưng types có `Exercise` riêng

**PRD FR-14/FR-15:** "tempo tốt nhất" ghi **per bài tập** (exercise); đánh dấu hoàn thành **từng bài học/bài tập**.

**Spine:** envelope AD-4 là `completedLessons: Record<LessonId, ...>` và `bestTempos: Record<LessonId, number>`, trong khi `core/types.ts` liệt kê `Phase/Week/Lesson/Exercise/Video` — Exercise là entity riêng. Không nói rõ exercise có nằm trong không gian ID `gd1-t2-b3` (khóa của progress store) hay không. Hai builder diverge: (a) Exercise là một loại Lesson (discriminated union, chung ID space) → envelope dùng được nguyên; (b) Exercise là con của Lesson với ID riêng → `bestTempos` key bằng LessonId không trỏ được tới từng bài tập, hoặc builder tự chế ID phụ ngoài convention.

**Đề xuất:** thêm một câu vào Conventions (hàng Content ID) hoặc AD-4: bài học và bài tập chia sẻ cùng không gian Content ID `gd1-t2-b3` (Exercise là biến thể của Lesson trong cùng danh sách tuần); mọi khóa progress đều là Content ID này.

## GAP-4 — FR-11: metronome hai ngữ cảnh (trang riêng + nhúng trong bài tập) — instance và tempo state chưa chốt

**PRD FR-11:** metronome dùng như công cụ độc lập **và** nhúng ngay trong bài tập. FR-7: Space start/stop.

**Spine AD-3:** "một class `MetronomeEngine` duy nhất" — chốt **class**, không chốt **instance**. `AudioContext` thì được chốt singleton, nhưng engine thì không. Hai builder diverge:

- Một singleton engine app-wide → tempo/trạng thái chạy giữ nguyên khi điều hướng từ `/metronome` sang bài tập (và ngược lại); nguy cơ metronome tiếp tục kêu khi rời trang nếu không định nghĩa lifecycle.
- Instance per-mount → mỗi bài tập nhúng có tempo riêng (khớp "tempo mục tiêu per bài" của FR-14), nhưng hai instance có thể cùng sống → hai nguồn tick, và phím Space không rõ thuộc về instance nào.

**Đề xuất:** chốt một câu trong AD-3: một instance engine duy nhất app-wide (khớp một AudioContext); mỗi surface khi mount chỉ *cấu hình* engine (tempo, beatsPerBar) chứ không tạo mới; điều hướng khỏi surface đang phát → stop (hoặc quy định tường minh là tiếp tục). Space bind ở surface đang hiển thị metronome.

---

## Ghi nhận — không cần hành động (đã cân nhắc, spine nhường đúng chỗ)

- **NFR-2 ngưỡng đo được (±2ms, không trôi sau 10 phút, kiểm bằng ghi âm):** spine không lặp lại con số nhưng AD-3 ép đúng cơ chế (lookahead theo `AudioContext.currentTime`) vốn sample-accurate by construction, và Conventions bắt buộc unit test engine scheduling. Ngưỡng ±2ms là acceptance test cấp sản phẩm, không phải invariant kiến trúc — chấp nhận spine nhường. Chỉ lưu ý: khi viết test/verify, nhớ quay lại con số này trong PRD.
- **NFR-5 "fallback kèm link tìm kiếm thay thế":** AD-7 trỏ về EXPERIENCE State Patterns — có nhà, chỉ là nhà ở tài liệu UX. Không phải gap của spine.
- **FR-7/FR-10 chi tiết metronome (dải 40–200, ±1/±5, tap tempo):** code detail, spine nhường đúng.
- **Addendum A (calendar heatmap, XP, "continue card"):** là gợi ý pattern từ nghiên cứu comparables, không phải requirement; envelope `sessions: IsoDateTime[]` đã đủ dữ liệu để làm heatmap sau nếu muốn — không gap.
- **Addendum B ghi chú biên tập (Pong Ơi làm xương sống):** quyết định nội dung, sống trong `content/phase-1.ts`, không phải việc của spine.
- **NFR-4:** PRD cho 3 lựa chọn host; spine chọn Vercel có gắn `[ASSUMPTION]` — hợp lệ.

## Truy vết tổng (tóm tắt)

| Nguồn | Nhà trong spine | Trạng thái |
| --- | --- | --- |
| FR-1, FR-2 | AD-2, `content/` | OK |
| FR-3 | `features/roadmap` | **GAP-2** (logic dẫn xuất không có chủ) |
| FR-4, FR-6 | AD-2, `ui/DrumMap`, AD-3/AD-7 | OK |
| FR-5 | AD-7 video shape | **GAP-1** (thiếu note tiếng Việt, thứ tự VI-trước) |
| FR-7..10, FR-13 | AD-3 + code detail | OK |
| FR-11 | AD-3 + `features/metronome`/`practice` | **GAP-4** (instance/lifecycle) |
| FR-12 | DESIGN.md tokens (AD-5) | OK (UX sở hữu) |
| FR-14, FR-15 | AD-4 envelope | **GAP-3** (Exercise ID space) |
| FR-16, FR-17 | AD-4 | OK (streak dẫn xuất, timezone local đã chốt) |
| NFR-1..6 | Conventions / AD-3 / AD-5 / AD-7 / Stack | OK (xem ghi nhận NFR-2) |
| A1..A7 | AD-4 (A1), AD-7 (A4), Deferred (A5, A6), Stack (A7) | OK |
