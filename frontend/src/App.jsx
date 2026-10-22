import { useEffect, useSyncExternalStore } from 'react'
import LoginPage from './modules/auth/pages/LoginPage.jsx'
import DashboardPage from './modules/dashboard/pages/DashboardPage.jsx'

function subscribeToRoute(callback) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function getRoute() {
  if (window.location.hash === '#/panel-principal') return 'dashboard'
  if (window.location.hash === '#/tramites') return 'tramites'
  if (window.location.hash === '#/agenda') return 'agenda'
  if (window.location.hash === '#/citas') return 'citas'
  return 'login'
}

function App() {
  const route = useSyncExternalStore(subscribeToRoute, getRoute)

  useEffect(() => {
    const titles = {
      dashboard: 'Panel Principal',
      tramites: 'Configuración de Trámites',
      agenda: 'Agenda y Horarios',
      citas: 'Lista de Citas Actuales',
      login: 'Iniciar sesión',
    }
    document.title = `${titles[route]} | Coordina Tec`
  }, [route])

  if (route !== 'login') {
    return (
      <DashboardPage
        page={route}
        onNavigate={(page) => { window.location.hash = page === 'dashboard' ? '/panel-principal' : `/${page}` }}
        onLogout={() => { window.location.hash = '/login' }}
      />
    )
  }

  return <LoginPage onLogin={() => { window.location.hash = '/panel-principal' }} />
}

export default App
