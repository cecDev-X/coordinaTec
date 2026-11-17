import { useEffect, useState, useSyncExternalStore } from 'react'
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
  coordinadores: '/coordinadores',
  carreras: '/carreras',
  configuracion: '/configuracion',
  alumnos: '/alumnos',
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
  if (hash === '#/coordinadores') return 'coordinadores'
  if (hash === '#/carreras') return 'carreras'
  if (hash === '#/configuracion') return 'configuracion'
  if (hash === '#/alumnos') return 'alumnos'
  if (hash === '#/analitica') return 'dashboard'
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
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('coordinaTecSession') || 'null') } catch { return null }
  })

  useEffect(() => {
    if (!session?.token) return undefined
    const controller = new AbortController()
    fetch('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${session.token}` }, signal: controller.signal,
    }).then((response) => {
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem('coordinaTecSession')
        setSession(null)
        window.location.hash = '/login'
      }
    }).catch(() => {})
    return () => controller.abort()
  }, [session?.token])

  useEffect(() => {
    const titles = {
      dashboard: 'Panel Principal',
      tramites: 'Configuración de Trámites',
      agenda: 'Agenda y Horarios',
      citas: 'Lista de Citas Actuales',
      coordinadores: 'Gestión de Coordinadores',
      carreras: 'Gestión de Carreras',
      configuracion: 'Configuración de cuenta',
      alumnos: 'Alumnos en plataforma',
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

  async function login(credentials) {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.mensaje || 'No se pudo iniciar sesión.')
    sessionStorage.setItem('coordinaTecSession', JSON.stringify(result))
    setSession(result)
    navigateTo('dashboard')
  }

  function logout() {
    sessionStorage.removeItem('coordinaTecSession')
    setSession(null)
    navigateTo('login')
  }

  // Rutas del Módulo de Estudiantes
  if (route.startsWith('student-')) {
    return (
      <EstudiantesModule
        route={route}
        onNavigate={navigateTo}
      />
    )
  }

  // Rutas del Módulo de Coordinador / Administración
  if (route !== 'login' && session?.token) {
    const adminRoutes = ['coordinadores', 'carreras']
    const permittedRoute = adminRoutes.includes(route) && session.rol !== 'JEFE_COORDINADORES'
      ? 'dashboard'
      : route
    return (
      <DashboardPage
        page={permittedRoute}
        role={session.rol}
        username={session.username}
        displayName={session.nombre}
        token={session.token}
        onNavigate={(page) => {
          window.location.hash = page === 'dashboard' ? '/panel-principal' : `/${page}`
        }}
        onLogout={logout}
      />
    )
  }

  return (
    <LoginPage
      onLogin={login}
      onGoToStudentPortal={() => navigateTo('student-login')}
    />
  )
}

export default App
