import DashboardIcon from './DashboardIcon.jsx'
import { formatAppointmentDate, formatStatus, getUpcomingAppointments } from '../data/dashboardData.js'
import '../css/agenda-card.css'

function AgendaCard({ appointments, onCalendar }) {
  const upcomingAppointments = getUpcomingAppointments(appointments)
  const todayLabel = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())

  return (
    <section className="agenda-card" aria-labelledby="agenda-title">
      <header className="dashboard-card-header">
        <div>
          <h2 id="agenda-title">Próximas citas</h2>
          <p>{todayLabel}</p>
        </div>
        <button type="button" className="dashboard-card-header__link" onClick={onCalendar}>
          Ver calendario completo <DashboardIcon name="arrow" size={14} />
        </button>
      </header>

      <div className="agenda-card__list">
        {upcomingAppointments.length > 0 ? upcomingAppointments.map((appointment) => (
          <article key={appointment.folio} className="appointment">
            <div className="appointment__time appointment__time--plain">
              <strong>{appointment.horaInicio.slice(0, 5)}</strong>
              <small>{formatAppointmentDate(appointment.fecha)}</small>
            </div>
            <div className="appointment__person">
              <h3>{appointment.nombre}</h3>
              <p>{appointment.tramite} · Matrícula {appointment.numControl}</p>
            </div>
            <span className="appointment__status appointment__status--blue">{formatStatus(appointment.estado)}</span>
            <DashboardIcon name="chevron" size={15} className="appointment__chevron" />
          </article>
        )) : (
          <p className="agenda-card__empty">No hay próximas citas pendientes.</p>
        )}
      </div>
    </section>
  )
}

export default AgendaCard
