import { useState } from 'react'
import StudentAuthShell from '../components/StudentAuthShell.jsx'
import { requestPasswordResetApi } from '../data/estudiantesData.js'

function StudentRecoveryPage({ onBackToLogin }) {
  const [correo, setCorreo] = useState('')
  const [notice, setNotice] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setNotice('')
    setLoading(true)
    try {
      const result = await requestPasswordResetApi(correo)
      setNotice(result.mensaje)
      setSent(true)
    } catch (error) {
      setNotice(error.message || 'No se pudo solicitar el enlace. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return <StudentAuthShell title="Recuperar contraseña" subtitle="Escribe el correo registrado en tu cuenta estudiantil. Si coincide, recibirás un enlace para crear una contraseña nueva.">
    {!sent && <form className="student-login__form" onSubmit={submit}>
      <label className="student-login__field-group">
        <span className="student-login__label">Correo electrónico <span className="student-login__req">*</span></span>
        <input className="student-login__input student-register__plain-input" type="email" autoComplete="email" value={correo} onChange={(event) => setCorreo(event.target.value)} maxLength={254} required />
      </label>
      <p className="student-register__hint">El enlace vence en 30 minutos y solo podrá utilizarse una vez. Revisa también tu carpeta de correo no deseado.</p>
      <button className="student-login__submit" type="submit" disabled={loading}>{loading ? 'ENVIANDO…' : 'ENVIAR ENLACE'}</button>
    </form>}
    {notice && <p className="student-login__notice" role={sent ? 'status' : 'alert'}>{notice}</p>}
    <p className="student-login__register"><button type="button" onClick={onBackToLogin}>Volver a iniciar sesión</button></p>
  </StudentAuthShell>
}

export default StudentRecoveryPage
