// core/progress public entry — singleton + wiring localStorage thật (AD-4, mirror core/audio/index.ts).
// Feature/ui CHỈ import từ đây, không import sâu store.ts/envelope.ts/selectors.ts.
// Guard typeof window: file bị import gián tiếp (ui/useProgress) — env node (vitest)
// không có window, dùng in-memory fallback để side effect cấp module không nổ.
import { ProgressStore } from './store'
import type { StorageLike } from './store'

export type { IsoDateTime, LoadResult, ProgressEnvelope, WriteResult } from './envelope'
export { STORAGE_KEY, SCHEMA_VERSION, emptyEnvelope, parseEnvelope } from './envelope'
export { getNextItem, getStreak, getWeekProgress } from './selectors'
export { ProgressStore } from './store'
export type { ProgressSnapshot, StorageLike } from './store'

// Fallback in-memory khi không có window (SSR/test) — cùng interface, không persist.
function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
  }
}

// Truy cập window.localStorage có thể THROW (storage bị tắt / iframe sandbox / một số
// chế độ riêng tư) — không chỉ getItem/setItem. Bọc try/catch để side effect cấp module
// không nổ làm trắng màn app; fallback in-memory (không persist nhưng app vẫn chạy).
function resolveStorage(): StorageLike {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
  } catch {
    // storage không truy cập được — dùng in-memory fallback
  }
  return createMemoryStorage()
}

const realStorage: StorageLike = resolveStorage()

export const progress = new ProgressStore(realStorage)
