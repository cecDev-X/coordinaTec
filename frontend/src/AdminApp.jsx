import { useEffect, useState, useSyncExternalStore } from 'react'
import LoginPage from './modules/auth/pages/LoginPage.jsx'
import DashboardPage from './modules/dashboard/pages/DashboardPage.jsx'

const routes = new Set(['dashboard', 'tramites', 'agenda', 'citas', 'coordinadores', 'carreras', 'configuracion', 'alumnos'])

function subscribe(callback) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function getRoute() {
  const path = window.location.hash.slice(2)
  if (path === 'panel-principal') return 'dashboard'
  return routes.has(path) ? path : 'login'
}

function AdminApp() {
  const route = useSyncExternalStore(subscribe, getRoute)
  const [session, setSession] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('coordinaTecSession') || 'null') } catch { return null }
  })

  useEffect(() => {
    if (!session?.token) return undefined
    const controller = new AbortController()
    fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${session.token}` }, signal: controller.signal })
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem('coordinaTecSession')
          setSession(null)
          window.location.hash = '/login'
        }
      }).catch(() => {})
    return () => controller.abort()
  }, [session?.token])

  async function login(credentials) {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.mensaje || 'No se pudo iniciar sesión.')
    sessionStorage.setItem('coordinaTecSession', JSON.stringify(result))
    setSession(result)
    window.location.hash = '/panel-principal'
  }

  if (route !== 'login' && session?.token) {
    const page = ['coordinadores', 'carreras'].includes(route) && session.rol !== 'JEFE_COORDINADORES' ? 'dashboard' : route
    return <DashboardPage
      page={page} role={session.rol} username={session.username} displayName={session.nombre} token={session.token}
      onNavigate={(target) => { window.location.hash = target === 'dashboard' ? '/panel-principal' : `/${target}` }}
      onLogout={() => {
        sessionStorage.removeItem('coordinaTecSession')
        setSession(null)
        window.location.hash = '/login'
      }}
    />
  }

  return <LoginPage onLogin={login} onGoToStudentPortal={() => { window.location.href = 'https://coordinatec.site/#/estudiante/login' }} />
}

export default AdminApp
