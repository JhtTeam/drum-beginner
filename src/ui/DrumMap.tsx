/*
 * DrumMap — sơ đồ bộ trống tương tác (FR-6, UX-DR7): SVG flat tự vẽ 6 vùng theo
 * token drum-map. Click/Enter/Space → highlight + panel + phát âm mẫu MỘT lần
 * qua AudioContext dùng chung (AR-4). KHÔNG preload/autoplay — zero request .wav
 * trước click đầu tiên (UX-DR11/NFR-5). Hover CHỈ highlight bằng CSS, không phát âm.
 */
import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { drumSamples } from '../core/audio'
import { DRUM_KIT_PARTS } from './drum-kit-parts'
import type { DrumKitPart, DrumKitPartId } from './drum-kit-parts'
import styles from './DrumMap.module.css'

/* Hình học từng vùng trong viewBox 640×400 — flat gợi hình, không cần giống ảnh thật. */
interface RegionGeometry {
  cx: number
  cy: number
  rx: number
  ry: number
  /** Baseline nhãn <text> (x = cx, anchor middle). */
  labelY: number
  /** Vùng dẹt (chũm chọe) cần hit-circle trong suốt r≥32 — touch target ≥44px (UX-DR2). */
  needsHitArea: boolean
  /** Chân/stand — line mảnh gợi hình bên trong <g>. */
  stands: ReadonlyArray<readonly [number, number, number, number]>
  /** Hi-hat là CẶP lá đóng mở — vẽ thêm lá dưới cách lá trên một khoảng nhỏ. */
  pairGap?: number
}

// Record đầy đủ theo union id — thiếu geometry cho một bộ phận là lỗi compile,
// không phải vùng lặng lẽ biến mất lúc runtime.
const REGION_GEOMETRY: Record<DrumKitPartId, RegionGeometry> = {
  snare: {
    cx: 210,
    cy: 250,
    rx: 52,
    ry: 52,
    labelY: 348,
    needsHitArea: false,
    stands: [
      [210, 302, 190, 330],
      [210, 302, 230, 330],
    ],
  },
  tom: {
    cx: 320,
    cy: 140,
    rx: 48,
    ry: 48,
    labelY: 76,
    needsHitArea: false,
    stands: [[320, 188, 320, 196]],
  },
  kick: {
    cx: 380,
    cy: 255,
    rx: 85,
    ry: 85,
    labelY: 366,
    needsHitArea: false,
    stands: [],
  },
  hihat: {
    cx: 90,
    cy: 140,
    rx: 55,
    ry: 12,
    labelY: 102,
    needsHitArea: true,
    stands: [[90, 162, 90, 330]],
    pairGap: 10,
  },
  crash: {
    cx: 200,
    cy: 70,
    rx: 60,
    ry: 13,
    labelY: 34,
    needsHitArea: true,
    stands: [[200, 83, 200, 185]],
  },
  ride: {
    cx: 470,
    cy: 90,
    rx: 70,
    ry: 15,
    labelY: 48,
    needsHitArea: true,
    stands: [[470, 105, 470, 330]],
  },
}

/*
 * r=44 (đơn vị viewBox 640): ở 375px SVG render ~343px → scale ~0.54, đường kính hit
 * thực tế ~47px ≥ 44px (UX-DR2). r=40 chỉ đạt ~43px — dưới ngưỡng ở màn hẹp nhất.
 */
const HIT_AREA_RADIUS = 44

export function DrumMap() {
  // UX-DR7: vùng đang active — null trước click đầu, panel hiện hint
  const [active, setActive] = useState<string | null>(null)

  const activePart = DRUM_KIT_PARTS.find((part) => part.id === active)

  // Một handler chung cho click lẫn bàn phím: set active + phát fire-and-forget.
  // play() lỗi trả false được bỏ qua — im lặng, panel vẫn hiện (UX-DR7, AC #3).
  const activate = (part: DrumKitPart) => {
    setActive(part.id)
    void drumSamples.play(part.soundUrl)
  }

  // SVG <g> KHÔNG có native activation như <button> — Enter/Space tự viết (UX-DR11).
  const handleKeyDown = (event: KeyboardEvent<SVGGElement>, part: DrumKitPart) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    // Space mặc định cuộn trang — chặn (chặn luôn Enter, vô hại)
    event.preventDefault()
    // Giữ phím auto-repeat sẽ chồng source node liên thanh — chỉ nhận lần nhấn đầu
    if (event.repeat) return
    activate(part)
  }

  return (
    <div className={styles.layout}>
      <svg
        className={styles.map}
        viewBox="0 0 640 400"
        role="group"
        aria-label="Sơ đồ bộ trống 6 bộ phận"
      >
        {DRUM_KIT_PARTS.map((part) => {
          const geo = REGION_GEOMETRY[part.id]
          const isActive = active === part.id
          // Nhãn ngắn trong SVG = phần trước ngoặc của label; tên đầy đủ ở aria-label + panel
          const shortName = part.label.replace(/\s*\(.*\)$/, '')
          return (
            <g
              key={part.id}
              className={isActive ? `${styles.region} ${styles.active}` : styles.region}
              role="button"
              tabIndex={0}
              aria-label={part.label + ' — ' + part.role}
              aria-pressed={isActive}
              onClick={() => activate(part)}
              onKeyDown={(event) => handleKeyDown(event, part)}
            >
              {geo.stands.map(([x1, y1, x2, y2]) => (
                <line
                  key={`${x1}-${y1}-${x2}-${y2}`}
                  className={styles.stand}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                />
              ))}
              {geo.pairGap !== undefined && (
                <ellipse
                  className={styles.shape}
                  cx={geo.cx}
                  cy={geo.cy + geo.pairGap}
                  rx={geo.rx}
                  ry={geo.ry}
                />
              )}
              <ellipse className={styles.shape} cx={geo.cx} cy={geo.cy} rx={geo.rx} ry={geo.ry} />
              {geo.needsHitArea && (
                <circle className={styles.hitArea} cx={geo.cx} cy={geo.cy} r={HIT_AREA_RADIUS} />
              )}
              {/* fontSize 22 = đơn vị viewBox (hình học SVG co theo khung), không phải type token */}
              <text className={styles.label} x={geo.cx} y={geo.labelY} textAnchor="middle" fontSize={22}>
                {shortName}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Panel tên + vai trò — card token, aria-live để screen reader đọc khi đổi vùng */}
      <div className={styles.panel} aria-live="polite">
        {activePart ? (
          <>
            <h3 className={styles.partLabel}>{activePart.label}</h3>
            <p className={styles.partRole}>{activePart.role}</p>
          </>
        ) : (
          <p className={styles.hint}>Chạm vào từng bộ phận để nghe thử</p>
        )}
      </div>
    </div>
  )
}
