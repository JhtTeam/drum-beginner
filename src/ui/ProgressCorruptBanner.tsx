// Banner cảnh báo dữ liệu tiến độ hỏng (AD-4 EXPERIENCE State Patterns).
// status !== 'corrupt' → null. Giọng không chê ("bạn", verbs, không đổ lỗi).
// "Bắt đầu lại" gọi progress.reset() — đường DUY NHẤT ghi đè dữ liệu corrupt.
// Dòng gợi ý import backup CHỈ là text trỏ /tien-do — UI import thật là story 3.4.
import { Link } from 'react-router'
import { ROUTES } from '../app/routes'
import { progress } from '../core/progress'
import { useProgress } from './useProgress'
import styles from './ProgressCorruptBanner.module.css'

export function ProgressCorruptBanner() {
  const { status } = useProgress()
  if (status !== 'corrupt') return null

  return (
    <div className={styles.banner} role="alert">
      <p className={styles.message}>
        Dữ liệu tiến độ đang lưu không đọc được. Tiến độ cũ tạm ẩn để bạn tiếp tục học — chưa có
        gì bị xóa.
      </p>
      <p className={styles.hint}>
        Nếu bạn có tệp sao lưu, hãy khôi phục ở trang{' '}
        <Link to={ROUTES.progress}>Tiến độ</Link>. Hoặc bắt đầu lại từ đầu:
      </p>
      <button type="button" className={styles.resetButton} onClick={() => progress.reset()}>
        Bắt đầu lại
      </button>
    </div>
  )
}
