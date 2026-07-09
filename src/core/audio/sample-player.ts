/*
 * SamplePlayer — phát âm mẫu bộ trống từ file WAV tự host (FR-6, AR-7).
 * Thuần TS, KHÔNG React, KHÔNG gọi fetch/AudioContext trực tiếp (AD-1):
 * deps inject qua constructor — wiring thật chỉ ở index.ts, y hệt quan hệ
 * MetronomeEngine ↔ createWorkerTicker. Test được trong môi trường node.
 *
 * Lỗi nuốt trong class, play() trả boolean — không throw xuyên tầng
 * (Consistency Conventions): âm lỗi thì im lặng, UI vẫn highlight + panel (UX-DR7).
 */

/* Subset cấu trúc SamplePlayer cần — fake được trong test, AudioContext thật khớp sẵn. */
export interface SampleAudioNodeLike {
  connect(destination: SampleAudioNodeLike): unknown
}

/** Subset AudioBuffer — cache là buffer đã decode, KHÔNG phải source node (single-use). */
export interface AudioBufferLike {
  readonly duration: number
}

export interface BufferSourceLike extends SampleAudioNodeLike {
  buffer: AudioBufferLike | null
  start(): void
}

export interface SampleGainLike extends SampleAudioNodeLike {
  gain: { value: number }
}

export interface SampleAudioContextLike {
  readonly state: string
  readonly destination: SampleAudioNodeLike
  resume(): void | Promise<void>
  decodeAudioData(data: ArrayBuffer): Promise<AudioBufferLike>
  createBufferSource(): BufferSourceLike
  createGain(): SampleGainLike
}

export interface SamplePlayerDeps {
  getContext(): SampleAudioContextLike
  fetchArrayBuffer(url: string): Promise<ArrayBuffer>
}

/*
 * Gain 0.9 + sample peak ≤0.85: tick metronome đang chạy gain đỉnh 1.0 thẳng vào
 * destination (AD-3 xuyên route) — sample chồng lên tick là kịch bản thật, cần
 * headroom chống clip thô. Master gain stage toàn app vẫn deferred.
 */
export const SAMPLE_GAIN = 0.9

export class SamplePlayer {
  private readonly deps: SamplePlayerDeps
  /** Cache buffer đã decode — mỗi url fetch + decode đúng MỘT lần khi thành công. */
  private readonly cache = new Map<string, AudioBufferLike>()
  /** Dedup fetch đồng thời cùng url (double-click nhanh) — chỉ MỘT request bay. */
  private readonly inFlight = new Map<string, Promise<AudioBufferLike>>()

  constructor(deps: SamplePlayerDeps) {
    this.deps = deps
  }

  /** Phát âm mẫu một lần, không loop. Lỗi fetch/decode → resolve false, không throw. */
  async play(url: string): Promise<boolean> {
    try {
      const ctx = this.deps.getContext()
      // 'suspended' (autoplay) lẫn 'interrupted' (iOS) đều cần resume; resume() có thể
      // reject (policy từ chối) — nuốt lỗi như engine, không để unhandled rejection.
      if (ctx.state !== 'running') {
        void Promise.resolve(ctx.resume()).catch(() => undefined)
      }
      const buffer = this.cache.get(url) ?? (await this.load(url, ctx))
      // AudioBufferSourceNode là node dùng-một-lần — mỗi lần phát tạo source MỚI.
      const source = ctx.createBufferSource()
      source.buffer = buffer
      const gain = ctx.createGain()
      gain.gain.value = SAMPLE_GAIN
      source.connect(gain)
      gain.connect(ctx.destination)
      source.start()
      return true
    } catch {
      // Âm lỗi thì im lặng (UX-DR7) — lỗi KHÔNG cache, click sau thử lại từ đầu.
      return false
    }
  }

  private load(url: string, ctx: SampleAudioContextLike): Promise<AudioBufferLike> {
    const pending = this.inFlight.get(url)
    if (pending) return pending
    const request = this.deps
      .fetchArrayBuffer(url)
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => {
        // Chỉ cache khi THÀNH CÔNG — thất bại rơi xuống catch của play(), retry được.
        this.cache.set(url, buffer)
        return buffer
      })
      .finally(() => {
        this.inFlight.delete(url)
      })
    this.inFlight.set(url, request)
    return request
  }
}
