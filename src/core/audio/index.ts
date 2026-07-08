/*
 * core/audio public entry — wiring thật + module singleton (AD-3/AR-4).
 * MỘT instance metronome + MỘT AudioContext cho cả app (drum-map 2.3 dùng chung).
 * Feature/ui chỉ import từ đây, không import sâu metronome-engine.ts.
 *
 * Lazy-init: engine chỉ gọi createAudioContext/createTicker ở lần start() đầu tiên
 * — đúng user gesture (autoplay policy); tạo sớm ngoài gesture sẽ bị suspended.
 * Nếu ctx suspended khi start, engine tự resume() (iOS/Safari).
 */
import { MetronomeEngine } from './metronome-engine'
import type { Ticker } from './metronome-engine'
// import type — chỉ lấy type message, không kéo code worker vào bundle main.
import type { TickWorkerMessage } from './tick-worker'

export type { BeatEvent, BeatsPerBar, MetronomeSnapshot } from './metronome-engine'
export { TEMPO_DEFAULT, TEMPO_MAX, TEMPO_MIN } from './metronome-engine'

function createWorkerTicker(): Ticker {
  // Cú pháp Vite bundle worker — hoạt động cả dev lẫn build.
  const worker = new Worker(new URL('./tick-worker.ts', import.meta.url), { type: 'module' })
  let onTick: (() => void) | null = null
  worker.addEventListener('message', () => {
    onTick?.()
  })
  // Worker load fail (CSP, asset 404) fail bất đồng bộ — không exception nào tới start().
  // Thiếu dòng này engine báo isRunning=true mà không bao giờ tick, không dấu vết debug.
  worker.addEventListener('error', (event) => {
    console.error('tick-worker không chạy được — metronome sẽ không tick:', event.message)
  })
  const post = (message: TickWorkerMessage) => worker.postMessage(message)
  return {
    start(intervalMs, callback) {
      onTick = callback
      post({ type: 'start', intervalMs })
    },
    stop() {
      onTick = null
      post({ type: 'stop' })
    },
  }
}

export const metronome = new MetronomeEngine({
  createAudioContext: () => new AudioContext(),
  createTicker: createWorkerTicker,
  now: () => performance.now(),
})

// Rời site/đóng tab → stop(); đổi route trong SPA KHÔNG stop — state xuyên route (AD-3).
// KHÔNG BAO GIỜ ctx.close().
// Guard window: module này bị import gián tiếp (ui/useMetronome) — import trong môi trường
// node (vitest env hiện tại) không được nổ ở side effect cấp module.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    metronome.stop()
  })
}
