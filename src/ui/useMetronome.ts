// Bind React vào engine singleton qua useSyncExternalStore (AD-3).
// Đặt ở ui/ vì story 1.3 (ui/MetronomeBlock) tái sử dụng (AD-1).
import { useSyncExternalStore } from 'react'
import { metronome } from '../core/audio'
import type { MetronomeSnapshot } from '../core/audio'

export function useMetronome(): MetronomeSnapshot {
  return useSyncExternalStore(metronome.subscribe, metronome.getSnapshot)
}
