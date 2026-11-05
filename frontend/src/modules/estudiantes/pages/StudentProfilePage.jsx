import StudentTopbar from '../components/StudentTopbar.jsx'
import StudentBottomNav from '../components/StudentBottomNav.jsx'
import StudentIcon from '../components/StudentIcon.jsx'
import '../css/student-profile.css'

function StudentProfilePage({ student, onNavigateTab, onLogout }) {
  return (
    <div className="student-shell">
      <div className="student-shell__viewport">
        <StudentTopbar subtitle="Perfil" initials={student.iniciales} onAvatarClick={() => {}} />

        <main className="student-main student-profile">
          <section className="student-profile__hero" aria-label="Perfil de estudiante">
            <div className="student-profile__avatar-large">{student.iniciales}</div>
            <h1 className="student-profile__name">{student.nombre}</h1>
            <p className="student-profile__career">{student.carrera}</p>
            <div className="student-profile__control-pill">
              <StudentIcon name="id-card" size={16} />
              <span>NÚMERO DE CONTROL: {student.numControl}</span>
            </div>
          </section>

          <section className="student-profile__section" aria-labelledby="datos-inst-heading">
            <div className="student-profile__section-header">
              <div className="student-profile__section-title-wrap">
                <span className="student-profile__section-icon"><StudentIcon name="id-card" size={19} /></span>
                <h2 id="datos-inst-heading" className="student-profile__section-title">Datos registrados</h2>
              </div>
            </div>
            <div className="student-profile__card">
              <div className="student-profile__info-tile">
                <div className="student-profile__tile-icon"><StudentIcon name="user-circle" size={19} /></div>
                <div className="student-profile__tile-body">
                  <span className="student-profile__tile-label">NOMBRE COMPLETO</span>
                  <strong className="student-profile__tile-value">{student.nombre}</strong>
                </div>
              </div>
              <div className="student-profile__info-tile">
                <div className="student-profile__tile-icon"><StudentIcon name="id-card" size={19} /></div>
                <div className="student-profile__tile-body">
                  <span className="student-profile__tile-label">NÚMERO DE CONTROL</span>
                  <strong className="student-profile__tile-value">{student.numControl}</strong>
                </div>
              </div>
              <div className="student-profile__info-tile">
                <div className="student-profile__tile-icon"><StudentIcon name="grad-cap" size={19} /></div>
                <div className="student-profile__tile-body">
                  <span className="student-profile__tile-label">CARRERA</span>
                  <strong className="student-profile__tile-value">{student.carrera}</strong>
                </div>
              </div>
            </div>
          </section>

          <button type="button" className="student-profile__logout-btn" onClick={onLogout}>
            <StudentIcon name="logout" size={19} />
            <span>Cerrar Sesión</span>
          </button>

          <footer className="student-profile__footer">
            <div className="student-profile__footer-brand"><StudentIcon name="grad-cap" size={16} /><span>TECNM OAXACA</span></div>
            <p className="student-profile__footer-dept">CoordinaTec • Instituto Tecnológico de Oaxaca</p>
          </footer>
        </main>

        <StudentBottomNav activeTab="student-profile" onNavigate={onNavigateTab} />
      </div>
    </div>
  )
}

export default StudentProfilePage
