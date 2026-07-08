# Deferred Work

## Deferred from: code review of 1-1-khung-du-an-design-tokens-nav-va-deploy (2026-07-08)

- SPA rewrite `/(.*) → /index.html` nuốt 404 của asset thiếu (trả HTML 200 thay vì 404 sạch). Config đúng theo AR-9 (spec-prescribed); xem lại khi load file âm thanh thật ở story 2.3 — cân nhắc loại trừ `/assets/` và `/sounds/` khỏi fallback nếu gây khó debug.
- Component token composite `bpm-display.typography` / `pattern-cell.typography` (DESIGN.md) chưa được map thành custom property riêng — role tokens (`--font-size-display-bpm`, `--font-size-pattern-letter`…) đã đủ giá trị. Map khi `ui/MetronomeBlock` (story 1.3) / `ui/PatternGrid` (story 2.4) tiêu thụ.
- ARCHITECTURE-SPINE Structural Seed comment ghi "RouterProvider" trong khi AD-6 (binding) chỉ định declarative mode (`BrowserRouter` + `<Routes>`) — code theo AD-6; cần một dòng reconcile trong spine doc.
- Skip-to-content link + focus management khi đổi route (Accessibility Floor "điều hướng bàn phím đủ mọi flow") — hiện 4 nav item là đủ dùng bàn phím; thêm khi trang có flow thật (story 1.3 trở đi).

- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-metronome-engine-nghe-duoc-nhip-chuan.md`
  summary: Click metronome chạy oscillator ở gain đỉnh 1.0 thẳng vào ctx.destination — chưa có master gain stage cho AudioContext dùng chung; khi story 2.3 trộn thêm âm mẫu trống sẽ có nguy cơ clipping và không có chỗ chỉnh mix.
  evidence: `scheduleClick` trong metronome-engine.ts đặt `CLICK_PEAK_GAIN = 1` và connect trực tiếp destination; ARCHITECTURE-SPINE AD-3/AD-7 chỉ định drum-map 2.3 tái dùng chính AudioContext này nên hai nguồn âm sẽ cộng biên độ.
