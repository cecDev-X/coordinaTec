import DashboardIcon from './DashboardIcon.jsx'
import '../css/welcome-banner.css'

function WelcomeBanner({ onViewAppointments, role }) {
  const isChief = role === 'JEFE_COORDINADORES'
  return (
    <section className="welcome-banner" aria-labelledby="welcome-title">
      <div className="welcome-banner__copy">
        <p className="welcome-banner__eyebrow">TECNOLÓGICO NACIONAL DE MÉXICO&nbsp; · &nbsp;OAXACA&nbsp; · &nbsp;{isChief ? 'JEFATURA DE COORDINACIÓN' : 'COORDINACIÓN ACADÉMICA'}</p>
        <h1 id="welcome-title">{isChief ? 'Panel de Jefatura de Coordinación' : 'Panel de Coordinación Académica'}</h1>
        <p className="welcome-banner__description">{isChief ? 'Administra carreras, trámites y coordinadores; consulta la actividad institucional.' : 'Resumen de citas y actividad de las carreras a tu cargo.'}</p>
      </div>
      <button type="button" className="welcome-banner__button" onClick={onViewAppointments}>
        <DashboardIcon name="list" size={14} /> Ver citas
      </button>
    </section>
  )
}

export default WelcomeBanner
