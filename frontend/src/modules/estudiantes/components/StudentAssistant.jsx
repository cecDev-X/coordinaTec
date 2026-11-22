import { useEffect, useRef, useState } from 'react'
import StudentIcon from './StudentIcon.jsx'
import '../css/student-assistant.css'

function StudentAssistant({ onNavigate }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottom = useRef(null)
  const input = useRef(null)

  useEffect(() => { if (open) input.current?.focus() }, [open])
  useEffect(() => { if (open) bottom.current?.scrollIntoView({ block: 'end' }) }, [messages, loading, open])

  async function send(event) {
    event.preventDefault()
    const pregunta = draft.trim()
    if (!pregunta || loading) return
    const previous = messages
    setMessages((current) => [...current, { pregunta, respuesta: '' }])
    setDraft('')
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/v1/asistente/consultar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('coordinaTecStudentToken') || ''}` },
        body: JSON.stringify({ mensaje: pregunta, historial: previous.slice(-4).map(({ pregunta: q, respuesta }) => ({ pregunta: q, respuesta })) }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.mensaje || 'No se pudo consultar al asistente.')
      setMessages((current) => current.map((item, index) => index === current.length - 1 ? { ...item, respuesta: result.respuesta } : item))
    } catch (cause) {
      setMessages(previous)
      setDraft(pregunta)
      setError(cause.message || 'No se pudo consultar al asistente. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return <div className="student-assistant">
    {open && <section className="student-assistant__panel" role="dialog" aria-label="Asistente de trámites">
      <header className="student-assistant__header">
        <div><strong>Asistente CoordinaTec</strong><small>Orientación sobre trámites y citas</small></div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar asistente">✕</button>
      </header>
      <div className="student-assistant__conversation" role="log" aria-live="polite">
        <p className="student-assistant__reply">¡Hola! Puedo ayudarte con los trámites habilitados para tu carrera y explicarte cómo agendar una cita. No puedo consultar ni cambiar tus reservas.</p>
        {messages.map((item, index) => <div key={index}>
          <p className="student-assistant__question">{item.pregunta}</p>
          {item.respuesta && <p className="student-assistant__reply">{item.respuesta}</p>}
        </div>)}
        {loading && <p className="student-assistant__reply" role="status">Escribiendo respuesta…</p>}
        <div ref={bottom} />
      </div>
      {error && <p className="student-assistant__error" role="alert">{error}</p>}
      <form className="student-assistant__form" onSubmit={send}>
        <label className="student-assistant__label" htmlFor="student-assistant-input">Tu pregunta</label>
        <div className="student-assistant__form-row">
          <input id="student-assistant-input" ref={input} value={draft} onChange={(event) => setDraft(event.target.value)}
            placeholder="Ej. ¿Qué necesito para mi trámite?" maxLength={500} disabled={loading} required />
          <button type="submit" disabled={loading || !draft.trim()}>Enviar</button>
        </div>
      </form>
      <p className="student-assistant__disclaimer">Puede equivocarse. Confirma requisitos con tu coordinación. No compartas contraseñas ni datos sensibles.</p>
      <button type="button" className="student-assistant__link" onClick={() => { setOpen(false); onNavigate('student-home') }}>
        Ver trámites y solicitar cita <StudentIcon name="arrow-right" size={14} />
      </button>
    </section>}
    <button type="button" className="student-assistant__launcher" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? 'Cerrar asistente' : 'Abrir asistente de trámites'}>
      {open ? '✕ Cerrar' : '¿Necesitas ayuda?'}
    </button>
  </div>
}

export default StudentAssistant
