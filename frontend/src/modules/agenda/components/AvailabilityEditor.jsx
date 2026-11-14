import { useEffect, useState } from 'react'
import '../css/availability-editor.css'

const API = import.meta.env.VITE_API_URL || ''
const days = [
  { value: 1, label: 'Lunes' }, { value: 2, label: 'Martes' }, { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' }, { value: 5, label: 'Viernes' }, { value: 6, label: 'Sábado' }, { value: 7, label: 'Domingo' },
]

function AvailabilityEditor({ token, coordinatorRfc, onSaved }) {
  const [blocks, setBlocks] = useState([])
  const [tramites, setTramites] = useState([])
  const [selectedTramites, setSelectedTramites] = useState([])
  const [day, setDay] = useState('1')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('12:00')
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve().then(() => {
      if (controller.signal.aborted) return undefined
      setLoading(true)
      setError('')
      return Promise.all([
        fetch(`${API}/api/v1/coordinadores/${encodeURIComponent(coordinatorRfc)}/horarios`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }),
        fetch(`${API}/api/v1/tramites`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }),
      ])
    }).then(async (responses) => {
      if (!responses) return undefined
      if (responses.some((response) => !response.ok)) throw new Error('No se pudo cargar la disponibilidad y el catálogo de trámites.')
      const [data, tramiteData] = await Promise.all(responses.map((response) => response.json()))
      if (!Array.isArray(data) || !Array.isArray(tramiteData)) throw new Error('La respuesta de horarios no es válida.')
      setTramites(tramiteData.filter((item) => item.activo).map((item) => ({ id: Number(item.id), nombre: item.nombre })))
      setBlocks(data.map((item) => ({
        diaSemana: Number(item.diaSemana), horaInicio: item.horaInicio.slice(0, 5),
        horaSalida: item.horaSalida.slice(0, 5), tramiteIds: item.tramiteIds.map(Number),
      })))
    }).catch((cause) => {
      if (!controller.signal.aborted) setError(cause.message || 'No se pudo cargar la disponibilidad.')
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [coordinatorRfc, token])

  function addBlock(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    const newBlock = { diaSemana: Number(day), horaInicio: start, horaSalida: end, tramiteIds: selectedTramites }
    if (!selectedTramites.length) {
      setError('Selecciona al menos un tipo de trámite para este bloque.')
      return
    }
    if (start >= end) {
      setError('La hora de salida debe ser posterior al inicio.')
      return
    }
    const overlaps = blocks.some((block) => block.diaSemana === newBlock.diaSemana && start < block.horaSalida && end > block.horaInicio)
    if (overlaps) {
      setError('Este bloque se cruza con otro horario del mismo día.')
      return
    }
    setBlocks((current) => [...current, newBlock].sort((a, b) => a.diaSemana - b.diaSemana || a.horaInicio.localeCompare(b.horaInicio)))
    setModalOpen(false)
    setSelectedTramites([])
  }

  async function saveBlocks() {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(`${API}/api/v1/coordinadores/${encodeURIComponent(coordinatorRfc)}/horarios`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(blocks),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.mensaje || 'No se pudo guardar la disponibilidad.')
      setMessage('Disponibilidad guardada. Las citas solo se ofrecerán dentro de estos bloques.')
      onSaved?.(blocks.map((block) => ({ ...block, tramites: block.tramiteIds.map((id) => tramites.find((item) => item.id === id)?.nombre).filter(Boolean) })))
    } catch (cause) { setError(cause.message || 'No se pudo guardar la disponibilidad.') }
    finally { setSaving(false) }
  }

  return (
    <section className="availability-editor" aria-labelledby="availability-editor-title">
      <header className="availability-editor__header">
        <div><span className="availability-editor__eyebrow">DISPONIBILIDAD SEMANAL</span><h2 id="availability-editor-title">Días y horas de atención</h2><p>Define tus bloques y qué trámites aceptarás en cada uno.</p></div>
        <button type="button" className="availability-editor__save" onClick={saveBlocks} disabled={loading || saving}>{saving ? 'Guardando…' : 'Guardar horario'}</button>
      </header>
      <button type="button" className="availability-editor__add-button" onClick={() => { setError(''); setModalOpen(true) }}>＋ Añadir bloque</button>
      {error && <p className="availability-editor__feedback availability-editor__feedback--error" role="alert">{error}</p>}
      {message && <p className="availability-editor__feedback" role="status">{message}</p>}
      {loading ? <p className="availability-editor__empty">Cargando horario…</p> : blocks.length === 0 ? (
        <p className="availability-editor__empty">No hay bloques configurados. Sin disponibilidad, los alumnos no podrán reservar citas.</p>
      ) : (
        <ul className="availability-editor__blocks">
          {blocks.map((block, index) => (
            <li key={`${block.diaSemana}-${block.horaInicio}-${index}`}>
              <span className="availability-editor__day">{days.find((item) => item.value === block.diaSemana)?.label}</span>
              <strong>{block.horaInicio}–{block.horaSalida}</strong>
              <span className="availability-editor__types">{block.tramiteIds.map((id) => tramites.find((item) => item.id === id)?.nombre).filter(Boolean).join(' · ') || 'Sin tipo de trámite'}</span>
              <button type="button" aria-label={`Quitar bloque del ${days.find((item) => item.value === block.diaSemana)?.label} de ${block.horaInicio} a ${block.horaSalida}`} onClick={() => { setBlocks((current) => current.filter((_, itemIndex) => itemIndex !== index)); setMessage(''); setError('') }}>Quitar</button>
            </li>
          ))}
        </ul>
      )}
      {modalOpen && <div className="availability-editor__backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false) }}>
        <form className="availability-editor__modal" role="dialog" aria-modal="true" aria-labelledby="availability-modal-title" onSubmit={addBlock}>
          <header><div><span className="availability-editor__eyebrow">NUEVA DISPONIBILIDAD</span><h3 id="availability-modal-title">Agregar bloque de atención</h3><p>Elige el día, el rango horario y los trámites que aceptarás.</p></div><button type="button" className="availability-editor__close" aria-label="Cerrar" onClick={() => setModalOpen(false)}>×</button></header>
          <div className="availability-editor__modal-fields">
            <label>Día<select value={day} onChange={(event) => setDay(event.target.value)}>{days.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label>Desde<input type="time" value={start} onChange={(event) => setStart(event.target.value)} required /></label>
            <label>Hasta<input type="time" value={end} onChange={(event) => setEnd(event.target.value)} required /></label>
          </div>
          <fieldset className="availability-editor__tramites"><legend>Trámites que atenderás</legend>
            {tramites.length === 0 ? <p>No hay tipos de trámite activos.</p> : tramites.map((tramite) => <label key={tramite.id}><input type="checkbox" checked={selectedTramites.includes(tramite.id)} onChange={(event) => setSelectedTramites((current) => event.target.checked ? [...current, tramite.id] : current.filter((id) => id !== tramite.id))} /><span>{tramite.nombre}</span></label>)}
          </fieldset>
          {error && <p className="availability-editor__feedback availability-editor__feedback--error" role="alert">{error}</p>}
          <footer><button type="button" className="availability-editor__cancel" onClick={() => setModalOpen(false)}>Cancelar</button><button type="submit" className="availability-editor__save">Agregar bloque</button></footer>
        </form>
      </div>}
    </section>
  )
}

export default AvailabilityEditor
