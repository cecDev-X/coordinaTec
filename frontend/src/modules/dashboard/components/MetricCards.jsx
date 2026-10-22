import DashboardIcon from './DashboardIcon.jsx'
import { metrics } from '../data/dashboardData.js'
import '../css/metric-cards.css'

function MetricCards() {
  return (
    <section className="metric-cards" aria-label="Resumen de coordinación">
      {metrics.map((metric) => (
        <article key={metric.label} className={`metric-card metric-card--${metric.tone}`}>
          <div className="metric-card__top">
            <div>
              <h2>{metric.label}</h2>
              <strong className="metric-card__value">{metric.value}</strong>
            </div>
            <span className="metric-card__icon"><DashboardIcon name={metric.icon} size={19} /></span>
          </div>
          <p className="metric-card__detail"><DashboardIcon name={metric.detailIcon} size={13} />{metric.detail}</p>
        </article>
      ))}
    </section>
  )
}

export default MetricCards
