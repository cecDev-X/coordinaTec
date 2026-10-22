import DashboardIcon from './DashboardIcon.jsx'
import '../css/topbar.css'

function DashboardTopbar({ onToggleMenu, onAction, menuOpen, title }) {
  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar__location">
        <button
          type="button"
          className="dashboard-topbar__menu"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-controls="dashboard-sidebar"
          aria-expanded={menuOpen}
          onClick={onToggleMenu}
        >
          <DashboardIcon name="menu" size={15} />
        </button>
        <strong>{title}</strong>
        <span className="dashboard-topbar__divider" />
        <span className="dashboard-topbar__tag">TecNM</span>
        <span className="dashboard-topbar__school">Instituto Tecnológico de Oaxaca</span>
      </div>

      <div className="dashboard-topbar__tools">
        <button type="button" className="dashboard-topbar__icon-button" aria-label="Notificaciones (3)" onClick={() => onAction('Notificaciones')}>
          <DashboardIcon name="bell" size={16} />
          <span className="dashboard-topbar__notification-count">3</span>
        </button>
        <button type="button" className="dashboard-topbar__icon-button" aria-label="Mensajes" onClick={() => onAction('Mensajes')}>
          <DashboardIcon name="mail" size={16} />
        </button>
        <div className="dashboard-topbar__profile">
          <span><strong>Ing. Adelina M.</strong><small>Coordinadora Académica ISC</small></span>
          <span className="dashboard-topbar__avatar" aria-hidden="true">AM</span>
        </div>
      </div>
    </header>
  )
}

export default DashboardTopbar
