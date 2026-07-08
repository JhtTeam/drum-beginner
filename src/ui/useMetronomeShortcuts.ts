/*
 * useMetronomeShortcuts — NƠI DUY NHẤT addEventListener cho Space/↑/↓/T (AD-8).
 * Chỉ được gọi bên trong MetronomeBlock. Đăng ký MỘT listener keydown trên window,
 * deps [] — không re-register; chống stale closure bằng cách đọc
 * metronome.getSnapshot() NGAY TRONG handler thay vì capture state từ render.
 */
import { useEffect } from 'react'
import { metronome } from '../core/audio'
import { resolveShortcutAction } from './metronome-shortcuts'

const INTERACTIVE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'])

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return INTERACTIVE_TAGS.has(target.tagName) || target.isContentEditable
}

export function useMetronomeShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const action = resolveShortcutAction({
        key: event.key,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        repeat: event.repeat,
        isInteractiveTarget: isInteractiveTarget(event.target),
      })
      if (action === null) return
      // Chỉ preventDefault khi action resolve (Space/↑↓ mặc định cuộn trang).
      event.preventDefault()

      const { tempo, isRunning } = metronome.getSnapshot()
      switch (action) {
        case 'toggle':
          if (isRunning) metronome.stop()
          else metronome.start()
          break
        case 'tempo+1':
          metronome.setTempo(tempo + 1)
          break
        case 'tempo-1':
          metronome.setTempo(tempo - 1)
          break
        case 'tempo+5':
          metronome.setTempo(tempo + 5)
          break
        case 'tempo-5':
          metronome.setTempo(tempo - 5)
          break
        case 'tap':
          metronome.tap()
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])
}
