import { useCallback, useEffect, useState } from 'react'
import PasswordRules from '../../estudiantes/components/PasswordRules.jsx'
import { nameIsValid, passwordIsValid } from '../../estudiantes/data/registroValidation.js'
import '../css/coordinadores-page.css'

const API = import.meta.env.VITE_API_URL || ''

function CoordinadoresPage({ token }) {
  const [carreras, setCarreras] = useState([])
  const [coordinadores, setCoordinadores] = useState([])
  const [seleccionadas, setSeleccionadas] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [jefaMensaje, setJefaMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const [editing, setEditing] = useState(null)
  const [coordinatorFields, setCoordinatorFields] = useState({})
  const [jefaFields, setJefaFields] = useState({})

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    try {
      const [carrerasResponse, coordinadoresResponse] = await Promise.all([
        fetch(`${API}/api/v1/jefe-coordinadores/carreras`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/v1/jefe-coordinadores`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (!carrerasResponse.ok || !coordinadoresResponse.ok) throw new Error('No se pudieron cargar los datos. Intenta de nuevo.')
      setCarreras(await carrerasResponse.json())
      setCoordinadores(await coordinadoresResponse.json())
    } catch (error) {
      setMensaje(error.message || 'No fue posible conectar con el servidor.')
    } finally {
      setCargando(false)
    }
  }, [token])

  useEffect(() => {
    const timer = window.setTimeout(cargarDatos, 0)
    return () => window.clearTimeout(timer)
  }, [cargarDatos])

  async function crearCoordinador(event) {
    event.preventDefault()
    const form = event.currentTarget
    setMensaje('')
    const data = new FormData(form)
    if (!nameIsValid(data.get('nombreCompleto')) || ((!editing || data.get('password')) && !passwordIsValid(data.get('password')))) {
      setMensaje('El nombre solo acepta letras y espacios; la contraseña necesita minúscula, mayúscula, número y carácter especial.')
      return
    }
    try {
      const response = await fetch(editing ? `${API}/api/v1/jefe-coordinadores/${encodeURIComponent(editing.rfc)}` : `${API}/api/v1/jefe-coordinadores`, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rfc: data.get('rfc'), nombreCompleto: data.get('nombreCompleto'), password: data.get('password'), carreras: seleccionadas }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.mensaje || 'No se pudo crear el coordinador.')
      setMensaje(result.mensaje)
      form.reset()
      setSeleccionadas([])
      setEditing(null)
      setCoordinatorFields({})
      await cargarDatos()
    } catch (error) {
      setMensaje(error.message || 'No fue posible conectar con el servidor.')
    }
  }

  async function crearJefa(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setJefaMensaje('')
    if (!nameIsValid(data.get('nombreCompleto')) || !passwordIsValid(data.get('password'))) {
      setJefaMensaje('El nombre solo acepta letras y espacios; la contraseña necesita minúscula, mayúscula, número y carácter especial.')
      return
    }
    try {
      const response = await fetch(`${API}/api/v1/jefe-coordinadores/jefas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: data.get('username'), nombreCompleto: data.get('nombreCompleto'), password: data.get('password') }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.mensaje || 'No se pudo crear la cuenta de Jefe(a) de Coordinación.')
      form.reset()
      setJefaFields({})
      setJefaMensaje(`${result.mensaje}. Usuario: ${result.username}`)
    } catch (error) { setJefaMensaje(error.message || 'No fue posible conectar con el servidor.') }
  }

  async function eliminarCoordinador(coordinador) {
    if (!window.confirm(`¿Eliminar a ${coordinador.nombreCompleto}?`)) return
    try {
      const response = await fetch(`${API}/api/v1/jefe-coordinadores/${encodeURIComponent(coordinador.rfc)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.mensaje || 'No se pudo eliminar el coordinador.')
      setMensaje('Coordinador eliminado.')
      await cargarDatos()
    } catch (error) { setMensaje(error.message) }
  }

  return (
    <section className="coordinadores-page">
      <header className="coordinadores-page__header">
        <span className="coordinadores-page__eyebrow">ADMINISTRACIÓN ACADÉMICA</span>
        <h1>Coordinadores</h1>
        <p>Registra a tu equipo y define las carreras que atenderá cada persona.</p>
      </header>

      <div className="coordinadores-page__summary">
        <div><span>Coordinadores registrados</span><strong>{cargando ? '—' : coordinadores.length}</strong></div>
        <div><span>Carreras disponibles</span><strong>{cargando ? '—' : carreras.length}</strong></div>
      </div>

      <div className="coordinadores-page__layout">
        <form className="coordinadores-form" onSubmit={crearCoordinador}>
          <div className="coordinadores-form__heading"><span className="coordinadores-form__icon" aria-hidden="true">＋</span><div><h2>{editing ? 'Editar coordinador' : 'Agregar coordinador'}</h2><p>{editing ? 'Actualiza su nombre, carreras o contraseña.' : 'Se creará una cuenta para acceder al panel.'}</p></div></div>
          <label>RFC<input key={editing?.rfc || 'new-rfc'} name="rfc" defaultValue={editing?.rfc || ''} maxLength="13" placeholder="Ej. ABCD900101XX1" required disabled={Boolean(editing)} /></label>
          <label>Nombre completo<input key={editing?.rfc || 'new-name'} name="nombreCompleto" defaultValue={editing?.nombreCompleto || ''} onChange={(event) => setCoordinatorFields((current) => ({ ...current, nombre: event.target.value }))} className={coordinatorFields.nombre && !nameIsValid(coordinatorFields.nombre) ? 'is-invalid' : ''} maxLength="150" placeholder="Nombre y apellidos" required />{coordinatorFields.nombre && !nameIsValid(coordinatorFields.nombre) && <small className="coordinadores-form__invalid">Solo se permiten letras y espacios.</small>}</label>
          <label>{editing ? 'Cambiar contraseña (opcional)' : 'Contraseña inicial'}<input name="password" type="password" minLength="8" maxLength="72" onChange={(event) => setCoordinatorFields((current) => ({ ...current, password: event.target.value }))} className={coordinatorFields.password && !passwordIsValid(coordinatorFields.password) ? 'is-invalid' : ''} placeholder={editing ? 'Dejar vacío para conservarla' : 'Crea una contraseña segura'} required={!editing} /><PasswordRules password={coordinatorFields.password || ''} showErrors={Boolean(coordinatorFields.password)} /></label>
          <fieldset className="coordinadores-form__careers"><legend>Carreras asignadas</legend>
            <p>Selecciona las áreas que podrá atender.</p>
            {cargando ? <span className="coordinadores-page__muted">Cargando carreras…</span> : carreras.length === 0 ? <span className="coordinadores-page__muted">Primero registra una carrera.</span> : (
              <div className="coordinadores-form__career-options">{carreras.map((carrera) => (
                <label className={`coordinadores-career${seleccionadas.includes(carrera) ? ' coordinadores-career--selected' : ''}`} key={carrera}>
                  <input type="checkbox" checked={seleccionadas.includes(carrera)} onChange={(event) => setSeleccionadas((current) => event.target.checked ? [...current, carrera] : current.filter((item) => item !== carrera))} />
                  <span>{carrera}</span>
                </label>
              ))}</div>
            )}
          </fieldset>
          <button className="coordinadores-form__submit" type="submit" disabled={cargando || seleccionadas.length === 0}>{editing ? 'Guardar cambios' : 'Crear cuenta'}</button>
          {editing && <button className="coordinadores-form__cancel" type="button" onClick={() => { setEditing(null); setSeleccionadas([]) }}>Cancelar edición</button>}
          {mensaje && <p className="coordinadores-page__message" role="status">{mensaje}</p>}
        </form>

        <section className="coordinadores-list" aria-labelledby="coordinadores-list-title">
          <div className="coordinadores-list__heading"><div><h2 id="coordinadores-list-title">Equipo de coordinación</h2><p>Cuentas registradas y carreras asignadas.</p></div><span>{coordinadores.length}</span></div>
          {cargando ? <p className="coordinadores-page__empty">Cargando coordinadores…</p> : coordinadores.length === 0 ? <p className="coordinadores-page__empty">Aún no hay coordinadores registrados.</p> : (
            <div className="coordinadores-list__items">{coordinadores.map((coordinador) => (
              <article className="coordinador-card" key={coordinador.rfc}>
                <span className="coordinador-card__avatar" aria-hidden="true">{coordinador.nombreCompleto.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('es')}</span>
                <div className="coordinador-card__body"><strong>{coordinador.nombreCompleto}</strong><span className="coordinador-card__rfc">{coordinador.rfc}</span>
                  <div className="coordinador-card__careers">{coordinador.carreras.length ? coordinador.carreras.map((carrera) => <span key={carrera}>{carrera}</span>) : <span className="coordinador-card__none">Sin carreras asignadas</span>}</div>
                  <div className="coordinador-card__actions" aria-label={`Acciones para ${coordinador.nombreCompleto}`}>
                    <button className="coordinador-card__edit" type="button" onClick={() => { setEditing(coordinador); setCoordinatorFields({}); setSeleccionadas(coordinador.carreras) }}>Editar</button>
                    <button className="coordinador-card__delete" type="button" onClick={() => eliminarCoordinador(coordinador)}>Eliminar</button>
                  </div>
                </div>
              </article>
            ))}</div>
          )}
        </section>
      </div>

      <section className="jefas-form" aria-labelledby="jefas-form-title">
        <div className="jefas-form__intro">
          <span className="jefas-form__badge" aria-hidden="true">JC</span>
          <div><h2 id="jefas-form-title">Agregar Jefe(a) de Coordinación</h2><p>Se creará una cuenta independiente con el rol de Jefe(a) de Coordinación.</p></div>
        </div>
        <form onSubmit={crearJefa}>
          <label>Usuario<input name="username" maxLength="120" autoComplete="username" placeholder="Ej. jefa@coordina.test" required /></label>
          <label>Nombre completo<input name="nombreCompleto" maxLength="150" autoComplete="name" onChange={(event) => setJefaFields((current) => ({ ...current, nombre: event.target.value }))} className={jefaFields.nombre && !nameIsValid(jefaFields.nombre) ? 'is-invalid' : ''} placeholder="Nombre y apellidos" required />{jefaFields.nombre && !nameIsValid(jefaFields.nombre) && <small className="coordinadores-form__invalid">Solo se permiten letras y espacios.</small>}</label>
          <label>Contraseña inicial<input name="password" type="password" minLength="8" maxLength="72" autoComplete="new-password" onChange={(event) => setJefaFields((current) => ({ ...current, password: event.target.value }))} className={jefaFields.password && !passwordIsValid(jefaFields.password) ? 'is-invalid' : ''} placeholder="Crea una contraseña segura" required /><PasswordRules password={jefaFields.password || ''} showErrors={Boolean(jefaFields.password)} /></label>
          <button className="jefas-form__submit" type="submit">Crear Jefe(a) de Coordinación</button>
        </form>
        {jefaMensaje && <p className="coordinadores-page__message" role="status">{jefaMensaje}</p>}
      </section>
    </section>
  )
}

export default CoordinadoresPage
