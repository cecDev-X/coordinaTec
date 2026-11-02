import { useState } from 'react'
import '../css/tramite-form-modal.css'

const emptyForm = {
  nombre: '',
  periodo: '1',
  duracionMinutos: '20',
  requisitos: '',
  activo: true,
  prioridad: 'MEDIA',
}

function TramiteFormModal({ tramite, onClose, onSaved }) {
  const [form, setForm] = useState(tramite ? {
    nombre: tramite.nombre,
    periodo: String(tramite.periodo),
    duracionMinutos: String(tramite.duracionMinutos),
    requisitos: tramite.requisitos,
    activo: tramite.activo,
    prioridad: tramite.prioridad,
  } : emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(tramite ? `/api/v1/tramites/${tramite.id}` : '/api/v1/tramites', {
        method: tramite ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          nombre: form.nombre.trim(),
          periodo: Number(form.periodo),
          duracionMinutos: Number(form.duracionMinutos),
          requisitos: form.requisitos.trim(),
        }),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.mensaje || (response.status === 409
          ? 'Ya existe un trámite con ese nombre.'
          : 'No se pudo guardar el trámite. Revisa los datos e intenta de nuevo.'))
      }

      onSaved(result)
    } catch (cause) {
      setError(cause.message || 'No se pudo guardar el trámite. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="tramite-form-modal__backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
    >
      <section className="tramite-form-modal" role="dialog" aria-modal="true" aria-labelledby="tramite-form-title">
        <header className="tramite-form-modal__header">
          <div>
            <h2 id="tramite-form-title">{tramite ? 'Editar trámite' : 'Agregar trámite'}</h2>
            <p>Configura el nombre, periodo, requisitos y prioridad.</p>
          </div>
          <button type="button" className="tramite-form-modal__close" aria-label="Cerrar formulario" onClick={onClose} disabled={saving}>×</button>
        </header>

        <form className="tramite-form-modal__form" onSubmit={submit}>
          <label>
            Nombre del trámite
            <input name="nombre" value={form.nombre} onChange={updateField} maxLength="150" required autoFocus />
          </label>
          <div className="tramite-form-modal__row">
            <label>
              Periodo (días)
              <input name="periodo" type="number" min="1" max="365" value={form.periodo} onChange={updateField} required />
            </label>
            <label>
              Duración de cita (minutos)
              <input name="duracionMinutos" type="number" min="5" max="480" value={form.duracionMinutos} onChange={updateField} required />
            </label>
            <label>
              Prioridad
              <select name="prioridad" value={form.prioridad} onChange={updateField} required>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </label>
          </div>
          <label>
            Requisitos
            <textarea name="requisitos" value={form.requisitos} onChange={updateField} rows="4" required />
          </label>
          <label className="tramite-form-modal__active">
            <input name="activo" type="checkbox" checked={form.activo} onChange={updateField} />
            Trámite activo
          </label>
          {error && <p className="tramite-form-modal__error" role="alert">{error}</p>}
          <footer className="tramite-form-modal__actions">
            <button type="button" className="tramite-form-modal__cancel" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" className="tramite-form-modal__submit" disabled={saving}>
              {saving ? 'Guardando...' : tramite ? 'Guardar cambios' : 'Crear trámite'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default TramiteFormModal
