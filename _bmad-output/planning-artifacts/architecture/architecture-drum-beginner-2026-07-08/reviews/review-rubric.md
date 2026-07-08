---
type: review
method: rubric-walker
target: ../ARCHITECTURE-SPINE.md
reviewed: 2026-07-08
verdict: ĐẠT — có phát hiện nhỏ (1 Medium, 3 Low, 2 Info; không có High)
---

# Review theo rubric — ARCHITECTURE-SPINE.md (drum-beginner)

Bối cảnh chấm: dự án hobby cá nhân, greenfield, React+TS static site, một người dùng. Severity đã hiệu chỉnh theo mức rủi ro đó — "Medium" ở đây nghĩa là "hai story có thể build lệch nhau", không phải rủi ro vận hành.

## Kết luận chung

Spine gọn, đúng altitude (feature), tiếng Việt nhất quán với override đã log. 7 AD đều trỏ đúng vào các điểm phân kỳ thật của bước epics/stories, Rule phần lớn enforce được bằng import-check/review. Capability map phủ đủ FR-1..17 và NFR-1..6. Phần "Vận hành" đóng được envelope môi trường (một môi trường, Vercel, không env var, không telemetry) — đây là chỗ nhiều spine bỏ trống, ở đây có. Stack khớp memlog verified 2026-07-08. Mermaid hợp lệ, seed ở mức thư mục — đúng độ tối giản.

Một điểm phân kỳ thật bị bỏ sót (metronome dùng chung giữa hai feature — chi tiết ở F-1); còn lại là các mối nối nhỏ.

## Kết quả theo từng mục rubric

### 1. Chốt đúng các điểm phân kỳ cho tầng dưới — ĐẠT MỘT PHẦN

Các điểm phân kỳ lớn đều có AD: hướng phụ thuộc (AD-1), nội dung là data (AD-2), một engine giữ nhịp (AD-3), một chủ sở hữu localStorage (AD-4), token styling (AD-5), route hằng số (AD-6), asset tự host (AD-7). Đây đúng là những chỗ mà hai dev agent làm hai story sẽ tự chế hai cách khác nhau nếu không chốt.

**Bỏ sót một điểm → F-1 (Medium).** FR-11 yêu cầu metronome vừa là trang riêng (`features/metronome`) vừa nhúng trong khối luyện tập (`features/practice`). Sơ đồ AD-1 **không có cạnh features→features**, tức `practice` không được import từ `metronome`. Vậy khối UI metronome dùng chung (điều khiển tempo ±1/±5, tap tempo, start/stop, và cụm phím tắt Space/↑/↓/T của EXPERIENCE Interaction Primitives) phải sống ở đâu — `ui/`? — spine im lặng. Seed chỉ có `ui/BeatDots`, không có khối điều khiển. Hệ quả thực tế: story "trang metronome" và story "khối luyện tập" mỗi bên tự viết một bộ điều khiển + một bộ keyboard handler, lệch nhau về hành vi (vd. Space cướp phím khi focus ở input). Đây chính xác là loại phân kỳ spine tồn tại để chặn. Fix rẻ: một câu trong AD-3 hoặc seed — "khối điều khiển metronome (controls + shortcuts) là component trong `ui/`, hai feature cùng mount nó quanh một `MetronomeEngine`".

### 2. Rule của từng AD enforce được và chặn đúng divergence — ĐẠT

- AD-1: enforce được bằng lint rule / grep import — tốt.
- AD-2: "thêm giai đoạn = thêm data file + đăng ký" — kiểm được bằng chính SM-3.
- AD-3: pattern lookahead + `useSyncExternalStore` + "âm thanh là nguồn chân lý" chặn đúng cả hai đường lệch (setInterval vs Web Audio, animation tự chạy). Ngưỡng ≤50ms khó enforce tự động nhưng kế thừa từ EXPERIENCE, chấp nhận được.
- AD-4: envelope cụ thể, streak là giá trị dẫn xuất — chặn đúng vụ "nhiều nơi tự ghi localStorage". Envelope khớp State Patterns (import validate, không ghi đè khi lỗi).
- AD-5/AD-6/AD-7: đều có Rule kiểm được bằng review (không hex trần, không string literal path, không CDN runtime).

### 3. Deferred không mở đường cho phân kỳ — ĐẠT

Cả 6 mục Deferred đều an toàn: subdivision/accent, auto-tempo, PWA/sync, CMS/i18n, TS 7.0 đều là tính năng tương lai có "chỗ chờ" rõ (tham số `beatsPerBar`, `schemaVersion`). "Cấu trúc chi tiết bên trong mỗi feature" defer cho code là đúng altitude — hai feature khác nhau về cấu trúc trong không phải là divergence ở tầng này.

### 4. Stack khớp memlog web-verified 2026-07-08 — ĐẠT (một điểm mềm)

Đối chiếu từng dòng với entry `(version)` của memlog: Vite 8.1 ✓, React 19.2 ✓, TypeScript 6.0 (không dùng 7.0 RC — nhất quán với Deferred) ✓, react-router 8.1 package `react-router` (không phải react-router-dom) ✓, Vitest 4.1 ✓, @fontsource/be-vietnam-pro 5.2 ✓, ESLint 10 flat-config + typescript-eslint unified ✓. Quyết định KHÔNG Zustand của memlog cũng phản ánh đúng (spine không kê Zustand, AD-3/AD-4 dùng built-ins). Node ≥20.19 không có trong memlog nhưng là hệ quả của Vite — không tính là lệch.

**F-4 (Low):** `@testing-library/react — latest` là ô duy nhất không có version verify. "latest" tại thời điểm dev agent chạy có thể khác thời điểm verify — nên ghi số như các dòng còn lại, hoặc ghi rõ "peer-compatible với React 19".

### 5. Phủ capability của nguồn — ĐẠT

Capability map cột-đối-cột: F1→FR-1..3, F2→FR-4..6, F3→FR-7..11, F4→FR-12..14, F5→FR-15..17, styling→NFR-1/3. NFR-2 sống trong AD-3, NFR-4 trong "Vận hành", NFR-5 trong AD-7, NFR-6 trong Stack (TS strict) + AD-2. Các quyết định UX đã chốt (SVG drum-map, click-to-load, 5 route slug tiếng Việt) đều được spine tiếp nhận verbatim. Không FR/NFR nào mồ côi.

### 6. Mọi dimension của altitude được quyết/defer/hỏi — ĐẠT (hai mối nối nhỏ)

Envelope vận hành **có mặt tường minh** — điểm cộng lớn: một môi trường production, deploy = git push lên Vercel, không staging, không env var runtime, không analytics. Đúng khẩu độ hobby.

**F-3 (Low):** thiếu một quyết định về **quality gate**: Conventions bắt buộc unit test cho `core/` (Vitest), nhưng không nói test/lint chạy ở đâu — Vercel auto-build mặc định không chạy vitest. Với hobby, chỉ cần một dòng: "gate = chạy local trước khi push" hoặc "GitHub Actions chạy `vitest run` + `eslint`". Không quyết thì mỗi epic tự hiểu một kiểu về "test bắt buộc" nghĩa là gì.

**F-6 (Info):** browser baseline không nêu (Web Audio, `useSyncExternalStore` đều cần trình duyệt hiện đại). Một người dùng duy nhất trên máy của chính mình → gần như vô hại, ghi nhận cho đủ.

### 7. Mermaid hợp lệ; seed tối giản — ĐẠT (một điểm Info)

Diagram `graph LR` cú pháp hợp lệ (label có ký tự đặc biệt đều đã quote). Seed dừng ở mức thư mục + một content file, comment trỏ ngược về AD — đúng liều.

**F-5 (Info):** dòng `ui/` kê đích danh 6 component (Button, Card, BeatDots, PatternGrid, VideoEmbed, DrumMap). Các tên này bám DESIGN.md components nên không phải bịa, nhưng đây là danh sách code nên sở hữu — spine chỉ cần nói "component chung theo DESIGN.md". Rất nhẹ, không yêu cầu sửa.

## Phát hiện chéo nguồn (ngoài 7 mục, ghi nhận thêm)

**F-2 (Low) — Thumbnail YouTube vs Rule "runtime không CDN ngoài".** AD-7 cho ngoại lệ duy nhất là *iframe sau click*. Nhưng DESIGN/EXPERIENCE mô tả video-embed hiển thị **thumbnail + nút play trước khi click** — thumbnail đó lấy từ đâu? Nếu từ `i.ytimg.com` thì trang đã gọi CDN ngoài trước click, vi phạm chữ nghĩa của Rule; nếu tự host thì là công việc content cần nói ra. Hai dev agent sẽ chọn hai đường khác nhau. Fix: một mệnh đề trong AD-7 — hoặc nới ngoại lệ thành "iframe + thumbnail tĩnh của YouTube", hoặc quy định thumbnail tự host/vẽ placeholder.

**F-7 (Info) — "Giải phóng audio" vs một AudioContext duy nhất.** EXPERIENCE: "Rời trang → metronome dừng và giải phóng audio"; AD-3: một `AudioContext` cho cả app. Nếu dev agent hiểu "giải phóng" = `close()` thì context chết, sang trang drum-map không phát được âm mẫu. Nên chú thích: dừng = stop scheduler + `suspend()`, không `close()`.

## Bảng tổng hợp phát hiện

| # | Severity | Phát hiện | Mục rubric | Fix đề xuất |
|---|---|---|---|---|
| F-1 | **Medium** | Khối metronome dùng chung (controls + phím tắt) cho FR-11 không có chủ; AD-1 chặn features→features nên buộc phải quyết mà spine im lặng | 1 | Một câu trong AD-3/seed: khối điều khiển metronome sống ở `ui/`, hai feature cùng mount quanh MetronomeEngine |
| F-2 | Low | Nguồn thumbnail YouTube trước click chưa quyết — có thể vi phạm chính Rule AD-7 | AD-7 | Nới ngoại lệ AD-7 hoặc quy định thumbnail tự host |
| F-3 | Low | Quality gate không quyết: test `core/` bắt buộc nhưng không nói chạy ở đâu (Vercel build không chạy vitest) | 6 | Một dòng trong "Vận hành": gate local hoặc GitHub Actions |
| F-4 | Low | `@testing-library/react — latest` không có version verify như các dòng Stack khác | 4 | Ghi số version đã verify |
| F-5 | Info | Seed `ui/` kê đích danh 6 component — chi tiết code nên sở hữu | 7 | Tùy chọn: đổi thành "component chung theo DESIGN.md" |
| F-6 | Info | Browser baseline không nêu (vô hại với single-user) | 6 | Tùy chọn: một dòng "evergreen browsers" |
| F-7 | Info | "Giải phóng audio" (EXPERIENCE) dễ đọc thành `close()` — xung đột một-AudioContext của AD-3 | 2 | Chú thích suspend ≠ close trong AD-3 |

**Đếm theo severity: High 0 · Medium 1 · Low 3 · Info 3.**

## Verdict

**ĐẠT.** Spine đủ chuẩn làm build-substrate cho bước epics/stories sau khi vá F-1 (một câu). F-2/F-3 nên vá cùng lúc vì đều là fix một dòng; các Info tùy chọn. Không có phát hiện nào đòi tái kiến trúc.
