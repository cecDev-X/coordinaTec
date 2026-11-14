import { useState, useSyncExternalStore } from 'react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'
import DashboardTopbar from '../components/DashboardTopbar.jsx'
import DashboardIcon from '../components/DashboardIcon.jsx'
import DashboardOverview from './DashboardOverview.jsx'
import TramitesPage from '../../tramites/pages/TramitesPage.jsx'
import AgendaPage from '../../agenda/pages/AgendaPage.jsx'
import CitasPage from '../../citas/pages/CitasPage.jsx'
import CoordinadoresPage from './CoordinadoresPage.jsx'
import CoordinadorSettingsPage from './CoordinadorSettingsPage.jsx'
import EstudiantesAdminPage from './EstudiantesAdminPage.jsx'
import CarrerasPage from './CarrerasPage.jsx'
import '../css/dashboard-page.css'

function subscribeToViewport(callback) {
  const query = window.matchMedia('(max-width: 820px)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

function isCompactViewport() {
  return window.matchMedia('(max-width: 820px)').matches
}

function DashboardPage({ onLogout, onNavigate, page = 'dashboard', role, username, displayName, token }) {
  const compact = useSyncExternalStore(subscribeToViewport, isCompactViewport)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notice, setNotice] = useState('')

  function handleNavigation(label) {
    setMenuOpen(false)
    setNotice('')
    if (label === 'Panel Principal') onNavigate('dashboard')
    else if (label === 'Trámites') onNavigate('tramites')
    else if (label === 'Agenda y Horarios') onNavigate('agenda')
    else if (label === 'Citas') onNavigate('citas')
    else if (label === 'Alumnos') onNavigate('alumnos')
    else if (label === 'Carreras') onNavigate('carreras')
    else if (label === 'Coordinadores') onNavigate('coordinadores')
    else if (label === 'Configuración') onNavigate('configuracion')
    else setNotice(`La sección ${label} estará disponible próximamente.`)
  }

  function handleAction(label) {
    setNotice(`La vista de ${label.toLowerCase()} estará disponible próximamente.`)
  }

  let content
  if (page === 'tramites') content = <TramitesPage token={token} role={role} />
  else if (page === 'agenda') content = <AgendaPage onAction={setNotice} token={token} role={role} username={username} />
  else if (page === 'citas') content = <CitasPage role={role} username={username} token={token} />
  else if (page === 'coordinadores') content = <CoordinadoresPage token={token} />
  else if (page === 'carreras') content = <CarrerasPage token={token} />
  else if (page === 'configuracion') content = <CoordinadorSettingsPage username={username} role={role} />
  else if (page === 'alumnos') content = <EstudiantesAdminPage token={token} role={role} username={username} />
  else content = <DashboardOverview onNavigate={onNavigate} role={role} username={username} token={token} />

  return (
    <div className={`dashboard${page !== 'dashboard' ? ` dashboard--${page}` : ''}${!compact && sidebarCollapsed ? ' dashboard--sidebar-collapsed' : ''}`}>
      {menuOpen && <button type="button" className="dashboard__backdrop" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />}
      <DashboardSidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavigation}
        onLogout={onLogout}
        activePage={page}
        role={role}
        username={username}
      />
      <div className="dashboard__main">
        <DashboardTopbar
          title={{ dashboard: 'Panel Principal', tramites: 'Administración de Trámites', agenda: 'Agenda y Horarios', citas: 'Lista de Citas Actuales', coordinadores: 'Gestión de Coordinadores', carreras: 'Gestión de Carreras', configuracion: 'Configuración de cuenta', alumnos: 'Alumnos en plataforma' }[page]}
          displayName={displayName}
          role={role}
          username={username}
          menuOpen={compact ? menuOpen : !sidebarCollapsed}
          onToggleMenu={() => {
            if (compact) setMenuOpen((open) => !open)
            else setSidebarCollapsed((collapsed) => !collapsed)
          }}
          onAction={handleAction}
        />
        <main className={`dashboard__content${page !== 'dashboard' ? ` dashboard__content--${page}` : ''}`}>
          {content}
        </main>
      </div>
      {notice && (
        <div className="dashboard__toast" role="status">
          <span>{notice}</span>
          <button type="button" aria-label="Cerrar aviso" onClick={() => setNotice('')}>
            <DashboardIcon name="x" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
