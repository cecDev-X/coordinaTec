import '../css/student-login.css'

function StudentAuthShell({ title, subtitle, children }) {
  return <div className="student-shell">
    <div className="student-shell__viewport student-login-viewport">
      <div className="student-login">
        <header className="student-login__banner">
          <div className="student-login__banner-text">
            <span className="student-login__banner-kicker">TECNM · ITO</span>
            <h1 className="student-login__banner-title">Portal Estudiantil</h1>
          </div>
          <img className="student-login__tecnm-logo" src="/tecnm.webp" alt="Tecnológico Nacional de México" />
        </header>
        <section className="student-login__card">
          <img className="student-login__tio-logo" src="/tio.png" alt="Mascota del Tecnológico Nacional de México" />
          <h2 className="student-login__title">{title}</h2>
          <p className="student-login__subtitle">{subtitle}</p>
          {children}
        </section>
      </div>
    </div>
  </div>
}

export default StudentAuthShell
