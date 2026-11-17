import { useSyncExternalStore } from 'react'
import EstudiantesModule from './modules/estudiantes/EstudiantesModule.jsx'

const routes = {
  'student-login': '/estudiante/login',
  'student-register': '/estudiante/registro',
  'student-home': '/estudiante/inicio',
  'student-schedule': '/estudiante/agendar',
  'student-confirm': '/estudiante/confirmar',
  'student-citas': '/estudiante/citas',
  'student-profile': '/estudiante/perfil',
}

function subscribe(callback) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function getRoute() {
  const path = window.location.hash.slice(1)
  const route = Object.keys(routes).find((key) => routes[key] === path)
  return route || 'student-login'
}

function StudentApp() {
  const route = useSyncExternalStore(subscribe, getRoute)
  function navigate(target) {
    window.location.hash = routes[target] || routes['student-login']
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return <EstudiantesModule
    route={route}
    onNavigate={navigate}
  />
}

export default StudentApp
