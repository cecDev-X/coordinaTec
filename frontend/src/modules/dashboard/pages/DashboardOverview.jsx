import { useEffect, useState } from 'react'
import AgendaCard from '../components/AgendaCard.jsx'
import MetricCards from '../components/MetricCards.jsx'
import NoticesCard from '../components/NoticesCard.jsx'
import WelcomeBanner from '../components/WelcomeBanner.jsx'
import '../css/dashboard-overview.css'

function DashboardOverview({ onNavigate }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/v1/citas', { signal: controller.signal })
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
  }, [attempt])

  function retry() {
    setLoading(true)
    setError('')
    setAttempt((current) => current + 1)
  }

  return (
    <>
      <WelcomeBanner onViewAppointments={() => onNavigate('citas')} />
      {loading && <p className="dashboard-overview__feedback" role="status">Cargando resumen de citas...</p>}
      {error && (
        <div className="dashboard-overview__feedback" role="alert">
          <span>{error}</span>
          <button type="button" onClick={retry}>Reintentar</button>
        </div>
      )}
      {!loading && !error && (
        <>
          <MetricCards appointments={appointments} />
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
