import { useState } from 'react'
import StudentIcon from '../components/StudentIcon.jsx'
import { loginStudentApi } from '../data/estudiantesData.js'
import '../css/student-login.css'

function StudentLoginPage({ cicloPortal = 'Ciclo 2024-B', onLoginSuccess, onSwitchToAdmin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')
    setIsSubmitting(true)

    const cleanUser = username.trim()
    const apiResult = await loginStudentApi(cleanUser, password)

    setIsSubmitting(false)

    if (apiResult && apiResult.token) {
      localStorage.setItem('coordinatec_student_token', apiResult.token)
    }

    onLoginSuccess(cleanUser || '23160887')
  }

  return (
    <div className="student-shell">
      <div className="student-shell__viewport student-login-viewport">
        <div className="student-login">
          {/* Banner Superior Institucional */}
          <header className="student-login__banner">
            <div className="student-login__banner-text">
              <span className="student-login__banner-kicker">TECNM · ITO</span>
              <h1 className="student-login__banner-title">Portal Estudiantil</h1>
            </div>
            <div className="student-login__cycle-badge">
              <span className="student-login__cycle-dot" aria-hidden="true" />
              <span>{cicloPortal}</span>
            </div>
          </header>

          {/* Tarjeta Principal de Login */}
          <section className="student-login__card" aria-labelledby="student-welcome-title">
            {/* Logo gráfico CoordinaTec */}
            <div className="student-login__brand" aria-hidden="true">
              <div className="student-login__bars">
                <span className="student-login__bar student-login__bar--top" />
                <span className="student-login__bar student-login__bar--mid">
                  <i className="student-login__bar-gray" />
                  <i className="student-login__bar-orange" />
                  <i className="student-login__bar-blue" />
                </span>
                <span className="student-login__bar student-login__bar--bot">
                  <i className="student-login__bar-gray-short" />
                  <i className="student-login__bar-blue-long" />
                </span>
              </div>
              <div className="student-login__brand-text">
                <span className="student-login__brand-dark">coordina</span>
                <span className="student-login__brand-blue">Tec</span>
              </div>
            </div>

            <h2 id="student-welcome-title" className="student-login__title">
              Bienvenido a CoordinaTec
            </h2>
            <p className="student-login__subtitle">
              Ingresa tus credenciales institucionales para gestionar tus trámites y citas académicas.
            </p>

            <form className="student-login__form" onSubmit={handleSubmit}>
              <div className="student-login__field-group">
                <label htmlFor="student-user" className="student-login__label">
                  Número de Control / Usuario <span className="student-login__req">*</span>
                </label>
                <div className="student-login__input-wrap">
                  <span className="student-login__input-icon">
                    <StudentIcon name="user-circle" size={20} />
                  </span>
                  <input
                    id="student-user"
                    type="text"
                    className="student-login__input"
                    placeholder="Ej. 21160452 o correo institucional"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="student-login__field-group">
                <label htmlFor="student-pass" className="student-login__label">
                  Contraseña <span className="student-login__req">*</span>
                </label>
                <div className="student-login__input-wrap">
                  <span className="student-login__input-icon">
                    <StudentIcon name="lock" size={19} />
                  </span>
                  <input
                    id="student-pass"
                    type={showPassword ? 'text' : 'password'}
                    className="student-login__input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="student-login__eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <StudentIcon name={showPassword ? 'eye-off' : 'eye'} size={20} />
                  </button>
                </div>
              </div>

              <div className="student-login__options">
                <label className="student-login__remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Recordarme</span>
                </label>

                <button
                  type="button"
                  className="student-login__forgot"
                  onClick={() =>
                    setNotice('Para recuperar tu contraseña acude al Centro de Cómputo o SII ITO.')
                  }
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                className="student-login__submit"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? 'INGRESANDO...' : 'INGRESAR'}</span>
                <StudentIcon name="arrow-right" size={19} />
              </button>
            </form>

            <div className="student-login__divider">
              <span>O INGRESA CON</span>
            </div>

            <div className="student-login__social-wrap">
              <button
                type="button"
                className="student-login__google-btn"
                onClick={() => onLoginSuccess('23160887@itoaxaca.edu.mx')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5Z"
                  />
                  <path
                    fill="#4285F4"
                    d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.3h5.9c-.3 1.4-1.1 2.6-2.3 3.4l3.6 2.8c2.1-2 3.3-4.9 3.3-8.3Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.8c-.2-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.8Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 20.4 7.4 23 12 23Z"
                  />
                </svg>
                <span>Google</span>
              </button>
            </div>

            <p className="student-login__register">
              ¿No tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() =>
                  setNotice('Tu cuenta institucional se activa automáticamente al inscribirte en el SII.')
                }
              >
                Regístrate
              </button>
            </p>

            {notice && (
              <p className="student-login__notice" role="status">
                {notice}
              </p>
            )}
          </section>

          <footer className="student-login__footer">
            <div className="student-login__footer-dept">
              <span className="student-login__footer-icon">
                <StudentIcon name="headset" size={16} />
              </span>
              <span>Dpto. de Sistemas y Computación</span>
            </div>

            {onSwitchToAdmin && (
              <button
                type="button"
                className="student-login__switch-role"
                onClick={onSwitchToAdmin}
              >
                Acceso Coordinación
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  )
}

export default StudentLoginPage