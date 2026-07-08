import { Route, Routes } from 'react-router'
import { LessonPage } from '../features/lesson/LessonPage'
import { MetronomePage } from '../features/metronome/MetronomePage'
import { ProgressPage } from '../features/progress/ProgressPage'
import { HomePage } from '../features/roadmap/HomePage'
import { RoadmapPage } from '../features/roadmap/RoadmapPage'
import { AppLayout } from './AppLayout'
import { NotFoundPage } from './NotFoundPage'
import { ROUTES } from './routes'

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.roadmap} element={<RoadmapPage />} />
        <Route path={ROUTES.lesson} element={<LessonPage />} />
        <Route path={ROUTES.metronome} element={<MetronomePage />} />
        <Route path={ROUTES.progress} element={<ProgressPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
