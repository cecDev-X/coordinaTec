import { useEffect, useState } from 'react'
import AgendaCard from '../components/AgendaCard.jsx'
import MetricCards from '../components/MetricCards.jsx'
import NoticesCard from '../components/NoticesCard.jsx'
import WelcomeBanner from '../components/WelcomeBanner.jsx'
import ChiefAnalyticsSummary from '../components/ChiefAnalyticsSummary.jsx'
import '../css/dashboard-overview.css'

function DashboardOverview({ onNavigate, role, username, token }) {
  const [appointments, setAppointments] = useState([])
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [studentsError, setStudentsError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    const endpoint = role === 'COORDINADOR' ? `/api/v1/citas/coordinador/${encodeURIComponent(username)}` : '/api/v1/citas'
    fetch(endpoint, { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)
        const data = await response.json()
        if (!Array.isArray(data)) throw new Error('Respuesta inesperada')
        return data
      })
      .then(setAppointments)
      .catch(() => {
        if (!controller.signal.aborted) setError('No se pudieron cargar los datos del panel. Intenta de nuevo.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt, role, username, token])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/v1/catalogos/citas', {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (response) => {
      if (!response.ok) throw new Error(`No se pudo cargar la lista de alumnos (HTTP ${response.status}).`)
      const data = await response.json()
      if (!Array.isArray(data.estudiantes)) throw new Error('Respuesta inesperada')
      return data.estudiantes
    }).then(setStudents).catch((error) => {
      if (!controller.signal.aborted) setStudentsError(error.message)
    }).finally(() => {
      if (!controller.signal.aborted) setStudentsLoading(false)
    })
    return () => controller.abort()
  }, [role, token, username])

  function retry() {
    setLoading(true)
    setError('')
    setAttempt((current) => current + 1)
  }

  return (
    <>
      <WelcomeBanner role={role} onViewAppointments={() => onNavigate('citas')} />
      {loading && <p className="dashboard-overview__feedback" role="status">Cargando resumen de citas...</p>}
      {error && (
        <div className="dashboard-overview__feedback" role="alert">
          <span>{error}</span>
          <button type="button" onClick={retry}>Reintentar</button>
        </div>
      )}
      {!loading && !error && (
        <>
          <MetricCards appointments={appointments} students={students} studentsLoading={studentsLoading} studentsError={studentsError} onViewStudents={() => onNavigate('alumnos')} />
          {role === 'JEFE_COORDINADORES' && <ChiefAnalyticsSummary appointments={appointments} />}
          <div className="dashboard__columns">
            <AgendaCard appointments={appointments} onCalendar={() => onNavigate('agenda')} />
            <NoticesCard />
          </div>
        </>
      )}
    </>
  )
}

export default DashboardOverview
