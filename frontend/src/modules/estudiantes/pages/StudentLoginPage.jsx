import { useState } from 'react'
import StudentIcon from '../components/StudentIcon.jsx'
import { loginStudentApi } from '../data/estudiantesData.js'
import '../css/student-login.css'

function currentCycleLabel(date = new Date()) {
  const month = date.getMonth()
  const year = date.getFullYear()
  if (month <= 5) return `Enero - Junio ${year}`
  if (month === 6) return `Periodo intersemestral ${year}`
  return `Agosto - Diciembre ${year}`
}

function StudentLoginPage({ onLoginSuccess, onSwitchToAdmin, onGoToRegister }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')
    setIsSubmitting(true)

    try {
      const cleanIdentifier = identifier.trim()
      const controlPattern = /^[a-z0-9]{1,15}$/i

      if (!controlPattern.test(cleanIdentifier)) {
        setNotice('Ingresa un número de control válido, sin correo electrónico.')
        return
      }

      const student = await loginStudentApi(cleanIdentifier, password)
      onLoginSuccess(student)
    } catch {
      setNotice('Número de control o contraseña incorrectos.')
    } finally {
      setIsSubmitting(false)
    }
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
              <div className="student-login__cycle-badge">
                <span className="student-login__cycle-dot" aria-hidden="true" />
                <span>Ciclo {currentCycleLabel()}</span>
              </div>
            </div>
            <img className="student-login__tecnm-logo" src="/tecnm.webp" alt="Tecnológico Nacional de México" />
          </header>

          {/* Tarjeta Principal de Login */}
          <section className="student-login__card" aria-labelledby="student-welcome-title">
            <img className="student-login__tio-logo" src="/tio.png" alt="Mascota del Tecnológico Nacional de México" />

            <h2 id="student-welcome-title" className="student-login__title">
              Bienvenido a CoordinaTec
            </h2>
            <p className="student-login__subtitle">Ingresa tu número de control y contraseña para consultar tus trámites y citas académicas.</p>

            <form className="student-login__form" onSubmit={handleSubmit}>
              <div className="student-login__field-group">
                <label htmlFor="student-identifier" className="student-login__label">
                  Número de Control <span className="student-login__req">*</span>
                </label>
                <div className="student-login__input-wrap">
                  <span className="student-login__input-icon">
                    <StudentIcon name="user-circle" size={20} />
                  </span>
                  <input
                    id="student-identifier"
                    type="text"
                    className="student-login__input"
                    name="identifier"
                    placeholder="Ej. DEMO0001"
                    value={identifier}
                    maxLength={15}
                    inputMode="text"
                    autoCapitalize="none"
                    pattern="[A-Za-z0-9]{1,15}"
                    title="Ingresa el número de control, no un correo electrónico."
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="student-login__field-group">
                <label htmlFor="student-password" className="student-login__label">
                  Contraseña <span className="student-login__req">*</span>
                </label>
                <div className="student-login__input-wrap">
                  <span className="student-login__input-icon">
                    <StudentIcon name="lock" size={19} />
                  </span>
                  <input
                    id="student-password"
                    type={showPassword ? 'text' : 'password'}
                    className="student-login__input"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="student-login__eye-btn"
                    onClick={() => setShowPassword((visible) => !visible)}
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
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Recordarme</span>
                </label>
                <button
                  type="button"
                  className="student-login__forgot"
                  onClick={() => setNotice('La recuperación de contraseña estará disponible al integrar la autenticación institucional.')}
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

            <p className="student-login__register">
              ¿Primera vez en CoordinaTec?{' '}
              <button type="button" onClick={onGoToRegister}>Regístrate aquí</button>
            </p>

            {notice && (
              <p className="student-login__notice" role="status">
                {notice}
              </p>
            )}
          </section>

          <footer className="student-login__footer">
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
