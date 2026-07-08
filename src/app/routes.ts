// AD-6: 5 route path là hằng số duy nhất — mọi <Route>/<Link>/navigate tham chiếu từ đây,
// không string literal rải rác.
export const ROUTES = {
  home: '/',
  roadmap: '/lo-trinh',
  lesson: '/bai-hoc/:id',
  metronome: '/metronome',
  progress: '/tien-do',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

const LESSON_BASE = '/bai-hoc'

export function lessonPath(id: string): string {
  return `${LESSON_BASE}/${id}`
}

// UX-DR3: trang Bài học không có tab riêng — active giữ ở "Lộ trình".
export function activeNavPath(pathname: string): RoutePath | null {
  if (pathname === ROUTES.home) return ROUTES.home
  if (pathname === ROUTES.roadmap || pathname === LESSON_BASE || pathname.startsWith(`${LESSON_BASE}/`)) {
    return ROUTES.roadmap
  }
  if (pathname === ROUTES.metronome) return ROUTES.metronome
  if (pathname === ROUTES.progress) return ROUTES.progress
  return null
}
