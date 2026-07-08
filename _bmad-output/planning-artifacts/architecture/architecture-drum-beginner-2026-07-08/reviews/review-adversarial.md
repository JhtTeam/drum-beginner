---
name: review-adversarial
type: review
target: ../ARCHITECTURE-SPINE.md
lens: adversarial (hai unit cùng tuân thủ AD từng chữ nhưng build ra kết quả không tương thích)
sources:
  - ../ARCHITECTURE-SPINE.md
  - ../../../ux-designs/ux-drum-beginner-2026-07-08/EXPERIENCE.md
created: '2026-07-08'
verdict: CẦN VÁ — spine vững ở tầng macro (layering, content-as-data, single store) nhưng thủng ở các đường nối liên-feature; 2 lỗ Critical khiến hai epic viết đúng luật vẫn chắc chắn va nhau
counts: { critical: 2, high: 3, moderate: 6, low: 2, total: 13 }
---

# Review đối kháng — ARCHITECTURE-SPINE.md (drum-beginner)

**Phương pháp:** với mỗi cặp unit một tầng dưới spine (epic/story), tôi xây hai cách hiện thực **đều tuân thủ mọi AD và convention theo từng chữ** nhưng khi ghép lại thì gãy. Mỗi finding gồm: (a) hai unit, (b) hai construction không tương thích mà AD hiện tại đều cho phép, (c) AD mới/siết lại để đóng lỗ. Đúng hobby scale — không finding nào là chuyện enterprise.

**Kết luận:** spine hiện tại đủ để mỗi feature tự đứng, **chưa đủ để hai feature gặp nhau**. Các điểm gặp nhau (khối metronome dùng chung, AudioContext, semantics của `sessions`/streak, ID của bài tập) là nơi 13 lỗ dưới đây sống.

---

## CRITICAL

### A1 — Khối metronome dùng chung không có chỗ ở hợp pháp (AD-1 × EXPERIENCE surface 3&4)

- **Hai unit:** epic "Trang metronome" (`features/metronome`) × epic "Khối luyện tập stick control" (`features/practice`).
- **Hai construction đều hợp lệ:**
  1. Practice import `MetronomeControls` từ `features/metronome` — **vi phạm AD-1** vì diagram không có mũi tên `features → features` ("phụ thuộc chỉ chảy theo mũi tên"), nên team sẽ né…
  2. …bằng cách mỗi feature **tự viết khối metronome riêng** (nút ±1/±5, tap, chọn nhịp, BPM display). Hoàn toàn đúng luật: cả hai chỉ dùng `MetronomeEngine` từ `core/audio`, chỉ dùng token AD-5, đúng route AD-6. Kết quả: hai UI metronome trôi dần khỏi nhau (layout nút, hành vi tap, disable state), trái thẳng EXPERIENCE "khối metronome **tái sử dụng** ở surface 3 và 4".
- **Bằng chứng lỗ trong spine:** Structural Seed liệt kê `ui/`: Button, Card, BeatDots, PatternGrid, VideoEmbed, DrumMap — **không có MetronomeControls/MetronomeBlock**. Spine vừa cấm đường import ngang vừa không cấp chỗ cho khối dùng chung → mọi cách build đều hoặc phạm luật hoặc nhân bản.
- **Vá:** thêm vào AD-1 câu tường minh "`features/*` không import lẫn nhau; mọi khối UI dùng chung ≥2 feature phải hạ xuống `ui/`", và thêm `ui/MetronomeBlock` (controls + BeatDots + shortcuts, nhận engine/instance qua props hoặc từ core) vào Structural Seed.

### A2 — AudioContext "duy nhất" nhưng vô chủ: race giữa drum-map và engine, và "giải phóng audio" được phép hiểu là `close()`

- **Hai unit:** story "Sơ đồ trống tương tác" (`ui/DrumMap` + sample player) × story "MetronomeEngine + trang metronome".
- **Hai construction đều hợp lệ:**
  1. `MetronomeEngine` tự tạo `AudioContext` trong constructor/start (nó là "một AudioContext duy nhất" — tại thời điểm đó đúng là chỉ có một). DrumMap, ở `ui/` (được import `core/` theo AD-1), gọi sample player cũng lazy-init context riêng khi user click lần đầu (autoplay policy) — mỗi module đều tự thấy mình giữ "the single context". Hai context tồn tại song song ngay trên trang bài học 1 (drum-map) + trang có practice block.
  2. Biến thể tệ hơn nhưng vẫn "đúng chữ": DrumMap phát mẫu bằng `<audio>`/`HTMLAudioElement` — không tạo AudioContext thứ hai nên không phạm "một AudioContext duy nhất", nhưng phá luôn ý đồ AD-3 (context dùng chung cho "metronome + âm thanh mẫu drum-map"), sinh hai pipeline âm lượng/độ trễ khác nhau và hai cách xử lý fallback "file lỗi → im lặng" khác nhau.
  3. EXPERIENCE: "Rời trang → metronome dừng và **giải phóng audio**". Story metronome hiện thực bằng `audioContext.close()` khi unmount — hợp lệ. Sang trang bài học, drum-map/practice cần context → hoặc chết (context closed) hoặc tạo lại → tranh cãi vô hạn về "một context duy nhất" nghĩa là gì.
- **Vá (siết AD-3):** "`core/audio/context.ts` là **chủ sở hữu duy nhất**: export `getAudioContext()` singleton, lazy-init trong user gesture đầu tiên, `resume()` khi suspended; **không module nào khác được gọi `new AudioContext()` hay dùng `HTMLAudioElement` để phát âm**. Mọi phát âm (tick, sample) đi qua `core/audio`. 'Giải phóng audio' khi rời trang = engine `stop()` + hủy timer lookahead; **không bao giờ `close()`** context dùng chung."

## HIGH

### A3 — `sessions` không có định nghĩa: hai nghĩa "buổi tập" cùng hợp lệ

- **Hai unit:** story "Nút Hoàn thành bài" (`features/lesson`) × story "Ghi tempo tốt nhất / dùng metronome" (`features/practice` hoặc `features/metronome`).
- **Hai construction đều hợp lệ:** AD-4 chỉ nói envelope có `sessions: IsoDateTime[]`, mutation qua API store. (a) Lesson story: mỗi lần bấm "Hoàn thành" push một timestamp — sessions = nhật ký hoàn thành. (b) Practice story đọc FR-16 "lịch sử **ngày tập**": bấm Start metronome / ghi best tempo cũng là "tập" → cũng push vào `sessions` qua API store (hoàn toàn được phép — API mở cho mọi feature). Kết quả: hai nguồn ghi chồng nhau, ngày chỉ nghịch metronome vẫn nuôi streak theo story B nhưng không theo story A; số phần tử `sessions` bùng nổ (push mỗi lần start). Câu hỏi phụ cùng lỗ: một ngày N sự kiện → N phần tử hay 1? Bấm "Hoàn thành" lại lần hai (nút "Tập lại") → `completedLessons[id]` ghi đè timestamp gốc hay giữ lần đầu?
- **Vá (siết AD-4):** "Một session = một lần bấm 'Hoàn thành bài hôm nay'. Store expose đúng một mutation `completeLesson(id, now)`: set `completedLessons[id]` (**giữ timestamp lần đầu**, hoàn thành lại không đổi) và append vào `sessions` **tối đa một entry mỗi ngày local**. Không API nào khác được ghi `sessions`. Dùng metronome/practice không tạo session."

### A4 — Streak là "giá trị dẫn xuất" nhưng không ai được chỉ định dẫn xuất nó; cộng bẫy UTC-vs-local

- **Hai unit:** story "Trang chủ (thẻ Hôm nay + streak 🔥)" (`features/roadmap`) × story "Trang tiến độ (lịch sử + streak)" (`features/progress`).
- **Hai construction đều hợp lệ:** AD-4 chỉ nói streak "tính từ `sessions`, không lưu" — không nói tính **ở đâu** và **theo luật nào**. (a) Roadmap tính: chuỗi ngày liên tiếp kết thúc ở hôm qua-hoặc-hôm-nay (streak "còn sống" khi hôm nay chưa tập). (b) Progress tính: chuỗi phải chứa hôm nay, chưa tập hôm nay → đứt. Cùng một `sessions`, trang chủ hiện 🔥5, trang tiến độ hiện 🔥0 — cùng lúc. Thêm bẫy convention tự mâu thuẫn: lưu bằng `toISOString()` (**UTC**) nhưng so "cùng ngày" theo **local** — story nào so bằng `s.slice(0, 10)` vẫn đúng chữ "ISO 8601 string" mà sai ngày với user UTC+7 tập sau 7h sáng… thực ra là trước 7h sáng; hai story chọn hai cách → lịch sử ngày tập lệch nhau giữa hai trang.
- **Vá:** thêm vào AD-4: "`core/progress/derive.ts` export `computeStreak(sessions, now)` và `sameLocalDay(a, b)` — **nơi duy nhất** hiểu ngày/streak; feature chỉ gọi, không tự tính. Định nghĩa chuẩn: streak = số ngày local liên tiếp có session, tính lùi từ hôm nay nếu hôm nay có session, ngược lại từ hôm qua; hôm nay chưa tập **không** làm đứt chuỗi của hôm qua. Cấm so sánh ngày bằng cắt chuỗi ISO."

### A5 — `bestTempos: Record<LessonId, number>` × entity Exercise: hai không gian khóa cùng hợp lệ

- **Hai unit:** story "Khối luyện tập + nút ghi tempo tốt nhất" (`features/practice`) × story "Trang tiến độ render bestTempos" (`features/progress`).
- **Hai construction đều hợp lệ:** `core/types.ts` có cả `Lesson` lẫn `Exercise` (Structural Seed); một bài có thể chứa nhiều exercise. (a) Practice story mint khóa theo exercise: `gd1-t2-b3-e1` — không phạm convention Content ID (convention chỉ định dạng `gd1-t2-b3` cho *bài*, không cấm hậu tố), lưu vào `bestTempos` qua API store — hợp lệ. (b) Progress story render `bestTempos` bằng cách resolve từng khóa qua danh sách Lesson trong `content/` → khóa `-e1` không resolve: hàng mồ côi, hoặc crash, hoặc âm thầm lọc mất dữ liệu user đã ghi. Cả hai đúng AD-2/AD-4 từng chữ.
- **Vá:** siết convention Content ID + AD-4: "Không gian khóa của `completedLessons` và `bestTempos` là **đúng tập ID xuất hiện trong content** (mọi item có trang `/bai-hoc/:id`); Exercise nhúng trong bài **không có ID riêng trong progress** — best tempo ghi lên ID của bài chứa nó, mỗi bài tối đa một practice block ở Giai đoạn 1. Store validate khóa thuộc content trước khi ghi." (Hoặc ngược lại: cấp ID progress cho exercise — nhưng phải **chọn một**, ngay bây giờ.)

## MODERATE

### A6 — Đơn vị hoàn thành & mẫu số "4/6 bài": ba trang ba con số

- **Hai unit:** "Trang chủ: tiến độ giai đoạn" × "Lộ trình: checkmark card" × "Tiến độ: checklist theo tuần".
- **Construction xung đột:** EXPERIENCE surface 2 nói tuần gồm "card **bài học/bài tập**". Roadmap story đếm mẫu số = bài học + bài tập (6); trang chủ đếm chỉ bài học (4); progress checklist đếm mọi item có checkmark. Cả ba tự đọc `content/` (AD-2 cho phép) và tự đếm → "Tuần 1 · 4/6" ở trang chủ, "3/4" ở lộ trình. "Xong Tuần N 🎉" (State Patterns) bắn ở ngưỡng khác nhau tùy trang nào tính.
- **Vá:** cùng chỗ với A4: `core/progress/derive.ts` export `getWeekProgress(content, progress)` / `isWeekComplete(...)` — mẫu số định nghĩa một lần = số item hoàn-thành-được trong tuần (khớp quyết định ở A5).

### A7 — "Một class MetronomeEngine duy nhất" ≠ một instance: tempo state và default 60 vs tempo mục tiêu

- **Hai unit:** "Trang metronome" × "Khối luyện tập trong trang bài học".
- **Construction xung đột:** (a) Metronome story giữ engine là **module singleton** trong `core/audio` → user chỉnh 90 bpm ở `/metronome`, mở bài học thấy practice block cũng 90. (b) Practice story `new MetronomeEngine()` mỗi lần mount, init theo `targetTempo` của exercise từ content — cũng đúng chữ AD-3 ("một class duy nhất" — class, không nói instance). EXPERIENCE lại nói "mặc định mở ở **60**" — mỗi story đọc "mở" một kiểu (mở app? mở surface?). Hai instance sống cùng lúc còn nghĩa là hai timer lookahead cùng schedule vào một context nếu ai quên stop.
- **Vá (siết AD-3):** "Đúng **một instance** engine, module-level trong `core/audio`, export sẵn; surface `attach`/`detach`. Tempo init: `/metronome` giữ tempo lần chỉnh cuối trong phiên (mặc định 60 khi app mở); practice block set `targetTempo` của exercise khi mount. Rời surface → `stop()` (per EXPERIENCE), tempo state giữ nguyên."

### A8 — Tap tempo: thuật toán và chỗ ở đều bỏ ngỏ; tap khi engine đang chạy

- **Hai unit:** "Trang metronome" × "Khối luyện tập" (nếu A1 vá bằng cách mỗi bên tự viết thì lỗ này chắc chắn nở).
- **Construction xung đột:** AD-3 chỉ quản scheduling; tap tempo không được nhắc trong spine. (a) Story metronome: trung bình 4 khoảng gần nhất, làm tròn, clamp 40–200, áp dụng ngay lập tức và **re-anchor phách 1 vào tap cuối**. (b) Story practice: median 3 khoảng, áp dụng "từ ô nhịp kế tiếp" theo đúng câu AD-3 về đổi tempo, không re-anchor. Cùng phím `T`, hai cảm giác khác nhau trên hai surface; cả hai đều đúng luật.
- **Vá:** thêm vào AD-3: "Tap tempo sống trong `core/audio` (hàm thuần `tapTempo(timestamps)` hoặc `engine.tap()`): trung bình N=4 khoảng cuối, reset nếu khoảng > 2s, clamp 40–200; kết quả đi qua đúng đường `setTempo` (hiệu lực từ ô nhịp kế tiếp, không re-anchor phase)."

### A9 — Payload beat event thiếu: "số phách" trong ô nhịp buộc practice tự đếm — và trôi

- **Hai unit:** "BeatDots trang metronome" × "Con trỏ pattern grid" (`features/practice`).
- **Construction xung đột:** AD-3 nói engine phát "(số phách, audioTime)". (a) BeatDots dùng thẳng số phách 1..4 — đủ. (b) Pattern 8 ô cần chỉ số **đơn điệu tăng** để index ô qua nhiều bar → practice tự giữ counter trong React state, tăng mỗi event. Counter này trôi khỏi engine khi đổi tempo/stop-start/tab background rồi quay lại (EXPERIENCE: "visual bắt kịp lại ngay khi tab hiện" — bắt kịp bằng gì khi chỉ có số phách 1..4?). Cả hai construction đúng chữ AD-3.
- **Vá (siết AD-3):** "Beat event payload chuẩn: `{ tickIndex: number (đơn điệu từ lúc start), beatInBar, bar, audioTime }`. Consumer **không được tự đếm tick**; vị trí ô pattern = `tickIndex % pattern.length`."

### A10 — Phím tắt: hai chủ sở hữu window listener, hai guard list, Space double-fire

- **Hai unit:** "Trang metronome" × "Khối luyện tập trong trang bài học".
- **Construction xung đột:** EXPERIENCE định phím cho "surface có metronome (3, 4)" nhưng spine không đặt chỗ cho binding. (a) Metronome story: `window.addEventListener('keydown')` trong feature, guard đúng chữ EXPERIENCE — chỉ nhả khi focus ở *input*. (b) Practice story: hook riêng, guard thêm BUTTON/TEXTAREA và `preventDefault` chống Space cuộn trang. Trên trang bài học: focus đang ở nút "Hoàn thành bài hôm nay", bấm Space → vừa toggle metronome (guard kiểu (a) không chặn button) vừa click "Hoàn thành" — ghi nhầm một session. Cả hai đều "đúng EXPERIENCE".
- **Vá:** convention mới: "Một hook `useMetronomeShortcuts(engine)` duy nhất (sống cạnh MetronomeBlock trong `ui/` — xem A1), mount tối đa một lần mỗi trang; guard: bỏ qua khi `event.target` là input/textarea/select/contentEditable **hoặc button**; Space/↑/↓ luôn `preventDefault`."

### A11 — Import: "validate schemaVersion" là điều kiện đủ theo chữ — envelope thối vẫn qua cửa; merge vs ghi đè

- **Hai unit:** story "Export/Import" (`features/progress`) × mọi consumer của store (trang chủ, lộ trình).
- **Construction xung đột:** AD-4 chỉ bắt "validate `schemaVersion` trước khi ghi". File `{ "schemaVersion": 1 }` (thiếu cả 3 field), hoặc `sessions: "2026-07-08"` (string thay vì mảng) — import story ghi thẳng, hoàn toàn đúng chữ. Trang chủ gọi `computeStreak(sessions)` → crash trên dữ liệu "đã validate". Nhánh hai: KF-3 nói "ghi đè" nhưng store API dạng mutation từng field cho phép story hiện thực import = **merge** (union completedLessons, max bestTempos) — cũng không trái chữ nào trong AD-4.
- **Vá (siết AD-4):** "Import validate **toàn bộ cấu trúc envelope** (từng field đúng kiểu, mọi timestamp parse được, mọi khóa thuộc content — khớp A5); fail bất kỳ → từ chối nguyên file, không ghi gì (EXPERIENCE 'Import JSON không hợp lệ'). Import hợp lệ = **thay thế nguyên tử toàn bộ envelope** sau confirm, không merge."

## LOW

### A12 — "Bài tiếp theo" (FR-3) được suy ra ở ≥3 chỗ

- **Hai unit:** "Thẻ Hôm nay trang chủ" × "Điều hướng gợi ý sau Hoàn thành" (lesson) × "Nút dẫn về bài 1" (progress empty state).
- **Construction xung đột:** (a) "item chưa hoàn thành đầu tiên theo thứ tự giáo trình" vs (b) "item liền sau item hoàn thành gần nhất" — khác nhau khi user học nhảy cóc. Cả hai đúng AD-2/AD-4.
- **Vá:** `getNextLesson(content, progress)` trong `core/progress/derive.ts` (gộp chung mối A4/A6), là nguồn duy nhất.

### A13 — Tra cứu content theo ID và 404: không có API đăng ký

- **Hai unit:** "Trang bài học `/bai-hoc/:id`" × "Lộ trình".
- **Construction xung đột:** AD-2 nói "đăng ký vào danh sách giai đoạn" nhưng không định API. Lesson story tự build `Map<LessonId, Lesson>` trong feature; roadmap tự duyệt mảng lồng nhau; `:id` không tồn tại → lesson trả trang trắng, roadmap link tới ID gõ nhầm không ai bắt. Cả hai đúng chữ.
- **Vá:** thêm vào AD-2: "`content/index.ts` export `phases: Phase[]` và `getLessonById(id): Lesson | undefined` — điểm tra cứu duy nhất; `/bai-hoc/:id` không resolve → redirect `/lo-trinh` + toast nhẹ (khớp convention Lỗi & trạng thái)."

---

## Tổng hợp vá — nếu chỉ sửa 5 điều

1. **AD-1+Seed:** cấm features→features tường minh; thêm `ui/MetronomeBlock` + `useMetronomeShortcuts` (đóng A1, A10).
2. **AD-3:** chủ sở hữu `getAudioContext()` duy nhất trong core, cấm context/`<audio>` ngoài luồng, "giải phóng" ≠ `close()`; một **instance** engine; payload event có `tickIndex` đơn điệu; tap tempo trong core (đóng A2, A7, A8, A9).
3. **AD-4 (semantics):** định nghĩa session = một lần Hoàn thành, ≤1/ngày local, `completeLesson` là mutation duy nhất ghi sessions; giữ timestamp hoàn thành đầu tiên (đóng A3).
4. **AD-4 (derive):** `core/progress/derive.ts` — `computeStreak`, `sameLocalDay`, `getWeekProgress`, `getNextLesson`; định nghĩa streak một câu; cấm cắt chuỗi ISO để so ngày (đóng A4, A6, A12).
5. **AD-4 (khóa & import):** không gian khóa progress = ID trong content, exercise không có ID progress riêng; import validate full envelope, thay thế nguyên tử (đóng A5, A11). Kèm A13 vào AD-2 một câu.

Sau 5 mũi vá này, các cặp unit ở trên hết đường build lệch nhau mà vẫn "đúng luật" — spine đủ điều kiện làm nền tạo epics/stories.
