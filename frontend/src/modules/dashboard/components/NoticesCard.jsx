import DashboardIcon from './DashboardIcon.jsx'
import { announcements } from '../data/dashboardData.js'
import '../css/notices-card.css'

function NoticesCard({ onRequests }) {
  return (
    <section className="notices-card" aria-labelledby="notices-title">
      <header className="dashboard-card-header">
        <div>
          <h2 id="notices-title">Avisos de Coordinación</h2>
          <p>Notificaciones institucionales y recordatorios</p>
        </div>
      </header>

      <div className="notices-card__list">
        {announcements.map((announcement) => (
          <article key={announcement.id} className="notice">
            <div className="notice__heading">
              <h3 className={`notice__title notice__title--${announcement.tone}`}>
                <DashboardIcon name={announcement.icon} size={14} />{announcement.title}
              </h3>
              <span>{announcement.date}</span>
            </div>
            <p>{announcement.content}</p>
          </article>
        ))}
      </div>

      <button type="button" className="notices-card__requests" onClick={onRequests}>
        <DashboardIcon name="archive" size={14} /> Ir a Bandeja de Solicitudes (12)
      </button>
    </section>
  )
}

export default NoticesCard
