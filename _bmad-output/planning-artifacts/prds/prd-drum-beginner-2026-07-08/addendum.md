# Addendum — PRD Drum Beginner

Nội dung sâu hơn PRD, dành cho các bước downstream (UX, architecture, epics).

## A. Digest nghiên cứu comparables (2026-07-08)

**Định vị các sản phẩm tương tự:**

- **Drumeo**: video-first, lộ trình tuyến tính 10 level (Drumeo Method), một giảng viên xuyên suốt; tiến độ = XP + trạng thái bài (hoàn thành / đang học / để dành); thẻ "continue where you left off" nổi bật trên trang chủ.
- **Melodics**: gamified, app nghe MIDI và chấm điểm từng nốt; retention loop = daily goal → streak → calendar heatmap lịch sử tập.
- **Rudiment trainers** (Drummer ITP, drumrudiments.app, DRT): thư viện rudiment với sticking R/L, metronome nhúng ~10–320 bpm, nút tăng tempo ±5; DRT tránh yêu cầu đọc nhạc (visual tracker dọc) — analog gần nhất với site hobby này.
- **Practice journals** (Andante, Modacity): đều hội tụ về timer + daily goal + streak + session log.

**Baseline metronome web miễn phí:** BPM ~20–300 (slider + input số), tap tempo, time signature 2/4–7/4 + 6/8..., subdivision (đen/đơn/chùm ba/kép), accent phách 1 + chỉnh accent từng phách, chấm beat sáng theo nhịp, phím Space start/stop.

**UX pattern đáng copy cho site React nhỏ:**

- Số BPM to, nút tap tempo, chấm accent từng phách kiêm luôn visual indicator, Space toggle.
- Exercise card = tên pattern + sticking RLRL + metronome nhúng + nút ±5 bpm.
- Streak counter + calendar heatmap + "hoàn thành mục tiêu hôm nay"; kỷ lục tempo tốt nhất per bài tập.
- Level đánh số với checkmark hoàn thành + card "học tiếp từ chỗ dừng".

**Kết luận cho scope hobby:** chấm điểm bằng audio/mic là ngoài phạm vi; tempo goal tự khai báo ("sạch ở 60 → thử 80") là đủ.

Nguồn: MusicRadar & Electronic Drum Advisor (Drumeo review), musora.com/drums, melodics.com (how-it-works, vs-drumeo), rtcd.io, tunableapp.com, onlinemetronome.app, idrumtune.com/drummer-itp, drumrudiments.app, DRT (Google Play), andante.app, modacity.co, athenify.io.

## B. Danh sách video YouTube khởi tạo (đã xác minh 2026-07-08)

Tất cả video được xác minh tồn tại qua tìm kiếm YouTube trực tiếp + oEmbed API (đúng title + channel). URL dạng `youtube.com/watch?v=ID`, nhúng qua `youtube.com/embed/ID`.

### B1. Cách cầm dùi trống đúng tư thế

| Video | Kênh | Ngôn ngữ | Thời lượng | URL |
|---|---|---|---|---|
| Hướng dẫn đánh trống cơ bản: Cách cầm dùi trống | Việt Thương Music | vi | 7:55 | https://www.youtube.com/watch?v=Zvgpjio8n4c |
| Học trống căn bản Bài 2 - Tư Thế Ngồi, Cách Cầm Dùi Và Setup Bộ Trống | Tran Tin Drummer | vi | 14:15 | https://www.youtube.com/watch?v=h8rWFXOoSEc |
| Hướng dẫn tự học trống: Bài 2 - Cách cầm dùi | Duy Phan | vi | 8:22 | https://www.youtube.com/watch?v=mTkuxDQEnk4 |

### B2. Các bộ phận của bộ trống

| Video | Kênh | Ngôn ngữ | Thời lượng | URL |
|---|---|---|---|---|
| Tìm hiểu các bộ phận và tiếng trong 1 bộ trống | Việt Thương Music | vi | 4:05 | https://www.youtube.com/watch?v=VI70TWXRKLM |
| Học trống - Thành phần của một bộ trống | Soul Institute of Arts | vi | 2:43 | https://www.youtube.com/watch?v=-W9qhBrw2Lk |
| Trống Jazz - Cấu tạo, tính năng từng bộ phận (Trung Drum. 330) | Trung Drum | vi | 12:44 | https://www.youtube.com/watch?v=Doxa4nYB4yo |
| (Bonus) Học TRỐNG cơ bản Bài 1: Làm quen với trống | Pong Ơi | vi | 2:26 | https://www.youtube.com/watch?v=LYNnF7iUE8U |

### B3. Tập giữ nhịp với metronome (60–80 bpm)

| Video | Kênh | Ngôn ngữ | Thời lượng | URL |
|---|---|---|---|---|
| Bài 5: Bí mật làm chủ nhịp điệu trống: Tempo & Metronome cho người mới | GIAO DRUM | vi | 7:40 | https://www.youtube.com/watch?v=8bcNVm9tut8 |
| Playing Drums To A Metronome — Drum Lesson | Drum Beats Online | en | — | https://www.youtube.com/watch?v=qc7wPNHCFnU |
| 60 BPM Metronome (click track luyện tập) | Drumset Fundamentals | en (không lời) | 30:00 | https://www.youtube.com/watch?v=gSmf7W3DUjs |

### B4. Stick control cơ bản

| Video | Kênh | Ngôn ngữ | Thời lượng | URL |
|---|---|---|---|---|
| Học Trống cơ bản Bài 2: Bài tập tay cơ bản (Single Stroke) | Pong Ơi | vi | 7:18 | https://www.youtube.com/watch?v=IpXHV9CUvho |
| Học TRỐNG cơ bản Bài 3: Bài tập tay cơ bản (Double Stroke) | Pong Ơi | vi | 5:17 | https://www.youtube.com/watch?v=_wYDJjCFtNY |
| Tự học trống: Paradiddle | Duy Phan | vi | 2:01 | https://www.youtube.com/watch?v=nRJBK5_o5SM |
| How To Play A Paradiddle — Drum Rudiment Lesson | Drumeo | en | 1:17 | https://www.youtube.com/watch?v=h0OoVP6VgBE |

**Ghi chú biên tập:** kênh Pong Ơi có nguyên series "Học TRỐNG cơ bản" — có thể dùng làm xương sống cho toàn Giai đoạn 1 để đồng nhất một giảng viên (pattern Drumeo). Việt Thương Music có cặp video cầm dùi + bộ phận trống cùng series. Không tìm thấy video phù hợp từ Trống Đức Anh, Học Trống Online, TYM Drum, Vũ Drum, Yamaha Music Vietnam.
