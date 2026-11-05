import { useState } from 'react'
import StudentIcon from '../components/StudentIcon.jsx'
import { registerStudentApi } from '../data/estudiantesData.js'
import '../css/student-login.css'

function currentCycleLabel(date = new Date()) {
  const month = date.getMonth()
  const year = date.getFullYear()
  if (month <= 5) return `Enero - Junio ${year}`
  if (month === 6) return `Periodo intersemestral ${year}`
  return `Agosto - Diciembre ${year}`
}

function StudentRegisterPage({ onRegisterSuccess, onBackToLogin }) {
  const [form, setForm] = useState({ numControl: '', nombres: '', apellidos: '', carrera: '', password: '', confirmPassword: '' })
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')
    if (form.password !== form.confirmPassword) {
      setNotice('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)
    try {
      const student = await registerStudentApi(form)
      onRegisterSuccess(student)
    } catch (error) {
      setNotice(error.status === 409 ? 'Ya existe una cuenta con ese número de control.' : error.message || 'No se pudo crear la cuenta. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="student-shell">
      <div className="student-shell__viewport student-login-viewport">
        <div className="student-login">
          <header className="student-login__banner">
            <div className="student-login__banner-text">
              <span className="student-login__banner-kicker">TECNM · ITO</span>
              <h1 className="student-login__banner-title">Portal Estudiantil</h1>
              <div className="student-login__cycle-badge"><span className="student-login__cycle-dot" aria-hidden="true" /><span>Ciclo {currentCycleLabel()}</span></div>
            </div>
            <img className="student-login__tecnm-logo" src="/tecnm.webp" alt="Tecnológico Nacional de México" />
          </header>

          <section className="student-login__card" aria-labelledby="student-register-title">
            <img className="student-login__tio-logo" src="/tio.png" alt="Mascota del Tecnológico Nacional de México" />
            <h2 id="student-register-title" className="student-login__title">Crear cuenta estudiantil</h2>
            <p className="student-login__subtitle">Registra tus datos para acceder a CoordinaTec.</p>

            <form className="student-login__form" onSubmit={handleSubmit}>
              <label className="student-login__field-group">
                <span className="student-login__label">Número de control <span className="student-login__req">*</span></span>
                <span className="student-login__input-wrap"><span className="student-login__input-icon"><StudentIcon name="user-circle" size={20} /></span>
                  <input className="student-login__input" name="numControl" placeholder="Ej. 23160887" value={form.numControl} onChange={updateField} maxLength={15} pattern="[A-Za-z0-9]{1,15}" title="Usa de 1 a 15 letras o números." autoComplete="username" required />
                </span>
              </label>
              <label className="student-login__field-group">
                <span className="student-login__label">Nombre(s) <span className="student-login__req">*</span></span>
                <input className="student-login__input student-register__plain-input" name="nombres" value={form.nombres} onChange={updateField} maxLength={100} autoComplete="given-name" required />
              </label>
              <label className="student-login__field-group">
                <span className="student-login__label">Apellidos <span className="student-login__req">*</span></span>
                <input className="student-login__input student-register__plain-input" name="apellidos" value={form.apellidos} onChange={updateField} maxLength={100} autoComplete="family-name" required />
              </label>
              <label className="student-login__field-group">
                <span className="student-login__label">Carrera <span className="student-login__req">*</span></span>
                <input className="student-login__input student-register__plain-input" name="carrera" placeholder="Ej. Ingeniería en Sistemas Computacionales" value={form.carrera} onChange={updateField} maxLength={100} required />
              </label>
              <label className="student-login__field-group">
                <span className="student-login__label">Contraseña <span className="student-login__req">*</span></span>
                <input className="student-login__input student-register__plain-input" type="password" name="password" value={form.password} onChange={updateField} minLength={8} maxLength={72} autoComplete="new-password" required />
                <span className="student-register__hint">Usa al menos 8 caracteres.</span>
              </label>
              <label className="student-login__field-group">
                <span className="student-login__label">Confirmar contraseña <span className="student-login__req">*</span></span>
                <input className="student-login__input student-register__plain-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={updateField} minLength={8} maxLength={72} autoComplete="new-password" required />
              </label>
              <button type="submit" className="student-login__submit" disabled={isSubmitting}>
                <span>{isSubmitting ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}</span><StudentIcon name="arrow-right" size={19} />
              </button>
            </form>

            {notice && <p className="student-login__notice" role="alert">{notice}</p>}
            <p className="student-login__register">¿Ya tienes cuenta? <button type="button" onClick={onBackToLogin}>Inicia sesión</button></p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default StudentRegisterPage
