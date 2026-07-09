// Helpers URL YouTube — module thuần, không React (AD-1: ui/ chỉ import core/).
// AD-7: CDN duy nhất là YouTube — thumbnail i.ytimg.com + embed youtube.com.

// hqdefault.jpg (480×360) — KHÔNG dùng maxresdefault: 404 thật với nhiều video cũ.
// Lưu ý: hqdefault trả HTTP 200 (ảnh xám) kể cả video đã gỡ — onError của <img>
// KHÔNG phải lưới an toàn cho video gỡ, chỉ bắt lỗi mạng/chặn domain.
export function youtubeThumbnailUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
}

// autoplay=1 hợp lệ vì iframe chỉ mount ngay sau user gesture (NFR-5) —
// một click là video chạy. Giữ nguyên domain youtube.com (AD-7, addendum đã chốt).
export function youtubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}?autoplay=1`
}

// UX-DR9: đường thoát khi video hỏng/đã gỡ — mở tìm kiếm YouTube với từ khóa của bài.
export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}
