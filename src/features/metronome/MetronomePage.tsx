// UI tối giản để verify engine (story 1.2) — MetronomeBlock đầy đủ là story 1.3.
// KHÔNG stop() khi unmount: engine giữ state xuyên route trong phiên (AD-3).
import { useState } from 'react'
import { metronome, TEMPO_MAX, TEMPO_MIN } from '../../core/audio'
import { useMetronome } from '../../ui/useMetronome'
import styles from './MetronomePage.module.css'

export function MetronomePage() {
  const { tempo, isRunning } = useMetronome()
  // Draft cục bộ khi đang gõ: clamp từng phím làm "45" thành 40 rồi "405"→200 —
  // chỉ commit live khi giá trị nằm trong range, blur mới clamp + đồng bộ lại.
  const [draft, setDraft] = useState<string | null>(null)

  const commitDraft = () => {
    if (draft === null) return
    const bpm = Number(draft)
    if (draft !== '' && Number.isFinite(bpm)) metronome.setTempo(bpm)
    setDraft(null)
  }

  return (
    <>
      <h1>Metronome</h1>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => (isRunning ? metronome.stop() : metronome.start())}
        >
          {isRunning ? 'Dừng' : 'Bắt đầu'}
        </button>
        <label className={styles.tempoField}>
          Tempo (bpm)
          <input
            type="number"
            min={TEMPO_MIN}
            max={TEMPO_MAX}
            step={1}
            value={draft ?? String(tempo)}
            onChange={(event) => {
              const raw = event.currentTarget.value
              setDraft(raw)
              const bpm = Number(raw)
              if (raw !== '' && Number.isFinite(bpm) && bpm >= TEMPO_MIN && bpm <= TEMPO_MAX) {
                metronome.setTempo(bpm)
              }
            }}
            onBlur={commitDraft}
          />
        </label>
      </div>
    </>
  )
}
