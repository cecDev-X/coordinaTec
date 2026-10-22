import { useState } from 'react'
import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import CitasFilters from '../components/CitasFilters.jsx'
import CitasTable from '../components/CitasTable.jsx'
import { citas } from '../data/citasData.js'
import '../css/citas-page.css'

const pageSize = 4

function CitasPage({ onAction }) {
  const [filters, setFilters] = useState({ search: '', tramite: 'Todos', estatus: 'Todos', prioridad: 'Todos', semestre: 'Todos' })
  const [page, setPage] = useState(1)
  const search = filters.search.trim().toLocaleLowerCase('es')
  const filtered = citas.filter((cita) => (
    (!search || `${cita.control} ${cita.nombre}`.toLocaleLowerCase('es').includes(search)) &&
    (filters.tramite === 'Todos' || cita.tramite === filters.tramite) &&
    (filters.estatus === 'Todos' || cita.estatus === filters.estatus) &&
    (filters.prioridad === 'Todos' || cita.prioridad === filters.prioridad) &&
    (filters.semestre === 'Todos' || cita.semestre === filters.semestre)
  ))

  function handleFilterChange(nextFilters) {
    setFilters(nextFilters)
    setPage(1)
  }

  return (
    <div className="citas-page">
      <header className="citas-page__header">
        <span className="citas-page__icon"><DashboardIcon name="edit" size={18} /></span>
        <div>
          <h1>Lista de Citas Actuales</h1>
          <p>Visualización y gestión de tus citas actuales.</p>
        </div>
      </header>
      <CitasFilters filters={filters} onChange={handleFilterChange} />
      <CitasTable
        rows={filtered.slice((page - 1) * pageSize, page * pageSize)}
        total={filtered.length}
        page={page}
        pageCount={Math.max(1, Math.ceil(filtered.length / pageSize))}
        onPageChange={setPage}
        onAction={onAction}
      />
    </div>
  )
}

export default CitasPage
