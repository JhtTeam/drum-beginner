# Deferred Work

## Deferred from: code review of 1-1-khung-du-an-design-tokens-nav-va-deploy (2026-07-08)

- SPA rewrite `/(.*) → /index.html` nuốt 404 của asset thiếu (trả HTML 200 thay vì 404 sạch). Config đúng theo AR-9 (spec-prescribed); xem lại khi load file âm thanh thật ở story 2.3 — cân nhắc loại trừ `/assets/` và `/sounds/` khỏi fallback nếu gây khó debug.
- ~~Component token composite `bpm-display.typography` (DESIGN.md) chưa map thành custom property riêng~~ — ĐÃ GIẢI QUYẾT ở story 1.3: `ui/MetronomeBlock` tiêu thụ trực tiếp role tokens (`--font-size-display-bpm`, `--font-weight-display-bpm`, `--letter-spacing-display-bpm`, `--bpm-display-color`), không cần token composite mới. Phần còn lại: `pattern-cell.typography` xử lý tương tự khi `ui/PatternGrid` (story 2.4) tiêu thụ role tokens (`--font-size-pattern-letter`…).
- ARCHITECTURE-SPINE Structural Seed comment ghi "RouterProvider" trong khi AD-6 (binding) chỉ định declarative mode (`BrowserRouter` + `<Routes>`) — code theo AD-6; cần một dòng reconcile trong spine doc.
- Skip-to-content link + focus management khi đổi route (Accessibility Floor "điều hướng bàn phím đủ mọi flow") — hiện 4 nav item là đủ dùng bàn phím; thêm khi trang có flow thật (story 1.3 trở đi).

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-metronome-engine-nghe-duoc-nhip-chuan.md`
  summary: Click metronome chạy oscillator ở gain đỉnh 1.0 thẳng vào ctx.destination — chưa có master gain stage cho AudioContext dùng chung; khi story 2.3 trộn thêm âm mẫu trống sẽ có nguy cơ clipping và không có chỗ chỉnh mix.
  evidence: `scheduleClick` trong metronome-engine.ts đặt `CLICK_PEAK_GAIN = 1` và connect trực tiếp destination; ARCHITECTURE-SPINE AD-3/AD-7 chỉ định drum-map 2.3 tái dùng chính AudioContext này nên hai nguồn âm sẽ cộng biên độ.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-metronome-block-hoan-chinh-trang-metronome-dung-duoc-that.md`
  summary: Sau khi click bất kỳ nút nào trên /metronome, focus nằm lại trên button nên MỌI phím tắt (kể cả ↑/↓/T vốn không có native activation trên button) bị resolver chặn — user click "Bắt đầu" rồi nhấn ↑ sẽ không thấy gì cho tới khi focus rời button.
  evidence: Hành vi đúng theo intent contract ("null khi target tương tác" — chặn blanket để Space không double-fire, story AC-3); nới lỏng (chỉ chặn Space/Enter trên BUTTON/A, giữ blanket cho INPUT/TEXTAREA/SELECT/contentEditable) là quyết định sản phẩm cần con người chốt vì nó sửa ngữ nghĩa đã ghi trong spec/story.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-metronome-block-hoan-chinh-trang-metronome-dung-duoc-that.md`
  summary: Đổi tempo (phím tắt, tap, nút ±) không được announce cho screen reader — dots aria-hidden (hợp thức) và số BPM là span thường, chưa có aria-live/role="status".
  evidence: SR user nhấn ↑ hay T không nghe xác nhận gì; thêm role="status" lên .bpmRow cần verify không spam khi giữ phím repeat (throttle nếu cần) — nên làm ở pass a11y có kiểm chứng SR thật.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-3-metronome-block-hoan-chinh-trang-metronome-dung-duoc-that.md`
  summary: Comment đầu tokens.css ("Responsive override sống TẠI ĐÂY, không trong component") giờ mâu thuẫn chữ nghĩa với media query 768px ẩn hint kbd trong MetronomeBlock.module.css (story sanctioned) — cần một dòng reconcile trong tokens.css phân biệt token-value override vs layout visibility rule.
  evidence: src/styles/tokens.css header vs src/ui/MetronomeBlock.module.css cuối file; cùng loại doc-drift với mục RouterProvider đã ghi ở trên.

## Deferred from: code review of spec-2-3-so-do-bo-trong-tuong-tac (2026-07-09)

- Sample + tick metronome chồng đỉnh vẫn vượt 1.0 (0.85×0.9 + 1.0 ≈ 1.77) dù SAMPLE_GAIN 0.9 tạo headroom — cùng gốc với mục master gain stage của spec-1-2 ở trên (hai nguồn âm cộng biên độ thẳng vào destination, chưa có master gain/compressor). Giải quyết MỘT lần cho cả hai mục khi thêm master gain stage; sửa riêng SAMPLE_GAIN không đủ.
- Nhãn SVG trong DrumMap render ~11.8px ở màn 375px (`fontSize={22}` đơn vị viewBox × scale ~0.54) — nhỏ hơn body text, không theo cỡ chữ hệ thống. Lý do defer (user, 2026-07-09): panel đã hiện tên đầy đủ khi chạm nên nhãn chỉ là gợi ý phụ; xem lại ở pass UX/a11y có kiểm chứng trên thiết bị thật (cùng đợt với các mục a11y defer từ story 1.3).

## Deferred from: code review of 2-4-khoi-luyen-tap-stick-control-trong-bai (2026-07-09)

- Đổi `beatsPerBar` giữa chừng (picker 2/3/4 của MetronomeBlock nhúng trong PracticeBlock) làm con trỏ pattern nhảy một offset một lần rồi tự chỉnh đúng — công thức `patternIndexForBeat` nhân beatsPerBar hiện tại cho (bar-1) quá khứ; grid cứng 4 cột nên "1 hàng = 1 ô nhịp" cũng vỡ khi beatsPerBar≠4. KHÔNG crash, KHÔNG NaN, index luôn hợp lệ. Lý do defer (Anhndt, 2026-07-09): self-correcting, ngoài AC #2, đã ghi nhận & chấp nhận trong Dev Notes 2.4; đổi số phách giữa bài stick-control là thao tác hiếm — xem lại nếu có phản hồi UX thật (cân nhắc lock 4/4 trong khối luyện tập, hoặc con trỏ dùng số beat tuyệt đối tích luỹ). Cả Blind Hunter + Edge Case Hunter độc lập cùng flag. Evidence: src/ui/pattern-cursor.ts:16, src/ui/PracticeBlock.tsx:48.
- Logic stateful của PracticeBlock (timer bù delay audioTime, cleanup subscription/timer khi unmount, mount rule AD-8 set tempo, stop→setActiveIndex(null)) không có test tự động — repo env node không có jsdom/@testing-library, thêm sẽ vi phạm ràng buộc "zero dependency mới" của story. Cùng khoảng trống với mọi React component trong repo (chỉ module thuần được unit-test). Giải quyết một lần khi dự án quyết định đưa vào test harness cho component (jsdom hoặc browser-mode Vitest). Evidence: src/ui/PracticeBlock.tsx:38-70.
- Raw `88px` trong PatternGrid.module.css:13 (`max-width: calc(4 * 88px + 3 * var(--spacing-3))`) là giá trị raw thứ hai, mâu thuẫn AD-5 (token-only) và chính comment PracticeBlock.module.css:5 khẳng định "raw hợp thức duy nhất là viền 3px". Đây là cap max-width lấy từ mock để 4 ô không phình quá to. Fix sạch cần thêm token cỡ ô vào tokens.css (ngoài phạm vi story 2.4 — cấm chạm styles/) hoặc bỏ cap (đổi thị giác, cần kiểm mắt). Gộp với đợt dọn token/UX sau. Evidence: src/ui/PatternGrid.module.css:13.

## Deferred from: code review of 3-1-progress-store-nut-hoan-thanh-bai-hom-nay (2026-07-09)

- source_spec: `spec-3-1-progress-store-nut-hoan-thanh-bai-hom-nay.md`
  summary: ProgressStore đọc localStorage một lần lúc khởi tạo, không nghe `storage` event nên hai tab mở song song ghi đè lẫn nhau (last-write-wins) làm mất tiến độ đã hoàn thành ở tab kia.
  evidence: `src/core/progress/store.ts` — constructor load-once + `commit` ghi đè toàn envelope từ snapshot in-memory; không có `window.addEventListener('storage', …)`. Kiến trúc chủ đích "no cloud sync, data chỉ trên trình duyệt" nên đa-tab là edge ngoài mandate story; cân nhắc thêm storage-event re-sync khi có nhu cầu thực. Cả Blind Hunter flag.
- source_spec: `spec-3-1-progress-store-nut-hoan-thanh-bai-hom-nay.md`
  summary: `parseEnvelope` validate đúng KIỂU (string/number) nhưng không kiểm ISO-validity, nên chuỗi rác đúng-kiểu (vd `sessions:["not-a-date"]`) qua cửa `ok` và bị `getStreak` âm thầm bỏ (day key `NaN-NaN-NaN`) → streak thiếu, không có tín hiệu corrupt.
  evidence: `src/core/progress/envelope.ts:44-58` (isStringRecord/isStringArray chỉ check typeof). Ghi của chính app luôn dùng `toISOString()` nên không tự phát sinh; rủi ro chỉ từ dữ liệu import/sửa tay — ngữ nghĩa validation dùng chung với validator import story 3.4, nên chốt cùng 3.4 (thêm `Date.parse` check). Cả hai reviewer flag.
- source_spec: `spec-3-1-progress-store-nut-hoan-thanh-bai-hom-nay.md`
  summary: `ProgressCorruptBanner` gọi `progress.reset()` nhưng bỏ qua `WriteResult`, nên nếu reset ghi thất bại (storage lỗi) banner corrupt kẹt lại mà user không nhận feedback — bấm "Bắt đầu lại" nhiều lần vô hiệu, thành ngõ cụt.
  evidence: `src/ui/ProgressCorruptBanner.tsx` onClick `() => progress.reset()` không đọc kết quả. Hẹp (chỉ khi corrupt VÀ storage đang ghi lỗi đồng thời); polish sau — hiển thị thông báo lỗi/nút retry khi `reset()` trả `{ok:false}`.
