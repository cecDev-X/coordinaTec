import { useEffect, useState } from 'react'
import AgendaBanner from '../components/AgendaBanner.jsx'
import CitaFormModal from '../components/CitaFormModal.jsx'
import AgendaToolbar from '../components/AgendaToolbar.jsx'
import WeekCalendar from '../components/WeekCalendar.jsx'
import AgendaCoordinatorSelection from '../components/AgendaCoordinatorSelection.jsx'
import AvailabilityEditor from '../components/AvailabilityEditor.jsx'
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
  const [availabilityBlocks, setAvailabilityBlocks] = useState([])

  useEffect(() => {
    const controller = new AbortController()

    const headers = { Authorization: `Bearer ${token}` }
    const loadAppointments = role === 'JEFE_COORDINADORES'
      ? Promise.all([
        fetch('/api/v1/jefe-coordinadores/agenda', { signal: controller.signal, headers }),
        fetch('/api/v1/catalogos/citas', { signal: controller.signal, headers }),
      ]).then(async ([ownAgendaResponse, catalogResponse]) => {
        if (!ownAgendaResponse.ok || !catalogResponse.ok) throw new Error('No se pudieron cargar las agendas de coordinación.')
        const [ownAgenda, catalog] = await Promise.all([ownAgendaResponse.json(), catalogResponse.json()])
        if (!Array.isArray(catalog.coordinadores)) throw new Error('Respuesta inesperada')
        const allCoordinators = [
          { rfc: ownAgenda.rfc, nombre: ownAgenda.nombre, esJefatura: true },
          ...catalog.coordinadores.filter((coordinator) => coordinator.rfc !== ownAgenda.rfc),
        ]
        setCoordinators(allCoordinators)
        const results = await Promise.all(allCoordinators.map(async (coordinator) => {
          const appointmentsResponse = await fetch(`/api/v1/citas/coordinador/${encodeURIComponent(coordinator.rfc)}`, { signal: controller.signal, headers })
          if (!appointmentsResponse.ok) throw new Error(`No se pudo cargar la agenda de ${coordinator.nombre}.`)
          const coordinatorAppointments = await appointmentsResponse.json()
          if (!Array.isArray(coordinatorAppointments)) throw new Error('Respuesta inesperada')
          return coordinatorAppointments.map((appointment) => ({ ...appointment, coordinadorRfc: coordinator.rfc, coordinadorNombre: coordinator.nombre, esJefatura: coordinator.esJefatura || false }))
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
  const scheduleRfc = role === 'JEFE_COORDINADORES' ? selectedCoordinator : username

  useEffect(() => {
    if (!scheduleRfc) return undefined
    const controller = new AbortController()
    fetch(`/api/v1/coordinadores/${encodeURIComponent(scheduleRfc)}/horarios`, {
      headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error('No se pudieron cargar los bloques disponibles.')
      const data = await response.json()
      if (!Array.isArray(data)) throw new Error('Respuesta de horarios inesperada')
      setAvailabilityBlocks(data.map((block) => ({
        ...block,
        diaSemana: Number(block.diaSemana),
        horaInicio: block.horaInicio.slice(0, 5),
        horaSalida: block.horaSalida.slice(0, 5),
      })))
    }).catch(() => {
      if (!controller.signal.aborted) setAvailabilityBlocks([])
    })
    return () => controller.abort()
  }, [scheduleRfc, token])

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
      {role === 'JEFE_COORDINADORES' && <button type="button" className="agenda-page__back" onClick={() => setSelectedCoordinator(undefined)}>← Cambiar agenda</button>}
      <AgendaBanner onRequests={() => onAction('La bandeja de solicitudes estará disponible próximamente.')} />
      {scheduleRfc && <AvailabilityEditor token={token} coordinatorRfc={scheduleRfc} onSaved={setAvailabilityBlocks} />}
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
            availability={availabilityBlocks}
            onAppointment={(appointment) => onAction(`Cita ${appointment.folio}${appointment.coordinadorNombre ? ` · ${appointment.coordinadorNombre}` : ''}: ${appointment.nombre} · ${appointment.tramite} · ${appointment.horaInicio.slice(0, 5)} · ${statusLabel(appointment.estado)}.`)}
          />
        </>
      )}
      {createOpen && (
        <CitaFormModal
          token={token}
          role={role}
          username={username}
          defaultCoordinatorRfc={role === 'JEFE_COORDINADORES' ? selectedCoordinator : undefined}
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
