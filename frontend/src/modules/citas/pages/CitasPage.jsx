import { useEffect, useState } from 'react'
import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import CitasFilters from '../components/CitasFilters.jsx'
import CitasTable from '../components/CitasTable.jsx'
import '../css/citas-page.css'

const pageSize = 4

function formatDate(value) {
  if (!value) return '—'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function formatStatus(value) {
  if (!value) return 'Sin estado'
  const text = value.toLocaleLowerCase('es')
  return text[0].toLocaleUpperCase('es') + text.slice(1)
}

function CitasPage() {
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [updatingFolio, setUpdatingFolio] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [filters, setFilters] = useState({ search: '', tramite: 'Todos', estatus: 'Todos' })
  const [page, setPage] = useState(1)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/v1/citas', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)
        const data = await response.json()
        if (!Array.isArray(data)) throw new Error('Respuesta inesperada')
        return data
      })
      .then(setCitas)
      .catch(() => {
        if (!controller.signal.aborted) setError('No se pudieron cargar las citas. Intenta de nuevo.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt])

  const rows = citas.map((cita) => ({
    folio: cita.folio,
    estado: cita.estado,
    control: cita.numControl,
    nombre: cita.nombre,
    semestre: '—',
    carrera: cita.carrera,
    tramite: cita.tramite,
    fecha: formatDate(cita.fecha),
    estatus: formatStatus(cita.estado),
  }))
  const tramiteOptions = ['Todos', ...new Set(rows.map((cita) => cita.tramite).filter(Boolean))]
  const estatusOptions = ['Todos', ...new Set(rows.map((cita) => cita.estatus))]
  const search = filters.search.trim().toLocaleLowerCase('es')
  const filtered = rows.filter((cita) => (
    (!search || `${cita.folio} ${cita.control} ${cita.nombre}`.toLocaleLowerCase('es').includes(search)) &&
    (filters.tramite === 'Todos' || cita.tramite === filters.tramite) &&
    (filters.estatus === 'Todos' || cita.estatus === filters.estatus)
  ))

  function handleFilterChange(nextFilters) {
    setFilters(nextFilters)
    setPage(1)
  }

  function handleRetry() {
    setLoading(true)
    setError('')
    setAttempt((current) => current + 1)
  }

  async function handleMarkAttended(folio) {
    setUpdatingFolio(folio)
    setActionError('')
    setActionMessage('')

    try {
      const response = await fetch(`/api/v1/citas/${encodeURIComponent(folio)}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'ATENDIDA' }),
      })

      if (response.status === 404) throw new Error('La cita ya no existe. Recarga la página para actualizar la lista.')
      if (response.status === 409) throw new Error('La cita ya no está programada. Recarga la página para ver su estado actual.')
      if (!response.ok) throw new Error('No se pudo actualizar la cita. Intenta de nuevo.')

      const result = await response.json()
      if (result.folio !== folio || result.estado !== 'ATENDIDA') throw new Error('El servidor devolvió una respuesta inesperada.')

      setCitas((current) => current.map((cita) => cita.folio === folio ? { ...cita, estado: result.estado } : cita))
      setFilters((current) => current.estatus === 'Programada' ? { ...current, estatus: 'Todos' } : current)
      setActionMessage(`La cita ${folio} fue marcada como atendida.`)
    } catch (cause) {
      setActionError(cause.message || 'No se pudo actualizar la cita. Intenta de nuevo.')
    } finally {
      setUpdatingFolio(null)
    }
  }

  return (
    <div className="citas-page">
      <header className="citas-page__header">
        <span className="citas-page__icon"><DashboardIcon name="edit" size={18} /></span>
        <div>
          <h1>Lista de Citas Actuales</h1>
          <p>Consulta de las citas registradas en coordinación.</p>
        </div>
      </header>
      {loading && <p className="citas-page__feedback" role="status">Cargando citas...</p>}
      {error && (
        <div className="citas-page__feedback" role="alert">
          <span>{error}</span>
          <button type="button" onClick={handleRetry}>Reintentar</button>
        </div>
      )}
      {actionError && <p className="citas-page__feedback" role="alert">{actionError}</p>}
      {actionMessage && <p className="citas-page__feedback" role="status">{actionMessage}</p>}
      {!loading && !error && (
        <>
          <CitasFilters filters={filters} onChange={handleFilterChange} tramiteOptions={tramiteOptions} estatusOptions={estatusOptions} />
          <CitasTable
            rows={filtered.slice((page - 1) * pageSize, page * pageSize)}
            total={filtered.length}
            page={page}
            pageCount={Math.max(1, Math.ceil(filtered.length / pageSize))}
            onPageChange={setPage}
            onMarkAttended={handleMarkAttended}
            updatingFolio={updatingFolio}
            emptyMessage={citas.length === 0 ? 'No hay citas registradas.' : 'No se encontraron citas con esos filtros.'}
          />
        </>
      )}
    </div>
  )
}

export default CitasPage
