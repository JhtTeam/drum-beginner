/*
 * pattern-cursor — suy vị trí ô pattern từ beat event của engine (AR-4/AD-3):
 * UI KHÔNG tự đếm tick; index là dẫn xuất STATELESS từ payload {bar, beatInBar}
 * nên đổi tempo giữa chừng không lệch ô (AC #2) và tab ẩn/hiện bắt kịp ngay,
 * không tua dồn (UX-DR13). Module thuần TS — không React (AD-1).
 */

/** bar/beatInBar đếm TỪ 1 (khớp BeatEvent của MetronomeEngine); pattern loop vô hạn (FR-13). */
export function patternIndexForBeat(
  event: { bar: number; beatInBar: number },
  beatsPerBar: number,
  patternLength: number,
): number {
  // Guard degenerate: pattern rỗng không có ô nào — trả 0, không NaN/âm.
  if (patternLength <= 0) return 0
  return ((event.bar - 1) * beatsPerBar + (event.beatInBar - 1)) % patternLength
}
