import { useEffect, useState } from 'react'
import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import CitasFilters from '../components/CitasFilters.jsx'
import CitasTable from '../components/CitasTable.jsx'
import CareerSelection from '../../dashboard/components/CareerSelection.jsx'
import CitaFormModal from '../../agenda/components/CitaFormModal.jsx'
import '../css/citas-page.css'

const pageSize = 4

function formatDate(value) {
  if (!value) return '—'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function formatStatus(value) {
  if (!value) return 'Sin estado'
  if (value === 'NO_ASISTIO') return 'No asistió'
  const text = value.toLocaleLowerCase('es')
  return text[0].toLocaleUpperCase('es') + text.slice(1)
}

function CitasPage({ role, username, token }) {
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [updatingFolio, setUpdatingFolio] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [filters, setFilters] = useState({ search: '', tramite: 'Todos', estatus: 'Todos' })
  const [page, setPage] = useState(1)
  const [careers, setCareers] = useState([])
  const [selectedCareer, setSelectedCareer] = useState(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [jefaturaRfc, setJefaturaRfc] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const endpoint = role === 'COORDINADOR'
      ? `/api/v1/citas/coordinador/${encodeURIComponent(username)}`
      : '/api/v1/citas'
    Promise.all([
      fetch(endpoint, { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/v1/catalogos/citas', { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } }),
    ]).then(async ([appointmentsResponse, catalogResponse]) => {
      if (!appointmentsResponse.ok || !catalogResponse.ok) throw new Error('No se pudieron cargar las citas o carreras.')
      const [appointments, catalog] = await Promise.all([appointmentsResponse.json(), catalogResponse.json()])
      if (!Array.isArray(appointments) || !Array.isArray(catalog.coordinadores)) throw new Error('Respuesta inesperada')
      if (role === 'JEFE_COORDINADORES') {
        const [careersResponse, ownAgendaResponse] = await Promise.all([
          fetch('/api/v1/jefe-coordinadores/carreras', { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/v1/jefe-coordinadores/agenda', { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (!careersResponse.ok || !ownAgendaResponse.ok) throw new Error('No se pudo cargar la agenda y el catálogo de carreras.')
        const [availableCareers, ownAgenda] = await Promise.all([careersResponse.json(), ownAgendaResponse.json()])
        setJefaturaRfc(ownAgenda.rfc)
        return { appointments, careers: availableCareers }
      }
      const coordinator = catalog.coordinadores.find((item) => item.rfc.toLocaleLowerCase() === username?.toLocaleLowerCase())
      return { appointments, careers: coordinator?.carreras || [] }
    }).then(({ appointments, careers: availableCareers }) => {
      setCitas(appointments)
      setCareers(availableCareers)
      if (role === 'COORDINADOR' && availableCareers.length === 1) {
        setSelectedCareer(availableCareers[0])
      }
    })
      .catch(() => {
        if (!controller.signal.aborted) setError('No se pudieron cargar las citas. Intenta de nuevo.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt, role, token, username])

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
    (selectedCareer === null || selectedCareer === undefined || cita.carrera === selectedCareer) &&
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  async function handleCancel(folio) {
    if (!window.confirm(`¿Cancelar la cita ${folio}? Se notificará al estudiante por correo si lo tiene registrado.`)) return
    setUpdatingFolio(folio)
    setActionError('')
    try {
      const response = await fetch(`/api/v1/citas/${encodeURIComponent(folio)}/cancelar`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.mensaje || 'No se pudo cancelar la cita.')
      setCitas((current) => current.map((cita) => cita.folio === folio ? { ...cita, estado: result.estado } : cita))
      setActionMessage(`La cita ${folio} fue cancelada.`)
    } catch (cause) { setActionError(cause.message) } finally { setUpdatingFolio(null) }
  }

  async function handleNoShow(folio) {
    if (!window.confirm(`¿Marcar la cita ${folio} como "No asistió"?`)) return
    setUpdatingFolio(folio)
    setActionError('')
    try {
      const response = await fetch(`/api/v1/citas/${encodeURIComponent(folio)}/estado`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: 'NO_ASISTIO' }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.mensaje || 'Solo puedes marcar la inasistencia cuando terminó el horario de la cita.')
      setCitas((current) => current.map((cita) => cita.folio === folio ? { ...cita, estado: result.estado } : cita))
      setActionMessage(`La cita ${folio} se marcó como "No asistió".`)
    } catch (cause) { setActionError(cause.message) } finally { setUpdatingFolio(null) }
  }

  async function handleEdit(folio) {
    setActionError('')
    try {
      const response = await fetch(`/api/v1/citas/${encodeURIComponent(folio)}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw new Error('No se pudieron cargar los datos de la cita.')
      setEditing(await response.json())
      setFormOpen(true)
    } catch (cause) { setActionError(cause.message) }
  }

  if (!loading && !error && selectedCareer === undefined) {
    const careerSummary = careers.map((nombre) => ({ nombre, total: rows.filter((cita) => cita.carrera === nombre).length }))
    return (
      <div className="citas-page">
        <CareerSelection title="Citas por carrera" description="Elige una carrera para consultar sus citas o revisa el conjunto institucional." countLabel="citas" total={citas.length} careers={careerSummary} onSelect={(career) => { setSelectedCareer(career); setPage(1) }} />
      </div>
    )
  }

  return (
    <div className="citas-page">
      <header className="citas-page__header">
        <span className="citas-page__icon"><DashboardIcon name="edit" size={18} /></span>
        <div>
          <h1>{selectedCareer ? `Citas · ${selectedCareer}` : 'Todas las citas'}</h1>
          <p>Consulta y actualiza las citas registradas en coordinación.</p>
        </div>
        {(role !== 'COORDINADOR' || careers.length > 1) && <button type="button" className="citas-page__back" onClick={() => { setSelectedCareer(undefined); setFilters({ search: '', tramite: 'Todos', estatus: 'Todos' }); setPage(1) }}>← Carreras</button>}
        {role === 'JEFE_COORDINADORES' && <button type="button" className="citas-page__back" onClick={() => { setEditing(null); setFormOpen(true) }}>＋ Nueva cita</button>}
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
            canManage={role === 'JEFE_COORDINADORES'}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onMarkNoShow={handleNoShow}
            updatingFolio={updatingFolio}
            emptyMessage={citas.length === 0 ? 'No hay citas registradas.' : 'No se encontraron citas con esos filtros.'}
          />
        </>
      )}
      {formOpen && <CitaFormModal token={token} role={role} username={username} defaultCoordinatorRfc={jefaturaRfc} initialCitation={editing} onClose={() => { setFormOpen(false); setEditing(null) }} onCreated={() => { setFormOpen(false); setEditing(null); setLoading(true); setAttempt((current) => current + 1) }} />}
    </div>
  )
}

export default CitasPage
