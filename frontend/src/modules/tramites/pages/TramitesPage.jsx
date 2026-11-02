import { useEffect, useState } from 'react'
import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import TramitesFilters from '../components/TramitesFilters.jsx'
import TramiteFormModal from '../components/TramiteFormModal.jsx'
import TramitesTable from '../components/TramitesTable.jsx'
import '../css/tramites-page.css'

function TramitesPage() {
  const [tramites, setTramites] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [filters, setFilters] = useState({ search: '', status: 'Todos', priority: 'Todos', period: 'Todos' })

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/v1/tramites', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)
        const data = await response.json()
        if (!Array.isArray(data)) throw new Error('Respuesta inesperada')
        return data
      })
      .then(setTramites)
      .catch(() => {
        if (!controller.signal.aborted) setLoadError('No se pudieron cargar los trámites. Intenta de nuevo.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt])

  function refresh() {
    setLoading(true)
    setLoadError('')
    setAttempt((current) => current + 1)
  }

  function handleSaved(tramite) {
    setEditing(null)
    setActionError('')
    setMessage(`El trámite «${tramite.nombre}» se guardó correctamente.`)
    refresh()
  }

  async function toggleStatus(tramite) {
    const currentTramite = tramites.find((item) => item.id === tramite.id)
    if (!currentTramite) return

    setBusyId(currentTramite.id)
    setActionError('')
    setMessage('')
    try {
      const response = await fetch(`/api/v1/tramites/${currentTramite.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentTramite, activo: !currentTramite.activo }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.mensaje || 'No se pudo actualizar el estatus del trámite.')
      setTramites((current) => current.map((item) => item.id === currentTramite.id ? result : item))
      setMessage(`El trámite «${result.nombre}» ahora está ${result.activo ? 'activo' : 'desactivado'}.`)
    } catch (error) {
      setActionError(error.message || 'No se pudo actualizar el estatus del trámite.')
    } finally {
      setBusyId(null)
    }
  }

  async function deleteTramite(tramite) {
    if (!window.confirm(`¿Eliminar el trámite «${tramite.nombre}»? Esta acción no se puede deshacer.`)) return

    setBusyId(tramite.id)
    setActionError('')
    setMessage('')
    try {
      const response = await fetch(`/api/v1/tramites/${tramite.id}`, { method: 'DELETE' })
      if (response.status === 404) throw new Error('El trámite ya no existe. Recarga la lista.')
      if (!response.ok) throw new Error('No se pudo eliminar el trámite.')
      setMessage(`El trámite «${tramite.nombre}» se eliminó.`)
      refresh()
    } catch (error) {
      setActionError(error.message || 'No se pudo eliminar el trámite.')
    } finally {
      setBusyId(null)
    }
  }

  const search = filters.search.trim().toLocaleLowerCase('es')
  const rows = tramites.map((tramite) => ({
    ...tramite,
    estatus: tramite.activo ? 'Activo' : 'Desactivado',
    prioridadLabel: tramite.prioridad[0] + tramite.prioridad.slice(1).toLocaleLowerCase('es'),
  }))
  const periodOptions = [...new Set(rows.map((tramite) => String(tramite.periodo)))].sort((a, b) => Number(a) - Number(b))
  const filtered = rows.filter((tramite) => (
    (!search || `${tramite.id} ${tramite.nombre} ${tramite.requisitos}`.toLocaleLowerCase('es').includes(search)) &&
    (filters.status === 'Todos' || tramite.estatus === filters.status) &&
    (filters.priority === 'Todos' || tramite.prioridadLabel === filters.priority) &&
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
      {message && <p className="tramites-page__feedback" role="status">{message}</p>}
      {actionError && <p className="tramites-page__feedback tramites-page__feedback--error" role="alert">{actionError}</p>}
      {loading && <p className="tramites-page__feedback" role="status">Cargando trámites...</p>}
      {loadError && (
        <div className="tramites-page__feedback tramites-page__feedback--error" role="alert">
          <span>{loadError}</span>
          <button type="button" onClick={refresh}>Reintentar</button>
        </div>
      )}
      {!loading && !loadError && (
        <>
          <TramitesFilters
            filters={filters}
            onChange={setFilters}
            onAdd={() => setEditing(false)}
            periodOptions={periodOptions}
          />
          <TramitesTable
            rows={filtered}
            total={filtered.length}
            busyId={busyId}
            emptyMessage={tramites.length === 0 ? 'No hay tipos de trámite registrados.' : 'No se encontraron trámites con esos filtros.'}
            onEdit={(tramite) => setEditing(tramites.find((item) => item.id === tramite.id))}
            onToggle={toggleStatus}
            onDelete={deleteTramite}
          />
        </>
      )}
      {editing !== null && (
        <TramiteFormModal
          tramite={editing || undefined}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

export default TramitesPage
