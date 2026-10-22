import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import { weekLabel } from '../data/agendaData.js'
import '../css/agenda-toolbar.css'

function AgendaToolbar({ monday, onToday, onShiftWeek, onOtherView, onAdd }) {
  return (
    <div className="agenda-toolbar" aria-label="Controles de agenda">
      <div className="agenda-toolbar__navigation">
        <button type="button" className="agenda-toolbar__today" onClick={onToday}>Hoy</button>
        <div className="agenda-toolbar__arrows">
          <button type="button" aria-label="Semana anterior" onClick={() => onShiftWeek(-1)}>
            <DashboardIcon name="left" size={15} />
          </button>
          <button type="button" aria-label="Semana siguiente" onClick={() => onShiftWeek(1)}>
            <DashboardIcon name="chevron" size={15} />
          </button>
        </div>
        <strong className="agenda-toolbar__date" aria-live="polite">{weekLabel(monday)}</strong>
      </div>
      <div className="agenda-toolbar__views">
        <div className="agenda-toolbar__switch" role="group" aria-label="Vista de calendario">
          <button type="button" onClick={() => onOtherView('día')}>Día</button>
          <button type="button" className="agenda-toolbar__view--active" aria-pressed="true">Semana</button>
          <button type="button" onClick={() => onOtherView('mes')}>Mes</button>
        </div>
        <button type="button" className="agenda-toolbar__add" onClick={onAdd}>
          <DashboardIcon name="plus" size={15} /> Agregar cita
        </button>
      </div>
    </div>
  )
}

export default AgendaToolbar
