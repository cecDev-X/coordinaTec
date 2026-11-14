import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import '../css/agenda-coordinator-selection.css'

function AgendaCoordinatorSelection({ coordinators, appointments, onSelect }) {
  return (
    <section className="agenda-coordinator-selection">
      <header><span>VISTA DE COORDINACIÓN</span><h1>Agenda y horarios</h1><p>Selecciona la agenda de jefatura o consulta por separado la de cada coordinador.</p></header>
      <div className="agenda-coordinator-selection__grid">
        {coordinators.map((coordinator) => {
          const count = appointments.filter((appointment) => appointment.coordinadorRfc === coordinator.rfc).length
          return (
            <button type="button" className="agenda-coordinator-selection__card" key={coordinator.rfc} onClick={() => onSelect(coordinator.rfc)}>
              <span className={`agenda-coordinator-selection__icon${coordinator.esJefatura ? ' agenda-coordinator-selection__icon--chief' : ''}`}><DashboardIcon name={coordinator.esJefatura ? 'calendar' : 'users'} size={18} /></span>
              <span className="agenda-coordinator-selection__copy"><strong>{coordinator.nombre}</strong><small>{coordinator.esJefatura ? 'Agenda personal de jefatura' : coordinator.rfc}</small></span>
              <span className="agenda-coordinator-selection__count"><strong>{count}</strong><small>citas</small></span>
              <DashboardIcon name="chevron" size={16} />
            </button>
          )
        })}
      </div>
      {coordinators.length === 0 && <p className="agenda-coordinator-selection__empty">No hay coordinadores registrados para mostrar.</p>}
    </section>
  )
}

export default AgendaCoordinatorSelection
