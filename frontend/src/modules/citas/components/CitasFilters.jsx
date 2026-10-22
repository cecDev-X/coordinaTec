import { useState } from 'react'
import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import '../css/citas-filters.css'

const tramiteOptions = ['Todos', 'Carga Superior a la Máxima.', 'Baja de Materia.', 'Cambio de Carrera.', 'Otro']

function CitasFilters({ filters, onChange }) {
  const [showMore, setShowMore] = useState(false)

  return (
    <section className="citas-filters" aria-label="Filtros de citas">
      <div className="citas-filters__row">
        <label className="citas-filters__search">
          <DashboardIcon name="search" size={14} />
          <span className="sr-only">Buscar por número de control o nombre</span>
          <input
            type="search"
            value={filters.search}
            placeholder="Buscar por No. Control..."
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
          />
        </label>
        <label className="citas-filters__select">
          <span>Trámite:</span>
          <select value={filters.tramite} onChange={(event) => onChange({ ...filters, tramite: event.target.value })}>
            {tramiteOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <DashboardIcon name="down" size={12} />
        </label>
        <label className="citas-filters__select">
          <span>Estatus:</span>
          <select value={filters.estatus} onChange={(event) => onChange({ ...filters, estatus: event.target.value })}>
            {['Todos', 'Rechazada', 'Pendiente', 'Atendida', 'Reagendada'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <DashboardIcon name="down" size={12} />
        </label>
        <label className="citas-filters__select">
          <span>Prioridad:</span>
          <select value={filters.prioridad} onChange={(event) => onChange({ ...filters, prioridad: event.target.value })}>
            {['Todos', 'Alta', 'Media', 'Baja'].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <DashboardIcon name="down" size={12} />
        </label>
      </div>
      <button
        type="button"
        className="citas-filters__more"
        aria-expanded={showMore}
        onClick={() => setShowMore((visible) => !visible)}
      >
        {showMore ? 'Ver menos filtros' : 'Ver más filtros'} <DashboardIcon name="down" size={11} />
      </button>
      {showMore && (
        <label className="citas-filters__semester">
          Semestre
          <select value={filters.semestre} onChange={(event) => onChange({ ...filters, semestre: event.target.value })}>
            {['Todos', '3°', '5°', '7°'].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      )}
    </section>
  )
}

export default CitasFilters
