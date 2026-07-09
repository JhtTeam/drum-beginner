/*
 * generate-drum-samples.mjs — synthesize 6 âm mẫu bộ trống (story 2.3, AR-7/PRD A4).
 * Chạy tay MỘT lần: `node scripts/generate-drum-samples.mjs` (Node ≥22, zero dependency).
 * Output: public/sounds/{snare,tom,kick,hihat,crash,ride}.wav — mono 16-bit PCM 44100Hz,
 * peak ≤0.85/file (headroom khi chồng tick metronome gain 1.0), tổng ≤ ~500KB.
 * Âm synthesize = tự sáng tác, miễn phí bản quyền theo cấu trúc; muốn hay hơn về sau
 * thay file WAV cùng tên bằng sample CC0 thật — zero code change (quy ước đặt tên).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SAMPLE_RATE = 44100
const PEAK = 0.85
const TWO_PI = 2 * Math.PI

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sounds')
// Tự tạo thư mục output — script tái tạo phải chạy được cả khi public/sounds/ chưa tồn tại.
mkdirSync(outDir, { recursive: true })

// PRNG seed cố định (mulberry32) — file sinh ra deterministic, tái tạo được y hệt.
function mulberry32(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Buffer Float64 dài `seconds`, giá trị 0. */
function silence(seconds) {
  return new Float64Array(Math.round(seconds * SAMPLE_RATE))
}

/** Decay exponential: e^(-t/tau). */
function decay(t, tau) {
  return Math.exp(-t / tau)
}

/** Chuẩn hóa peak về đúng PEAK (0.85) + fade-out 8ms cuối chống pop khi cắt. */
function finalize(samples) {
  let max = 0
  for (const value of samples) {
    max = Math.max(max, Math.abs(value))
  }
  const scale = max > 0 ? PEAK / max : 0
  const fadeSamples = Math.round(0.008 * SAMPLE_RATE)
  for (let i = 0; i < samples.length; i += 1) {
    samples[i] *= scale
    const fromEnd = samples.length - 1 - i
    if (fromEnd < fadeSamples) {
      samples[i] *= fromEnd / fadeSamples
    }
  }
  return samples
}

/** Ghi WAV mono 16-bit PCM 44100Hz — header RIFF/fmt/data chuẩn. */
function writeWav(fileName, samples) {
  const dataSize = samples.length * 2
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // fmt chunk size
  buffer.writeUInt16LE(1, 20) // PCM
  buffer.writeUInt16LE(1, 22) // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24)
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28) // byte rate
  buffer.writeUInt16LE(2, 32) // block align
  buffer.writeUInt16LE(16, 34) // bits per sample
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]))
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2)
  }
  const path = join(outDir, fileName)
  writeFileSync(path, buffer)
  console.log(`${fileName}: ${(buffer.length / 1024).toFixed(1)} KB`)
}

/** Sine sweep exponential from→to Hz — tích lũy pha để sweep mượt không click. */
function sweep(samples, fromHz, toHz, tau, amp = 1) {
  const duration = samples.length / SAMPLE_RATE
  let phase = 0
  for (let i = 0; i < samples.length; i += 1) {
    const t = i / SAMPLE_RATE
    const freq = fromHz * (toHz / fromHz) ** (t / duration)
    phase += (TWO_PI * freq) / SAMPLE_RATE
    samples[i] += Math.sin(phase) * decay(t, tau) * amp
  }
}

/** Noise highpass thô (vi phân bậc nhất, lặp `order` lần) nhân envelope decay. */
function highpassNoise(samples, random, tau, amp = 1, order = 1) {
  const raw = new Float64Array(samples.length)
  for (let i = 0; i < raw.length; i += 1) {
    raw[i] = random() * 2 - 1
  }
  for (let pass = 0; pass < order; pass += 1) {
    for (let i = raw.length - 1; i >= 1; i -= 1) {
      raw[i] = (raw[i] - raw[i - 1]) * 0.5
    }
  }
  for (let i = 0; i < samples.length; i += 1) {
    const t = i / SAMPLE_RATE
    samples[i] += raw[i] * decay(t, tau) * amp
  }
}

/** Cộng các partial sine tần số cố định (kim loại — không hài hòa). */
function partials(samples, freqs, tau, amp = 1) {
  for (let i = 0; i < samples.length; i += 1) {
    const t = i / SAMPLE_RATE
    let value = 0
    for (const freq of freqs) {
      value += Math.sin(TWO_PI * freq * t)
    }
    samples[i] += (value / freqs.length) * decay(t, tau) * amp
  }
}

// ---- 6 công thức (story 2.3 Dev Notes §"Công thức synthesize âm mẫu") ----

/** kick (~0.35s): sweep 120→45Hz decay nhanh + transient click 5ms đầu. */
function kick() {
  const samples = silence(0.35)
  sweep(samples, 120, 45, 0.09, 1)
  const random = mulberry32(11)
  const clickLen = Math.round(0.005 * SAMPLE_RATE)
  for (let i = 0; i < clickLen; i += 1) {
    samples[i] += (random() * 2 - 1) * (1 - i / clickLen) * 0.35
  }
  return samples
}

/** snare (~0.25s): noise band thô (highpass + lowpass nhẹ) + body sine ~190Hz, decay rất nhanh. */
function snare() {
  const samples = silence(0.25)
  const noise = silence(0.25)
  highpassNoise(noise, mulberry32(22), 0.05, 1, 1)
  // Lowpass một cực nhẹ kéo bớt phần chói >8kHz — thành dải ~1.5–8kHz thô
  let prev = 0
  for (let i = 0; i < noise.length; i += 1) {
    prev = prev * 0.35 + noise[i] * 0.65
    samples[i] += prev * 1.1
  }
  sweep(samples, 195, 185, 0.045, 0.7) // body ~190Hz gần như tĩnh
  return samples
}

/** tom (~0.4s): sweep 160→110Hz decay vừa — tròn, trầm hơn snare. */
function tom() {
  const samples = silence(0.4)
  sweep(samples, 160, 110, 0.13, 1)
  return samples
}

/** hihat (~0.12s): noise thiên cao (highpass kép), decay cực nhanh — closed hat "chíc". */
function hihat() {
  const samples = silence(0.12)
  highpassNoise(samples, mulberry32(33), 0.022, 1, 2)
  return samples
}

/** crash (~1.8s): noise + partial kim loại không hài hòa 3.1k/4.7k/6.3kHz, decay chậm. */
function crash() {
  const samples = silence(1.8)
  highpassNoise(samples, mulberry32(44), 0.5, 0.8, 1)
  partials(samples, [3110, 4730, 6280], 0.7, 0.45)
  return samples
}

/** ride (~1.2s): ping — partial thấp-trung 330/495/587Hz + shimmer noise nhỏ, decay vừa. */
function ride() {
  const samples = silence(1.2)
  partials(samples, [330, 495, 587, 1244], 0.4, 1)
  highpassNoise(samples, mulberry32(55), 0.25, 0.18, 2)
  return samples
}

const GENERATORS = { snare, tom, kick, hihat, crash, ride }

for (const [name, generate] of Object.entries(GENERATORS)) {
  writeWav(`${name}.wav`, finalize(generate()))
}
