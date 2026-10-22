import { useState, useSyncExternalStore } from 'react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'
import DashboardTopbar from '../components/DashboardTopbar.jsx'
import WelcomeBanner from '../components/WelcomeBanner.jsx'
import MetricCards from '../components/MetricCards.jsx'
import AgendaCard from '../components/AgendaCard.jsx'
import NoticesCard from '../components/NoticesCard.jsx'
import DashboardIcon from '../components/DashboardIcon.jsx'
import TramitesPage from '../../tramites/pages/TramitesPage.jsx'
import AgendaPage from '../../agenda/pages/AgendaPage.jsx'
import CitasPage from '../../citas/pages/CitasPage.jsx'
import '../css/dashboard-page.css'

function subscribeToViewport(callback) {
  const query = window.matchMedia('(max-width: 820px)')
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

function isCompactViewport() {
  return window.matchMedia('(max-width: 820px)').matches
}

function DashboardPage({ onLogout, onNavigate, page = 'dashboard' }) {
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
    else setNotice(`La sección ${label} estará disponible próximamente.`)
  }

  function handleAction(label) {
    setNotice(`La vista de ${label.toLowerCase()} estará disponible próximamente.`)
  }

  let content
  if (page === 'tramites') content = <TramitesPage onAction={setNotice} />
  else if (page === 'agenda') content = <AgendaPage onAction={setNotice} />
  else if (page === 'citas') content = <CitasPage onAction={setNotice} />
  else {
    content = (
      <>
        <WelcomeBanner onRequests={() => handleAction('Solicitudes')} />
        <MetricCards />
        <div className="dashboard__columns">
          <AgendaCard onCalendar={() => onNavigate('agenda')} onAction={setNotice} />
          <NoticesCard onRequests={() => handleAction('Solicitudes')} />
        </div>
      </>
    )
  }

  return (
    <div className={`dashboard${page !== 'dashboard' ? ` dashboard--${page}` : ''}${!compact && sidebarCollapsed ? ' dashboard--sidebar-collapsed' : ''}`}>
      {menuOpen && <button type="button" className="dashboard__backdrop" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />}
      <DashboardSidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavigation}
        onLogout={onLogout}
        activePage={page}
      />
      <div className="dashboard__main">
        <DashboardTopbar
          title={{ dashboard: 'Panel Principal', tramites: 'Configuración de Trámites', agenda: 'Agenda y Horarios', citas: 'Lista de Citas Actuales' }[page]}
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
