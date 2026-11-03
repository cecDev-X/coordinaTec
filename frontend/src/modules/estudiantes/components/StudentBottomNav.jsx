import StudentIcon from './StudentIcon.jsx'

const navItems = [
  { id: 'student-home', label: 'Inicio', icon: 'nav-grid' },
  { id: 'student-citas', label: 'Mis Citas', icon: 'calendar' },
  { id: 'student-profile', label: 'Perfil', icon: 'user-circle' },
]

function StudentBottomNav({ activeTab, onNavigate }) {
  return (
    <nav className="student-bottom-nav" aria-label="Navegación principal de estudiante">
      <div className="student-bottom-nav__inner">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={`student-bottom-nav__item ${isActive ? 'is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="student-bottom-nav__icon">
                <StudentIcon name={item.icon} size={21} />
              </span>
              <span className="student-bottom-nav__label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default StudentBottomNav