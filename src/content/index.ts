// AD-2: content/index.ts là lookup API duy nhất — features render từ
// getPhases/getWeeks/getItemById, không tự duyệt cây.
// FR-2/SM-3: thêm giai đoạn mới = import phase mới + thêm vào registry, hết.
// AD-1: file này chỉ import từ core/ và content/ — không React/app/ui/features.
import type { LessonItem, Phase, Week } from '../core/types'
import { phase1 } from './phase-1'

const phases: readonly Phase[] = [phase1]

export interface LessonItemLocation {
  item: LessonItem
  phaseId: string
  weekNumber: number
  ordinal: number
}

// Map id → vị trí, build một lần lúc module init — tra cứu O(1) cho LessonPage.
const itemLocationById = new Map<string, LessonItemLocation>()
for (const phase of phases) {
  for (const week of phase.weeks) {
    week.items.forEach((item, index) => {
      itemLocationById.set(item.id, {
        item,
        phaseId: phase.id,
        weekNumber: week.weekNumber,
        // ordinal 1-based — hiển thị "Bài M" trong breadcrumb
        ordinal: index + 1,
      })
    })
  }
}

export function getPhases(): readonly Phase[] {
  return phases
}

// Phase không tồn tại → mảng rỗng, không throw (lỗi trả về dạng kết quả tường minh).
export function getWeeks(phaseId: string): readonly Week[] {
  return phases.find((phase) => phase.id === phaseId)?.weeks ?? []
}

export function getItemById(id: string): LessonItemLocation | undefined {
  return itemLocationById.get(id)
}
