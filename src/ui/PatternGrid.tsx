/*
 * PatternGrid — grid ô R/L thuần trình bày (UX-DR5): LUÔN kèm chữ cái, không bao
 * giờ chỉ mã hóa bằng màu; R amber / L teal qua token pattern-cell (AD-5).
 * KHÔNG subscribe engine — PracticeBlock suy activeIndex từ beat event và truyền
 * xuống (AR-4: UI không tự đếm tick). Active chỉ đổi nền/viền, không scale —
 * tự thỏa prefers-reduced-motion (UX-DR2).
 */
import styles from './PatternGrid.module.css'

export interface PatternGridProps {
  pattern: ReadonlyArray<'R' | 'L'>
  /** Ô đang sáng theo beat event; null = không ô nào (metronome dừng). */
  activeIndex: number | null
}

export function PatternGrid({ pattern, activeIndex }: PatternGridProps) {
  return (
    <div className={styles.grid}>
      {pattern.map((hand, index) => {
        const classNames = [styles.cell, hand === 'R' ? styles.cellRight : styles.cellLeft]
        if (index === activeIndex) classNames.push(styles.cellActive)
        // key theo index hợp lệ: pattern tĩnh từ content, không reorder
        return (
          <span key={index} className={classNames.join(' ')}>
            {hand}
          </span>
        )
      })}
    </div>
  )
}
