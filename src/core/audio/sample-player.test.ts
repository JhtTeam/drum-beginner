import { describe, expect, it } from 'vitest'
import { SAMPLE_GAIN, SamplePlayer } from './sample-player'
import type { AudioBufferLike, SampleAudioContextLike } from './sample-player'

// Fake deps hoàn toàn (AD-1): không jsdom, không mock module — DI làm việc đó,
// model theo metronome-engine.test.ts. Fake ctx ghi lại source/gain/decode/resume.

interface FakeSource {
  buffer: AudioBufferLike | null
  connectedTo: unknown
  startCount: number
}

interface FakeGain {
  value: number
  connectedTo: unknown
}

interface FakeAudioContext extends SampleAudioContextLike {
  state: string
  resumeCount: number
  decodeCalls: ArrayBuffer[]
  sources: FakeSource[]
  gains: FakeGain[]
  failDecode: boolean
}

function createFakeAudioContext(): FakeAudioContext {
  const destination = { connect: () => undefined }
  const ctx: FakeAudioContext = {
    state: 'running',
    resumeCount: 0,
    decodeCalls: [],
    sources: [],
    gains: [],
    failDecode: false,
    destination,
    resume() {
      ctx.resumeCount += 1
      ctx.state = 'running'
    },
    decodeAudioData(data: ArrayBuffer) {
      ctx.decodeCalls.push(data)
      if (ctx.failDecode) return Promise.reject(new Error('decode hỏng'))
      return Promise.resolve({ duration: 1 })
    },
    createBufferSource() {
      const source: FakeSource & {
        connect(destinationNode: unknown): void
        start(): void
      } = {
        buffer: null,
        connectedTo: null,
        startCount: 0,
        connect(destinationNode) {
          source.connectedTo = destinationNode
        },
        start() {
          source.startCount += 1
        },
      }
      ctx.sources.push(source)
      return source
    },
    createGain() {
      const node: FakeGain & {
        gain: { value: number }
        connect(destinationNode: unknown): void
      } = {
        value: 1,
        connectedTo: null,
        get gain() {
          return {
            get value() {
              return node.value
            },
            set value(next: number) {
              node.value = next
            },
          }
        },
        connect(destinationNode) {
          node.connectedTo = destinationNode
        },
      }
      ctx.gains.push(node)
      return node
    },
  }
  return ctx
}

function createHarness() {
  const ctx = createFakeAudioContext()
  const fetchCalls: string[] = []
  let failFetch = false
  let resolveHeld: ((data: ArrayBuffer) => void) | null = null
  let holdFetch = false
  const player = new SamplePlayer({
    getContext: () => ctx,
    fetchArrayBuffer(url) {
      fetchCalls.push(url)
      if (failFetch) return Promise.reject(new Error('mạng lỗi'))
      if (holdFetch) {
        return new Promise((resolve) => {
          resolveHeld = resolve
        })
      }
      return Promise.resolve(new ArrayBuffer(8))
    },
  })
  return {
    ctx,
    player,
    fetchCalls,
    setFailFetch(fail: boolean) {
      failFetch = fail
    },
    holdNextFetches() {
      holdFetch = true
    },
    releaseHeldFetch() {
      resolveHeld?.(new ArrayBuffer(8))
      resolveHeld = null
    },
  }
}

describe('play() lần đầu — fetch + decode + source → gain → destination (a, f)', () => {
  it('fetch đúng url, decode bytes đã fetch, source mới nhận buffer và start() một lần', async () => {
    const h = createHarness()
    await expect(h.player.play('/sounds/snare.wav')).resolves.toBe(true)

    expect(h.fetchCalls).toEqual(['/sounds/snare.wav'])
    expect(h.ctx.decodeCalls).toHaveLength(1)
    expect(h.ctx.sources).toHaveLength(1)
    expect(h.ctx.sources[0]!.buffer).toEqual({ duration: 1 })
    expect(h.ctx.sources[0]!.startCount).toBe(1)
    // Chuỗi node: source → gain → destination
    expect(h.ctx.gains).toHaveLength(1)
    expect(h.ctx.sources[0]!.connectedTo).toBe(h.ctx.gains[0])
    expect(h.ctx.gains[0]!.connectedTo).toBe(h.ctx.destination)
  })

  it('gain đặt SAMPLE_GAIN 0.9 — headroom khi chồng tick metronome gain 1.0', async () => {
    const h = createHarness()
    await h.player.play('/sounds/kick.wav')
    expect(SAMPLE_GAIN).toBe(0.9)
    expect(h.ctx.gains[0]!.value).toBe(SAMPLE_GAIN)
  })
})

describe('cache AudioBuffer (b) — source node single-use, buffer decode một lần', () => {
  it('play lần hai CÙNG url: không fetch/decode lại, vẫn tạo source MỚI và phát', async () => {
    const h = createHarness()
    await h.player.play('/sounds/tom.wav')
    await h.player.play('/sounds/tom.wav')

    expect(h.fetchCalls).toHaveLength(1)
    expect(h.ctx.decodeCalls).toHaveLength(1)
    expect(h.ctx.sources).toHaveLength(2)
    expect(h.ctx.sources[1]!.startCount).toBe(1)
  })

  it('url khác nhau fetch riêng từng url', async () => {
    const h = createHarness()
    await h.player.play('/sounds/tom.wav')
    await h.player.play('/sounds/ride.wav')
    expect(h.fetchCalls).toEqual(['/sounds/tom.wav', '/sounds/ride.wav'])
  })
})

describe('in-flight dedup (c)', () => {
  it('hai play() đồng thời cùng url chỉ fetch MỘT lần, cả hai đều phát', async () => {
    const h = createHarness()
    h.holdNextFetches()
    const first = h.player.play('/sounds/hihat.wav')
    const second = h.player.play('/sounds/hihat.wav')
    h.releaseHeldFetch()

    await expect(Promise.all([first, second])).resolves.toEqual([true, true])
    expect(h.fetchCalls).toHaveLength(1)
    expect(h.ctx.decodeCalls).toHaveLength(1)
    expect(h.ctx.sources).toHaveLength(2)
  })
})

describe('lỗi → false im lặng, KHÔNG cache lỗi (d)', () => {
  it('fetch reject → resolve false không throw; bỏ lỗi rồi click lại phát được', async () => {
    const h = createHarness()
    h.setFailFetch(true)
    await expect(h.player.play('/sounds/crash.wav')).resolves.toBe(false)
    expect(h.ctx.sources).toHaveLength(0)

    // Lỗi không bị cache vĩnh viễn — lần sau thử fetch lại và thành công
    h.setFailFetch(false)
    await expect(h.player.play('/sounds/crash.wav')).resolves.toBe(true)
    expect(h.fetchCalls).toHaveLength(2)
    expect(h.ctx.sources).toHaveLength(1)
  })

  it('decode reject (SPA rewrite trả HTML 200) → false, retry được', async () => {
    const h = createHarness()
    h.ctx.failDecode = true
    await expect(h.player.play('/sounds/snare.wav')).resolves.toBe(false)

    h.ctx.failDecode = false
    await expect(h.player.play('/sounds/snare.wav')).resolves.toBe(true)
    expect(h.ctx.decodeCalls).toHaveLength(2)
  })
})

describe('ctx suspended → resume() (e)', () => {
  it("state !== 'running' → gọi resume() trước khi phát", async () => {
    const h = createHarness()
    h.ctx.state = 'suspended'
    await expect(h.player.play('/sounds/ride.wav')).resolves.toBe(true)
    expect(h.ctx.resumeCount).toBe(1)
    expect(h.ctx.sources[0]!.startCount).toBe(1)
  })

  it("state 'running' → KHÔNG gọi resume()", async () => {
    const h = createHarness()
    await h.player.play('/sounds/ride.wav')
    expect(h.ctx.resumeCount).toBe(0)
  })
})
