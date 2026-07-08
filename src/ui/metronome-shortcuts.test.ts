// Unit test resolver phím tắt (Task 1 — red trước, green sau). Env node, không DOM.
import { describe, expect, it } from 'vitest'
import { resolveShortcutAction } from './metronome-shortcuts'
import type { ShortcutInput } from './metronome-shortcuts'

// Input mặc định: không modifier, không repeat, focus không nằm trên phần tử tương tác.
function input(overrides: Partial<ShortcutInput> & Pick<ShortcutInput, 'key'>): ShortcutInput {
  return {
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    repeat: false,
    isInteractiveTarget: false,
    ...overrides,
  }
}

describe('resolveShortcutAction — mapping 6 phím', () => {
  it('Space → toggle', () => {
    expect(resolveShortcutAction(input({ key: ' ' }))).toBe('toggle')
  })

  it('Shift+Space vẫn toggle (shift không đổi nghĩa Space)', () => {
    expect(resolveShortcutAction(input({ key: ' ', shiftKey: true }))).toBe('toggle')
  })

  it('ArrowUp → tempo+1', () => {
    expect(resolveShortcutAction(input({ key: 'ArrowUp' }))).toBe('tempo+1')
  })

  it('ArrowDown → tempo-1', () => {
    expect(resolveShortcutAction(input({ key: 'ArrowDown' }))).toBe('tempo-1')
  })

  it('Shift+ArrowUp → tempo+5', () => {
    expect(resolveShortcutAction(input({ key: 'ArrowUp', shiftKey: true }))).toBe('tempo+5')
  })

  it('Shift+ArrowDown → tempo-5', () => {
    expect(resolveShortcutAction(input({ key: 'ArrowDown', shiftKey: true }))).toBe('tempo-5')
  })

  it('t → tap', () => {
    expect(resolveShortcutAction(input({ key: 't' }))).toBe('tap')
  })

  it('T (shift hoặc CapsLock) → tap', () => {
    expect(resolveShortcutAction(input({ key: 'T', shiftKey: true }))).toBe('tap')
    expect(resolveShortcutAction(input({ key: 'T' }))).toBe('tap')
  })
})

describe('resolveShortcutAction — isInteractiveTarget chặn tất cả', () => {
  it.each([' ', 'ArrowUp', 'ArrowDown', 't', 'T'])('key %j → null khi focus tương tác', (key) => {
    expect(resolveShortcutAction(input({ key, isInteractiveTarget: true }))).toBeNull()
  })

  it('Shift+ArrowUp cũng bị chặn khi focus tương tác', () => {
    expect(
      resolveShortcutAction(input({ key: 'ArrowUp', shiftKey: true, isInteractiveTarget: true })),
    ).toBeNull()
  })
})

describe('resolveShortcutAction — modifier ctrl/meta/alt chặn (không cướp shortcut trình duyệt)', () => {
  it('Ctrl+T → null', () => {
    expect(resolveShortcutAction(input({ key: 't', ctrlKey: true }))).toBeNull()
  })

  it('Cmd+T → null', () => {
    expect(resolveShortcutAction(input({ key: 't', metaKey: true }))).toBeNull()
  })

  it('Alt+ArrowUp → null', () => {
    expect(resolveShortcutAction(input({ key: 'ArrowUp', altKey: true }))).toBeNull()
  })

  it('Ctrl+Space → null', () => {
    expect(resolveShortcutAction(input({ key: ' ', ctrlKey: true }))).toBeNull()
  })
})

describe('resolveShortcutAction — key repeat', () => {
  it('repeat chặn toggle (giữ Space không bật/tắt liên hồi)', () => {
    expect(resolveShortcutAction(input({ key: ' ', repeat: true }))).toBeNull()
  })

  it('repeat chặn tap (repeat phá trung bình tap)', () => {
    expect(resolveShortcutAction(input({ key: 't', repeat: true }))).toBeNull()
    expect(resolveShortcutAction(input({ key: 'T', repeat: true }))).toBeNull()
  })

  it('repeat CHO PHÉP 4 action tempo (giữ ↑ dò tempo nhanh)', () => {
    expect(resolveShortcutAction(input({ key: 'ArrowUp', repeat: true }))).toBe('tempo+1')
    expect(resolveShortcutAction(input({ key: 'ArrowDown', repeat: true }))).toBe('tempo-1')
    expect(resolveShortcutAction(input({ key: 'ArrowUp', shiftKey: true, repeat: true }))).toBe(
      'tempo+5',
    )
    expect(resolveShortcutAction(input({ key: 'ArrowDown', shiftKey: true, repeat: true }))).toBe(
      'tempo-5',
    )
  })
})

describe('resolveShortcutAction — phím lạ → null', () => {
  it.each(['Enter', 'Escape', 'a', 'ArrowLeft', 'ArrowRight', 'Tab', '5'])(
    'key %j → null',
    (key) => {
      expect(resolveShortcutAction(input({ key }))).toBeNull()
    },
  )
})
