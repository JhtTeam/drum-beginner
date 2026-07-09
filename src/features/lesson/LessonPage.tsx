// Trang Bài học (FR-4) — render từ getItemById (AD-2), không tự duyệt cây.
import { Link, useParams } from 'react-router'
import { ROUTES } from '../../app/routes'
import { LESSON_KIND_LABEL } from '../../core/types'
import { getItemById } from '../../content'
import { DrumMap } from '../../ui/DrumMap'
import { PracticeBlock } from '../../ui/PracticeBlock'
import { VideoEmbed } from '../../ui/VideoEmbed'
import styles from './LessonPage.module.css'

export function LessonPage() {
  const { id } = useParams()
  // Guard param rỗng/undefined trước khi tra cứu — rơi cùng nhánh 404 nội dung
  const found = id ? getItemById(id) : undefined

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
    </article>
  )
}
