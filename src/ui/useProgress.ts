// Bind React vào progress store singleton qua useSyncExternalStore (AD-4).
// Đặt ở ui/ vì LessonPage + banner + roadmap cùng dùng (AD-1). Mirror useMetronome.ts.
import { useSyncExternalStore } from 'react'
import { progress } from '../core/progress'
import type { ProgressSnapshot } from '../core/progress'

export function useProgress(): ProgressSnapshot {
  return useSyncExternalStore(progress.subscribe, progress.getSnapshot)
}
