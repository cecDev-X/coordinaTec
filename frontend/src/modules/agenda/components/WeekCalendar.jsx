import { dateKey, hoursFor, isPending, statusLabel, weekdays } from '../data/agendaData.js'
import '../css/week-calendar.css'

function WeekCalendar({ monday, appointments, onAppointment }) {
  const days = weekdays.map((label, index) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index)
    return { label, day: date.getDate(), key: dateKey(date) }
  })
  const hours = hoursFor(appointments)
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
    <section className="week-calendar" aria-label="Citas de la semana">
      <p className="week-calendar__hint">Desliza para ver todos los días →</p>
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
                  const group = byDayAndHour.get(`${day.key}-${hour}`) || []
                  return (
                    <td key={day.key}>
                      <div className="week-calendar__appointments">
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
