// AD-4: envelope tiến độ có version — một chủ sở hữu key localStorage.
// Thuần TS, KHÔNG React/app/ui/features/content (AD-1). KHÔNG throw xuyên tầng:
// parseEnvelope trả LoadResult 3 trạng thái; validate ĐẦY ĐỦ từng trường
// (mirror yêu cầu import 3.4 — file rác không được nhận nhầm là ok).
import type { LessonItemId } from '../types'

/** Ngày giờ ISO 8601 (toISOString(), UTC) — mọi so "cùng ngày" quy về ngày local ở selector. */
export type IsoDateTime = string

export const STORAGE_KEY = 'drum-beginner:progress:v1'
export const SCHEMA_VERSION = 1

/** AD-4: shape cố định — đổi shape kéo theo migrate cả epic (Block If). */
export interface ProgressEnvelope {
  schemaVersion: typeof SCHEMA_VERSION
  completedLessons: Record<LessonItemId, IsoDateTime>
  bestTempos: Record<LessonItemId, number>
  sessions: IsoDateTime[]
}

/** Load phân biệt 3 trạng thái (AD-4): empty (chưa có) | ok | corrupt (giữ raw). */
export type LoadResult =
  | { status: 'empty' }
  | { status: 'ok'; data: ProgressEnvelope }
  | { status: 'corrupt'; raw: string }

/** Kết quả ghi tường minh — không throw xuyên tầng. */
export type WriteResult = { ok: true } | { ok: false; reason: 'write-failed' | 'corrupt' }

export function emptyEnvelope(): ProgressEnvelope {
  return {
    schemaVersion: SCHEMA_VERSION,
    completedLessons: {},
    bestTempos: {},
    sessions: [],
  }
}

// Object trần (không null, không mảng) — Record cần đúng dạng này.
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Record<string, string>: mọi value là string.
function isStringRecord(value: unknown): value is Record<string, string> {
  if (!isPlainObject(value)) return false
  return Object.values(value).every((entry) => typeof entry === 'string')
}

// Record<string, number>: mọi value là number hữu hạn.
function isNumberRecord(value: unknown): value is Record<string, number> {
  if (!isPlainObject(value)) return false
  return Object.values(value).every((entry) => typeof entry === 'number' && Number.isFinite(entry))
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}

/**
 * raw === null → empty; JSON hỏng / thiếu trường / sai kiểu / schemaVersion ≠ 1 → corrupt;
 * shape đúng đủ → ok. KHÔNG throw — mọi lỗi trả về LoadResult.
 */
export function parseEnvelope(raw: string | null): LoadResult {
  if (raw === null) return { status: 'empty' }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { status: 'corrupt', raw }
  }

  if (!isPlainObject(parsed)) return { status: 'corrupt', raw }
  if (parsed.schemaVersion !== SCHEMA_VERSION) return { status: 'corrupt', raw }
  if (!isStringRecord(parsed.completedLessons)) return { status: 'corrupt', raw }
  if (!isNumberRecord(parsed.bestTempos)) return { status: 'corrupt', raw }
  if (!isStringArray(parsed.sessions)) return { status: 'corrupt', raw }

  return {
    status: 'ok',
    data: {
      schemaVersion: SCHEMA_VERSION,
      completedLessons: parsed.completedLessons,
      bestTempos: parsed.bestTempos,
      sessions: parsed.sessions,
    },
  }
}
