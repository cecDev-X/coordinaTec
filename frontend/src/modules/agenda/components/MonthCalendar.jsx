import { dateKey, isPending } from '../data/agendaData.js'
import '../css/month-calendar.css'

function MonthCalendar({ date, appointments, onAppointment }) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - ((first.getDay() + 6) % 7))
  const days = Array.from({ length: 42 }, (_, index) => {
    const current = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
    return { date: current, key: dateKey(current), inMonth: current.getMonth() === date.getMonth() }
  })
  const grouped = new Map()
  appointments.forEach((appointment) => {
    if (!grouped.has(appointment.fecha)) grouped.set(appointment.fecha, [])
    grouped.get(appointment.fecha).push(appointment)
  })

  return <section className="month-calendar" aria-label="Citas del mes">
    <div className="month-calendar__weekdays">{['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => <span key={day}>{day}</span>)}</div>
    <div className="month-calendar__grid">
      {days.map(({ date: day, key, inMonth }) => {
        const items = grouped.get(key) || []
        return <div key={key} className={`month-calendar__cell${inMonth ? '' : ' is-outside'}`}>
          <time dateTime={key}>{day.getDate()}</time>
          <div className="month-calendar__events">
            {items.slice(0, 3).map((appointment) => <button key={appointment.folio} type="button" className={`month-calendar__event${isPending(appointment.estado) ? ' is-pending' : ''}`} onClick={() => onAppointment(appointment)} title={`${appointment.horaInicio.slice(0, 5)} ${appointment.tramite} · ${appointment.nombre}`}>
              <span>{appointment.horaInicio.slice(0, 5)} · {appointment.tramite}</span>
            </button>)}
            {items.length > 3 && <span className="month-calendar__more">+{items.length - 3} más</span>}
          </div>
          {items.length > 0 && <span className="sr-only">{items.length} citas</span>}
        </div>
      })}
    </div>
  </section>
}

export default MonthCalendar
