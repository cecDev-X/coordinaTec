import { useEffect, useState } from 'react'
import StudentAuthShell from '../components/StudentAuthShell.jsx'
import StudentIcon from '../components/StudentIcon.jsx'
import { confirmStudentEmailApi } from '../data/estudiantesData.js'

function StudentEmailVerificationPage({ onBackToLogin }) {
  const [token] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] || '').get('token') || '')
  const [state, setState] = useState(() => token
    ? { loading: true, success: false, message: 'Confirmando tu correo…' }
    : { loading: false, success: false, message: 'El enlace no contiene un token de confirmación.' })

  useEffect(() => {
    let active = true
    if (!token) return undefined
    confirmStudentEmailApi(token).then((result) => {
      if (active) setState({ loading: false, success: true, message: result.mensaje })
    }).catch((error) => {
      if (active) setState({ loading: false, success: false, message: error.message || 'El enlace es inválido, venció o ya fue utilizado.' })
    }).finally(() => {
      if (active) window.history.replaceState(null, '', '#/estudiante/confirmar-correo')
    })
    return () => { active = false }
  }, [token])

  return <StudentAuthShell title="Confirmación de correo" subtitle="Verifica tu dirección para activar el acceso al portal estudiantil.">
    <div className={`student-register__confirmation ${state.success ? 'is-success' : ''}`} role={state.loading ? 'status' : state.success ? 'status' : 'alert'}>
      <span className="student-register__confirmation-icon">
        <StudentIcon name={state.loading ? 'clock' : state.success ? 'check-circle' : 'info'} size={25} />
      </span>
      <h3>{state.loading ? 'Un momento…' : state.success ? 'Correo confirmado' : 'No se pudo confirmar'}</h3>
      <p>{state.message}</p>
      {!state.loading && <button type="button" className="student-login__submit" onClick={onBackToLogin}>
        IR A INICIAR SESIÓN
      </button>}
    </div>
  </StudentAuthShell>
}

export default StudentEmailVerificationPage
