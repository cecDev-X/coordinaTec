import DashboardIcon from './DashboardIcon.jsx'
import { countAppointmentsAttendedToday, countPendingAppointments, metrics } from '../data/dashboardData.js'
import '../css/metric-cards.css'

function MetricCards({ appointments }) {
  return (
    <section className="metric-cards" aria-label="Resumen de coordinación">
      {metrics.map((metric) => {
        const available = metric.id === 'pending' || metric.id === 'attended-today'
        const metricValue = metric.id === 'pending'
          ? countPendingAppointments(appointments)
          : metric.id === 'attended-today'
            ? countAppointmentsAttendedToday(appointments)
            : null
        const value = available ? metricValue.toLocaleString('es-MX') : 'Dato no disponible'

        return (
          <article key={metric.id} className={`metric-card metric-card--${metric.tone}${available ? '' : ' metric-card--unavailable'}`}>
            <div className="metric-card__top">
              <div>
                <h2>{metric.label}</h2>
                <strong className="metric-card__value">{value}</strong>
              </div>
              <span className="metric-card__icon"><DashboardIcon name={metric.icon} size={19} /></span>
            </div>
            <p className="metric-card__detail">
              {available && <DashboardIcon name={metric.detailIcon} size={13} />}
              {metric.detail}
            </p>
          </article>
        )
      })}
    </section>
  )
}

export default MetricCards
