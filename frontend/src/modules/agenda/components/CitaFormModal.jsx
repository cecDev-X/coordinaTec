import { useEffect, useState } from 'react'
import '../css/cita-form-modal.css'

function localDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function calculatedEndTime(startTime, durationMinutes) {
  if (!startTime || !durationMinutes) return ''
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  if (totalMinutes >= 24 * 60) return ''
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`
}

function CitaFormModal({ onClose, onCreated }) {
  const [catalogos, setCatalogos] = useState({ estudiantes: [], coordinadores: [], formatos: [] })
  const [loading, setLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [form, setForm] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return {
      fecha: localDateValue(tomorrow),
      horaInicio: '10:00',
      motivo: '',
      coordinadorRfc: '',
      numControlEstudiante: '',
      formatoFolio: '',
    }
  })

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/v1/catalogos/citas', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`)
        const data = await response.json()
        if (!Array.isArray(data.estudiantes) || !Array.isArray(data.coordinadores) || !Array.isArray(data.formatos)) {
          throw new Error('Respuesta de catálogos incompleta')
        }
        return data
      })
      .then((data) => {
        setCatalogos(data)
        setForm((current) => ({
          ...current,
          numControlEstudiante: current.numControlEstudiante || data.estudiantes[0]?.numControl || '',
          coordinadorRfc: current.coordinadorRfc || data.coordinadores[0]?.rfc || '',
          formatoFolio: current.formatoFolio || data.formatos[0]?.folio || '',
        }))
      })
      .catch(() => {
        if (!controller.signal.aborted) setCatalogError('No se pudieron cargar los estudiantes, coordinadores y formatos.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [attempt])

  const formatoSeleccionado = catalogos.formatos.find((formato) => formato.folio === form.formatoFolio)
  const duracionMinutos = formatoSeleccionado?.duracionMinutos
  const horaFin = calculatedEndTime(form.horaInicio, duracionMinutos)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setSubmitError('')

    if (!horaFin) {
      setSubmitError('La duración del trámite excede el horario del día. Elige otra hora de inicio o trámite.')
      return
    }

    if (new Date(`${form.fecha}T${form.horaInicio}:00`) <= new Date()) {
      setSubmitError('Selecciona una fecha y hora futuras.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/v1/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          horaInicio: `${form.horaInicio}:00`,
          motivo: form.motivo.trim() || null,
        }),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.mensaje || 'No se pudo guardar la cita. Revisa los datos e intenta de nuevo.')
      }

      onCreated(result)
    } catch (error) {
      setSubmitError(error.message || 'No se pudo guardar la cita. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="cita-form-modal__backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose()
      }}
    >
      <section className="cita-form-modal" role="dialog" aria-modal="true" aria-labelledby="cita-form-title">
        <header className="cita-form-modal__header">
          <div>
            <h2 id="cita-form-title">Agregar cita</h2>
            <p>Completa los datos para registrar una nueva cita.</p>
          </div>
          <button type="button" className="cita-form-modal__close" aria-label="Cerrar formulario" onClick={onClose} disabled={submitting}>×</button>
        </header>

        {loading && <p className="cita-form-modal__message" role="status">Cargando opciones...</p>}
        {catalogError && (
          <div className="cita-form-modal__message" role="alert">
            <span>{catalogError} Verifica que la base tenga datos iniciales.</span>
            <button type="button" onClick={() => { setLoading(true); setCatalogError(''); setAttempt((value) => value + 1) }}>Reintentar</button>
          </div>
        )}
        {!loading && !catalogError && (
          <form className="cita-form-modal__form" onSubmit={submit}>
            {catalogos.estudiantes.length === 0 || catalogos.coordinadores.length === 0 || catalogos.formatos.length === 0 ? (
              <p className="cita-form-modal__message" role="status">Faltan estudiantes, coordinadores o formatos en la base. Carga el seed de desarrollo o registra esos datos primero.</p>
            ) : (
              <>
                <label>
                  Estudiante
                  <select name="numControlEstudiante" value={form.numControlEstudiante} onChange={updateField} required>
                    {catalogos.estudiantes.map((estudiante) => (
                      <option key={estudiante.numControl} value={estudiante.numControl}>
                        {estudiante.nombre} · {estudiante.numControl}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Coordinador
                  <select name="coordinadorRfc" value={form.coordinadorRfc} onChange={updateField} required>
                    {catalogos.coordinadores.map((coordinador) => (
                      <option key={coordinador.rfc} value={coordinador.rfc}>
                        {coordinador.nombre} · {coordinador.departamento}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Formato / trámite
                  <select name="formatoFolio" value={form.formatoFolio} onChange={updateField} required>
                    {catalogos.formatos.map((formato) => (
                      <option key={formato.folio} value={formato.folio}>
                        {formato.tipoTramite} · {formato.folio} · {formato.duracionMinutos} min
                      </option>
                    ))}
                  </select>
                </label>
                <div className="cita-form-modal__row">
                  <label>
                    Fecha
                    <input type="date" name="fecha" min={localDateValue(new Date())} value={form.fecha} onChange={updateField} required />
                  </label>
                  <label>
                    Hora de inicio
                    <input type="time" name="horaInicio" value={form.horaInicio} onChange={updateField} required />
                  </label>
                  <div className="cita-form-modal__calculated">
                    <span>Duración asignada</span>
                    <output>{duracionMinutos ? `${duracionMinutos} min` : '—'}</output>
                  </div>
                  <div className="cita-form-modal__calculated">
                    <span>Hora de fin calculada</span>
                    <output>{horaFin || 'Fuera del día'}</output>
                  </div>
                </div>
                <label>
                  Motivo <span className="cita-form-modal__optional">(opcional)</span>
                  <textarea name="motivo" value={form.motivo} onChange={updateField} rows="3" maxLength="2000" />
                </label>
                {submitError && <p className="cita-form-modal__error" role="alert">{submitError}</p>}
                <footer className="cita-form-modal__actions">
                  <button type="button" className="cita-form-modal__cancel" onClick={onClose} disabled={submitting}>Cancelar</button>
                  <button type="submit" className="cita-form-modal__submit" disabled={submitting}>
                    {submitting ? 'Guardando...' : 'Guardar cita'}
                  </button>
                </footer>
              </>
            )}
          </form>
        )}
      </section>
    </div>
  )
}

export default CitaFormModal
