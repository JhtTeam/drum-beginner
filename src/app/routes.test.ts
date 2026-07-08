import { describe, expect, it } from 'vitest'
import { ROUTES, activeNavPath, lessonPath } from './routes'

describe('ROUTES (AD-6)', () => {
  it('định nghĩa đúng 5 route theo EXPERIENCE.md IA', () => {
    expect(ROUTES).toEqual({
      home: '/',
      roadmap: '/lo-trinh',
      lesson: '/bai-hoc/:id',
      metronome: '/metronome',
      progress: '/tien-do',
    })
  })
})

describe('lessonPath', () => {
  it('build path bài học từ content ID', () => {
    expect(lessonPath('gd1-t2-b3')).toBe('/bai-hoc/gd1-t2-b3')
  })
})

describe('activeNavPath (UX-DR3)', () => {
  it('trang chủ chỉ active khi pathname đúng "/"', () => {
    expect(activeNavPath('/')).toBe(ROUTES.home)
    expect(activeNavPath('/lo-trinh')).not.toBe(ROUTES.home)
  })

  it('mỗi route chính active đúng mục nav của nó', () => {
    expect(activeNavPath('/lo-trinh')).toBe(ROUTES.roadmap)
    expect(activeNavPath('/metronome')).toBe(ROUTES.metronome)
    expect(activeNavPath('/tien-do')).toBe(ROUTES.progress)
  })

  it('trang Bài học không có tab riêng — active giữ ở "Lộ trình"', () => {
    expect(activeNavPath('/bai-hoc/gd1-t1-b1')).toBe(ROUTES.roadmap)
  })

  it('pathname lạ không active mục nào', () => {
    expect(activeNavPath('/khong-ton-tai')).toBeNull()
  })
})
