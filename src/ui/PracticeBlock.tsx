/*
 * PracticeBlock — khối luyện tập stick control (FR-11/12/13/14 hiển thị):
 * compose ui/MetronomeBlock nguyên trạng (AD-8 — KHÔNG gọi useMetronomeShortcuts
 * lần hai, block đã sở hữu) + PatternGrid + tempo mục tiêu + ghi chú kỹ thuật.
 * Sống ở ui/ chứ KHÔNG features/practice: AD-1 cấm features/lesson import
 * features khác — tiền lệ DrumMap/MetronomeBlock (xem story 2.4 Dev Notes).
 * ExerciseSpec đi qua props — ui/ không import content/ (AD-1).
 * Con trỏ pattern suy STATELESS từ beat event payload (AR-4), bù delay theo
 * audioTime y khuôn MetronomeBlock — duplication ~12 dòng sanctioned, không
 * refactor block đã review; trích hook chung khi có consumer thứ ba.
 */
import { useEffect, useRef, useState } from 'react'
import { metronome } from '../core/audio'
import type { ExerciseSpec } from '../core/types'
import { MetronomeBlock } from './MetronomeBlock'
import { PatternGrid } from './PatternGrid'
import { patternIndexForBeat } from './pattern-cursor'
import { useMetronome } from './useMetronome'
import styles from './PracticeBlock.module.css'

export function PracticeBlock({ exercise }: { exercise: ExerciseSpec }) {
  const { isRunning } = useMetronome()
  const { pattern } = exercise

  // Ô pattern đang sáng; null = không ô nào (metronome dừng).
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  // MỘT pending timer duy nhất — event mới thay event cũ (UX-DR13, không dồn frame).
  const beatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // AD-8 mount rule: engine không chạy → set tempo bắt đầu của bài; đang chạy → giữ.
  // Chạy lại khi đổi bài (LessonPage key={item.id} ép remount) — StrictMode idempotent.
  useEffect(() => {
    if (!metronome.getSnapshot().isRunning) {
      metronome.setTempo(exercise.targetTempo.from)
    }
  }, [exercise])

  useEffect(() => {
    const unsubscribe = metronome.onBeat((event) => {
      // Event phát tại thời điểm SCHEDULE, sớm hơn âm thật tối đa ~100ms — bù lại
      // để ô đổi đúng lúc âm vang (≤50ms cảm nhận — UX-DR13).
      const delayMs = Math.max(0, (event.audioTime - metronome.currentTime) * 1000)
      if (beatTimerRef.current !== null) clearTimeout(beatTimerRef.current)
      beatTimerRef.current = setTimeout(() => {
        beatTimerRef.current = null
        // beatsPerBar đọc từ snapshot NGAY LÚC CẦN (chống stale closure — nếp 1.3)
        setActiveIndex(
          patternIndexForBeat(event, metronome.getSnapshot().beatsPerBar, pattern.length),
        )
      }, delayMs)
    })
    return () => {
      // Unmount: dọn subscription + timer nhưng KHÔNG stop engine (state xuyên route — AD-3).
      unsubscribe()
      if (beatTimerRef.current !== null) {
        clearTimeout(beatTimerRef.current)
        beatTimerRef.current = null
      }
    }
  }, [pattern])

  useEffect(() => {
    if (isRunning) return
    // Dừng → không ô nào sáng ("loop đến khi dừng" — FR-13), hủy timer đang chờ.
    if (beatTimerRef.current !== null) {
      clearTimeout(beatTimerRef.current)
      beatTimerRef.current = null
    }
    setActiveIndex(null)
  }, [isRunning])

  return (
    <div className={styles.block}>
      <div className={styles.card}>
        <PatternGrid pattern={pattern} activeIndex={activeIndex} />
        {/* FR-14 hiển thị: tempo mục tiêu — ghi best tempo là story 3.3, KHÔNG làm ở đây */}
        <p className={styles.target}>
          Mục tiêu: sạch ở <strong>{exercise.targetTempo.from}</strong> → nâng dần{' '}
          <strong>{exercise.targetTempo.to}</strong> bpm
        </p>
        {/* Dock ghim đáy mobile (UX-DR12) — cụm điều khiển trong tầm ngón cái */}
        <div className={styles.dock}>
          <MetronomeBlock />
        </div>
      </div>
      <aside className={styles.notes}>
        <p className={styles.notesLabel}>
          {/* Glyph trang trí — ẩn khỏi accessible name (nếp MetronomeBlock) */}
          <span aria-hidden="true">💡</span> Ghi chú kỹ thuật
        </p>
        <ul className={styles.notesList}>
          {/* Danh sách tĩnh từ content, không reorder — key theo index an toàn */}
          {exercise.techniqueNotes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
