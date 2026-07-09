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
import { SamplePlayer } from './sample-player'
// import type — chỉ lấy type message, không kéo code worker vào bundle main.
import type { TickWorkerMessage } from './tick-worker'

export type { BeatEvent, BeatsPerBar, MetronomeSnapshot } from './metronome-engine'
export { TEMPO_DEFAULT, TEMPO_MAX, TEMPO_MIN } from './metronome-engine'

// AR-4/AD-3: MỘT AudioContext cho cả app — metronome lẫn drum samples đều đi
// qua đây. Lazy-init ở user gesture đầu tiên (start() metronome hoặc click
// sơ đồ trống — cả hai đều là gesture hợp lệ theo autoplay policy).
let sharedCtx: AudioContext | null = null

function getSharedAudioContext(): AudioContext {
  sharedCtx ??= new AudioContext()
  return sharedCtx
}

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
  createAudioContext: getSharedAudioContext,
  createTicker: createWorkerTicker,
  now: () => performance.now(),
})

// FR-6: instance phát âm mẫu bộ trống — wiring thật (fetch + shared ctx) chỉ ở đây (AD-1).
// KHÔNG preload khi mount: fetch chỉ chạy ở lần play() đầu của mỗi url (UX-DR11/NFR-5).
export const drumSamples = new SamplePlayer({
  getContext: getSharedAudioContext,
  // Timeout 10s: fetch treo vô hạn sẽ kẹt trong in-flight map của SamplePlayer —
  // mọi click sau trên cùng vùng câm vĩnh viễn. Abort → reject → dọn in-flight, retry được.
  fetchArrayBuffer: (url) =>
    fetch(url, { signal: AbortSignal.timeout(10_000) }).then((response) => {
      if (!response.ok) throw new Error(`không tải được âm mẫu: ${url}`)
      return response.arrayBuffer()
    }),
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
