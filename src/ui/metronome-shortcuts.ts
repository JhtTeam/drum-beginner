/*
 * Resolver phím tắt metronome — module THUẦN (không React, không DOM type)
 * để test được ở vitest env node (AD-8: một chủ semantics phím tắt).
 * Hook useMetronomeShortcuts là nơi duy nhất dịch KeyboardEvent → ShortcutInput.
 */
export type ShortcutAction = 'toggle' | 'tempo+1' | 'tempo-1' | 'tempo+5' | 'tempo-5' | 'tap'

export interface ShortcutInput {
  key: string
  shiftKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  repeat: boolean
  isInteractiveTarget: boolean
}

export function resolveShortcutAction(input: ShortcutInput): ShortcutAction | null {
  // Focus đang ở phần tử tương tác → nhường native (không double-fire Space trên button).
  if (input.isInteractiveTarget) return null
  // Không cướp shortcut trình duyệt/OS (Cmd+T, Ctrl+T, Alt+↑…). Shift KHÔNG chặn — là modifier ±5.
  if (input.ctrlKey || input.metaKey || input.altKey) return null

  switch (input.key) {
    case ' ':
      // Giữ Space = bật/tắt liên hồi → chặn repeat. Shift+Space vẫn toggle.
      return input.repeat ? null : 'toggle'
    case 'ArrowUp':
      // Repeat cho phép: giữ ↑ để dò tempo nhanh.
      return input.shiftKey ? 'tempo+5' : 'tempo+1'
    case 'ArrowDown':
      return input.shiftKey ? 'tempo-5' : 'tempo-1'
    case 't':
    case 'T':
      // Tap repeat phá trung bình khoảng tap → chặn.
      return input.repeat ? null : 'tap'
    default:
      return null
  }
}
