import { describe, expect, it } from 'vitest'
import { MetronomeEngine } from './metronome-engine'
import type { BeatEvent, MetronomeAudioContext, MetronomeDeps, Ticker } from './metronome-engine'

// Fake deps hoàn toàn (AD-1): không jsdom, không mock module — DI làm việc đó.
// Fake AudioContext ghi lại lịch osc.start(t) + frequency; ticker bắn tay; now() chỉnh tay.

const TICK_MS = 25
const TICK_SEC = TICK_MS / 1000

interface RecordedClick {
  time: number
  frequency: number
  stopTime: number
}

interface FakeAudioContext extends MetronomeAudioContext {
  currentTime: number
  state: 'running' | 'suspended'
  clicks: RecordedClick[]
  resumeCount: number
  closeCount: number
  close(): void
}

function createFakeAudioContext(): FakeAudioContext {
  const noopParam = () => ({
    value: 1,
    setValueAtTime: () => undefined,
    linearRampToValueAtTime: () => undefined,
  })
  const ctx: FakeAudioContext = {
    currentTime: 0,
    state: 'running',
    clicks: [],
    resumeCount: 0,
    closeCount: 0,
    destination: { connect: () => undefined },
    resume() {
      ctx.resumeCount += 1
      ctx.state = 'running'
    },
    close() {
      ctx.closeCount += 1
    },
    createOscillator() {
      const frequency = noopParam()
      const click: RecordedClick = { time: -1, frequency: -1, stopTime: -1 }
      return {
        frequency,
        connect: () => undefined,
        start(when: number) {
          click.time = when
          click.frequency = frequency.value
          ctx.clicks.push(click)
        },
        stop(when: number) {
          click.stopTime = when
        },
      }
    },
    createGain: () => ({
      gain: noopParam(),
      connect: () => undefined,
    }),
  }
  return ctx
}

interface FakeTicker extends Ticker {
  startCalls: number[]
  stopCount: number
  fire(): void
}

function createFakeTicker(): FakeTicker {
  let callback: (() => void) | null = null
  return {
    startCalls: [],
    stopCount: 0,
    start(intervalMs, onTick) {
      this.startCalls.push(intervalMs)
      callback = onTick
    },
    stop() {
      this.stopCount += 1
      callback = null
    },
    fire() {
      callback?.()
    },
  }
}

function createHarness() {
  const ctx = createFakeAudioContext()
  const ticker = createFakeTicker()
  let nowMs = 0
  let ctxCreated = 0
  let tickerCreated = 0
  const deps: MetronomeDeps = {
    createAudioContext: () => {
      ctxCreated += 1
      return ctx
    },
    createTicker: () => {
      tickerCreated += 1
      return ticker
    },
    now: () => nowMs,
  }
  const engine = new MetronomeEngine(deps)
  return {
    ctx,
    ticker,
    engine,
    setNow(ms: number) {
      nowMs = ms
    },
    ctxCreated: () => ctxCreated,
    tickerCreated: () => tickerCreated,
    // Mô phỏng thời gian trôi: mỗi bước ~25ms chỉnh currentTime rồi bắn ticker.
    run(seconds: number) {
      const steps = Math.round(seconds / TICK_SEC)
      for (let i = 0; i < steps; i += 1) {
        ctx.currentTime += TICK_SEC
        ticker.fire()
      }
    },
  }
}

describe('lịch tick theo tempo (AC-3 test 1)', () => {
  it('tempo 60 mặc định: tick cách đúng 1.000s bắt đầu từ currentTime + 0.05', () => {
    const h = createHarness()
    h.engine.start()
    h.run(5)
    // Lookahead 0.1s: tại currentTime 5.0 mọi beat < 5.1 đã schedule → 0.05..5.05 = 6 tick.
    expect(h.ctx.clicks).toHaveLength(6)
    h.ctx.clicks.forEach((click, i) => {
      expect(click.time).toBeCloseTo(0.05 + i * 1.0, 9)
    })
  })

  it('tempo 120: tick cách đúng 0.500s', () => {
    const h = createHarness()
    h.engine.setTempo(120)
    h.engine.start()
    h.run(3)
    expect(h.ctx.clicks.length).toBeGreaterThan(5)
    h.ctx.clicks.forEach((click, i) => {
      expect(click.time).toBeCloseTo(0.05 + i * 0.5, 9)
    })
  })

  it('không trôi tích lũy qua nhiều chu kỳ ticker (tempo 90, 60 giây)', () => {
    const h = createHarness()
    h.engine.setTempo(90)
    h.engine.start()
    h.run(60)
    const interval = 60 / 90
    expect(h.ctx.clicks.length).toBeGreaterThan(85)
    // Tick thứ i phải khớp 0.05 + i*interval tuyệt đối (không cộng dồn sai số từ tick trước).
    h.ctx.clicks.forEach((click, i) => {
      expect(click.time).toBeCloseTo(0.05 + i * interval, 6)
    })
  })
})

describe('đổi tempo khi đang chạy (AC-3 test 2)', () => {
  it('tick đã schedule giữ nguyên thời điểm, khoảng cách mới áp dụng từ beat kế tiếp', () => {
    const h = createHarness()
    h.engine.start()
    h.run(0.5)
    // Đã schedule beat 0.05; beat kế (1.05) đã nằm trong hàng đợi với bước cũ.
    expect(h.ctx.clicks.map((c) => c.time)).toEqual([0.05])
    const before = [...h.ctx.clicks]

    h.engine.setTempo(120)
    h.run(3)

    // Tick đã schedule không bị hủy/reschedule.
    expect(h.ctx.clicks.slice(0, before.length)).toEqual(before)
    expect(h.ctx.clicks[0]!.time).toBeCloseTo(0.05, 9)
    // Beat pre-queued phát đúng lịch cũ (tối đa ~1 beat), sau đó mọi khoảng cách là 60/120.
    expect(h.ctx.clicks[1]!.time).toBeCloseTo(1.05, 9)
    for (let i = 2; i < h.ctx.clicks.length; i += 1) {
      expect(h.ctx.clicks[i]!.time - h.ctx.clicks[i - 1]!.time).toBeCloseTo(0.5, 9)
    }
    expect(h.ctx.clicks.length).toBeGreaterThan(4)
  })
})

describe('tap tempo (AC-3 test 3)', () => {
  it('4 tap cách 500ms → tempo 120', () => {
    const h = createHarness()
    for (const t of [0, 500, 1000, 1500]) {
      h.setNow(t)
      h.engine.tap()
    }
    expect(h.engine.getSnapshot().tempo).toBe(120)
  })

  it('chỉ tính tối đa 5 tap gần nhất', () => {
    const h = createHarness()
    // 2 tap đầu cách 1000ms, 5 tap sau chỉ chứa các khoảng 400ms.
    for (const t of [0, 1000, 2000, 2400, 2800, 3200, 3600]) {
      h.setNow(t)
      h.engine.tap()
    }
    // Buffer = [2000, 2400, 2800, 3200, 3600] → avg 400ms → 150, không phải 100 (nếu tính cả 7).
    expect(h.engine.getSnapshot().tempo).toBe(150)
  })

  it('im lặng > 2000ms → reset chuỗi, không lẫn tap cũ', () => {
    const h = createHarness()
    h.setNow(0)
    h.engine.tap()
    h.setNow(500)
    h.engine.tap()
    expect(h.engine.getSnapshot().tempo).toBe(120)

    // Gap 2500ms > 2000ms: tap đơn mở chuỗi mới, tempo giữ nguyên.
    h.setNow(3000)
    h.engine.tap()
    expect(h.engine.getSnapshot().tempo).toBe(120)

    // Tap kế cách 600ms → 100bpm; nếu lẫn tap cũ sẽ ra 50.
    h.setNow(3600)
    h.engine.tap()
    expect(h.engine.getSnapshot().tempo).toBe(100)
  })

  it('tap không bao giờ tự start engine', () => {
    const h = createHarness()
    for (const t of [0, 500, 1000]) {
      h.setNow(t)
      h.engine.tap()
    }
    expect(h.engine.getSnapshot().isRunning).toBe(false)
    expect(h.ticker.startCalls).toHaveLength(0)
    expect(h.ctxCreated()).toBe(0)
  })

  it('tap quá nhanh vẫn đi qua clamp setTempo (100ms → 200 chứ không 600)', () => {
    const h = createHarness()
    h.setNow(0)
    h.engine.tap()
    h.setNow(100)
    h.engine.tap()
    expect(h.engine.getSnapshot().tempo).toBe(200)
  })
})

describe('beat event {bar, beatInBar, audioTime}', () => {
  function collect(engine: MetronomeEngine): BeatEvent[] {
    const events: BeatEvent[] = []
    engine.onBeat((e) => events.push(e))
    return events
  }

  it('beatInBar wrap 1→4→1 theo 4/4, bar tăng dần (đếm từ 1)', () => {
    const h = createHarness()
    const events = collect(h.engine)
    h.engine.start()
    h.run(6.5)
    expect(events.map((e) => e.beatInBar)).toEqual([1, 2, 3, 4, 1, 2, 3])
    expect(events.map((e) => e.bar)).toEqual([1, 1, 1, 1, 2, 2, 2])
  })

  it('đổi setBeatsPerBar(3) giữa chừng: wrap theo số phách mới từ beat kế tiếp', () => {
    const h = createHarness()
    const events = collect(h.engine)
    h.engine.start()
    h.run(3.5) // 4 beat: beatInBar 1..4 của bar 1
    expect(events.map((e) => e.beatInBar)).toEqual([1, 2, 3, 4])

    h.engine.setBeatsPerBar(3)
    h.run(4) // 4 beat kế: wrap ngay (4 ≥ 3) rồi theo chu kỳ 3
    expect(events.slice(4).map((e) => e.beatInBar)).toEqual([1, 2, 3, 1])
    expect(events.slice(4).map((e) => e.bar)).toEqual([2, 2, 2, 3])
  })

  it('audioTime của event trùng thời điểm click đã schedule', () => {
    const h = createHarness()
    const events = collect(h.engine)
    h.engine.start()
    h.run(3)
    expect(events.length).toBeGreaterThan(0)
    expect(events.map((e) => e.audioTime)).toEqual(h.ctx.clicks.map((c) => c.time))
  })

  it('phách 1 accent 880Hz, phách thường 440Hz', () => {
    const h = createHarness()
    h.engine.start()
    h.run(4.5) // 5 beat: 1,2,3,4,1
    expect(h.ctx.clicks.map((c) => c.frequency)).toEqual([880, 440, 440, 440, 880])
  })
})

describe('setTempo clamp 40–200', () => {
  it('mặc định 60; clamp dưới 40 và trên 200', () => {
    const h = createHarness()
    expect(h.engine.getSnapshot().tempo).toBe(60)
    h.engine.setTempo(39)
    expect(h.engine.getSnapshot().tempo).toBe(40)
    h.engine.setTempo(201)
    expect(h.engine.getSnapshot().tempo).toBe(200)
    h.engine.setTempo(120)
    expect(h.engine.getSnapshot().tempo).toBe(120)
  })
})

describe('lifecycle', () => {
  it('stop() dừng ticker, isRunning=false, giữ tempo/beatsPerBar, KHÔNG BAO GIỜ ctx.close()', () => {
    const h = createHarness()
    h.engine.setTempo(100)
    h.engine.setBeatsPerBar(3)
    h.engine.start()
    h.run(2)
    h.engine.stop()
    expect(h.ticker.stopCount).toBe(1)
    expect(h.ctx.closeCount).toBe(0)
    expect(h.engine.getSnapshot()).toEqual({ tempo: 100, beatsPerBar: 3, isRunning: false })
  })

  it('AudioContext + ticker tạo lazy ở start() đầu tiên, tái dùng khi start lại', () => {
    const h = createHarness()
    expect(h.ctxCreated()).toBe(0)
    expect(h.tickerCreated()).toBe(0)
    h.engine.start()
    expect(h.ctxCreated()).toBe(1)
    expect(h.tickerCreated()).toBe(1)
    h.engine.stop()
    h.engine.start()
    expect(h.ctxCreated()).toBe(1)
    expect(h.tickerCreated()).toBe(1)
  })

  it('start() khi ctx suspended → resume(); start lại reset bar=1, beat đầu là phách 1', () => {
    const h = createHarness()
    h.engine.start()
    h.run(5.5)
    h.engine.stop()

    const events: BeatEvent[] = []
    h.engine.onBeat((e) => events.push(e))
    h.ctx.state = 'suspended'
    h.engine.start()
    expect(h.ctx.resumeCount).toBe(1)
    h.run(1)
    expect(events[0]).toMatchObject({ bar: 1, beatInBar: 1 })
  })
})

describe('getSnapshot cho useSyncExternalStore', () => {
  it('giữ nguyên reference khi không có gì đổi (kể cả sau nhiều chu kỳ beat)', () => {
    const h = createHarness()
    const s1 = h.engine.getSnapshot()
    expect(h.engine.getSnapshot()).toBe(s1)
    h.engine.setTempo(60) // giá trị không đổi → không tạo object mới
    expect(h.engine.getSnapshot()).toBe(s1)
    h.engine.setBeatsPerBar(4)
    expect(h.engine.getSnapshot()).toBe(s1)

    h.engine.start()
    const s2 = h.engine.getSnapshot()
    h.run(3) // beat event không đổi state snapshot
    expect(h.engine.getSnapshot()).toBe(s2)
  })

  it('reference mới CHỈ khi state đổi + notify subscriber; unsubscribe ngừng nhận', () => {
    const h = createHarness()
    let notified = 0
    const unsubscribe = h.engine.subscribe(() => {
      notified += 1
    })

    const s1 = h.engine.getSnapshot()
    h.engine.setTempo(80)
    const s2 = h.engine.getSnapshot()
    expect(s2).not.toBe(s1)
    expect(s2.tempo).toBe(80)
    expect(notified).toBe(1)

    h.engine.start()
    expect(h.engine.getSnapshot().isRunning).toBe(true)
    expect(h.engine.getSnapshot()).not.toBe(s2)
    expect(notified).toBe(2)

    unsubscribe()
    h.engine.setTempo(90)
    expect(notified).toBe(2)
  })
})

describe('robustness (review patches)', () => {
  it('clock nhảy xa (device sleep/worker treo) → bỏ qua beat đã lỡ, KHÔNG burst click quá khứ', () => {
    const h = createHarness()
    h.engine.start()
    h.run(2)
    const clicksBefore = h.ctx.clicks.length

    // Mô phỏng 60s clock trôi mà ticker không bắn (sleep) rồi tỉnh dậy
    h.ctx.currentTime += 60
    h.ticker.fire()

    const newClicks = h.ctx.clicks.slice(clicksBefore)
    // Không schedule dồn ~60 beat đã lỡ — chỉ những beat trong cửa sổ lookahead mới
    expect(newClicks.length).toBeLessThanOrEqual(2)
    for (const click of newClicks) {
      expect(click.time).toBeGreaterThanOrEqual(h.ctx.currentTime)
    }
  })

  it('trễ nhẹ dưới ngưỡng catch-up vẫn phát liền mạch (không skip beat)', () => {
    const h = createHarness()
    h.engine.start()
    h.run(1) // beat kế tiếp ở 2.05s
    const clicksBefore = h.ctx.clicks.length
    // Ticker khựng: clock tới 2.20s — beat 2.05 lỡ 0.15s (< 0.25s threshold) vẫn được
    // schedule (osc.start quá khứ phát ngay) thay vì bị skip
    h.ctx.currentTime = 2.2
    h.ticker.fire()
    expect(h.ctx.clicks.length).toBe(clicksBefore + 1)
    expect(h.ctx.clicks.at(-1)?.time).toBeCloseTo(2.05, 5)
  })

  it('onBeat listener ném lỗi không phá scheduler — beat không bị schedule trùng, listener khác vẫn nhận', () => {
    const h = createHarness()
    const received: BeatEvent[] = []
    h.engine.onBeat(() => {
      throw new Error('listener hỏng')
    })
    h.engine.onBeat((e) => received.push(e))
    h.engine.start()
    h.run(3)

    // Không có beat trùng thời điểm (lỗi listener từng làm pump abort trước khi tăng nextNoteTime)
    const times = h.ctx.clicks.map((c) => c.time)
    expect(new Set(times).size).toBe(times.length)
    expect(received.length).toBe(times.length)

    // subscribe listener ném lỗi cũng không chặn notify các listener khác
    let notified = 0
    h.engine.subscribe(() => {
      throw new Error('subscriber hỏng')
    })
    h.engine.subscribe(() => {
      notified += 1
    })
    h.engine.setTempo(90)
    expect(notified).toBe(1)
  })

  it('setTempo làm tròn bpm lẻ về số nguyên (đồng nhất với tap())', () => {
    const h = createHarness()
    h.engine.setTempo(60.5)
    expect(h.engine.getSnapshot().tempo).toBe(61)
  })

  it('setBeatsPerBar guard runtime: giá trị ngoài 2|3|4 bị bỏ qua', () => {
    const h = createHarness()
    h.engine.setBeatsPerBar(0 as never)
    h.engine.setBeatsPerBar(Number.NaN as never)
    h.engine.setBeatsPerBar(7 as never)
    expect(h.engine.getSnapshot().beatsPerBar).toBe(4)
  })
})
