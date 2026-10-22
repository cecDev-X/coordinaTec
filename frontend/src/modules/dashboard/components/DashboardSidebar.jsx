import DashboardIcon from './DashboardIcon.jsx'
import '../css/sidebar.css'

const navigation = [
  { label: 'Panel Principal', icon: 'grid' },
  { label: 'Citas', icon: 'calendar', badge: '12', badgeTone: 'amber' },
  { label: 'Trámites', icon: 'document' },
  { label: 'Agenda y Horarios', icon: 'clock', badge: 'Hoy', badgeTone: 'blue' },
  { label: 'Configuración', icon: 'settings' },
]

function InstitutionLogo() {
  return (
    <div className="institution-logo" aria-label="Tecnológico Nacional de México">
      <svg viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <path d="M17 2 20 4l4-1 1 4 4 2-2 4 2 4-3 3 1 4-4 2-1 4-5-1-3 3-3-3-4 1-1-4-4-2 2-4-2-4 3-3-1-4 4-2 1-4 4 1z" fill="#243958" />
        <circle cx="17" cy="16" r="8" fill="#fff" />
        <path d="M11 17c2-1 4-1 6 1 2-2 4-2 6-1v5c-2-1-4-1-6 1-2-2-4-2-6-1v-5ZM17 11v7" stroke="#243958" strokeWidth="1.4" />
        <circle cx="17" cy="10" r="2" fill="#243958" />
      </svg>
      <span>TECNOLÓGICO<br />NACIONAL DE MÉXICO</span>
    </div>
  )
}

function DashboardSidebar({ onNavigate, onLogout, onClose, open, activePage }) {
  const activeLabel = {
    dashboard: 'Panel Principal',
    tramites: 'Trámites',
    agenda: 'Agenda y Horarios',
    citas: 'Citas',
  }[activePage]

  return (
    <aside id="dashboard-sidebar" className={`dashboard-sidebar${open ? ' dashboard-sidebar--open' : ''}`}>
      <div className="dashboard-sidebar__brand">
        <InstitutionLogo />
        <span className="dashboard-sidebar__campus">ITO OAXACA</span>
        <button type="button" className="dashboard-sidebar__close" aria-label="Cerrar menú" onClick={onClose}>
          <DashboardIcon name="x" size={18} />
        </button>
      </div>

      <div className="dashboard-sidebar__identity">
        <span className="dashboard-sidebar__identity-icon"><DashboardIcon name="layers" size={17} /></span>
        <span><strong>PSICCA Admin</strong><small>Coordinación Académica ISC</small></span>
      </div>

      <nav className="dashboard-sidebar__nav" aria-label="Navegación principal">
        {navigation.map((item) => {
          const active = item.label === activeLabel
          return (
            <button
              key={item.label}
              type="button"
              className={`dashboard-sidebar__link${active ? ' dashboard-sidebar__link--active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => onNavigate(item.label)}
            >
              <DashboardIcon name={item.icon} size={14} />
              <span>{item.label}</span>
              {item.badge && <span className={`dashboard-sidebar__badge dashboard-sidebar__badge--${item.badgeTone}`}>{item.badge}</span>}
            </button>
          )
        })}
      </nav>

      <div className="dashboard-sidebar__footer">
        <div className="dashboard-sidebar__term">
          <strong><span className="dashboard-sidebar__term-dot" />CICLO ESCOLAR ACTIVO</strong>
          <span>Ene – Jun 2026</span>
          <small>(Semestre 2026-1)</small>
        </div>
        <button type="button" className="dashboard-sidebar__logout" onClick={onLogout}>
          <DashboardIcon name="logout" size={14} /> Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}

export default DashboardSidebar
