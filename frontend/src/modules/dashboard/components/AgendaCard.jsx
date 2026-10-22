import { useState } from 'react'
import DashboardIcon from './DashboardIcon.jsx'
import { appointments } from '../data/dashboardData.js'
import '../css/agenda-card.css'

function AgendaCard({ onCalendar, onAction }) {
  const [appointmentState, setAppointmentState] = useState('waiting')

  function handleAttend() {
    if (appointmentState === 'waiting') {
      setAppointmentState('attending')
      onAction('Cita de Carlos iniciada en esta demostración.')
    } else {
      setAppointmentState('done')
      onAction('Cita de Carlos finalizada en esta demostración.')
    }
  }

  return (
    <section className="agenda-card" aria-labelledby="agenda-title">
      <header className="dashboard-card-header">
        <div>
          <h2 id="agenda-title">Agenda de Citas de Hoy</h2>
          <p>Jueves, 15 de Octubre 2026 · Modalidad Presencial</p>
        </div>
        <button type="button" className="dashboard-card-header__link" onClick={onCalendar}>
          Ver calendario completo <DashboardIcon name="arrow" size={14} />
        </button>
      </header>

      <div className="agenda-card__list">
        {appointments.map((appointment) => {
          const isCarlos = appointment.id === 'carlos'
          const currentStatus = isCarlos && appointmentState !== 'waiting'
            ? appointmentState === 'attending' ? 'En atención' : 'Atendida'
            : appointment.status
          const tone = isCarlos && appointmentState === 'done' ? 'green' : appointment.tone

          return (
            <article key={appointment.id} className={`appointment${isCarlos && appointmentState === 'waiting' ? ' appointment--waiting' : ''}`}>
              <div className={`appointment__time appointment__time--${isCarlos ? 'amber' : 'plain'}`}>
                <strong>{appointment.time}</strong><small>AM</small>
              </div>
              <div className="appointment__person">
                <h3>{appointment.name}{isCarlos && <span className="appointment__online" aria-label="En espera" />}</h3>
                <p>{appointment.description}</p>
              </div>
              <span className={`appointment__status appointment__status--${tone}`}>
                {appointment.id === 'monica' && <DashboardIcon name="check" size={12} />}
                {currentStatus}
              </span>
              {isCarlos && appointmentState !== 'done' ? (
                <button type="button" className="appointment__attend" onClick={handleAttend}>
                  {appointmentState === 'attending' ? 'Finalizar cita' : 'Atender Cita'}
                </button>
              ) : (
                <DashboardIcon name="chevron" size={15} className="appointment__chevron" />
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default AgendaCard
