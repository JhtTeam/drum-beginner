// Trang Bài học (FR-4) — render từ getItemById (AD-2), không tự duyệt cây.
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ROUTES, lessonPath } from '../../app/routes'
import { LESSON_KIND_LABEL } from '../../core/types'
import { progress, getNextItem } from '../../core/progress'
import { getItemById, getPhases } from '../../content'
import { DrumMap } from '../../ui/DrumMap'
import { PracticeBlock } from '../../ui/PracticeBlock'
import { VideoEmbed } from '../../ui/VideoEmbed'
import { useProgress } from '../../ui/useProgress'
import styles from './LessonPage.module.css'

// Thứ tự id toàn lộ trình cho "bài kế tiếp" (AD-4 selector) — build một lần lúc module init.
const orderedItemIds = getPhases().flatMap((phase) =>
  phase.weeks.flatMap((week) => week.items.map((item) => item.id)),
)

export function LessonPage() {
  const { id } = useParams()
  // Guard param rỗng/undefined trước khi tra cứu — rơi cùng nhánh 404 nội dung
  const found = id ? getItemById(id) : undefined

  // Hook gọi vô điều kiện TRƯỚC early return (rules of hooks). Snapshot phản ứng
  // để nút đổi trạng thái ngay khi completeLesson emit.
  const { data } = useProgress()
  // Toast "write-failed" tạm thời (role=status) — corrupt dựa banner toàn cục.
  const [saveError, setSaveError] = useState(false)

  // Đổi bài (id đổi, KHÔNG remount) → dọn toast của bài cũ.
  useEffect(() => {
    setSaveError(false)
  }, [id])

  // Toast tự tắt sau vài giây — nhẹ, không chặn (EXPERIENCE State Patterns).
  useEffect(() => {
    if (!saveError) return
    const timer = setTimeout(() => setSaveError(false), 4000)
    return () => clearTimeout(timer)
  }, [saveError])

  // AC #2: MỘT kiểu 404 nội dung duy nhất — in-page, không redirect, không throw
  if (!found) {
    return (
      <div className={styles.notFound}>
        <h1>Không tìm thấy bài</h1>
        <p>Bài học này không có trong lộ trình — có thể đường dẫn đã sai.</p>
        <Link to={ROUTES.roadmap}>← Về Lộ trình</Link>
      </div>
    )
  }

  const { item, weekNumber, ordinal } = found

  const isCompleted = Object.hasOwn(data.completedLessons, item.id)
  // Bài kế = item chưa xong đầu tiên theo thứ tự lộ trình (selector core, AD-4).
  const nextItemId = getNextItem(data.completedLessons, orderedItemIds)
  const nextItem = nextItemId ? getItemById(nextItemId) : undefined

  const handleComplete = () => {
    // AD-6/AD-4: id là khóa progress; ngày lưu UTC toISOString(), streak quy ngày local ở selector.
    const result = progress.completeLesson(item.id, new Date().toISOString())
    if (result.ok) {
      setSaveError(false)
    } else if (result.reason === 'write-failed') {
      // KHÔNG auto-navigate; nút bấm lại được.
      setSaveError(true)
    }
    // reason === 'corrupt' → banner toàn cục xử lý, không ghi cục bộ.
  }

  return (
    <article className={styles.article}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link to={ROUTES.roadmap}>Lộ trình</Link>
        {' → '}
        <span>Tuần {weekNumber}</span>
        {' → '}
        <span>Bài {ordinal}</span>
      </nav>

      <header className={styles.header}>
        <h1>{item.title}</h1>
        <span className={styles.kindBadge}>{LESSON_KIND_LABEL[item.kind]}</span>
      </header>

      <section>
        <h2 className={styles.sectionTitle}>Mục tiêu</h2>
        <p>{item.objective}</p>
      </section>

      <section>
        {/* Danh sách tĩnh, không reorder — key theo index an toàn kể cả khi hai đoạn trùng chữ */}
        {item.theory.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </section>

      {/* FR-6/KF-2: sơ đồ bộ trống GIỮA lý thuyết và video — đọc lý thuyết →
          khám phá sơ đồ → xem video. Guard interactive — 12 bài còn lại không có section. */}
      {item.interactive === 'drum-map' && (
        <section>
          <h2 className={styles.sectionTitle}>Sơ đồ bộ trống</h2>
          <DrumMap />
        </section>
      )}

      {/* FR-4/KF-1/KF-2: thứ tự mục tiêu → lý thuyết → sơ đồ (nếu có) → video →
          luyện tập (nếu exercise) → thực hành. Guard videos.length > 0 — bài
          không video KHÔNG có section rỗng. */}
      {item.videos.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>Video hướng dẫn</h2>
          <div className={styles.videoList}>
            {item.videos.map((video) => (
              // key theo youtubeId — giá trị ổn định, không dùng index
              <VideoEmbed key={video.youtubeId} video={video} searchQuery={item.title} />
            ))}
          </div>
        </section>
      )}

      {/* FR-11/12/13 (story 2.4): khối luyện tập TRƯỚC "Thực hành" — phần chữ
          hướng dẫn đẩy xuống dưới (UX-DR12/KF-1). Union narrow theo kind nên
          item.exercise có type đầy đủ; 6 bài theory không có section rỗng.
          key={item.id}: đổi route giữa hai bài KHÔNG remount LessonPage — key ép
          remount để mount rule AD-8 chạy lại cho bài mới (3.1 sẽ thêm link bài kế). */}
      {item.kind === 'exercise' && (
        <section>
          <h2 className={styles.sectionTitle}>Luyện tập</h2>
          <PracticeBlock key={item.id} exercise={item.exercise} />
        </section>
      )}

      <section>
        <h2 className={styles.sectionTitle}>Thực hành</h2>
        <ol className={styles.steps}>
          {item.practiceSteps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </section>

      {/* Story 3.1: nút hoàn thành cho MỌI bài (theory lẫn exercise). completeLesson
          ghi ngày UTC, checkmark trên card lộ trình phản ứng qua snapshot; gợi ý bài
          kế mà KHÔNG auto-navigate. */}
      <section className={styles.completion}>
        <button
          type="button"
          className={styles.completeButton}
          aria-pressed={isCompleted}
          onClick={handleComplete}
        >
          {isCompleted ? 'Đã hoàn thành ✓' : '✓ Hoàn thành bài hôm nay'}
        </button>

        {/* Toast nhẹ, không chặn — nút vẫn bấm lại được (AC #2). */}
        {saveError && (
          <p role="status" className={styles.saveError}>
            Chưa lưu được — thử lại
          </p>
        )}

        {/* Gợi ý bài kế xuất hiện sau khi hoàn thành, không tự chuyển trang. */}
        {isCompleted &&
          (nextItem ? (
            <p className={styles.nextHint}>
              Bài kế tiếp:{' '}
              <Link to={lessonPath(nextItem.item.id)}>{nextItem.item.title}</Link>
            </p>
          ) : (
            <p className={styles.nextHint}>Bạn đã hoàn thành hết các bài trong lộ trình. 🎉</p>
          ))}
      </section>
    </article>
  )
}
