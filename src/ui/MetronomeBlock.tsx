/*
 * MetronomeBlock — khối metronome dùng chung (AD-8): features/metronome compose
 * bây giờ, features/practice compose ở story 2.4. KHÔNG props ở story này.
 * Visual beat CHỈ từ beat event của engine, bù delay theo audioTime (AD-3) —
 * không rAF loop, không CSS animation theo tempo, không tự đếm tick.
 */
import { useEffect, useRef, useState } from 'react'
import { metronome } from '../core/audio'
import type { BeatsPerBar } from '../core/audio'
import { useMetronome } from './useMetronome'
import { useMetronomeShortcuts } from './useMetronomeShortcuts'
import styles from './MetronomeBlock.module.css'

const BEATS_PER_BAR_OPTIONS: readonly BeatsPerBar[] = [2, 3, 4]

export function MetronomeBlock() {
  const { tempo, beatsPerBar, isRunning } = useMetronome()
  useMetronomeShortcuts()

  // Phách đang sáng (beatInBar đếm TỪ 1); null = không dot nào active.
  const [activeBeat, setActiveBeat] = useState<number | null>(null)
  // MỘT pending timer duy nhất — event mới thay event cũ (UX-DR13, không dồn frame).
  const beatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unsubscribe = metronome.onBeat((event) => {
      // Event phát tại thời điểm SCHEDULE, sớm hơn âm thật tối đa ~100ms — bù lại
      // để dot đổi đúng lúc âm vang (≤50ms cảm nhận).
      const delayMs = Math.max(0, (event.audioTime - metronome.currentTime) * 1000)
      if (beatTimerRef.current !== null) clearTimeout(beatTimerRef.current)
      beatTimerRef.current = setTimeout(() => {
        beatTimerRef.current = null
        setActiveBeat(event.beatInBar)
      }, delayMs)
    })
    return () => {
      // Unmount: dọn subscription + timer nhưng KHÔNG stop engine (state xuyên route).
      unsubscribe()
      if (beatTimerRef.current !== null) {
        clearTimeout(beatTimerRef.current)
        beatTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (isRunning) return
    // Dừng → không dot nào sáng, hủy timer đang chờ.
    if (beatTimerRef.current !== null) {
      clearTimeout(beatTimerRef.current)
      beatTimerRef.current = null
    }
    setActiveBeat(null)
  }, [isRunning])

  return (
    <div className={styles.block}>
      {/* Hàng dots thuần trang trí nhịp — thao tác đã có nút, ẩn khỏi screen reader */}
      <div className={styles.dots} aria-hidden="true">
        {Array.from({ length: beatsPerBar }, (_, index) => {
          const beatNumber = index + 1
          const classNames = [styles.dot]
          if (index === 0) classNames.push(styles.dotAccent)
          // Render guard: đổi beatsPerBar khi đang chạy, activeBeat có thể vượt
          // số dot trong ≤1 beat — so sánh đúng số phách là đủ.
          if (beatNumber === activeBeat) classNames.push(styles.dotActive)
          return <span key={beatNumber} className={classNames.join(' ')} />
        })}
      </div>

      <div className={styles.bpmRow}>
        <span className={styles.bpmValue}>{tempo}</span>
        <span className={styles.bpmUnit}>bpm</span>
      </div>

      <div className={styles.transport}>
        <button
          type="button"
          className={styles.secondaryButton}
          aria-label="Giảm 5 bpm"
          onClick={() => metronome.setTempo(tempo - 5)}
        >
          −5
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          aria-label="Giảm 1 bpm"
          onClick={() => metronome.setTempo(tempo - 1)}
        >
          −1
        </button>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => (isRunning ? metronome.stop() : metronome.start())}
        >
          {/* Glyph ẩn khỏi accessible name — SR chỉ đọc "Dừng"/"Bắt đầu" */}
          <span aria-hidden="true">{isRunning ? '■' : '▶'}</span> {isRunning ? 'Dừng' : 'Bắt đầu'}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          aria-label="Tăng 1 bpm"
          onClick={() => metronome.setTempo(tempo + 1)}
        >
          +1
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          aria-label="Tăng 5 bpm"
          onClick={() => metronome.setTempo(tempo + 5)}
        >
          +5
        </button>
        <button type="button" className={styles.secondaryButton} onClick={() => metronome.tap()}>
          Tap tempo
        </button>
      </div>

      <div className={styles.picker} role="group" aria-label="Số phách mỗi ô nhịp">
        {BEATS_PER_BAR_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={styles.pickerButton}
            aria-pressed={beatsPerBar === option}
            onClick={() => metronome.setBeatsPerBar(option)}
          >
            {option}/4
          </button>
        ))}
      </div>

      <p className={styles.hints}>
        <kbd>Space</kbd> bắt đầu/dừng · <kbd>↑</kbd>
        <kbd>↓</kbd> ±1 · <kbd>Shift+↑↓</kbd> ±5 · <kbd>T</kbd> tap tempo
      </p>
    </div>
  )
}
