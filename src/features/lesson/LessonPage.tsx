import { useParams } from 'react-router'

export function LessonPage() {
  const { id } = useParams()

  return (
    <>
      <h1>Bài học</h1>
      <p>Nội dung bài "{id}" sẽ hiển thị ở đây.</p>
    </>
  )
}
