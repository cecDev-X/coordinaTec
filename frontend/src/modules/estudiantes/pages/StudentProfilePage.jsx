import { useState } from 'react'
import StudentTopbar from '../components/StudentTopbar.jsx'
import StudentBottomNav from '../components/StudentBottomNav.jsx'
import StudentIcon from '../components/StudentIcon.jsx'
import ProfileActions from '../../../components/ProfileActions.jsx'
import '../css/student-profile.css'
import '../../dashboard/css/coordinador-settings.css'

function StudentProfilePage({ student, token, onNavigateTab, onLogout }) {
  const [photo, setPhoto] = useState('')
  return (
    <div className="student-shell">
      <div className="student-shell__viewport">
        <StudentTopbar subtitle="Perfil" initials={student.iniciales} photo={photo} onAvatarClick={() => {}} />

        <main className="student-main student-profile coordinator-settings">
          <header className="coordinator-settings__header">
            <span className="coordinator-settings__eyebrow">PORTAL ESTUDIANTIL</span>
            <h1>Mi perfil</h1>
            <p>Consulta tus datos y administra la seguridad de tu cuenta.</p>
          </header>

          <section className="coordinator-settings__profile" aria-label="Perfil de estudiante">
            <div className="coordinator-settings__avatar" aria-hidden="true">
              {photo ? <img src={photo} alt="" /> : student.iniciales}
            </div>
            <div className="coordinator-settings__profile-copy">
              <span className="coordinator-settings__eyebrow">CUENTA ESTUDIANTIL</span>
              <h2>{student.nombre}</h2>
              <p>{student.carrera} <span>·</span> {student.numControl}</p>
            </div>
            <span className="coordinator-settings__status"><i /> Cuenta activa</span>
          </section>

          <section className="student-profile__registered coordinator-settings__card" aria-labelledby="datos-inst-heading">
            <div className="coordinator-settings__section-heading">
              <div className="coordinator-settings__section-icon" aria-hidden="true"><StudentIcon name="id-card" size={19} /></div>
              <div><h2 id="datos-inst-heading">Datos registrados</h2><p>Información asociada a tu cuenta estudiantil.</p></div>
            </div>
            <div className="student-profile__registered-grid">
              <div><span>Nombre completo</span><strong>{student.nombre}</strong></div>
              <div><span>Número de control</span><strong>{student.numControl}</strong></div>
              <div><span>Carrera</span><strong>{student.carrera}</strong></div>
              {student.correo && <div><span>Correo electrónico</span><strong>{student.correo}</strong></div>}
            </div>
          </section>

          <ProfileActions token={token} onPhotoChange={setPhoto} />

          <button type="button" className="coordinator-settings__logout" onClick={onLogout}>
            <StudentIcon name="logout" size={19} />
            <span>Cerrar sesión</span>
          </button>

          <footer className="coordinator-settings__student-footer">
            <div><StudentIcon name="grad-cap" size={16} /><span>TECNM OAXACA</span></div>
            <p>CoordinaTec · Instituto Tecnológico de Oaxaca</p>
          </footer>
        </main>

        <StudentBottomNav activeTab="student-profile" onNavigate={onNavigateTab} />
      </div>
    </div>
  )
}

export default StudentProfilePage
