import { useEffect, useState } from 'react'
import '../css/carrera-tramites-panel.css'

const API = import.meta.env.VITE_API_URL || ''

function CarreraTramitesPanel({ token, role }) {
  const [carreras, setCarreras] = useState([])
  const [carreraSeleccionada, setCarreraSeleccionada] = useState('')
  const [tramites, setTramites] = useState([])
  const [loadingCareers, setLoadingCareers] = useState(true)
  const [loadingTramites, setLoadingTramites] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${API}/api/v1/carrera-tramites/carreras`, {
      headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error('No se pudieron cargar las carreras asignadas.')
      const data = await response.json()
      if (!Array.isArray(data)) throw new Error('La respuesta de carreras no es válida.')
      setCarreras(data)
    }).catch((cause) => {
      if (!controller.signal.aborted) setError(cause.message || 'No se pudieron cargar las carreras.')
    }).finally(() => {
      if (!controller.signal.aborted) setLoadingCareers(false)
    })
    return () => controller.abort()
  }, [token])

  const carreraActiva = carreras.includes(carreraSeleccionada) ? carreraSeleccionada : carreras[0] || ''

  useEffect(() => {
    if (!carreraActiva) {
      return undefined
    }
    const controller = new AbortController()
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        setLoadingTramites(true)
        setError('')
      }
      return fetch(`${API}/api/v1/carrera-tramites/${encodeURIComponent(carreraActiva)}`, {
        headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
      })
    }).then(async (response) => {
      if (!response.ok) throw new Error('No se pudieron cargar los trámites de esta carrera.')
      const data = await response.json()
      if (!Array.isArray(data)) throw new Error('La respuesta de trámites no es válida.')
      setTramites(data)
    }).catch((cause) => {
      if (!controller.signal.aborted) setError(cause.message || 'No se pudieron cargar los trámites.')
    }).finally(() => {
      if (!controller.signal.aborted) setLoadingTramites(false)
    })
    return () => controller.abort()
  }, [carreraActiva, token])

  async function cambiarHabilitacion(tramite) {
    const habilitado = !tramite.habilitado
    setBusyId(tramite.id)
    setError('')
    setMessage('')
    try {
      const response = await fetch(`${API}/api/v1/carrera-tramites/${encodeURIComponent(carreraActiva)}/${tramite.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ habilitado }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.mensaje || 'No se pudo cambiar el estado del trámite.')
      setTramites((current) => current.map((item) => item.id === tramite.id ? { ...item, habilitado } : item))
      setMessage(`«${tramite.nombre}» ${habilitado ? 'habilitado' : 'deshabilitado'} para ${carreraActiva}.`)
    } catch (cause) {
      setError(cause.message || 'No se pudo cambiar el estado del trámite.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="career-tramites" aria-labelledby="career-tramites-title">
      <header className="career-tramites__header">
        <div>
          <span className="career-tramites__eyebrow">DISPONIBILIDAD POR CARRERA</span>
          <h2 id="career-tramites-title">Trámites habilitados</h2>
          <p>Activa o desactiva trámites cuando lo necesites. Esto solo afecta nuevas citas de la carrera seleccionada.</p>
        </div>
        {carreras.length > 1 ? <label className="career-tramites__career-select">Carrera
          <select value={carreraActiva} onChange={(event) => { setCarreraSeleccionada(event.target.value); setMessage('') }}>
            {carreras.map((carrera) => <option key={carrera} value={carrera}>{carrera}</option>)}
          </select>
        </label> : carreraActiva && <span className="career-tramites__single-career"><strong>Carrera:</strong> {carreraActiva}</span>}
      </header>
      {error && <p className="career-tramites__feedback career-tramites__feedback--error" role="alert">{error}</p>}
      {message && <p className="career-tramites__feedback" role="status">{message}</p>}
      {loadingCareers || loadingTramites ? <p className="career-tramites__empty" role="status">Cargando configuración…</p>
        : !carreraActiva ? <p className="career-tramites__empty">No hay carreras asignadas a esta cuenta.</p>
          : tramites.length === 0 ? <p className="career-tramites__empty">No hay trámites en el catálogo.</p>
            : <ul className="career-tramites__list">{tramites.map((tramite) => (
              <li key={tramite.id} className={!tramite.activo ? 'career-tramites__item career-tramites__item--inactive' : 'career-tramites__item'}>
                <div><strong>{tramite.nombre}</strong><small>{!tramite.activo ? 'Desactivado del catálogo global' : tramite.habilitado ? 'Disponible para nuevas citas' : 'No se ofrece en esta carrera'}</small></div>
                <label className="career-tramites__toggle">
                  <span>{tramite.habilitado ? 'Habilitado' : 'Deshabilitado'}</span>
                  <input type="checkbox" checked={tramite.habilitado} disabled={!tramite.activo || busyId === tramite.id} onChange={() => cambiarHabilitacion(tramite)} aria-label={`${tramite.habilitado ? 'Deshabilitar' : 'Habilitar'} ${tramite.nombre} para ${carreraActiva}`} />
                </label>
              </li>
            ))}</ul>}
      {role === 'JEFE_COORDINADORES' && <p className="career-tramites__note">El cambio aplica a todos los coordinadores asignados a esa carrera.</p>}
    </section>
  )
}

export default CarreraTramitesPanel
