/*
 * VideoEmbed — khung video 16:9 click-to-load (NFR-5): thumbnail i.ytimg.com +
 * nút play + badge VI/EN; iframe YouTube CHỈ mount sau click (AD-7).
 * Component KHÔNG sort/lọc — nhận một video, render một khung; thứ tự do data quyết.
 * Lỗi là state hiển thị, không throw xuyên tầng (Consistency Conventions).
 */
import { useState } from 'react'
import type { Video } from '../core/types'
import { youtubeEmbedUrl, youtubeSearchUrl, youtubeThumbnailUrl } from './video-urls'
import styles from './VideoEmbed.module.css'

type EmbedState = 'idle' | 'playing' | 'thumbError'

export function VideoEmbed({ video, searchQuery }: { video: Video; searchQuery: string }) {
  const [state, setState] = useState<EmbedState>('idle')

  const searchUrl = youtubeSearchUrl(searchQuery)

  return (
    <figure className={styles.embed}>
      <div className={styles.frame}>
        {state === 'idle' && (
          // UX-DR11: nút thật phủ toàn khung (≥44px), aria-label chứa tên video.
          <button
            type="button"
            className={styles.playButton}
            aria-label={'Phát video: ' + video.title}
            onClick={() => setState('playing')}
          >
            {/* onError chỉ bắt lỗi mạng/chặn domain — video đã gỡ vẫn trả ảnh 200 */}
            <img
              className={styles.thumbnail}
              src={youtubeThumbnailUrl(video.youtubeId)}
              alt=""
              loading="lazy"
              onError={() => setState('thumbError')}
            />
            {/* Icon play tự vẽ, tô amber — không script/asset ngoài (AD-7) */}
            <svg
              className={styles.playIcon}
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="var(--color-amber)"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            {/* UX-DR11: badge là CHỮ, không truyền nghĩa chỉ bằng màu */}
            <span className={styles.badge}>{video.lang.toUpperCase()}</span>
          </button>
        )}

        {state === 'playing' && (
          // autoplay=1 hợp lệ: iframe mount ngay trong user gesture — một click video chạy
          <iframe
            className={styles.iframe}
            src={youtubeEmbedUrl(video.youtubeId)}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}

        {state === 'thumbError' && (
          // UX-DR9: fallback CÙNG khung 16:9 — không bao giờ khung xám trống, không sập layout
          <div className={styles.fallback}>
            <p className={styles.fallbackMessage}>Video này hiện không tải được.</p>
            <a href={searchUrl} target="_blank" rel="noopener noreferrer">
              Tìm video thay thế trên YouTube ↗
            </a>
          </div>
        )}
      </div>

      <figcaption className={styles.caption}>
        <p className={styles.title}>{video.title}</p>
        {/* Discriminated union: 'en' luôn có note (AR-7) — {video.note && …} đủ, không cần narrow */}
        {video.note && <p className={styles.note}>{video.note}</p>}
        {/*
         * UX-DR9: link phụ LUÔN hiển thị ở MỌI trạng thái — video đã gỡ vẫn trả
         * thumbnail HTTP 200 và lỗi trong iframe là cross-origin không có event,
         * nên không detect được; dòng này là đường thoát duy nhất cho người học.
         */}
        <a
          className={styles.searchLink}
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Video không xem được? Tìm trên YouTube ↗
        </a>
      </figcaption>
    </figure>
  )
}
