import { describe, expect, it } from 'vitest'
import { STORAGE_KEY, emptyEnvelope, parseEnvelope } from './envelope'
import { getNextItem, getStreak, getWeekProgress } from './selectors'
import { ProgressStore } from './store'
import type { StorageLike } from './store'

// Fake storage DI (AD-1): Map nội bộ + cờ failWrite ném khi setItem — không jsdom,
// không mock module. Mirror sample-player.test.ts createFake style.
interface FakeStorage extends StorageLike {
  map: Map<string, string>
  failWrite: boolean
  setCalls: Array<{ key: string; value: string }>
}

function createFakeStorage(initial?: Record<string, string>): FakeStorage {
  const map = new Map<string, string>(initial ? Object.entries(initial) : [])
  const fake: FakeStorage = {
    map,
    failWrite: false,
    setCalls: [],
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      if (fake.failWrite) throw new Error('quota exceeded')
      fake.setCalls.push({ key, value })
      map.set(key, value)
    },
  }
  return fake
}

function fullEnvelopeRaw(): string {
  return JSON.stringify({
    schemaVersion: 1,
    completedLessons: { 'gd1-t1-b1': '2026-07-01T10:00:00.000Z' },
    bestTempos: { 'gd1-t1-b1': 80 },
    sessions: ['2026-07-01T10:00:00.000Z'],
  })
}

describe('parseEnvelope', () => {
  it('raw === null → empty', () => {
    expect(parseEnvelope(null)).toEqual({ status: 'empty' })
  })

  it('shape đúng đủ → ok với data đọc lại', () => {
    const result = parseEnvelope(fullEnvelopeRaw())
    expect(result.status).toBe('ok')
    if (result.status === 'ok') {
      expect(result.data.completedLessons).toEqual({ 'gd1-t1-b1': '2026-07-01T10:00:00.000Z' })
      expect(result.data.bestTempos).toEqual({ 'gd1-t1-b1': 80 })
      expect(result.data.sessions).toEqual(['2026-07-01T10:00:00.000Z'])
    }
  })

  it('envelope rỗng đúng shape → ok', () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      completedLessons: {},
      bestTempos: {},
      sessions: [],
    })
    expect(parseEnvelope(raw).status).toBe('ok')
  })

  it('JSON hỏng → corrupt (giữ raw)', () => {
    expect(parseEnvelope('{bad')).toEqual({ status: 'corrupt', raw: '{bad' })
  })

  it('thiếu trường → corrupt', () => {
    const raw = JSON.stringify({ schemaVersion: 1, completedLessons: {}, bestTempos: {} })
    expect(parseEnvelope(raw).status).toBe('corrupt')
  })

  it('sai kiểu trường (completedLessons value không phải string) → corrupt', () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      completedLessons: { x: 5 },
      bestTempos: {},
      sessions: [],
    })
    expect(parseEnvelope(raw).status).toBe('corrupt')
  })

  it('sai kiểu (sessions không phải string[]) → corrupt', () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      completedLessons: {},
      bestTempos: {},
      sessions: [1, 2],
    })
    expect(parseEnvelope(raw).status).toBe('corrupt')
  })

  it('bestTempos value không phải number → corrupt', () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      completedLessons: {},
      bestTempos: { x: 'fast' },
      sessions: [],
    })
    expect(parseEnvelope(raw).status).toBe('corrupt')
  })

  it('schemaVersion ≠ 1 → corrupt', () => {
    const raw = JSON.stringify({
      schemaVersion: 2,
      completedLessons: {},
      bestTempos: {},
      sessions: [],
    })
    expect(parseEnvelope(raw).status).toBe('corrupt')
  })

  it('mảng/scalar/null ở top-level → corrupt', () => {
    expect(parseEnvelope('[]').status).toBe('corrupt')
    expect(parseEnvelope('null').status).toBe('corrupt')
    expect(parseEnvelope('42').status).toBe('corrupt')
  })
})

describe('getStreak', () => {
  const now = new Date(2026, 6, 9, 12, 0, 0) // 2026-07-09 local trưa

  it('rỗng → 0', () => {
    expect(getStreak([], now)).toBe(0)
  })

  it('nhiều session cùng ngày → 1', () => {
    const iso = new Date(2026, 6, 9, 8, 0, 0).toISOString()
    const iso2 = new Date(2026, 6, 9, 20, 0, 0).toISOString()
    expect(getStreak([iso, iso2], now)).toBe(1)
  })

  it('3 ngày liên tiếp kết thúc hôm nay → 3', () => {
    const sessions = [
      new Date(2026, 6, 7, 9, 0).toISOString(),
      new Date(2026, 6, 8, 9, 0).toISOString(),
      new Date(2026, 6, 9, 9, 0).toISOString(),
    ]
    expect(getStreak(sessions, now)).toBe(3)
  })

  it('có khoảng trống ở giữa → chỉ đếm chuỗi liền hôm nay', () => {
    const sessions = [
      new Date(2026, 6, 5, 9, 0).toISOString(), // đứt (thiếu ngày 6, 7)
      new Date(2026, 6, 8, 9, 0).toISOString(),
      new Date(2026, 6, 9, 9, 0).toISOString(),
    ]
    expect(getStreak(sessions, now)).toBe(2)
  })

  it('ngày gần nhất là hôm qua → còn sống', () => {
    const sessions = [
      new Date(2026, 6, 7, 9, 0).toISOString(),
      new Date(2026, 6, 8, 9, 0).toISOString(),
    ]
    expect(getStreak(sessions, now)).toBe(2)
  })

  it('ngày gần nhất cách > 1 ngày → 0', () => {
    const sessions = [new Date(2026, 6, 6, 9, 0).toISOString()]
    expect(getStreak(sessions, now)).toBe(0)
  })

  it('biên TZ: hai session được quy về ngày local rồi đếm distinct', () => {
    // Ghim ngày local qua constructor local — 23:00 và 01:00 cùng-hoặc-khác ngày
    // đều được localDayKey xử lý; ở đây tạo đúng hai ngày local liên tiếp.
    const lateYesterday = new Date(2026, 6, 8, 23, 0, 0).toISOString()
    const earlyToday = new Date(2026, 6, 9, 1, 0, 0).toISOString()
    expect(getStreak([lateYesterday, earlyToday], now)).toBe(2)
  })

  it('biên TZ: hai giờ UTC khác nhau rơi cùng ngày local → streak 1', () => {
    // Cả hai giờ trong cùng ngày local 2026-07-09 dù cách nhau nhiều giờ.
    const morning = new Date(2026, 6, 9, 6, 0, 0).toISOString()
    const evening = new Date(2026, 6, 9, 22, 0, 0).toISOString()
    expect(getStreak([morning, evening], now)).toBe(1)
  })
})

describe('getNextItem', () => {
  const ordered = ['a', 'b', 'c', 'd']

  it('chưa xong gì → item đầu tiên', () => {
    expect(getNextItem({}, ordered)).toBe('a')
  })

  it('một số đã xong → item chưa xong đầu tiên theo thứ tự', () => {
    expect(getNextItem({ a: 'x', b: 'x' }, ordered)).toBe('c')
  })

  it('bỏ qua giữa chừng vẫn trả undone đầu theo thứ tự', () => {
    expect(getNextItem({ a: 'x', c: 'x' }, ordered)).toBe('b')
  })

  it('tất cả đã xong → undefined', () => {
    expect(getNextItem({ a: 'x', b: 'x', c: 'x', d: 'x' }, ordered)).toBeUndefined()
  })
})

describe('getWeekProgress', () => {
  const week = ['w1', 'w2', 'w3']

  it('0/M', () => {
    expect(getWeekProgress({}, week)).toEqual({ done: 0, total: 3 })
  })

  it('k/M', () => {
    expect(getWeekProgress({ w1: 'x', w3: 'x' }, week)).toEqual({ done: 2, total: 3 })
  })

  it('M/M', () => {
    expect(getWeekProgress({ w1: 'x', w2: 'x', w3: 'x' }, week)).toEqual({ done: 3, total: 3 })
  })
})

describe('ProgressStore', () => {
  it('completeLesson ghi completedLessons + append session + persist + {ok:true}', () => {
    const storage = createFakeStorage()
    const store = new ProgressStore(storage)
    const result = store.completeLesson('gd1-t1-b1', '2026-07-09T10:00:00.000Z')

    expect(result).toEqual({ ok: true })
    expect(store.isCompleted('gd1-t1-b1')).toBe(true)
    const snap = store.getSnapshot()
    expect(snap.data.completedLessons['gd1-t1-b1']).toBe('2026-07-09T10:00:00.000Z')
    expect(snap.data.sessions).toEqual(['2026-07-09T10:00:00.000Z'])
    // Persist thật
    expect(parseEnvelope(storage.map.get(STORAGE_KEY) ?? null).status).toBe('ok')
  })

  it('hoàn thành lại: giữ timestamp lần đầu nhưng vẫn append session', () => {
    const storage = createFakeStorage()
    const store = new ProgressStore(storage)
    store.completeLesson('gd1-t1-b1', '2026-07-09T10:00:00.000Z')
    store.completeLesson('gd1-t1-b1', '2026-07-10T11:00:00.000Z')

    const snap = store.getSnapshot()
    expect(snap.data.completedLessons['gd1-t1-b1']).toBe('2026-07-09T10:00:00.000Z')
    expect(snap.data.sessions).toEqual([
      '2026-07-09T10:00:00.000Z',
      '2026-07-10T11:00:00.000Z',
    ])
  })

  it('getSnapshot tham chiếu ổn định — chỉ đổi khi mutation thành công', () => {
    const storage = createFakeStorage()
    const store = new ProgressStore(storage)
    const before = store.getSnapshot()
    expect(store.getSnapshot()).toBe(before)
    store.completeLesson('a', '2026-07-09T10:00:00.000Z')
    expect(store.getSnapshot()).not.toBe(before)
  })

  it('setItem throw → {ok:false,write-failed} và snapshot KHÔNG đổi', () => {
    const storage = createFakeStorage()
    const store = new ProgressStore(storage)
    const before = store.getSnapshot()
    storage.failWrite = true
    const result = store.completeLesson('a', '2026-07-09T10:00:00.000Z')

    expect(result).toEqual({ ok: false, reason: 'write-failed' })
    expect(store.getSnapshot()).toBe(before)
    expect(store.isCompleted('a')).toBe(false)
  })

  it('corrupt → completeLesson {ok:false,corrupt} không ghi', () => {
    const storage = createFakeStorage({ [STORAGE_KEY]: '{bad' })
    const store = new ProgressStore(storage)
    expect(store.getSnapshot().status).toBe('corrupt')

    const result = store.completeLesson('a', '2026-07-09T10:00:00.000Z')
    expect(result).toEqual({ ok: false, reason: 'corrupt' })
    // Không ghi đè raw corrupt
    expect(storage.map.get(STORAGE_KEY)).toBe('{bad')
    expect(store.isCompleted('a')).toBe(false)
  })

  it('corrupt: đọc dùng emptyEnvelope() nhưng giữ status=corrupt', () => {
    const storage = createFakeStorage({ [STORAGE_KEY]: '{bad' })
    const store = new ProgressStore(storage)
    const snap = store.getSnapshot()
    expect(snap.status).toBe('corrupt')
    expect(snap.data).toEqual(emptyEnvelope())
  })

  it('reset ghi đè về empty (đường duy nhất ghi đè corrupt) + persist + emit', () => {
    const storage = createFakeStorage({ [STORAGE_KEY]: '{bad' })
    const store = new ProgressStore(storage)
    let notified = 0
    store.subscribe(() => {
      notified += 1
    })

    const result = store.reset()
    expect(result).toEqual({ ok: true })
    expect(store.getSnapshot().status).toBe('ok')
    expect(store.getSnapshot().data).toEqual(emptyEnvelope())
    expect(parseEnvelope(storage.map.get(STORAGE_KEY) ?? null).status).toBe('ok')
    expect(notified).toBe(1)
  })

  it('subscribe được gọi sau mutation; unsubscribe dừng nhận', () => {
    const storage = createFakeStorage()
    const store = new ProgressStore(storage)
    let notified = 0
    const unsub = store.subscribe(() => {
      notified += 1
    })
    store.completeLesson('a', '2026-07-09T10:00:00.000Z')
    expect(notified).toBe(1)
    unsub()
    store.completeLesson('b', '2026-07-09T10:00:00.000Z')
    expect(notified).toBe(1)
  })

  it('write-failed KHÔNG emit (snapshot giữ nguyên nên không notify)', () => {
    const storage = createFakeStorage()
    const store = new ProgressStore(storage)
    let notified = 0
    store.subscribe(() => {
      notified += 1
    })
    storage.failWrite = true
    store.completeLesson('a', '2026-07-09T10:00:00.000Z')
    expect(notified).toBe(0)
  })

  it('load ok từ storage có sẵn dữ liệu', () => {
    const storage = createFakeStorage({ [STORAGE_KEY]: fullEnvelopeRaw() })
    const store = new ProgressStore(storage)
    expect(store.getSnapshot().status).toBe('ok')
    expect(store.isCompleted('gd1-t1-b1')).toBe(true)
  })
})
