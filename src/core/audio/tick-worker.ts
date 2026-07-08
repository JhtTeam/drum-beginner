/*
 * tick-worker — nguồn tick tối giản cho lookahead scheduler (UX-DR13, GAP-2).
 * setInterval trong Worker KHÔNG bị throttle ≥1s như main thread khi tab ẩn —
 * đó là toàn bộ lý do file này tồn tại. Worker chỉ bơm 'tick', không phát âm.
 */

export type TickWorkerMessage = { type: 'start'; intervalMs: number } | { type: 'stop' }

// tsconfig dùng lib DOM (không webworker) — cast `self` cục bộ về subset worker cần,
// KHÔNG thêm lib webworker vào tsconfig chung.
const workerScope = self as unknown as {
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent<TickWorkerMessage>) => void,
  ): void
  postMessage(message: string): void
}

let intervalId: ReturnType<typeof setInterval> | undefined

workerScope.addEventListener('message', (event) => {
  clearInterval(intervalId)
  intervalId = undefined
  if (event.data.type === 'start') {
    const { intervalMs } = event.data
    // setInterval(NaN/0/âm) → flood tick ~0ms nghẽn main thread. Contract là type public
    // nên guard runtime, không tin caller.
    if (!Number.isFinite(intervalMs) || intervalMs < 1) return
    intervalId = setInterval(() => {
      workerScope.postMessage('tick')
    }, intervalMs)
  }
})
