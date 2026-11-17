import { useEffect, useState } from 'react'
import StudentAuthShell from '../components/StudentAuthShell.jsx'
import PasswordRules from '../components/PasswordRules.jsx'
import { passwordIsValid } from '../data/registroValidation.js'
import { confirmPasswordResetApi, validatePasswordResetApi } from '../data/estudiantesData.js'

function StudentResetPage({ onBackToLogin, onRequestNew }) {
  const token = new URLSearchParams(window.location.hash.split('?')[1] || '').get('token') || ''
  const [valid, setValid] = useState(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    let active = true
    if (!token) return undefined
    validatePasswordResetApi(token).then((result) => {
      if (active) setValid(Boolean(result.valido))
    }).catch(() => { if (active) setNotice('No se pudo verificar el enlace. Intenta de nuevo.') })
    return () => { active = false }
  }, [token])

  async function submit(event) {
    event.preventDefault()
    setTouched(true)
    setNotice('')
    if (!passwordIsValid(password) || password !== confirm) return
    setLoading(true)
    try {
      const result = await confirmPasswordResetApi(token, password)
      setComplete(true)
      setNotice(result.mensaje)
      sessionStorage.removeItem('coordinaTecStudentControl')
      sessionStorage.removeItem('coordinaTecStudentToken')
      window.history.replaceState(null, '', '#/estudiante/restablecer')
    } catch (error) {
      setNotice(error.message || 'No se pudo cambiar la contraseña.')
      if (error.status === 400 && error.message?.includes('enlace')) setValid(false)
    } finally {
      setLoading(false)
    }
  }

  return <StudentAuthShell title="Nueva contraseña" subtitle="Elige una contraseña segura para volver a acceder a CoordinaTec.">
    {!token && !complete && <p className="student-login__notice" role="alert">Falta el enlace de recuperación. Solicita uno nuevo.</p>}
    {token && valid === null && !notice && <p className="student-login__notice" role="status">Verificando enlace…</p>}
    {valid === false && !complete && <p className="student-login__notice" role="alert">El enlace es inválido, ya fue utilizado o venció. Solicita uno nuevo.</p>}
    {valid && !complete && <form className="student-login__form" onSubmit={submit} noValidate>
      <label className="student-login__field-group">
        <span className="student-login__label">Nueva contraseña <span className="student-login__req">*</span></span>
        <input className={`student-login__input student-register__plain-input ${touched && !passwordIsValid(password) ? 'is-invalid' : ''}`} aria-invalid={touched && !passwordIsValid(password)} type="password" autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setTouched(true) }} maxLength={72} required />
        <PasswordRules password={password} showErrors={touched} />
      </label>
      <label className="student-login__field-group">
        <span className="student-login__label">Confirma la contraseña <span className="student-login__req">*</span></span>
        <input className={`student-login__input student-register__plain-input ${touched && confirm && confirm !== password ? 'is-invalid' : ''}`} aria-invalid={Boolean(touched && confirm && confirm !== password)} type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} maxLength={72} required />
        {touched && confirm !== password && <span className="student-register__hint student-register__hint--error">Las contraseñas no coinciden.</span>}
      </label>
      <button className="student-login__submit" type="submit" disabled={loading}>{loading ? 'GUARDANDO…' : 'CAMBIAR CONTRASEÑA'}</button>
    </form>}
    {notice && <p className="student-login__notice" role={complete ? 'status' : 'alert'}>{notice}</p>}
    {complete ? <p className="student-login__register"><button type="button" onClick={onBackToLogin}>Iniciar sesión</button></p>
      : <p className="student-login__register"><button type="button" onClick={onRequestNew}>Solicitar otro enlace</button>{' · '}<button type="button" onClick={onBackToLogin}>Volver al inicio</button></p>}
  </StudentAuthShell>
}

export default StudentResetPage
