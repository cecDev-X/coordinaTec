import { useState } from 'react'
import AuthArtwork from '../components/AuthArtwork.jsx'
import LoginForm from '../components/LoginForm.jsx'
import '../css/login-page.css'

function LoginPage({ onLogin, onGoToStudentPortal }) {
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleLogin(credentials) {
    setSubmitting(true)
    setNotice('')
    try {
      await onLogin(credentials)
    } catch (error) {
      setNotice(error.message || 'No fue posible iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-page__panel" aria-labelledby="login-title">
        <div className="login-page__content">
          <header className="login-page__header">
            <img className="login-page__mascot" src="/tio.png" alt="Mascota del Tecnológico Nacional de México" />
            <h1 id="login-title">COORDINA TEC</h1>
            <p>Ingrese sus datos para acceder al sistema</p>
          </header>

          <LoginForm onSubmit={handleLogin} />
          {submitting && <p role="status">Iniciando sesión…</p>}

          {onGoToStudentPortal && (
            <p className="login-page__register">
              ¿Eres alumno?{' '}
              <button type="button" onClick={onGoToStudentPortal}>
                Ir al Portal Estudiantil Móvil
              </button>
            </p>
          )}

          <p className="login-page__notice" role="status">{notice}</p>
        </div>
      </section>

      <AuthArtwork />
    </main>
  )
}

export default LoginPage
