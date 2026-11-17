import { useEffect, useState } from 'react'
import StudentIcon from '../components/StudentIcon.jsx'
import { fetchCarrerasApi, registerStudentApi } from '../data/estudiantesData.js'
import { nameIsValid, passwordIsValid } from '../data/registroValidation.js'
import PasswordRules from '../components/PasswordRules.jsx'
import '../css/student-login.css'

function currentCycleLabel(date = new Date()) {
  const month = date.getMonth()
  const year = date.getFullYear()
  if (month <= 5) return `Enero - Junio ${year}`
  if (month === 6) return `Periodo intersemestral ${year}`
  return `Agosto - Diciembre ${year}`
}

function StudentRegisterPage({ onRegisterSuccess, onBackToLogin }) {
  const [form, setForm] = useState({ numControl: '', nombres: '', apellidos: '', carrera: '', correo: '', password: '', confirmPassword: '' })
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [carreras, setCarreras] = useState([])
  const [loadingCarreras, setLoadingCarreras] = useState(true)
  const [touched, setTouched] = useState({})

  useEffect(() => {
    const controller = new AbortController()
    fetchCarrerasApi({ signal: controller.signal })
      .then(setCarreras)
      .catch(() => {
        if (!controller.signal.aborted) setNotice('No se pudieron cargar las carreras. Intenta de nuevo más tarde.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCarreras(false)
      })
    return () => controller.abort()
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: name === 'numControl' ? value.toUpperCase() : value }))
    setTouched((current) => ({ ...current, [name]: true }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')
    setTouched({ numControl: true, nombres: true, apellidos: true, correo: true, password: true, confirmPassword: true })
    if (!/^(?:\d{8}|C\d{8})$/.test(form.numControl)) {
      setNotice('El número de control debe tener 8 dígitos o C seguida de 8 dígitos.')
      return
    }
    if (![form.nombres, form.apellidos].every(nameIsValid)) {
      setNotice('El nombre y los apellidos solo pueden contener letras y espacios.')
      return
    }
    if (!passwordIsValid(form.password)) {
      setNotice('La contraseña debe tener entre 8 y 72 caracteres e incluir minúscula, mayúscula, número y signo especial.')
      return
    }
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
            </div>
            <img className="student-login__tecnm-logo" src="/tecnm.webp" alt="Tecnológico Nacional de México" />
            <div className="student-login__cycle-badge"><span className="student-login__cycle-dot" aria-hidden="true" /><span>Ciclo {currentCycleLabel()}</span></div>
          </header>

          <section className="student-login__card" aria-labelledby="student-register-title">
            <img className="student-login__tio-logo" src="/tio.png" alt="Mascota del Tecnológico Nacional de México" />
            <h2 id="student-register-title" className="student-login__title">Crear cuenta estudiantil</h2>
            <p className="student-login__subtitle">Registra tus datos para acceder a CoordinaTec.</p>

            <form className="student-login__form" onSubmit={handleSubmit}>
              <label className="student-login__field-group">
                <span className="student-login__label">Número de control <span className="student-login__req">*</span></span>
                <span className="student-login__input-wrap"><span className="student-login__input-icon"><StudentIcon name="user-circle" size={20} /></span>
                   <input className="student-login__input" name="numControl" placeholder="Ej. 23160887 o C23160887" value={form.numControl} onChange={updateField} maxLength={9} pattern="(?:[0-9]{8}|C[0-9]{8})" title="8 dígitos o C seguida de 8 dígitos." autoComplete="username" required />
                 </span>
                 <span className="student-register__hint">8 dígitos; si cambiaste de carrera, C seguida de 8 dígitos.</span>
              </label>
              <label className="student-login__field-group">
                <span className="student-login__label">Nombre(s) <span className="student-login__req">*</span></span>
                 <input className={`student-login__input student-register__plain-input ${touched.nombres && form.nombres && !nameIsValid(form.nombres) ? 'is-invalid' : ''}`} aria-invalid={Boolean(touched.nombres && form.nombres && !nameIsValid(form.nombres))} name="nombres" value={form.nombres} onChange={updateField} maxLength={100} autoComplete="given-name" required />
                 {touched.nombres && form.nombres && !nameIsValid(form.nombres) && <span className="student-register__hint student-register__hint--error">Solo se permiten letras y espacios, sin números ni signos.</span>}
              </label>
              <label className="student-login__field-group">
                <span className="student-login__label">Apellidos <span className="student-login__req">*</span></span>
                 <input className={`student-login__input student-register__plain-input ${touched.apellidos && form.apellidos && !nameIsValid(form.apellidos) ? 'is-invalid' : ''}`} aria-invalid={Boolean(touched.apellidos && form.apellidos && !nameIsValid(form.apellidos))} name="apellidos" value={form.apellidos} onChange={updateField} maxLength={100} autoComplete="family-name" required />
                 {touched.apellidos && form.apellidos && !nameIsValid(form.apellidos) && <span className="student-register__hint student-register__hint--error">Solo se permiten letras y espacios, sin números ni signos.</span>}
              </label>
              <label className="student-login__field-group">
                <span className="student-login__label">Carrera <span className="student-login__req">*</span></span>
                <select className="student-login__input student-register__plain-input" name="carrera" value={form.carrera} onChange={updateField} disabled={loadingCarreras || carreras.length === 0} required>
                  <option value="">Selecciona tu carrera</option>
                  {carreras.map((carrera) => <option key={carrera} value={carrera}>{carrera}</option>)}
                </select>
              </label>
              <label className="student-login__field-group">
                <span className="student-login__label">Correo electrónico <span className="student-login__req">*</span></span>
                <input className="student-login__input student-register__plain-input" type="email" name="correo" value={form.correo} onChange={updateField} maxLength={254} autoComplete="email" required />
                <span className="student-register__hint">Usa un correo al que tengas acceso: ahí recibirás notificaciones y actualizaciones sobre tus trámites.</span>
              </label>
              <label className="student-login__field-group">
                <span className="student-login__label">Contraseña <span className="student-login__req">*</span></span>
                 <input className={`student-login__input student-register__plain-input ${touched.password && form.password && !passwordIsValid(form.password) ? 'is-invalid' : ''}`} aria-invalid={Boolean(touched.password && form.password && !passwordIsValid(form.password))} type="password" name="password" value={form.password} onChange={updateField} minLength={8} maxLength={72} autoComplete="new-password" required />
                 <PasswordRules password={form.password} showErrors={touched.password} />
              </label>
              <label className="student-login__field-group">
                <span className="student-login__label">Confirmar contraseña <span className="student-login__req">*</span></span>
                 <input className={`student-login__input student-register__plain-input ${touched.confirmPassword && form.confirmPassword && form.confirmPassword !== form.password ? 'is-invalid' : ''}`} aria-invalid={Boolean(touched.confirmPassword && form.confirmPassword && form.confirmPassword !== form.password)} type="password" name="confirmPassword" value={form.confirmPassword} onChange={updateField} minLength={8} maxLength={72} autoComplete="new-password" required />
                 {touched.confirmPassword && form.confirmPassword && form.confirmPassword !== form.password && <span className="student-register__hint student-register__hint--error">Las contraseñas no coinciden.</span>}
              </label>
              <button type="submit" className="student-login__submit" disabled={isSubmitting || loadingCarreras || carreras.length === 0}>
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
