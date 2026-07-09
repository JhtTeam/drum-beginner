// Unit test helpers URL YouTube (Task 1 — red trước, green sau). Env node, không DOM.
import { describe, expect, it } from 'vitest'
import { youtubeEmbedUrl, youtubeSearchUrl, youtubeThumbnailUrl } from './video-urls'

describe('youtubeThumbnailUrl (AD-7)', () => {
  it('trả về hqdefault.jpg trên i.ytimg.com — KHÔNG dùng maxresdefault', () => {
    expect(youtubeThumbnailUrl('abc')).toBe('https://i.ytimg.com/vi/abc/hqdefault.jpg')
  })

  it('giữ nguyên id thật 11 ký tự (có gạch dưới/gạch ngang)', () => {
    expect(youtubeThumbnailUrl('_wYDJjCFtNY')).toBe(
      'https://i.ytimg.com/vi/_wYDJjCFtNY/hqdefault.jpg',
    )
  })
})

describe('youtubeEmbedUrl (AD-7, NFR-5)', () => {
  it('trả về youtube.com/embed với autoplay=1 (iframe chỉ mount sau click)', () => {
    expect(youtubeEmbedUrl('abc')).toBe('https://www.youtube.com/embed/abc?autoplay=1')
  })
})

describe('youtubeSearchUrl (UX-DR9 — đường thoát video hỏng)', () => {
  it('có prefix results?search_query= trên youtube.com', () => {
    expect(youtubeSearchUrl('drums')).toBe(
      'https://www.youtube.com/results?search_query=drums',
    )
  })

  it('encode ký tự Việt và khoảng trắng qua encodeURIComponent — không vỡ URL', () => {
    expect(youtubeSearchUrl('cầm dùi trống')).toBe(
      `https://www.youtube.com/results?search_query=${encodeURIComponent('cầm dùi trống')}`,
    )
    // Không còn khoảng trắng thô trong URL
    expect(youtubeSearchUrl('cầm dùi trống')).not.toContain(' ')
  })

  it('encode ký tự đặc biệt của query string (&, =, ?)', () => {
    expect(youtubeSearchUrl('a & b = c?')).toBe(
      `https://www.youtube.com/results?search_query=${encodeURIComponent('a & b = c?')}`,
    )
  })
})
