// Trang chủ "Hôm nay" (story 3.2) — màn hình khởi động buổi tập (KF-1/KF-2):
// mở web là thấy hôm nay tập gì + streak, vào bài trong một cú click.
// UI CHỈ tiêu thụ selector (AD-4): bài kế = getNextItem, streak = getStreak,
// tiến độ tuần = getWeekProgress; danh sách id lấy từ content truyền vào (AD-1).
import { Link } from 'react-router'
import { ROUTES, lessonPath } from '../../app/routes'
import { LESSON_KIND_LABEL } from '../../core/types'
import { getNextItem, getStreak, getWeekProgress } from '../../core/progress'
import { getItemById, getOrderedItemIds, getWeekItemIds } from '../../content'
import { useProgress } from '../../ui/useProgress'
import styles from './HomePage.module.css'

// Thứ tự lộ trình từ nguồn duy nhất content (AD-2) — build một lần lúc module init.
const orderedItemIds = getOrderedItemIds()

export function HomePage() {
  const { data } = useProgress()

  // Phân nhánh theo completedLessons, KHÔNG theo status: reset() (từ banner corrupt)
  // tạo envelope rỗng với status='ok' — vẫn phải hiện onboarding. Khi corrupt, data
  // là emptyEnvelope() nên nhánh onboarding hiện tự nhiên; ProgressCorruptBanner
  // (mount ở AppLayout) đã cảnh báo phía trên.
  const hasProgress = Object.keys(data.completedLessons).length > 0

  // Bài kế = selector core + lookup content (AD-4) — UI không tự tính.
  const nextId = getNextItem(data.completedLessons, orderedItemIds)
  const next = nextId ? getItemById(nextId) : undefined

  // AC-1: onboarding MỘT thẻ, không wizard, không streak (UX-DR9).
  if (!hasProgress) {
    return (
      <div className={styles.page}>
        <h1>Hôm nay</h1>
        <section className={styles.card}>
          {next ? (
            <>
              <p className={styles.greeting}>
                Chào bạn! Bắt đầu với Tuần {next.weekNumber} · Bài {next.ordinal}:{' '}
                {next.item.title}
              </p>
              {/* Microcopy động từ (UX-DR10); Link style nút primary, target ≥44px */}
              <Link className={styles.startButton} to={lessonPath(next.item.id)}>
                Bắt đầu Tuần {next.weekNumber} · Bài {next.ordinal}
              </Link>
            </>
          ) : (
            // Fallback lý thuyết (content rỗng) — không link bài gãy.
            <p className={styles.greeting}>
              Chào bạn! Lộ trình chưa có bài học —{' '}
              <Link to={ROUTES.roadmap}>xem Lộ trình</Link>.
            </p>
          )}
        </section>
      </div>
    )
  }

  // Selector gọi tại call-site UI, truyền now để core tất định (AD-4).
  const streak = getStreak(data.sessions, new Date())

  // Tiến độ tuần của tuần chứa bài kế — list id từ content, đếm bằng selector.
  const weekItemIds = next ? getWeekItemIds(next.phaseId, next.weekNumber) : []
  const weekProgress = getWeekProgress(data.completedLessons, weekItemIds)

  // AC-2: thẻ "Hôm nay" — bài kế là link + streak + "Tuần N · X/M bài" (UX-DR10).
  return (
    <div className={styles.page}>
      <h1>Hôm nay</h1>
      <section className={styles.card}>
        {streak > 0 ? (
          <p className={styles.streak}>🔥 Chuỗi {streak} ngày</p>
        ) : (
          // Chuỗi đứt → trung tính, KHÔNG chê "bỏ tập N ngày" (UX-DR10).
          <p className={styles.streakNew}>Bắt đầu chuỗi mới hôm nay</p>
        )}

        {next ? (
          <>
            <Link className={styles.nextLink} to={lessonPath(next.item.id)}>
              Tuần {next.weekNumber} · Bài {next.ordinal}: {next.item.title}
              {/* UX-DR11: nhãn kind là chữ, không truyền nghĩa bằng màu đơn thuần */}
              <span className={styles.kindBadge}>{LESSON_KIND_LABEL[next.item.kind]}</span>
            </Link>
            <p className={styles.weekProgress}>
              Tuần {next.weekNumber} · {weekProgress.done}/{weekProgress.total} bài
            </p>
          </>
        ) : (
          // Xong hết lộ trình — không link "bài kế" gãy (AC-2).
          <>
            <p className={styles.allDone}>Bạn đã hoàn thành hết lộ trình Giai đoạn 1 🎉</p>
            <Link className={styles.roadmapLink} to={ROUTES.roadmap}>
              Xem lại Lộ trình
            </Link>
          </>
        )}
      </section>
    </div>
  )
}
