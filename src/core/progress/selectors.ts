// AD-4: mọi giá trị dẫn xuất là selector thuần trong core/progress — UI chỉ gọi.
// KHÔNG import content (AD-1): danh sách item lộ trình truyền vào qua tham số.
// `now`/danh sách truyền vào để test tất định — KHÔNG gọi new Date() bên trong.
import type { LessonItemId } from '../types'
import type { IsoDateTime } from './envelope'

// Khóa ngày LOCAL "YYYY-M-D" từ ISO (getFullYear/getMonth/getDate của new Date(iso)) —
// KHÔNG so chuỗi UTC (AD-4/Conventions): 23:00 và 01:00 UTC có thể là hai ngày local khác.
function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

/**
 * Số ngày luyện liên tiếp lùi từ hôm nay. Chuẩn hóa mỗi session → ngày local distinct;
 * còn sống nếu ngày gần nhất là hôm nay HOẶC hôm qua; gặp khoảng trống > 1 ngày → dừng.
 * Ngày gần nhất cách > 1 ngày (đứt hẳn) → 0. `now` truyền vào để tất định.
 */
export function getStreak(sessions: IsoDateTime[], now: Date): number {
  if (sessions.length === 0) return 0

  const dayKeys = new Set<string>()
  for (const iso of sessions) {
    dayKeys.add(localDayKey(new Date(iso)))
  }

  // Con trỏ ngày bắt đầu từ hôm nay; nếu hôm nay chưa có session nhưng hôm qua có
  // thì streak vẫn sống, bắt đầu đếm từ hôm qua.
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!dayKeys.has(localDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!dayKeys.has(localDayKey(cursor))) return 0
  }

  let streak = 0
  while (dayKeys.has(localDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Item chưa hoàn thành đầu tiên theo thứ tự lộ trình; hết → undefined. */
export function getNextItem(
  completedLessons: Record<LessonItemId, IsoDateTime>,
  orderedItemIds: LessonItemId[],
): LessonItemId | undefined {
  return orderedItemIds.find((id) => !Object.hasOwn(completedLessons, id))
}

/** N/M của tuần: M = tổng item của tuần, N = số item đã hoàn thành trong tuần. */
export function getWeekProgress(
  completedLessons: Record<LessonItemId, IsoDateTime>,
  weekItemIds: LessonItemId[],
): { done: number; total: number } {
  const done = weekItemIds.filter((id) => Object.hasOwn(completedLessons, id)).length
  return { done, total: weekItemIds.length }
}
