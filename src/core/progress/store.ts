// AD-4: ProgressStore — chủ sở hữu duy nhất key drum-beginner:progress:v1.
// DI StorageLike qua constructor (test env node KHÔNG có localStorage/jsdom) — AD-1.
// KHÔNG throw xuyên tầng: completeLesson/reset trả WriteResult. getSnapshot trả
// tham chiếu ỔN ĐỊNH (object mới CHỈ khi mutation thành công) cho useSyncExternalStore.
import type { LessonItemId } from '../types'
import type { IsoDateTime, LoadResult, ProgressEnvelope, WriteResult } from './envelope'
import { STORAGE_KEY, emptyEnvelope, parseEnvelope } from './envelope'

/** Subset localStorage store cần — fake được trong test (Map + cờ failWrite). */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** Snapshot bất biến cho useSyncExternalStore — status để banner corrupt phản ứng. */
export interface ProgressSnapshot {
  readonly status: LoadResult['status']
  readonly data: ProgressEnvelope
}

export class ProgressStore {
  private readonly storage: StorageLike
  private snapshot: ProgressSnapshot
  private readonly listeners = new Set<() => void>()

  constructor(storage: StorageLike) {
    this.storage = storage
    // Load MỘT lần lúc khởi tạo. Corrupt → đọc dùng emptyEnvelope() nhưng GIỮ
    // status='corrupt' (banner phản ứng, completeLesson chặn ghi).
    const result = parseEnvelope(this.readRaw())
    this.snapshot =
      result.status === 'ok'
        ? { status: 'ok', data: result.data }
        : { status: result.status, data: emptyEnvelope() }
  }

  private readRaw(): string | null {
    // getItem có thể throw (Safari private mode) — nuốt về null → coi như empty.
    try {
      return this.storage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = (): ProgressSnapshot => this.snapshot

  isCompleted(id: LessonItemId): boolean {
    return Object.hasOwn(this.snapshot.data.completedLessons, id)
  }

  /**
   * completeLesson: corrupt → không ghi, {ok:false,'corrupt'}. Ngược lại:
   * completedLessons[id] chỉ set khi CHƯA có (giữ timestamp lần đầu); sessions LUÔN +1;
   * persist. setItem throw → rollback snapshot in-memory về trước mutation, {ok:false,'write-failed'}.
   */
  completeLesson(id: LessonItemId, nowIso: IsoDateTime): WriteResult {
    if (this.snapshot.status === 'corrupt') {
      return { ok: false, reason: 'corrupt' }
    }

    const previous = this.snapshot
    const current = previous.data
    const completedLessons = Object.hasOwn(current.completedLessons, id)
      ? current.completedLessons
      : { ...current.completedLessons, [id]: nowIso }
    const next: ProgressEnvelope = {
      schemaVersion: current.schemaVersion,
      completedLessons,
      bestTempos: current.bestTempos,
      sessions: [...current.sessions, nowIso],
    }

    return this.commit(previous, next)
  }

  /** reset: đường DUY NHẤT ghi đè dữ liệu corrupt — luôn về emptyEnvelope(). */
  reset(): WriteResult {
    return this.commit(this.snapshot, emptyEnvelope())
  }

  // Ghi + đổi snapshot + emit. setItem throw → giữ nguyên snapshot cũ (rollback), báo lỗi.
  private commit(previous: ProgressSnapshot, next: ProgressEnvelope): WriteResult {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Snapshot chưa đổi tại đây nên không cần thao tác rollback — chỉ giữ previous.
      this.snapshot = previous
      return { ok: false, reason: 'write-failed' }
    }
    this.snapshot = { status: 'ok', data: next }
    this.emit()
    return { ok: true }
  }

  private emit(): void {
    for (const listener of this.listeners) {
      try {
        listener()
      } catch {
        // listener lỗi là việc của listener — store đi tiếp
      }
    }
  }
}
