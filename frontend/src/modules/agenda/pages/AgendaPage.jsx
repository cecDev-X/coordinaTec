import { useEffect, useState } from 'react'
import AgendaBanner from '../components/AgendaBanner.jsx'
import CitaFormModal from '../components/CitaFormModal.jsx'
import AgendaToolbar from '../components/AgendaToolbar.jsx'
import WeekCalendar from '../components/WeekCalendar.jsx'
import AgendaCoordinatorSelection from '../components/AgendaCoordinatorSelection.jsx'
import { appointmentsForWeek, isPending, mondayOf, shiftWeek, statusLabel } from '../data/agendaData.js'
import '../css/agenda-page.css'

function AgendaPage({ onAction, token, role, username }) {
  const [monday, setMonday] = useState(() => mondayOf(new Date()))
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [createMessage, setCreateMessage] = useState('')
  const [coordinators, setCoordinators] = useState([])
  const [selectedCoordinator, setSelectedCoordinator] = useState(undefined)

  useEffect(() => {
    const controller = new AbortController()

    const headers = { Authorization: `Bearer ${token}` }
    const loadAppointments = role === 'JEFE_COORDINADORES'
      ? fetch('/api/v1/catalogos/citas', { signal: controller.signal, headers }).then(async (response) => {
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)
        const catalog = await response.json()
        if (!Array.isArray(catalog.coordinadores)) throw new Error('Respuesta inesperada')
        setCoordinators(catalog.coordinadores)
        const results = await Promise.all(catalog.coordinadores.map(async (coordinator) => {
          const appointmentsResponse = await fetch(`/api/v1/citas/coordinador/${encodeURIComponent(coordinator.rfc)}`, { signal: controller.signal, headers })
          if (!appointmentsResponse.ok) throw new Error(`No se pudo cargar la agenda de ${coordinator.nombre}.`)
          const coordinatorAppointments = await appointmentsResponse.json()
          if (!Array.isArray(coordinatorAppointments)) throw new Error('Respuesta inesperada')
          return coordinatorAppointments.map((appointment) => ({ ...appointment, coordinadorRfc: coordinator.rfc, coordinadorNombre: coordinator.nombre }))
        }))
        return results.flat()
      })
      : fetch(`/api/v1/citas/coordinador/${encodeURIComponent(username)}`, { signal: controller.signal, headers }).then(async (response) => {
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)
        const data = await response.json()
        if (!Array.isArray(data)) throw new Error('Respuesta inesperada')
        return data.map((appointment) => ({ ...appointment, coordinadorRfc: username }))
      })
    loadAppointments.then(setAppointments)
      .catch(() => {
        if (!controller.signal.aborted) setError('No se pudieron cargar las citas. Intenta de nuevo.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt, token, role, username])

  const coordinatorAppointments = selectedCoordinator && role === 'JEFE_COORDINADORES'
    ? appointments.filter((appointment) => appointment.coordinadorRfc === selectedCoordinator)
    : appointments
  const weekAppointments = appointmentsForWeek(coordinatorAppointments, monday)
  const visibleAppointments = appointmentsForWeek(coordinatorAppointments, monday, filter)
  const filters = [
    { key: 'all', label: 'Todas', count: weekAppointments.length },
    { key: 'pending', label: 'Pendientes', count: weekAppointments.filter((appointment) => isPending(appointment.estado)).length },
    { key: 'attended', label: 'Atendidas', count: weekAppointments.filter((appointment) => appointment.estado === 'ATENDIDA').length },
  ]

  function handleRetry() {
    setLoading(true)
    setError('')
    setAttempt((current) => current + 1)
  }

  if (role === 'JEFE_COORDINADORES' && !loading && !error && selectedCoordinator === undefined) {
    return <AgendaCoordinatorSelection coordinators={coordinators} appointments={appointments} onSelect={setSelectedCoordinator} />
  }

  return (
    <div className="agenda-page">
      {role === 'JEFE_COORDINADORES' && <button type="button" className="agenda-page__back" onClick={() => setSelectedCoordinator(undefined)}>← Todas las agendas</button>}
      <AgendaBanner onRequests={() => onAction('La bandeja de solicitudes estará disponible próximamente.')} />
      <AgendaToolbar
        monday={monday}
        onToday={() => setMonday(mondayOf(new Date()))}
        onShiftWeek={(weeks) => setMonday((current) => shiftWeek(current, weeks))}
        onOtherView={(view) => onAction(`La vista de ${view} estará disponible próximamente.`)}
        onAdd={() => { setCreateMessage(''); setCreateOpen(true) }}
      />
      {createMessage && <p className="agenda-page__feedback" role="status">{createMessage}</p>}
      {loading && <p className="agenda-page__feedback" role="status">Cargando citas...</p>}
      {error && (
        <div className="agenda-page__feedback" role="alert">
          <span>{error}</span>
          <button type="button" onClick={handleRetry}>Reintentar</button>
        </div>
      )}
      {!loading && !error && (
        <>
          <div className="agenda-page__filters" role="group" aria-label="Filtrar citas por estado">
            {filters.map((option) => (
              <button
                key={option.key}
                type="button"
                className={filter === option.key ? 'agenda-page__filter agenda-page__filter--active' : 'agenda-page__filter'}
                aria-pressed={filter === option.key}
                onClick={() => setFilter(option.key)}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
          {visibleAppointments.length === 0 && (
            <p className="agenda-page__feedback" role="status">No hay citas {filter === 'all' ? 'registradas' : filter === 'attended' ? 'atendidas' : 'pendientes'} en esta semana.</p>
          )}
          <WeekCalendar
            monday={monday}
            appointments={visibleAppointments}
            onAppointment={(appointment) => onAction(`Cita ${appointment.folio}${appointment.coordinadorNombre ? ` · ${appointment.coordinadorNombre}` : ''}: ${appointment.nombre} · ${appointment.tramite} · ${appointment.horaInicio.slice(0, 5)} · ${statusLabel(appointment.estado)}.`)}
          />
        </>
      )}
      {createOpen && (
        <CitaFormModal
          token={token}
          role={role}
          username={username}
          onClose={() => setCreateOpen(false)}
          onCreated={(cita) => {
            setCreateOpen(false)
            setCreateMessage(`La cita ${cita.folio} se creó correctamente.`)
            setMonday(mondayOf(new Date(`${cita.fecha}T12:00:00`)))
            setFilter('all')
            setLoading(true)
            setAttempt((current) => current + 1)
          }}
        />
      )}
    </div>
  )
}

export default AgendaPage
