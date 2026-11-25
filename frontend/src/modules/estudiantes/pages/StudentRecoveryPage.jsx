import { useState } from 'react'
import StudentAuthShell from '../components/StudentAuthShell.jsx'
import { requestCoordinatorPasswordResetApi, requestPasswordResetApi } from '../data/estudiantesData.js'

function StudentRecoveryPage({ onBackToLogin, initialAccountType = 'estudiante' }) {
  const [correo, setCorreo] = useState('')
  const [username, setUsername] = useState('')
  const [accountType, setAccountType] = useState(initialAccountType)
  const [notice, setNotice] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setNotice('')
    setLoading(true)
    try {
      const result = accountType === 'estudiante'
        ? await requestPasswordResetApi(correo)
        : await requestCoordinatorPasswordResetApi(username, correo)
      setNotice(result.mensaje)
      setSent(true)
    } catch (error) {
      setNotice(error.message || 'No se pudo solicitar el enlace. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return <StudentAuthShell title="Recuperar contraseña" subtitle="Solicita un enlace seguro para crear una contraseña nueva.">
    {!sent && <form className="student-login__form" onSubmit={submit}>
      <label className="student-login__field-group">
        <span className="student-login__label">Tipo de cuenta <span className="student-login__req">*</span></span>
        <select className="student-login__input student-register__plain-input" value={accountType} onChange={(event) => setAccountType(event.target.value)}>
          <option value="estudiante">Estudiante</option>
          <option value="coordinacion">Coordinación</option>
        </select>
      </label>
      {accountType === 'coordinacion' && <label className="student-login__field-group">
        <span className="student-login__label">Usuario o RFC <span className="student-login__req">*</span></span>
        <input className="student-login__input student-register__plain-input" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} maxLength={120} required />
      </label>}
      <label className="student-login__field-group">
        <span className="student-login__label">Correo de recuperación <span className="student-login__req">*</span></span>
        <input className="student-login__input student-register__plain-input" type="email" autoComplete="email" value={correo} onChange={(event) => setCorreo(event.target.value)} maxLength={254} required />
      </label>
      <p className="student-register__hint">Para cuentas de coordinación, usa el correo de recuperación que registraste en tu perfil. El enlace vence en 30 minutos y solo puede utilizarse una vez. Revisa también la carpeta de correo no deseado.</p>
      <button className="student-login__submit" type="submit" disabled={loading}>{loading ? 'ENVIANDO…' : 'ENVIAR ENLACE'}</button>
    </form>}
    {notice && <p className="student-login__notice" role={sent ? 'status' : 'alert'}>{notice}</p>}
    <p className="student-login__register"><button type="button" onClick={onBackToLogin}>Volver a iniciar sesión</button></p>
  </StudentAuthShell>
}

export default StudentRecoveryPage
