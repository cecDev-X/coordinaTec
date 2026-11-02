import { useEffect, useState } from 'react'
import AgendaBanner from '../components/AgendaBanner.jsx'
import CitaFormModal from '../components/CitaFormModal.jsx'
import AgendaToolbar from '../components/AgendaToolbar.jsx'
import WeekCalendar from '../components/WeekCalendar.jsx'
import { appointmentsForWeek, isPending, mondayOf, shiftWeek, statusLabel } from '../data/agendaData.js'
import '../css/agenda-page.css'

function AgendaPage({ onAction }) {
  const [monday, setMonday] = useState(() => mondayOf(new Date()))
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [createMessage, setCreateMessage] = useState('')

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
        if (!controller.signal.aborted) setError('No se pudieron cargar las citas. Intenta de nuevo.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt])

  const weekAppointments = appointmentsForWeek(appointments, monday)
  const visibleAppointments = appointmentsForWeek(appointments, monday, filter)
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

  return (
    <div className="agenda-page">
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
            onAppointment={(appointment) => onAction(`Cita ${appointment.folio}: ${appointment.nombre} · ${appointment.tramite} · ${appointment.horaInicio.slice(0, 5)} · ${statusLabel(appointment.estado)}.`)}
          />
        </>
      )}
      {createOpen && (
        <CitaFormModal
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
