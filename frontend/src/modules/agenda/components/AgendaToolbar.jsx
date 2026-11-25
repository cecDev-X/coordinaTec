import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import '../css/agenda-toolbar.css'

function AgendaToolbar({ label, view, onViewChange, onToday, onShift, onAdd }) {
  return (
    <div className="agenda-toolbar" aria-label="Controles de agenda">
      <div className="agenda-toolbar__navigation">
        <button type="button" className="agenda-toolbar__today" onClick={onToday}>Hoy</button>
        <div className="agenda-toolbar__arrows">
          <button type="button" aria-label="Periodo anterior" onClick={() => onShift(-1)}>
            <DashboardIcon name="left" size={15} />
          </button>
          <button type="button" aria-label="Periodo siguiente" onClick={() => onShift(1)}>
            <DashboardIcon name="chevron" size={15} />
          </button>
        </div>
        <strong className="agenda-toolbar__date" aria-live="polite">{label}</strong>
      </div>
      <div className="agenda-toolbar__views">
        <div className="agenda-toolbar__switch" role="group" aria-label="Vista de calendario">
          {['day', 'week', 'month'].map((option) => <button key={option} type="button" className={view === option ? 'agenda-toolbar__view--active' : ''} aria-pressed={view === option} onClick={() => onViewChange(option)}>{option === 'day' ? 'Día' : option === 'week' ? 'Semana' : 'Mes'}</button>)}
        </div>
        <button type="button" className="agenda-toolbar__add" onClick={onAdd}>
          <DashboardIcon name="plus" size={15} /> Agregar cita
        </button>
      </div>
    </div>
  )
}

export default AgendaToolbar
