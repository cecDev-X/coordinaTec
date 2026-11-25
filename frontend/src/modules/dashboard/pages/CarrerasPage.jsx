import { useCallback, useEffect, useState } from 'react'
import '../css/carreras-page.css'
import ConfirmationModal from '../../../components/ConfirmationModal.jsx'

const API = import.meta.env.VITE_API_URL || ''

function CarrerasPage({ token }) {
  const [carreras, setCarreras] = useState([])
  const [nombre, setNombre] = useState('')
  const [edicion, setEdicion] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const cargarCarreras = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const response = await fetch(`${API}/api/v1/jefe-coordinadores/carreras`, { headers: { Authorization: `Bearer ${token}` } })
      if (!response.ok) throw new Error('No se pudo cargar el catálogo de carreras.')
      setCarreras(await response.json())
    } catch (requestError) {
      setError(requestError.message || 'No fue posible conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }, [token])

  useEffect(() => {
    const timer = window.setTimeout(cargarCarreras, 0)
    return () => window.clearTimeout(timer)
  }, [cargarCarreras])

  async function enviarCambio(url, method, body, successMessage) {
    setMensaje('')
    setError('')
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.mensaje || 'No se pudo guardar el cambio.')
      setMensaje(result.mensaje || successMessage)
      await cargarCarreras()
      return true
    } catch (requestError) {
      setError(requestError.message || 'No fue posible conectar con el servidor.')
      return false
    }
  }

  async function agregarCarrera(event) {
    event.preventDefault()
    if (!nombre.trim()) return
    const success = await enviarCambio(`${API}/api/v1/jefe-coordinadores/carreras`, 'POST', { nombre: nombre.trim() }, 'Carrera agregada.')
    if (success) setNombre('')
  }

  async function guardarEdicion(event, carrera) {
    event.preventDefault()
    const nuevoNombre = edicion?.nombre.trim()
    if (!nuevoNombre) return
    const success = await enviarCambio(`${API}/api/v1/jefe-coordinadores/carreras/${encodeURIComponent(carrera)}`, 'PUT', { nombre: nuevoNombre }, 'Carrera actualizada.')
    if (success) setEdicion(null)
  }

  async function eliminarCarrera(carrera) {
    await enviarCambio(`${API}/api/v1/jefe-coordinadores/carreras/${encodeURIComponent(carrera)}`, 'DELETE', null, 'Carrera eliminada.')
  }

  return (
    <section className="carreras-page">
      <header className="carreras-page__header">
        <span className="carreras-page__eyebrow">CATÁLOGO INSTITUCIONAL</span>
        <h1>Carreras</h1>
        <p>Administra las carreras disponibles para alumnos y asignaciones de coordinación.</p>
      </header>

      <div className="carreras-page__count"><span className="carreras-page__count-icon" aria-hidden="true">▤</span><span><strong>{cargando ? '—' : carreras.length}</strong><small>Carreras en el catálogo</small></span></div>

      <div className="carreras-page__layout">
        <form className="carreras-form" onSubmit={agregarCarrera}>
          <div className="carreras-form__heading"><span aria-hidden="true">＋</span><div><h2>Nueva carrera</h2><p>Añade una opción al catálogo institucional.</p></div></div>
          <label htmlFor="nueva-carrera">Nombre de la carrera</label>
          <input id="nueva-carrera" value={nombre} onChange={(event) => setNombre(event.target.value)} maxLength={100} placeholder="Ej. Ingeniería en Sistemas Computacionales" required />
          <button type="submit" disabled={cargando || !nombre.trim()}>Agregar carrera</button>
          <small>Máximo 100 caracteres.</small>
        </form>

        <section className="carreras-list" aria-labelledby="carreras-list-title">
          <header className="carreras-list__heading"><div><h2 id="carreras-list-title">Carreras registradas</h2><p>Catálogo utilizado en registros y asignaciones.</p></div><span>{cargando ? '…' : carreras.length}</span></header>
          {mensaje && <p className="carreras-page__notice" role="status">{mensaje}</p>}
          {error && <p className="carreras-page__error" role="alert">{error} <button type="button" onClick={cargarCarreras}>Reintentar</button></p>}
          {cargando ? <p className="carreras-page__empty" role="status">Cargando catálogo…</p> : carreras.length === 0 ? <p className="carreras-page__empty">Todavía no hay carreras registradas.</p> : (
            <div className="carreras-list__items">{carreras.map((carrera) => (
              <article className="carrera-item" key={carrera}>
                {edicion?.anterior === carrera ? (
                  <form className="carrera-item__edit" onSubmit={(event) => guardarEdicion(event, carrera)}>
                    <input aria-label="Nombre de la carrera" value={edicion.nombre} onChange={(event) => setEdicion({ ...edicion, nombre: event.target.value })} maxLength={100} required autoFocus />
                    <button type="submit" aria-label="Guardar cambios">Guardar</button>
                    <button type="button" className="carrera-item__cancel" onClick={() => setEdicion(null)}>Cancelar</button>
                  </form>
                ) : (
                  <><span className="carrera-item__symbol" aria-hidden="true">⌂</span><strong>{carrera}</strong><div className="carrera-item__actions"><button type="button" onClick={() => setDeleting({ carrera, isEditConfirmation: true })}>Editar</button><button type="button" className="carrera-item__delete" onClick={() => setDeleting({ carrera })}>Eliminar</button></div></>
                )}
              </article>
            ))}</div>
          )}
        </section>
      </div>
      <ConfirmationModal open={Boolean(deleting)} title={deleting?.isEditConfirmation ? 'Editar carrera' : 'Eliminar carrera'} message={deleting?.isEditConfirmation ? `¿Deseas abrir «${deleting?.carrera}» para editarla?` : `¿Eliminar «${deleting?.carrera || ''}» del catálogo? Esta acción no se puede deshacer.`} confirmLabel={deleting?.isEditConfirmation ? 'Sí, editar' : 'Sí, eliminar'} danger={!deleting?.isEditConfirmation} onCancel={() => setDeleting(null)} onConfirm={() => { const item = deleting; setDeleting(null); if (item?.isEditConfirmation) { setError(''); setEdicion({ anterior: item.carrera, nombre: item.carrera }) } else if (item) eliminarCarrera(item.carrera) }} />
    </section>
  )
}

export default CarrerasPage
