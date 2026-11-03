import { useState } from 'react'
import StudentTopbar from '../components/StudentTopbar.jsx'
import StudentBottomNav from '../components/StudentBottomNav.jsx'
import StudentIcon from '../components/StudentIcon.jsx'
import '../css/student-profile.css'

function StudentProfilePage({
  student,
  onUpdateStudent,
  onNavigateTab,
  onLogout,
}) {
  const [copied, setCopied] = useState(false)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [phoneDraft, setPhoneDraft] = useState(student.telefono)

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(student.correo)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  function handleToggleEditPhone() {
    if (isEditingPhone) {
      onUpdateStudent({ telefono: phoneDraft.trim() || student.telefono })
      setIsEditingPhone(false)
    } else {
      setPhoneDraft(student.telefono)
      setIsEditingPhone(true)
    }
  }

  return (
    <div className="student-shell">
      <div className="student-shell__viewport">
        <StudentTopbar
          subtitle="Perfil"
          initials={student.iniciales}
          onAvatarClick={() => {}}
        />

        <main className="student-main student-profile">
          {/* Hero Card Azul de Perfil */}
          <section className="student-profile__hero" aria-label="Resumen de estudiante">
            <div className="student-profile__avatar-large">{student.iniciales}</div>

            <h1 className="student-profile__name">{student.nombre}</h1>
            <p className="student-profile__career">{student.carrera}</p>

            <div className="student-profile__control-pill">
              <StudentIcon name="id-card" size={16} />
              <span>NO. CONTROL: {student.numControl}</span>
            </div>

            <div className="student-profile__badges-row">
              <span className="student-profile__badge student-profile__badge--green">
                <i className="student-profile__green-dot" aria-hidden="true" />
                {student.estatusLargo}
              </span>

              <span className="student-profile__badge student-profile__badge--glass">
                <StudentIcon name="grad-cap" size={15} />
                <span>{student.semestre}</span>
              </span>
            </div>
          </section>

          {/* Datos Institucionales */}
          <section className="student-profile__section" aria-labelledby="datos-inst-heading">
            <div className="student-profile__section-header">
              <div className="student-profile__section-title-wrap">
                <span className="student-profile__section-icon">
                  <StudentIcon name="id-card" size={19} />
                </span>
                <h2 id="datos-inst-heading" className="student-profile__section-title">
                  Datos Institucionales
                </h2>
              </div>

              <button
                type="button"
                className="student-profile__edit-btn"
                onClick={handleToggleEditPhone}
              >
                <StudentIcon name={isEditingPhone ? 'check' : 'edit'} size={14} />
                <span>{isEditingPhone ? 'Guardar' : 'Modificar'}</span>
              </button>
            </div>

            <div className="student-profile__card">
              <div className="student-profile__info-tile">
                <div className="student-profile__tile-icon">
                  <StudentIcon name="at" size={19} />
                </div>
                <div className="student-profile__tile-body">
                  <span className="student-profile__tile-label">CORREO INSTITUCIONAL</span>
                  <strong className="student-profile__tile-value">{student.correo}</strong>
                </div>
                <button
                  type="button"
                  className="student-profile__copy-btn"
                  onClick={handleCopyEmail}
                  aria-label="Copiar correo institucional"
                  title="Copiar correo"
                >
                  <StudentIcon name={copied ? 'check' : 'copy'} size={18} />
                </button>
              </div>

              <div className="student-profile__info-tile">
                <div className="student-profile__tile-icon">
                  <StudentIcon name="phone" size={19} />
                </div>
                <div className="student-profile__tile-body">
                  <span className="student-profile__tile-label">TELÉFONO REGISTRADO</span>
                  {isEditingPhone ? (
                    <input
                      type="tel"
                      className="student-profile__phone-input"
                      value={phoneDraft}
                      onChange={(e) => setPhoneDraft(e.target.value)}
                      aria-label="Editar teléfono registrado"
                    />
                  ) : (
                    <strong className="student-profile__tile-value">{student.telefono}</strong>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Ajustes y Accesibilidad */}
          <section className="student-profile__section" aria-labelledby="ajustes-heading">
            <div className="student-profile__section-header">
              <div className="student-profile__section-title-wrap">
                <span className="student-profile__section-icon">
                  <StudentIcon name="sliders" size={19} />
                </span>
                <h2 id="ajustes-heading" className="student-profile__section-title">
                  Ajustes y Accesibilidad
                </h2>
              </div>
            </div>

            <div className="student-profile__card">
              <div className="student-profile__setting-row">
                <div className="student-profile__setting-left">
                  <div className="student-profile__setting-icon">
                    <StudentIcon name="bell" size={19} />
                  </div>
                  <div className="student-profile__setting-texts">
                    <strong>Notificaciones de Citas</strong>
                    <span>Alertas sonoras 15 min antes</span>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={student.notificacionesCitas}
                  aria-label="Notificaciones de Citas"
                  className={`student-profile__switch ${
                    student.notificacionesCitas ? 'is-on' : ''
                  }`}
                  onClick={() =>
                    onUpdateStudent({ notificacionesCitas: !student.notificacionesCitas })
                  }
                >
                  <span className="student-profile__switch-thumb" />
                </button>
              </div>

              <div className="student-profile__setting-row">
                <div className="student-profile__setting-left">
                  <div className="student-profile__setting-icon">
                    <StudentIcon name="mail-forward" size={19} />
                  </div>
                  <div className="student-profile__setting-texts">
                    <strong>Recordatorios por Correo</strong>
                    <span>Resumen a tu correo institucional</span>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={student.recordatoriosCorreo}
                  aria-label="Recordatorios por Correo"
                  className={`student-profile__switch ${
                    student.recordatoriosCorreo ? 'is-on' : ''
                  }`}
                  onClick={() =>
                    onUpdateStudent({ recordatoriosCorreo: !student.recordatoriosCorreo })
                  }
                >
                  <span className="student-profile__switch-thumb" />
                </button>
              </div>

              <button
                type="button"
                className="student-profile__logout-btn"
                onClick={onLogout}
              >
                <StudentIcon name="logout" size={19} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </section>

          {/* Footer Institucional */}
          <footer className="student-profile__footer">
            <div className="student-profile__footer-brand">
              <StudentIcon name="grad-cap" size={16} />
              <span>TECNM OAXACA</span>
            </div>
            <p className="student-profile__footer-dept">
              CoordinaTec Móvil • Depto. de Sistemas y
              <br />
              Computación
            </p>
            <span className="student-profile__footer-copy">
              © 2026 INSTITUTO TECNOLÓGICO DE OAXACA
            </span>
          </footer>
        </main>

        <StudentBottomNav activeTab="student-profile" onNavigate={onNavigateTab} />
      </div>
    </div>
  )
}

export default StudentProfilePage