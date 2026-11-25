import { dateKey, hoursFor, isPending, statusLabel, weekdays } from '../data/agendaData.js'
import '../css/week-calendar.css'

function WeekCalendar({ monday, appointments, availability = [], onAppointment, view = 'week' }) {
  const visibleDays = view === 'day' ? [weekdays[(monday.getDay() + 6) % 7]] : weekdays
  const days = visibleDays.map((label, index) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + (view === 'day' ? 0 : index))
    return { label, day: date.getDate(), key: dateKey(date) }
  })
  const hours = hoursFor(appointments, availability)
  const byDayAndHour = new Map()

  for (const appointment of appointments) {
    const hour = appointment.horaInicio.slice(0, 2)
    const key = `${appointment.fecha}-${hour}`
    if (!byDayAndHour.has(key)) byDayAndHour.set(key, [])
    byDayAndHour.get(key).push(appointment)
  }

  for (const group of byDayAndHour.values()) {
    group.sort((first, second) => first.horaInicio.localeCompare(second.horaInicio) || first.folio.localeCompare(second.folio))
  }

  return (
    <section className={`week-calendar${view === 'day' ? ' week-calendar--day' : ''}`} aria-label={view === 'day' ? 'Citas del día' : 'Citas de la semana'}>
      <div className="week-calendar__legend"><p className="week-calendar__hint">Desliza para ver todos los días →</p><span><i /> Horario habilitado</span></div>
      <div className="week-calendar__scroll">
        <table>
          <colgroup>
            <col className="week-calendar__time-col" />
            {days.map((day) => <col key={day.key} />)}
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Horas</th>
              {days.map((day) => (
                <th scope="col" key={day.key}>
                  {day.label} {day.day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <th scope="row">{hour}:00</th>
                {days.map((day) => {
                  const weekday = ((new Date(`${day.key}T12:00:00`).getDay() + 6) % 7) + 1
                  const hourStart = `${hour}:00`
                  const hourEnd = `${String(Number(hour) + 1).padStart(2, '0')}:00`
                  const activeBlocks = availability.filter((block) => block.diaSemana === weekday && block.horaInicio < hourEnd && block.horaSalida > hourStart)
                  const group = byDayAndHour.get(`${day.key}-${hour}`) || []
                  return (
                    <td key={day.key} className={activeBlocks.length ? 'week-calendar__cell--available' : undefined}>
                      <div className="week-calendar__appointments">
                        {activeBlocks.filter((block) => block.horaInicio.slice(0, 2) === hour).map((block) => (
                          <div className="week-calendar__availability" key={`${block.horaInicio}-${block.horaSalida}`}>
                            <strong>Atención {block.horaInicio.slice(0, 5)}–{block.horaSalida.slice(0, 5)}</strong>
                            {block.tramites?.length > 0 && <small>{block.tramites.join(' · ')}</small>}
                          </div>
                        ))}
                        {group.map((appointment) => {
                          const tone = appointment.estado === 'ATENDIDA' ? 'attended' : isPending(appointment.estado) ? 'pending' : 'other'
                          return (
                            <button
                              key={appointment.folio}
                              type="button"
                              className={`week-calendar__appointment week-calendar__appointment--${tone}`}
                              onClick={() => onAppointment(appointment)}
                              aria-label={`${appointment.horaInicio.slice(0, 5)}: ${appointment.tramite}, ${appointment.nombre}, ${statusLabel(appointment.estado)}`}
                            >
                              <strong>{appointment.horaInicio.slice(0, 5)} · {appointment.tramite}</strong>
                              <span>{appointment.nombre}</span>
                              {appointment.coordinadorNombre && <small className="week-calendar__coordinator">{appointment.coordinadorNombre}</small>}
                              <small>{appointment.numControl}</small>
                              <span className="week-calendar__appointment-status">{statusLabel(appointment.estado)}</span>
                            </button>
                          )
                        })}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default WeekCalendar
