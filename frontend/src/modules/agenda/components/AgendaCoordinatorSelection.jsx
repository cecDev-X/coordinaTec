import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import '../css/agenda-coordinator-selection.css'

function AgendaCoordinatorSelection({ coordinators, appointments, onSelect }) {
  return (
    <section className="agenda-coordinator-selection">
      <header><span>VISTA DE COORDINACIÓN</span><h1>Agenda y horarios</h1><p>Consulta la agenda de cada coordinador o revisa todas las agendas en conjunto.</p></header>
      <div className="agenda-coordinator-selection__grid">
        <button type="button" className="agenda-coordinator-selection__card agenda-coordinator-selection__card--all" onClick={() => onSelect(null)}>
          <span className="agenda-coordinator-selection__icon"><DashboardIcon name="calendar" size={19} /></span>
          <span className="agenda-coordinator-selection__copy"><strong>Todas las agendas</strong><small>Vista institucional conjunta</small></span>
          <span className="agenda-coordinator-selection__count"><strong>{appointments.length}</strong><small>citas</small></span>
          <DashboardIcon name="chevron" size={16} />
        </button>
        {coordinators.map((coordinator) => {
          const count = appointments.filter((appointment) => appointment.coordinadorRfc === coordinator.rfc).length
          return (
            <button type="button" className="agenda-coordinator-selection__card" key={coordinator.rfc} onClick={() => onSelect(coordinator.rfc)}>
              <span className="agenda-coordinator-selection__icon"><DashboardIcon name="users" size={18} /></span>
              <span className="agenda-coordinator-selection__copy"><strong>{coordinator.nombre}</strong><small>{coordinator.rfc}</small></span>
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
