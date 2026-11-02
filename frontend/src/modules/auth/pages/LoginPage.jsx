import { useState } from 'react'
import BrandLogo from '../../../components/BrandLogo.jsx'
import AuthArtwork from '../components/AuthArtwork.jsx'
import LoginForm from '../components/LoginForm.jsx'
import SocialLogin from '../components/SocialLogin.jsx'
import '../css/login-page.css'

function LoginPage({ onLogin, onGoToStudentPortal }) {
  const [notice, setNotice] = useState('')

  function handleLogin(username) {
    onLogin(username)
  }

  function handleSocialLogin(provider) {
    setNotice(`El acceso con ${provider} estará disponible al configurar la autenticación.`)
  }

  return (
    <main className="login-page">
      <section className="login-page__panel" aria-labelledby="login-title">
        <div className="login-page__content">
          <header className="login-page__header">
            <BrandLogo />
            <h1 id="login-title">COORDINA TEC</h1>
            <p>Ingrese sus datos para acceder al sistema</p>
          </header>

          <LoginForm onSubmit={handleLogin} />
          <SocialLogin onSelect={handleSocialLogin} />

          <p className="login-page__register">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              onClick={() => setNotice('El registro de cuentas estará disponible próximamente.')}
            >
              Regístrate
            </button>
          </p>

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