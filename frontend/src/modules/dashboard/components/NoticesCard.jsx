import DashboardIcon from './DashboardIcon.jsx'
import '../css/notices-card.css'

function NoticesCard() {
  return (
    <section className="notices-card" aria-labelledby="notices-title">
      <header className="dashboard-card-header">
        <div>
          <h2 id="notices-title">Avisos de Coordinación</h2>
          <p>Notificaciones institucionales</p>
        </div>
      </header>

      <div className="notices-card__empty">
        <DashboardIcon name="document" size={20} />
        <p>Dato no disponible</p>
        <span>Los avisos aún no están conectados a una fuente de datos.</span>
      </div>

      <div className="notices-card__requests" aria-disabled="true">Bandeja de solicitudes no disponible</div>
    </section>
  )
}

export default NoticesCard
