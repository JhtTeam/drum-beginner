// AD-1: domain types thuần TS — KHÔNG import React/app/ui/features.
// AD-2: content-as-data — một không gian ID duy nhất gd{p}-t{w}-b{n};
// theory và exercise đều là LessonItem, phân biệt bằng `kind`.

// AD-4: LessonItemId là khóa progress-store (story 3.1) — cố định vĩnh viễn,
// không đổi/không tái sử dụng sau khi ship.
export type LessonItemId = string

export type LessonKind = 'theory' | 'exercise'

// AR-7: discriminated union theo `lang` — video tiếng Anh BẮT BUỘC có note
// tóm tắt tiếng Việt (ép ở compile time, không cần validate runtime).
export type Video =
  | { youtubeId: string; lang: 'vi'; title: string; note?: string }
  | { youtubeId: string; lang: 'en'; title: string; note: string }

// AD-2: exercise nhúng trong LessonItem, KHÔNG có ID riêng —
// không bao giờ thành khóa progress độc lập.
export interface ExerciseSpec {
  pattern: ReadonlyArray<'R' | 'L'>
  targetTempo: { from: number; to: number }
  techniqueNotes: string[]
}

interface LessonItemBase {
  id: LessonItemId
  title: string
  objective: string
  theory: string[]
  practiceSteps: string[]
  videos: Video[]
}

// Discriminated union theo `kind` — exercise BẮT BUỘC có embed, theory thì
// KHÔNG được có (bất biến "exercise iff kind === 'exercise'" ép ở compile time).
export type LessonItem =
  | (LessonItemBase & { kind: 'theory'; exercise?: never })
  | (LessonItemBase & { kind: 'exercise'; exercise: ExerciseSpec })

export interface Week {
  weekNumber: number
  title: string
  items: LessonItem[]
}

export interface Phase {
  id: string
  title: string
  weeks: Week[]
}

// AD-1: nhãn tiếng Việt dùng chung cho roadmap + lesson — features không được
// import lẫn nhau nên nguồn nhãn duy nhất sống ở core.
export const LESSON_KIND_LABEL = {
  theory: 'Lý thuyết',
  exercise: 'Luyện tập',
} as const satisfies Record<LessonKind, string>
