// Trang metronome độc lập "toàn màn hình" (EXPERIENCE IA #4) — chỉ compose
// ui/MetronomeBlock (AD-8). KHÔNG stop() khi rời trang: state xuyên route (AD-3).
import { MetronomeBlock } from '../../ui/MetronomeBlock'
import styles from './MetronomePage.module.css'

export function MetronomePage() {
  return (
    <div className={styles.page}>
      <h1>Metronome</h1>
      <MetronomeBlock />
    </div>
  )
}
