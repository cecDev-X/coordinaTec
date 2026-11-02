import DashboardIcon from './DashboardIcon.jsx'
import '../css/welcome-banner.css'

function WelcomeBanner({ onViewAppointments }) {
  return (
    <section className="welcome-banner" aria-labelledby="welcome-title">
      <div className="welcome-banner__copy">
        <p className="welcome-banner__eyebrow">TECNOLÓGICO NACIONAL DE MÉXICO&nbsp; · &nbsp;OAXACA&nbsp; · &nbsp;COORDINACIÓN ACADÉMICA</p>
        <h1 id="welcome-title">Panel de Coordinación Académica</h1>
        <p className="welcome-banner__description">Resumen de citas y actividad de coordinación.</p>
      </div>
      <button type="button" className="welcome-banner__button" onClick={onViewAppointments}>
        <DashboardIcon name="list" size={14} /> Ver citas
      </button>
    </section>
  )
}

export default WelcomeBanner
