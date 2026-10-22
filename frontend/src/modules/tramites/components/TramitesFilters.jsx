import { useState } from 'react'
import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import '../css/tramites-filters.css'

function TramitesFilters({ filters, onChange, onAdd }) {
  const [showMore, setShowMore] = useState(false)

  return (
    <section className="tramites-filters" aria-label="Filtros de trámites">
      <div className="tramites-filters__row">
        <label className="tramites-filters__search">
          <DashboardIcon name="search" size={14} />
          <span className="sr-only">Buscar trámite</span>
          <input
            type="search"
            value={filters.search}
            placeholder="Buscar trámite..."
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
          />
        </label>
        <label className="tramites-filters__select">
          <span>Estatus:</span>
          <select value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value })}>
            <option value="Todos">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Desactivado">Desactivado</option>
          </select>
          <DashboardIcon name="down" size={12} />
        </label>
        <label className="tramites-filters__select">
          <span>Prioridad:</span>
          <select value={filters.priority} onChange={(event) => onChange({ ...filters, priority: event.target.value })}>
            <option value="Todos">Todos</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
          <DashboardIcon name="down" size={12} />
        </label>
        <button type="button" className="tramites-filters__add" onClick={onAdd}>
          <DashboardIcon name="plus" size={15} /> Agregar nuevo trámite
        </button>
      </div>
      <button
        type="button"
        className="tramites-filters__more"
        aria-expanded={showMore}
        onClick={() => setShowMore((visible) => !visible)}
      >
        {showMore ? 'Ver menos filtros' : 'Ver más filtros'} <DashboardIcon name="down" size={11} />
      </button>
      {showMore && (
        <label className="tramites-filters__period">
          Periodo (días)
          <select value={filters.period} onChange={(event) => onChange({ ...filters, period: event.target.value })}>
            <option value="Todos">Todos</option>
            <option value="1">1 día</option>
            <option value="2">2 días</option>
            <option value="5">5 días</option>
          </select>
        </label>
      )}
    </section>
  )
}

export default TramitesFilters
