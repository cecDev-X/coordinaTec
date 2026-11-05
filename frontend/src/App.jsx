import { useEffect, useSyncExternalStore } from 'react'
import LoginPage from './modules/auth/pages/LoginPage.jsx'
import DashboardPage from './modules/dashboard/pages/DashboardPage.jsx'
import EstudiantesModule from './modules/estudiantes/EstudiantesModule.jsx'

function subscribeToRoute(callback) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

const routeToHash = {
  dashboard: '/panel-principal',
  tramites: '/tramites',
  agenda: '/agenda',
  citas: '/citas',
  login: '/login',
  'student-login': '/estudiante/login',
  'student-register': '/estudiante/registro',
  'student-home': '/estudiante/inicio',
  'student-schedule': '/estudiante/agendar',
  'student-confirm': '/estudiante/confirmar',
  'student-citas': '/estudiante/citas',
  'student-profile': '/estudiante/perfil',
}

function getRoute() {
  const hash = window.location.hash
  if (hash === '#/panel-principal') return 'dashboard'
  if (hash === '#/tramites') return 'tramites'
  if (hash === '#/agenda') return 'agenda'
  if (hash === '#/citas') return 'citas'
  if (hash === '#/estudiante/login') return 'student-login'
  if (hash === '#/estudiante/registro') return 'student-register'
  if (hash === '#/estudiante' || hash === '#/estudiante/inicio') return 'student-home'
  if (hash === '#/estudiante/agendar') return 'student-schedule'
  if (hash === '#/estudiante/confirmar') return 'student-confirm'
  if (hash === '#/estudiante/citas') return 'student-citas'
  if (hash === '#/estudiante/perfil') return 'student-profile'
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
      'student-login': 'Portal Estudiantil - Iniciar sesión',
      'student-register': 'Portal Estudiantil - Crear cuenta',
      'student-home': 'Inicio y Trámites | Estudiante',
      'student-schedule': 'Agendar Cita | Estudiante',
      'student-confirm': 'Detalle de Trámite | Estudiante',
      'student-citas': 'Mis Citas | Estudiante',
      'student-profile': 'Mi Perfil | Estudiante',
    }
    document.title = `${titles[route] || 'CoordinaTec'} | Coordina Tec`
  }, [route])

  function navigateTo(targetRoute) {
    window.location.hash = routeToHash[targetRoute] || '/login'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Rutas del Módulo de Estudiantes
  if (route.startsWith('student-')) {
    return (
      <EstudiantesModule
        route={route}
        onNavigate={navigateTo}
        onLogoutToAdmin={() => navigateTo('login')}
      />
    )
  }

  // Rutas del Módulo de Coordinador / Administración
  if (route !== 'login') {
    return (
      <DashboardPage
        page={route}
        onNavigate={(page) => {
          window.location.hash = page === 'dashboard' ? '/panel-principal' : `/${page}`
        }}
        onLogout={() => {
          window.location.hash = '/login'
        }}
      />
    )
  }

  return (
    <LoginPage
      onLogin={() => navigateTo('dashboard')}
      onGoToStudentPortal={() => navigateTo('student-login')}
    />
  )
}

export default App
