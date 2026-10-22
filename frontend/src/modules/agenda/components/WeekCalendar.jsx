import { appointments, hours, SAMPLE_WEEK_START, weekdays } from '../data/agendaData.js'
import '../css/week-calendar.css'

function WeekCalendar({ monday, onAppointment }) {
  const isSampleWeek = monday.getTime() === SAMPLE_WEEK_START.getTime()

  return (
    <section className="week-calendar" aria-label="Citas de la semana">
      <p className="week-calendar__hint">Desliza para ver todos los días →</p>
      <div className="week-calendar__scroll">
        <table>
          <colgroup>
            <col className="week-calendar__time-col" />
            {weekdays.map((day) => <col key={day} />)}
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Horas</th>
              {weekdays.map((day, index) => (
                <th scope="col" key={day}>
                  {day} {new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index).getDate()}
                </th>
              ))}
              <th scope="col">Citas</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, hourIndex) => (
              <tr key={hour}>
                <th scope="row">{hour}</th>
                {weekdays.map((day, dayIndex) => {
                  const appointment = isSampleWeek && appointments.find((item) => item.day === dayIndex && item.hour === hourIndex)
                  return (
                    <td key={day}>
                      {appointment && (
                        <button type="button" className="week-calendar__appointment" onClick={() => onAppointment(appointment)}>
                          <strong>{appointment.title}</strong>
                          <span>{appointment.student}</span>
                          <small>{appointment.registration}</small>
                        </button>
                      )}
                    </td>
                  )
                })}
                <td>
                  {hourIndex === 0 && isSampleWeek && (
                    <div className="week-calendar__pending"><strong>● Pendientes</strong><span>12 solicitudes<br />por revisar</span></div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default WeekCalendar
