import { describe, expect, it } from 'vitest'
import { DRUM_KIT_PARTS } from './drum-kit-parts'

// Hợp đồng data 6 bộ phận (FR-6) — chốt chống sửa ẩu, tinh thần test "VI trước EN" 2.2.

describe('DRUM_KIT_PARTS (FR-6)', () => {
  it('đúng 6 bộ phận theo thứ tự FR-6: snare, tom, kick, hihat, crash, ride', () => {
    expect(DRUM_KIT_PARTS.map((part) => part.id)).toEqual([
      'snare',
      'tom',
      'kick',
      'hihat',
      'crash',
      'ride',
    ])
  })

  it('id không trùng', () => {
    const ids = DRUM_KIT_PARTS.map((part) => part.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('soundUrl khớp /^\\/sounds\\/[a-z]+\\.wav$/ theo id, không trùng (AR-7 tự host)', () => {
    for (const part of DRUM_KIT_PARTS) {
      expect(part.soundUrl).toMatch(/^\/sounds\/[a-z]+\.wav$/)
      expect(part.soundUrl).toBe(`/sounds/${part.id}.wav`)
    }
    const urls = DRUM_KIT_PARTS.map((part) => part.soundUrl)
    expect(new Set(urls).size).toBe(urls.length)
  })

  it('label và role tiếng Việt không rỗng (NFR-1: thuật ngữ Anh + chú giải Việt)', () => {
    for (const part of DRUM_KIT_PARTS) {
      expect(part.label.trim().length).toBeGreaterThan(0)
      expect(part.role.trim().length).toBeGreaterThan(0)
    }
  })

  it("label dạng 'Tên Anh (chú giải Việt)' — DrumMap cắt phần trước ngoặc làm nhãn SVG", () => {
    for (const part of DRUM_KIT_PARTS) {
      expect(part.label).toMatch(/^[^()]+ \(.+\)$/)
    }
  })
})
