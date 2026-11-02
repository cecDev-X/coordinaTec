import StudentIcon from './StudentIcon.jsx'

function StudentFlowHeader({ title, initials = 'Dg', onBack, onAvatarClick }) {
  return (
    <header className="student-flow-header">
      <div className="student-flow-header__inner">
        <div className="student-flow-header__left">
          <button
            type="button"
            className="student-flow-header__back"
            onClick={onBack}
            aria-label="Regresar"
          >
            <StudentIcon name="arrow-left" size={22} />
          </button>
          <h1 className="student-flow-header__title">{title}</h1>
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

export default StudentFlowHeader