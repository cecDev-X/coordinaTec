import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import '../css/agenda-banner.css'

function AgendaBanner({ onRequests }) {
  return (
    <section className="agenda-banner" aria-labelledby="agenda-page-title">
      <div className="agenda-banner__copy">
        <p className="agenda-banner__eyebrow"><strong>TECNOLÓGICO NACIONAL DE MÉXICO</strong><span>·</span> Oaxaca · Depto. Sistemas y Computación</p>
        <div className="agenda-banner__heading">
          <span className="agenda-banner__icon"><DashboardIcon name="calendar" size={20} /></span>
          <div>
            <h1 id="agenda-page-title">Agenda y Horario</h1>
            <p>Organiza, visualiza y gestiona las citas y horarios de atención.</p>
          </div>
        </div>
      </div>
      <button type="button" className="agenda-banner__requests" onClick={onRequests}>
        <DashboardIcon name="document" size={13} /> Revisar Solicitudes (12)
      </button>
    </section>
  )
}

export default AgendaBanner
