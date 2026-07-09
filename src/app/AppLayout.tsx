import { Link, Outlet, useLocation } from 'react-router'
import { ProgressCorruptBanner } from '../ui/ProgressCorruptBanner'
import styles from './AppLayout.module.css'
import { ROUTES, activeNavPath } from './routes'

const NAV_ITEMS = [
  { to: ROUTES.home, label: 'Trang chủ' },
  { to: ROUTES.roadmap, label: 'Lộ trình' },
  { to: ROUTES.metronome, label: 'Metronome' },
  { to: ROUTES.progress, label: 'Tiến độ' },
] as const

export function AppLayout() {
  const { pathname } = useLocation()
  const active = activeNavPath(pathname)

  return (
    <div className={styles.shell}>
      <nav className={styles.nav} aria-label="Điều hướng chính">
        <div className={styles.navInner}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={item.to === active ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
              aria-current={item.to === active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className={styles.main}>
        <ProgressCorruptBanner />
        <Outlet />
      </main>
    </div>
  )
}
