import StudentIcon from './StudentIcon.jsx'

function StudentTopbar({ subtitle = 'Inicio', variant = 'default', initials = 'Dg', onAvatarClick }) {
  return (
    <header className="student-topbar">
      <div className="student-topbar__inner">
        <div className="student-topbar__brand">
          <div className="student-topbar__logo" aria-hidden="true">
            <StudentIcon name="grad-cap" size={20} />
          </div>
          {variant === 'home' ? (
            <div className="student-topbar__titles">
              <span className="student-topbar__kicker">COORDINATEC</span>
              <span className="student-topbar__page-title">{subtitle}</span>
            </div>
          ) : (
            <div className="student-topbar__titles">
              <div className="student-topbar__brand-row">
                <span className="student-topbar__brand-name">CoordinaTec</span>
                <span className="student-topbar__ito-badge">I.T.O.</span>
              </div>
              <span className="student-topbar__subtitle">{subtitle}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="student-topbar__avatar"
          onClick={onAvatarClick}
          aria-label="Ir a Mi Perfil"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}

export default StudentTopbar