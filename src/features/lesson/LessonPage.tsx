// Trang Bài học (FR-4) — render từ getItemById (AD-2), không tự duyệt cây.
// Story này KHÔNG render videos (2.2) / pattern-tempo-MetronomeBlock (2.4).
import { Link, useParams } from 'react-router'
import { ROUTES } from '../../app/routes'
import { LESSON_KIND_LABEL } from '../../core/types'
import { getItemById } from '../../content'
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
