import { useCallback, useEffect, useRef, useState } from 'react'
import DashboardIcon from './DashboardIcon.jsx'
import '../css/topbar.css'

function DashboardTopbar({ onToggleMenu, onNavigateToCitas, token, menuOpen, title, displayName, role, username }) {
  const name = displayName?.trim() || username || 'Usuario'
  const roleLabel = role === 'JEFE_COORDINADORES' ? 'Jefe(a) de Coordinación' : 'Coordinador(a)'
  const initial = name.trim().charAt(0).toLocaleUpperCase('es') || 'U'
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [pending, setPending] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const container = useRef(null)

  const refresh = useCallback(async (signal) => {
    try {
      const response = await fetch('/api/v1/notificaciones/citas', {
        signal, headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('No se pudieron cargar las notificaciones.')
      const data = await response.json()
      setItems(data.notificaciones)
      setPending(data.pendientes)
      setError('')
    } catch (cause) {
      if (cause.name !== 'AbortError') setError('No se pudieron cargar las notificaciones. Intenta de nuevo.')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [token])

  useEffect(() => {
    const controller = new AbortController()
    const update = () => { if (!document.hidden) refresh(controller.signal) }
    update()
    const interval = window.setInterval(update, 30000)
    document.addEventListener('visibilitychange', update)
    window.addEventListener('cita-agendada', update)
    return () => {
      controller.abort()
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', update)
      window.removeEventListener('cita-agendada', update)
    }
  }, [refresh])

  useEffect(() => {
    if (!open) return undefined
    function close(event) {
      if (event.key === 'Escape' || (event.type === 'pointerdown' && !container.current?.contains(event.target))) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  async function openAppointment(item) {
    try {
      if (!item.leida) {
        const response = await fetch(`/api/v1/notificaciones/citas/${item.id}/leer`, {
          method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error('No se pudo marcar como leída.')
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, leida: true } : entry))
        setPending((current) => Math.max(0, current - 1))
      }
      setOpen(false)
      onNavigateToCitas()
    } catch {
      setError('No se pudo marcar la notificación como leída. Intenta de nuevo.')
    }
  }

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar__location">
        <button
          type="button"
          className="dashboard-topbar__menu"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-controls="dashboard-sidebar"
          aria-expanded={menuOpen}
          onClick={onToggleMenu}
        >
          <DashboardIcon name="menu" size={15} />
        </button>
        <strong>{title}</strong>
        <span className="dashboard-topbar__divider" />
        <span className="dashboard-topbar__tag">TecNM</span>
        <span className="dashboard-topbar__school">Instituto Tecnológico de Oaxaca</span>
      </div>

      <div className="dashboard-topbar__tools">
        <div className="dashboard-topbar__notifications" ref={container}>
          <button type="button" className="dashboard-topbar__icon-button" aria-label={`Notificaciones (${pending} pendientes)`}
            aria-expanded={open} aria-controls="dashboard-notifications" onClick={() => { setOpen((current) => !current); refresh() }}>
            <DashboardIcon name="bell" size={16} />
            {pending > 0 && <span className="dashboard-topbar__notification-count">{pending > 99 ? '99+' : pending}</span>}
          </button>
          {open && <section id="dashboard-notifications" className="dashboard-topbar__notification-panel" aria-label="Notificaciones de citas">
            <header><strong>Notificaciones</strong><button type="button" onClick={() => refresh()}>Actualizar</button></header>
            {error && <p role="alert" className="dashboard-topbar__notification-feedback">{error}</p>}
            {loading && !error && <p className="dashboard-topbar__notification-feedback">Cargando…</p>}
            {!loading && !error && items.length === 0 && <p className="dashboard-topbar__notification-feedback">Aún no hay citas nuevas.</p>}
            <div className="dashboard-topbar__notification-list">
              {items.map((item) => <button type="button" key={item.id}
                className={`dashboard-topbar__notification-item${item.leida ? '' : ' dashboard-topbar__notification-item--new'}`}
                onClick={() => openAppointment(item)}>
                <strong>{item.leida ? 'Cita agendada' : 'Nueva cita agendada'} · {item.folio}</strong>
                <span>{item.estudiante} · {item.tramite}</span>
                <small>{item.fecha} · {item.hora?.slice(0, 5)}</small>
              </button>)}
            </div>
          </section>}
        </div>
        <div className="dashboard-topbar__profile">
          <span className="dashboard-topbar__profile-copy"><strong title={name}>{name}</strong><small>{roleLabel}</small></span>
          <span className="dashboard-topbar__avatar" aria-label={`Cuenta de ${name}, ${roleLabel}`} title={`${name} · ${roleLabel}`}>{initial}</span>
        </div>
      </div>
    </header>
  )
}

export default DashboardTopbar
