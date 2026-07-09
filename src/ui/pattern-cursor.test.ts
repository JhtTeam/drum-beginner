// Unit test con trỏ pattern (Task 1 — red trước, green sau). Env node, không DOM.
// AR-4: index là DẪN XUẤT stateless từ beat event payload — không đếm event.
import { describe, expect, it } from 'vitest'
import { patternIndexForBeat } from './pattern-cursor'

describe('patternIndexForBeat — dẫn xuất index từ {bar, beatInBar}', () => {
  it('bar 1, phách 1 → ô 0', () => {
    expect(patternIndexForBeat({ bar: 1, beatInBar: 1 }, 4, 4)).toBe(0)
  })

  it('tiến tuần tự trong một bar 4/4: phách 1..4 → ô 0..3', () => {
    expect(patternIndexForBeat({ bar: 1, beatInBar: 1 }, 4, 4)).toBe(0)
    expect(patternIndexForBeat({ bar: 1, beatInBar: 2 }, 4, 4)).toBe(1)
    expect(patternIndexForBeat({ bar: 1, beatInBar: 3 }, 4, 4)).toBe(2)
    expect(patternIndexForBeat({ bar: 1, beatInBar: 4 }, 4, 4)).toBe(3)
  })

  it('pattern 4 ô loop vô hạn: bar 2 phách 1 quay về ô 0 (FR-13)', () => {
    expect(patternIndexForBeat({ bar: 2, beatInBar: 1 }, 4, 4)).toBe(0)
    expect(patternIndexForBeat({ bar: 3, beatInBar: 4 }, 4, 4)).toBe(3)
  })

  it('pattern 8 ô đi hết 2 bar 4/4 rồi wrap', () => {
    expect(patternIndexForBeat({ bar: 2, beatInBar: 4 }, 4, 8)).toBe(7)
    expect(patternIndexForBeat({ bar: 3, beatInBar: 1 }, 4, 8)).toBe(0)
  })

  it('pattern 16 ô đi hết 4 bar 4/4 rồi wrap', () => {
    expect(patternIndexForBeat({ bar: 4, beatInBar: 4 }, 4, 16)).toBe(15)
    expect(patternIndexForBeat({ bar: 5, beatInBar: 1 }, 4, 16)).toBe(0)
    expect(patternIndexForBeat({ bar: 6, beatInBar: 3 }, 4, 16)).toBe(6)
  })

  it('không phụ thuộc tempo — cùng bar/phách luôn cùng ô (AC #2 đổi tempo không nhảy ô)', () => {
    // Hàm không nhận tempo trong chữ ký; hai lần gọi giống nhau cho cùng kết quả.
    const a = patternIndexForBeat({ bar: 7, beatInBar: 2 }, 4, 8)
    const b = patternIndexForBeat({ bar: 7, beatInBar: 2 }, 4, 8)
    expect(a).toBe(b)
    expect(a).toBe(1)
  })

  it('beatsPerBar 3: con trỏ vẫn tiến liên tục qua bar (bar 2 phách 1 → ô 3)', () => {
    expect(patternIndexForBeat({ bar: 2, beatInBar: 1 }, 3, 4)).toBe(3)
    expect(patternIndexForBeat({ bar: 2, beatInBar: 2 }, 3, 4)).toBe(0)
  })

  it('patternLength ≤ 0 → 0 (guard degenerate, không NaN/âm)', () => {
    expect(patternIndexForBeat({ bar: 3, beatInBar: 2 }, 4, 0)).toBe(0)
    expect(patternIndexForBeat({ bar: 3, beatInBar: 2 }, 4, -1)).toBe(0)
  })
})
