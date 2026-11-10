import DashboardIcon from './DashboardIcon.jsx'
import { countAppointmentsAttendedToday, countPendingAppointments, metrics } from '../data/dashboardData.js'
import '../css/metric-cards.css'

function MetricCards({ appointments, students = [], studentsLoading = false, studentsError = '', onViewStudents }) {
  return (
    <section className="metric-cards" aria-label="Resumen de coordinación">
      {metrics.map((metric) => {
        const available = metric.id === 'pending' || metric.id === 'attended-today' || metric.id === 'students'
        const metricValue = metric.id === 'pending'
          ? countPendingAppointments(appointments)
          : metric.id === 'attended-today'
            ? countAppointmentsAttendedToday(appointments)
            : metric.id === 'students' ? students.length : null
        const value = metric.id === 'students'
          ? studentsError ? 'No disponible' : studentsLoading ? 'Cargando…' : metricValue.toLocaleString('es-MX')
          : available ? metricValue.toLocaleString('es-MX') : 'Dato no disponible'
        const detail = metric.id === 'students'
          ? studentsError ? 'No se pudieron cargar los alumnos' : 'Ver directorio completo'
          : metric.detail
        const Card = metric.id === 'students' ? 'button' : 'article'

        return (
          <Card key={metric.id} {...(metric.id === 'students' ? { type: 'button', onClick: onViewStudents, 'aria-label': `${metric.label}: ${value}. ${detail}` } : {})} className={`metric-card metric-card--${metric.tone}${!available ? ' metric-card--unavailable' : ''}${metric.id === 'students' ? ' metric-card--interactive' : ''}`}>
            <div className="metric-card__top">
              <div>
                <h2>{metric.label}</h2>
                <strong className="metric-card__value">{value}</strong>
              </div>
              <span className="metric-card__icon"><DashboardIcon name={metric.icon} size={19} /></span>
            </div>
            <p className="metric-card__detail">
              {available && <DashboardIcon name={metric.detailIcon} size={13} />}
              {detail}
            </p>
          </Card>
        )
      })}
    </section>
  )
}

export default MetricCards
