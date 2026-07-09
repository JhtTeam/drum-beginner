// Trang Lộ trình (FR-1) — render thuần từ getPhases() (AD-2): không hardcode
// phase ID, thêm giai đoạn mới trong content/ là tự hiển thị (FR-2/SM-3).
import { Link } from 'react-router'
import { lessonPath } from '../../app/routes'
import { LESSON_KIND_LABEL } from '../../core/types'
import { getPhases } from '../../content'
import { useProgress } from '../../ui/useProgress'
import styles from './RoadmapPage.module.css'

export function RoadmapPage() {
  // Snapshot phản ứng: bấm hoàn thành ở LessonPage → checkmark hiện ngay khi quay lại.
  const { data } = useProgress()

  return (
    <div className={styles.page}>
      <h1>Lộ trình</h1>
      {getPhases().map((phase) => (
        <section key={phase.id}>
          <h2 className={styles.phaseTitle}>{phase.title}</h2>
          {phase.weeks.map((week) => (
            <section key={week.weekNumber} className={styles.week}>
              {/* h3 dưới h2 của phase — giữ outline heading đúng thứ bậc */}
              <h3 className={styles.weekTitle}>
                Tuần {week.weekNumber} — {week.title}
              </h3>
              <ol className={styles.itemList}>
                {week.items.map((item) => {
                  const done = Object.hasOwn(data.completedLessons, item.id)
                  return (
                    <li key={item.id}>
                      {/* AD-6: link qua lessonPath(), không tự ghép chuỗi path */}
                      <Link to={lessonPath(item.id)} className={styles.card}>
                        {/* Checkmark có aria-label — trạng thái không chỉ bằng màu (UX-DR11) */}
                        {done && (
                          <span className={styles.doneMark} aria-label="Đã hoàn thành" role="img">
                            ✓
                          </span>
                        )}
                        <span className={styles.cardTitle}>{item.title}</span>
                        <span className={styles.kindBadge}>
                          {LESSON_KIND_LABEL[item.kind]}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}
        </section>
      ))}
    </div>
  )
}
