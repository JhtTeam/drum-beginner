// Data 6 bộ phận bộ trống (FR-6) — module thuần, không React (AD-1: ui/ chỉ import core/).
// Thứ tự mảng = thứ tự FR-6; nội dung tiếng Việt nguyên văn bảng story 2.3 (NFR-1:
// thuật ngữ tiếng Anh + chú giải Việt, giọng khớp theory bài gd1-t1-b1).
// AR-7: soundUrl trỏ file WAV tự host trong public/sounds/ — thay file cùng tên bằng
// sample CC0 hay hơn về sau là zero code change (chủ đích quy ước đặt tên).

// Union chữ — DrumMap map id → hình học ở compile time, gõ nhầm/thiếu là lỗi tsc.
export type DrumKitPartId = 'snare' | 'tom' | 'kick' | 'hihat' | 'crash' | 'ride'

export interface DrumKitPart {
  id: DrumKitPartId
  label: string
  role: string
  soundUrl: string
}

export const DRUM_KIT_PARTS: readonly DrumKitPart[] = [
  {
    id: 'snare',
    label: 'Snare (trống lẫy)',
    role: 'Trống chính ngay trước mặt bạn — tiếng đanh và gọn. Mọi bài tập tay của giai đoạn này chơi trên nó.',
    soundUrl: '/sounds/snare.wav',
  },
  {
    id: 'tom',
    label: 'Tom (trống tròn)',
    role: 'Gắn phía trên hoặc đứng cạnh — tiếng trầm và tròn hơn snare, hay dùng để chuyển đoạn.',
    soundUrl: '/sounds/tom.wav',
  },
  {
    id: 'kick',
    label: 'Kick (trống cái)',
    role: 'Trống to nhất, đạp bằng bàn đạp chân phải — giữ phần "thịch thịch" nền của bài nhạc.',
    soundUrl: '/sounds/kick.wav',
  },
  {
    id: 'hihat',
    label: 'Hi-hat (chũm chọe đóng mở)',
    role: 'Cặp lá đóng mở bằng chân trái — âm "chíc chíc" đều đặn giữ nhịp cho cả bài.',
    soundUrl: '/sounds/hihat.wav',
  },
  {
    id: 'crash',
    label: 'Crash (chũm chọe điểm nhấn)',
    role: 'Lá đánh điểm nhấn — tiếng "xoảng" bùng nổ khi mở đầu hoặc kết một đoạn.',
    soundUrl: '/sounds/crash.wav',
  },
  {
    id: 'ride',
    label: 'Ride (chũm chọe lớn)',
    role: 'Lá lớn nhất bộ — gõ đều thay hi-hat khi bài nhạc cần màu sắc khác.',
    soundUrl: '/sounds/ride.wav',
  },
]
