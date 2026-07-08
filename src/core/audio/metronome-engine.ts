/*
 * MetronomeEngine — lookahead scheduling "A Tale of Two Clocks" (AD-3, NFR-2).
 * Thuần TS, KHÔNG React, KHÔNG chạm Worker/AudioContext trực tiếp (AD-1):
 * deps inject qua constructor để unit-test được trong môi trường node.
 * Nguyên tắc ±2ms: âm đặt lịch trên audio clock (osc.start(t)) —
 * timer chỉ bơm hàng đợi, không bao giờ phát âm trực tiếp trong callback.
 */

export type BeatsPerBar = 2 | 3 | 4

/** Beat event engine phát ra — bar/beatInBar đếm từ 1; UI không tự đếm tick (AD-3). */
export interface BeatEvent {
  bar: number
  beatInBar: number
  audioTime: number
}

/** Snapshot bất biến cho useSyncExternalStore — reference chỉ đổi khi state đổi. */
export interface MetronomeSnapshot {
  readonly tempo: number
  readonly beatsPerBar: BeatsPerBar
  readonly isRunning: boolean
}

/* Subset AudioContext engine cần — fake được trong test, AudioContext thật khớp cấu trúc. */
export interface AudioParamLike {
  value: number
  setValueAtTime(value: number, time: number): unknown
  linearRampToValueAtTime(value: number, time: number): unknown
}

export interface AudioNodeLike {
  connect(destination: AudioNodeLike): unknown
}

export interface OscillatorLike extends AudioNodeLike {
  frequency: AudioParamLike
  start(when: number): void
  stop(when: number): void
}

export interface GainLike extends AudioNodeLike {
  gain: AudioParamLike
}

export interface MetronomeAudioContext {
  readonly currentTime: number
  readonly state: string
  readonly destination: AudioNodeLike
  resume(): void | Promise<void>
  createOscillator(): OscillatorLike
  createGain(): GainLike
}

/** Nguồn tick bơm hàng đợi — wiring thật là setInterval trong Web Worker (UX-DR13). */
export interface Ticker {
  start(intervalMs: number, onTick: () => void): void
  stop(): void
}

export interface MetronomeDeps {
  createAudioContext(): MetronomeAudioContext
  createTicker(): Ticker
  now(): number
}

export const TEMPO_MIN = 40
export const TEMPO_MAX = 200
export const TEMPO_DEFAULT = 60

/** Ticker ~25ms + schedule ahead 100ms theo AudioContext.currentTime (đã web-verify). */
export const TICK_INTERVAL_MS = 25
const SCHEDULE_AHEAD_SEC = 0.1
/** Epsilon nhỏ để beat đầu không rơi vào quá khứ của audio clock. */
const START_DELAY_SEC = 0.05

const TAP_RESET_MS = 2000
const TAP_BUFFER_MAX = 5

/*
 * Ngưỡng catch-up: nếu audio clock vượt quá nextNoteTime hơn mức này (device sleep,
 * worker bị treo dài) thì bỏ qua các beat đã lỡ thay vì schedule dồn vào quá khứ
 * (osc.start(quá khứ) phát ngay lập tức → tràng click liên thanh khi tỉnh dậy).
 * Nhỏ hơn khoảng beat ngắn nhất (60/200 = 0.3s) nên trễ nhẹ vẫn phát liền mạch.
 */
const CATCH_UP_THRESHOLD_SEC = 0.25

/** Tick synthesize (AD-7 chỉ bắt buộc self-host cho âm mẫu trống): accent 880Hz, thường 440Hz. */
const CLICK_ACCENT_HZ = 880
const CLICK_REGULAR_HZ = 440
/** Envelope ~50ms ramp về 0 — tránh pop khi cắt sóng giữa chu kỳ. */
const CLICK_DURATION_SEC = 0.05
const CLICK_PEAK_GAIN = 1

export class MetronomeEngine {
  private readonly deps: MetronomeDeps
  private ctx: MetronomeAudioContext | null = null
  private ticker: Ticker | null = null

  private tempo: number = TEMPO_DEFAULT
  private beatsPerBar: BeatsPerBar = 4
  private isRunning = false

  private bar = 1
  private beatInBar = 0
  private nextNoteTime = 0
  private taps: number[] = []

  private snapshot: MetronomeSnapshot
  private readonly listeners = new Set<() => void>()
  private readonly beatListeners = new Set<(event: BeatEvent) => void>()

  constructor(deps: MetronomeDeps) {
    this.deps = deps
    this.snapshot = { tempo: this.tempo, beatsPerBar: this.beatsPerBar, isRunning: this.isRunning }
  }

  /** Đọc audio clock — story 1.3 dùng tính delay visual. Getter thuần, không logic. */
  get currentTime(): number {
    return this.ctx?.currentTime ?? 0
  }

  /** Lazy-init ở đúng user gesture (autoplay policy): ctx + ticker chỉ tạo ở start() đầu tiên. */
  start(): void {
    if (this.isRunning) return
    this.ctx ??= this.deps.createAudioContext()
    // 'suspended' (autoplay) lẫn 'interrupted' (iOS bị cắt bởi cuộc gọi/Siri) đều cần resume;
    // resume() có thể reject (policy từ chối) — nuốt lỗi, không để unhandled rejection.
    if (this.ctx.state !== 'running') {
      void Promise.resolve(this.ctx.resume()).catch(() => undefined)
    }
    this.ticker ??= this.deps.createTicker()

    this.bar = 1
    this.beatInBar = 0
    this.nextNoteTime = this.ctx.currentTime + START_DELAY_SEC
    this.isRunning = true
    this.publishSnapshot()
    this.ticker.start(TICK_INTERVAL_MS, this.pump)
  }

  /** Dừng ticker, giữ tempo/beatsPerBar — KHÔNG BAO GIỜ ctx.close() (AD-3). */
  stop(): void {
    if (!this.isRunning) return
    this.ticker?.stop()
    this.isRunning = false
    this.publishSnapshot()
  }

  /** Clamp 40–200 (FR-7), làm tròn về bpm nguyên (domain sản phẩm — tap() cũng round).
   * Đổi khi đang chạy chỉ đổi bước 60/tempo — tick đã schedule giữ nguyên. */
  setTempo(bpm: number): void {
    if (!Number.isFinite(bpm)) return
    const next = Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, Math.round(bpm)))
    if (next === this.tempo) return
    this.tempo = next
    this.publishSnapshot()
  }

  setBeatsPerBar(beats: BeatsPerBar): void {
    // Guard runtime cho caller JS/parse (TS chỉ chặn compile-time).
    if (beats !== 2 && beats !== 3 && beats !== 4) return
    if (beats === this.beatsPerBar) return
    this.beatsPerBar = beats
    this.publishSnapshot()
  }

  /** Tap tempo: trung bình khoảng cách ≤5 tap gần nhất; im > 2s reset chuỗi; không tự start. */
  tap(): void {
    const now = this.deps.now()
    const last = this.taps.at(-1)
    if (last !== undefined && now - last > TAP_RESET_MS) {
      this.taps = []
    }
    this.taps.push(now)
    if (this.taps.length > TAP_BUFFER_MAX) {
      this.taps = this.taps.slice(-TAP_BUFFER_MAX)
    }
    if (this.taps.length >= 2) {
      const first = this.taps[0]
      const latest = this.taps[this.taps.length - 1]
      const avgIntervalMs = (latest - first) / (this.taps.length - 1)
      if (avgIntervalMs > 0) {
        this.setTempo(Math.round(60_000 / avgIntervalMs))
      }
    }
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = (): MetronomeSnapshot => this.snapshot

  onBeat = (listener: (event: BeatEvent) => void): (() => void) => {
    this.beatListeners.add(listener)
    return () => {
      this.beatListeners.delete(listener)
    }
  }

  /*
   * Bơm hàng đợi mỗi lần ticker bắn (~25ms): schedule mọi beat rơi trong cửa sổ
   * lookahead 100ms. Event phát tại thời điểm schedule (sớm hơn âm thật ≤ ~100ms)
   * — payload mang audioTime để 1.3 bù visual.
   */
  private pump = (): void => {
    const ctx = this.ctx
    if (!ctx || !this.isRunning) return
    if (ctx.currentTime - this.nextNoteTime > CATCH_UP_THRESHOLD_SEC) {
      this.nextNoteTime = ctx.currentTime + START_DELAY_SEC
    }
    while (this.nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD_SEC) {
      this.advanceBeat()
      this.scheduleClick(this.nextNoteTime, this.beatInBar === 1)
      this.emitBeat({ bar: this.bar, beatInBar: this.beatInBar, audioTime: this.nextNoteTime })
      this.nextNoteTime += 60 / this.tempo
    }
  }

  /** Wrap dùng ≥ để giảm beatsPerBar giữa chừng (vd đang ở phách 4 đổi sang 3/4) vẫn đúng. */
  private advanceBeat(): void {
    if (this.beatInBar >= this.beatsPerBar) {
      this.beatInBar = 1
      this.bar += 1
    } else {
      this.beatInBar += 1
    }
  }

  /** Tách riêng để sau này thay bằng AudioBuffer sample mà không đụng scheduler. */
  private scheduleClick(time: number, isAccent: boolean): void {
    const ctx = this.ctx
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = isAccent ? CLICK_ACCENT_HZ : CLICK_REGULAR_HZ
    gain.gain.setValueAtTime(CLICK_PEAK_GAIN, time)
    gain.gain.linearRampToValueAtTime(0, time + CLICK_DURATION_SEC)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(time)
    osc.stop(time + CLICK_DURATION_SEC)
  }

  /* Listener ném lỗi không được phá scheduler: nếu exception thoát khỏi pump() trước khi
   * nextNoteTime tăng, cùng một beat sẽ bị schedule lại mỗi 25ms — click chồng vô hạn. */
  private emitBeat(event: BeatEvent): void {
    for (const listener of this.beatListeners) {
      try {
        listener(event)
      } catch {
        // listener lỗi là việc của listener — engine đi tiếp
      }
    }
  }

  /** Snapshot cached bất biến — object mới CHỈ khi state đổi (tránh render loop vô hạn). */
  private publishSnapshot(): void {
    this.snapshot = { tempo: this.tempo, beatsPerBar: this.beatsPerBar, isRunning: this.isRunning }
    for (const listener of this.listeners) {
      try {
        listener()
      } catch {
        // listener lỗi là việc của listener — engine đi tiếp
      }
    }
  }
}
