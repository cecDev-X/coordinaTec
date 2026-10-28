import { useState } from 'react'
import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import TramitesFilters from '../components/TramitesFilters.jsx'
import TramitesTable from '../components/TramitesTable.jsx'
import { tramites } from '../data/tramitesData.js'
import '../css/tramites-page.css'

function TramitesPage({ onAction }) {
  const [filters, setFilters] = useState({ search: '', status: 'Todos', priority: 'Todos', period: 'Todos' })
  const search = filters.search.trim().toLocaleLowerCase('es')
  const filtered = tramites.filter((tramite) => (
    (!search || `${tramite.id} ${tramite.nombre} ${tramite.requisitos}`.toLocaleLowerCase('es').includes(search)) &&
    (filters.status === 'Todos' || tramite.estatus === filters.status) &&
    (filters.priority === 'Todos' || tramite.prioridad === filters.priority) &&
    (filters.period === 'Todos' || String(tramite.periodo) === filters.period)
  ))

  return (
    <div className="tramites-page">
      <header className="tramites-page__header">
        <span className="tramites-page__icon"><DashboardIcon name="folder" size={20} /></span>
        <div>
          <h1>Configuración de Trámites</h1>
          <p>Administra los tipos de trámites, requisitos, periodo y prioridad por defecto.</p>
        </div>
      </header>
      <TramitesFilters
        filters={filters}
        onChange={setFilters}
        onAdd={() => onAction('La creación de trámites estará disponible próximamente.')}
      />
      <TramitesTable rows={filtered} total={tramites.length} onAction={onAction} />
    </div>
  )
}

export default TramitesPage
