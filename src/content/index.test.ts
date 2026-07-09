import { describe, expect, it } from 'vitest'
import { getItemById, getPhases, getWeeks } from './index'

describe('getPhases / getWeeks (AD-2, FR-1)', () => {
  it('có phase gd1 với đúng 3 tuần đánh số 1..3, tuần nào cũng có bài', () => {
    const gd1 = getPhases().find((phase) => phase.id === 'gd1')
    expect(gd1).toBeDefined()
    expect(gd1?.weeks).toHaveLength(3)
    expect(gd1?.weeks.map((week) => week.weekNumber)).toEqual([1, 2, 3])
    for (const week of gd1?.weeks ?? []) {
      expect(week.items.length).toBeGreaterThan(0)
    }
  })

  it('getWeeks trả về tuần của phase, phase lạ → mảng rỗng (không throw)', () => {
    expect(getWeeks('gd1')).toHaveLength(3)
    expect(getWeeks('gd9')).toEqual([])
  })
})

describe('không gian ID gd{p}-t{w}-b{n} (AD-2, AD-4)', () => {
  // Regex suy ra từ phase.id + weekNumber — thêm gd2/tuần 4 sau này không vỡ test (FR-2/SM-3)
  it('mọi id khớp {phase.id}-t{weekNumber}-b{n} của đúng tuần chứa nó', () => {
    for (const phase of getPhases()) {
      for (const week of phase.weeks) {
        for (const item of week.items) {
          expect(item.id).toMatch(new RegExp(`^${phase.id}-t${week.weekNumber}-b\\d+$`))
        }
      }
    }
  })

  it('phase gd1 giữ đúng không gian id /^gd1-t[1-3]-b\\d+$/', () => {
    for (const week of getWeeks('gd1')) {
      for (const item of week.items) {
        expect(item.id).toMatch(/^gd1-t[1-3]-b\d+$/)
      }
    }
  })

  it('id của phase là duy nhất trong registry', () => {
    const phaseIds = getPhases().map((phase) => phase.id)
    expect(new Set(phaseIds).size).toBe(phaseIds.length)
  })

  it('tất cả id là duy nhất trên toàn bộ các phase', () => {
    const ids = getPhases().flatMap((phase) =>
      phase.weeks.flatMap((week) => week.items.map((item) => item.id)),
    )
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getItemById (AD-2 — feature không tự duyệt cây)', () => {
  it('roundtrip cho MỌI item: trả đúng item, phaseId, weekNumber, ordinal', () => {
    for (const phase of getPhases()) {
      for (const week of phase.weeks) {
        week.items.forEach((item, index) => {
          const found = getItemById(item.id)
          expect(found).toBeDefined()
          expect(found?.item).toBe(item)
          expect(found?.phaseId).toBe(phase.id)
          expect(found?.weekNumber).toBe(week.weekNumber)
          expect(found?.ordinal).toBe(index + 1)
        })
      }
    }
  })

  it('id không tồn tại → undefined (không throw, không redirect)', () => {
    expect(getItemById('khong-ton-tai')).toBeUndefined()
    expect(getItemById('')).toBeUndefined()
  })

  it('anchor KF-2: gd1-t1-b1 tồn tại với kind theory (DrumMap mount ở 2.3)', () => {
    const found = getItemById('gd1-t1-b1')
    expect(found?.item.kind).toBe('theory')
    expect(found?.item.title).toBe('Làm quen bộ trống')
  })

  // FR-6: chốt hợp đồng data chống gắn nhầm bài — DrumMap chỉ sống ở bài mở đầu
  it("đúng MỘT item có interactive 'drum-map' trên toàn phase, và đó là gd1-t1-b1", () => {
    const withDrumMap = getPhases().flatMap((phase) =>
      phase.weeks.flatMap((week) =>
        week.items.filter((item) => item.interactive === 'drum-map'),
      ),
    )
    expect(withDrumMap.map((item) => item.id)).toEqual(['gd1-t1-b1'])
  })
})

describe('video data (FR-5, AR-7 — addendum B)', () => {
  const allVideos = () =>
    getPhases().flatMap((phase) =>
      phase.weeks.flatMap((week) => week.items.flatMap((item) => item.videos)),
    )

  it('mọi youtubeId đúng dạng 11 ký tự [A-Za-z0-9_-]', () => {
    for (const video of allVideos()) {
      expect(video.youtubeId).toMatch(/^[A-Za-z0-9_-]{11}$/)
    }
  })

  it('tổng số video toàn phase = 14 (addendum B chép nguyên văn)', () => {
    expect(allVideos()).toHaveLength(14)
  })

  it('trong mỗi item, không video vi nào đứng SAU video en (component không sort — data phải đúng)', () => {
    for (const phase of getPhases()) {
      for (const week of phase.weeks) {
        for (const item of week.items) {
          const firstEn = item.videos.findIndex((video) => video.lang === 'en')
          if (firstEn === -1) continue
          for (const video of item.videos.slice(firstEn)) {
            expect(video.lang).toBe('en')
          }
        }
      }
    }
  })

  it('mọi video en có note tiếng Việt không rỗng (AR-7 — test chốt chống sửa data ẩu)', () => {
    for (const video of allVideos()) {
      if (video.lang !== 'en') continue
      expect(video.note.trim().length).toBeGreaterThan(0)
    }
  })

  it('youtubeId không trùng trong cùng một item', () => {
    for (const phase of getPhases()) {
      for (const week of phase.weeks) {
        for (const item of week.items) {
          const ids = item.videos.map((video) => video.youtubeId)
          expect(new Set(ids).size).toBe(ids.length)
        }
      }
    }
  })

  it('anchors: số video từng bài khớp bảng mapping story 2.2', () => {
    const expectedCounts: Record<string, number> = {
      'gd1-t1-b1': 4,
      'gd1-t1-b2': 3,
      'gd1-t1-b3': 3,
      'gd1-t1-b4': 1,
      'gd1-t2-b2': 1,
      'gd1-t3-b1': 2,
    }
    for (const [id, count] of Object.entries(expectedCounts)) {
      expect(getItemById(id)?.item.videos, id).toHaveLength(count)
    }
  })

  it('gd1-t1-b3 có 1 vi + 2 en, gd1-t3-b1 có 1 vi + 1 en', () => {
    expect(getItemById('gd1-t1-b3')?.item.videos.map((video) => video.lang)).toEqual([
      'vi',
      'en',
      'en',
    ])
    expect(getItemById('gd1-t3-b1')?.item.videos.map((video) => video.lang)).toEqual(['vi', 'en'])
  })
})

describe('exercise embed (AD-2, FR-14)', () => {
  it('mọi item kind exercise có embed pattern không rỗng và 40 ≤ from ≤ to ≤ 200', () => {
    for (const phase of getPhases()) {
      for (const week of phase.weeks) {
        for (const item of week.items) {
          if (item.kind !== 'exercise') continue
          expect(item.exercise).toBeDefined()
          expect(item.exercise?.pattern.length).toBeGreaterThan(0)
          const { from, to } = item.exercise?.targetTempo ?? { from: 0, to: 0 }
          expect(from).toBeGreaterThanOrEqual(40)
          expect(to).toBeGreaterThanOrEqual(from)
          expect(to).toBeLessThanOrEqual(200)
        }
      }
    }
  })
})
