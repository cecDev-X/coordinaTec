import DashboardIcon from './DashboardIcon.jsx'
import '../css/sidebar.css'

const coordinatorNavigation = [
  { label: 'Panel Principal', icon: 'grid' },
  { label: 'Citas', icon: 'calendar' },
  { label: 'Alumnos', icon: 'users' },
  { label: 'Trámites', icon: 'document' },
  { label: 'Agenda y Horarios', icon: 'clock' },
  { label: 'Configuración', icon: 'settings' },
]

const chiefNavigation = [
  { label: 'Panel Principal', icon: 'grid' },
  { label: 'Citas', icon: 'calendar' },
  { label: 'Alumnos', icon: 'users' },
  { label: 'Trámites', icon: 'document' },
  { label: 'Carreras', icon: 'school' },
  { label: 'Coordinadores', icon: 'layers' },
  { label: 'Agenda y Horarios', icon: 'clock' },
  { label: 'Configuración', icon: 'settings' },
]

function InstitutionLogo() {
  return (
    <div className="institution-logo">
      <img src="/tecnm.webp" alt="Tecnológico Nacional de México" />
    </div>
  )
}

function DashboardSidebar({ onNavigate, onLogout, onClose, open, activePage, role, username }) {
  const activeLabel = {
    dashboard: 'Panel Principal',
    tramites: 'Trámites',
    agenda: 'Agenda y Horarios',
    citas: 'Citas',
    coordinadores: 'Coordinadores',
    carreras: 'Carreras',
    configuracion: 'Configuración',
    alumnos: 'Alumnos',
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
        <span><strong>{role === 'JEFE_COORDINADORES' ? 'Jefe de Coordinadores' : 'Coordinador'}</strong><small>{username}</small></span>
      </div>

      <nav className="dashboard-sidebar__nav" aria-label="Navegación principal">
        {(role === 'JEFE_COORDINADORES' ? chiefNavigation : coordinatorNavigation).map((item) => {
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
