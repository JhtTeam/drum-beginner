// AD-6: 5 route path là hằng số duy nhất — mọi <Route>/<Link>/navigate tham chiếu từ đây,
// không string literal rải rác.
const LESSON_BASE = '/bai-hoc'

export const ROUTES = {
  home: '/',
  roadmap: '/lo-trinh',
  lesson: `${LESSON_BASE}/:id`,
  metronome: '/metronome',
  progress: '/tien-do',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

export function lessonPath(id: string): string {
  return `${LESSON_BASE}/${encodeURIComponent(id)}`
}

// React Router match route không phân biệt hoa-thường và trailing slash —
// chuẩn hóa pathname trước khi so để active-state không lệch với router.
function normalize(pathname: string): string {
  let p = pathname.toLowerCase()
  while (p.length > 1 && p.endsWith('/')) {
    p = p.slice(0, -1)
  }
  return p
}

// UX-DR3: trang Bài học không có tab riêng — active giữ ở "Lộ trình".
export function activeNavPath(pathname: string): RoutePath | null {
  const p = normalize(pathname)
  if (p === ROUTES.home) return ROUTES.home
  if (p === ROUTES.roadmap) return ROUTES.roadmap
  if (p.startsWith(`${LESSON_BASE}/`)) {
    // Chỉ active khi khớp đúng shape /bai-hoc/:id (một segment không rỗng) —
    // /bai-hoc trần hoặc thừa segment rơi vào 404, không tab nào active.
    const rest = p.slice(LESSON_BASE.length + 1)
    if (rest.length > 0 && !rest.includes('/')) return ROUTES.roadmap
  }
  if (p === ROUTES.metronome) return ROUTES.metronome
  if (p === ROUTES.progress) return ROUTES.progress
  return null
}
