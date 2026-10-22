import DashboardIcon from './DashboardIcon.jsx'
import '../css/welcome-banner.css'

function WelcomeBanner({ onRequests }) {
  return (
    <section className="welcome-banner" aria-labelledby="welcome-title">
      <div className="welcome-banner__copy">
        <p className="welcome-banner__eyebrow">TECNOLÓGICO NACIONAL DE MÉXICO&nbsp; · &nbsp;OAXACA&nbsp; · &nbsp;DEPTO. SISTEMAS Y COMPUTACIÓN</p>
        <h1 id="welcome-title">Bienvenida, Coordinadora Académica ISC</h1>
        <p className="welcome-banner__description">Gestión de citas estudiantiles, análisis de dictámenes normativos y seguimiento de trayectoria curricular.</p>
      </div>
      <button type="button" className="welcome-banner__button" onClick={onRequests}>
        <DashboardIcon name="list" size={14} /> Revisar Solicitudes (12)
      </button>
    </section>
  )
}

export default WelcomeBanner
