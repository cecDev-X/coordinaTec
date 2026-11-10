import DashboardIcon from './DashboardIcon.jsx'
import '../css/career-selection.css'

function CareerSelection({ title, description, total, countLabel, careers, onSelect }) {
  return (
    <section className="career-selection" aria-labelledby="career-selection-title">
      <header className="career-selection__header">
        <span className="career-selection__eyebrow">VISTA POR CARRERA</span>
        <h1 id="career-selection-title">{title}</h1>
        <p>{description}</p>
      </header>
      <div className="career-selection__grid">
        <button type="button" className="career-selection__card career-selection__card--all" onClick={() => onSelect(null)}>
          <span className="career-selection__icon"><DashboardIcon name="school" size={19} /></span>
          <span className="career-selection__copy"><strong>Todas las carreras</strong><small>Ver el total de registros disponibles</small></span>
          <span className="career-selection__count"><strong>{total}</strong><small>{countLabel}</small></span>
          <DashboardIcon name="chevron" size={16} className="career-selection__chevron" />
        </button>
        {careers.map(({ nombre, total: count }) => (
          <button type="button" className="career-selection__card" key={nombre} onClick={() => onSelect(nombre)}>
            <span className="career-selection__icon"><DashboardIcon name="layers" size={18} /></span>
            <span className="career-selection__copy"><strong>{nombre}</strong><small>Consultar {countLabel}</small></span>
            <span className="career-selection__count"><strong>{count}</strong><small>{countLabel}</small></span>
            <DashboardIcon name="chevron" size={16} className="career-selection__chevron" />
          </button>
        ))}
      </div>
      {!careers.length && <p className="career-selection__empty">No hay carreras asignadas para mostrar.</p>}
    </section>
  )
}

export default CareerSelection
