import { useState } from 'react'
import '../css/coordinador-settings.css'

const defaultPreferences = {
  recordatorios: true,
  cambiosCitas: true,
  resumenSemanal: false,
}

function readPreferences() {
  try {
    return { ...defaultPreferences, ...JSON.parse(localStorage.getItem('coordinaTecPreferences') || '{}') }
  } catch {
    return defaultPreferences
  }
}

function CoordinadorSettingsPage({ username, role }) {
  const [preferences, setPreferences] = useState(readPreferences)
  const [saved, setSaved] = useState(false)

  function togglePreference(key) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }))
    setSaved(false)
  }

  function savePreferences(event) {
    event.preventDefault()
    localStorage.setItem('coordinaTecPreferences', JSON.stringify(preferences))
    setSaved(true)
  }

  return (
    <section className="coordinator-settings">
      <header className="coordinator-settings__header">
        <span className="coordinator-settings__eyebrow">Tu espacio de trabajo</span>
        <h1>Configuración</h1>
        <p>Administra la información de tu cuenta y cómo quieres recibir avisos de Coordina Tec.</p>
      </header>

      <section className="coordinator-settings__profile" aria-labelledby="settings-profile-title">
        <div className="coordinator-settings__avatar" aria-hidden="true">{(username || 'C').slice(0, 1).toUpperCase()}</div>
        <div className="coordinator-settings__profile-copy">
          <span className="coordinator-settings__eyebrow">CUENTA ACTIVA</span>
          <h2 id="settings-profile-title">{username}</h2>
          <p>{role === 'JEFE_COORDINADORES' ? 'Jefe de Coordinadores' : 'Coordinador'} <span>·</span> Tecnológico de Oaxaca</p>
        </div>
        <span className="coordinator-settings__status"><i /> Sesión segura</span>
      </section>

      <form className="coordinator-settings__card" onSubmit={savePreferences}>
        <div className="coordinator-settings__section-heading">
          <div className="coordinator-settings__section-icon" aria-hidden="true">✉</div>
          <div><h2>Notificaciones</h2><p>Elige los avisos que quieres ver en tu cuenta.</p></div>
        </div>
        <div className="coordinator-settings__options">
          <label className="coordinator-settings__option">
            <span><strong>Recordatorios de citas</strong><small>Recibe avisos sobre las citas próximas de tu agenda.</small></span>
            <input type="checkbox" checked={preferences.recordatorios} onChange={() => togglePreference('recordatorios')} />
          </label>
          <label className="coordinator-settings__option">
            <span><strong>Actualizaciones de citas</strong><small>Entérate cuando una cita se registre o cambie de estado.</small></span>
            <input type="checkbox" checked={preferences.cambiosCitas} onChange={() => togglePreference('cambiosCitas')} />
          </label>
          <label className="coordinator-settings__option">
            <span><strong>Resumen semanal</strong><small>Consulta un resumen de actividad al inicio de cada semana.</small></span>
            <input type="checkbox" checked={preferences.resumenSemanal} onChange={() => togglePreference('resumenSemanal')} />
          </label>
        </div>
        <footer className="coordinator-settings__footer">
          <span role="status">{saved ? 'Preferencias guardadas en este dispositivo.' : 'Los cambios se aplicarán a tus preferencias.'}</span>
          <button type="submit">Guardar preferencias</button>
        </footer>
      </form>

      <aside className="coordinator-settings__security">
        <span className="coordinator-settings__security-icon" aria-hidden="true">✓</span>
        <div><strong>Tu cuenta está protegida</strong><p>La sesión se valida con credenciales institucionales y se cierra al salir del sistema.</p></div>
      </aside>
    </section>
  )
}

export default CoordinadorSettingsPage
