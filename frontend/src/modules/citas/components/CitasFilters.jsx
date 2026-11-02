import { useState } from 'react'
import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import '../css/citas-filters.css'

function CitasFilters({ filters, onChange, tramiteOptions, estatusOptions }) {
  const [showMore, setShowMore] = useState(false)

  return (
    <section className="citas-filters" aria-label="Filtros de citas">
      <div className="citas-filters__row">
        <label className="citas-filters__search">
          <DashboardIcon name="search" size={14} />
          <span className="sr-only">Buscar por folio, número de control o nombre</span>
          <input
            type="search"
            value={filters.search}
            placeholder="Buscar por folio, control o nombre..."
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
            {estatusOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <DashboardIcon name="down" size={12} />
        </label>
        <label className="citas-filters__select">
          <span>Prioridad:</span>
          <select disabled title="La prioridad aún no está disponible en la base de datos">
            <option>Sin datos</option>
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
          <select disabled title="El semestre aún no está disponible en la base de datos">
            <option>Sin datos</option>
          </select>
        </label>
      )}
    </section>
  )
}

export default CitasFilters
