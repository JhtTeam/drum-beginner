import { Link } from 'react-router'
import { ROUTES } from './routes'

export function NotFoundPage() {
  return (
    <>
      <h1>Không tìm thấy trang</h1>
      <p>
        Đường dẫn này không tồn tại. <Link to={ROUTES.home}>Về Trang chủ</Link> để tiếp tục buổi tập nhé.
      </p>
    </>
  )
}
