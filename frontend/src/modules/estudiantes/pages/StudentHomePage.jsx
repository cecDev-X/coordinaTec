import { useRef } from 'react'
import StudentTopbar from '../components/StudentTopbar.jsx'
import StudentBottomNav from '../components/StudentBottomNav.jsx'
import StudentIcon from '../components/StudentIcon.jsx'
import StudentAssistant from '../components/StudentAssistant.jsx'
import '../css/student-home.css'

function StudentHomePage({
  student,
  tramites,
  ultimaSolicitud,
  onSelectTramite,
  onNavigateTab,
}) {
  const catalogRef = useRef(null)

  function goToCatalog() {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    catalogRef.current?.focus({ preventScroll: true })
  }

  return (
    <div className="student-shell">
      <div className="student-shell__viewport">
        <StudentTopbar
          subtitle="Inicio"
          variant="home"
          initials={student.iniciales}
          onAvatarClick={() => onNavigateTab('student-profile')}
        />

        <main className="student-main student-home">
          {/* Encabezado de Bienvenida */}
          <section className="student-home__welcome">
            <div className="student-home__welcome-top">
              <div>
                <span className="student-home__portal-kicker">PORTAL DE ESTUDIANTE</span>
                <h1 className="student-home__greeting">¡Hola, {student.nombre}!</h1>
              </div>
            </div>

            <p className="student-home__welcome-desc">
              Bienvenido a <strong>CoordinaTec</strong>. ¿Qué trámite deseas gestionar hoy?
            </p>
          </section>

          <section className="student-home__booking" aria-labelledby="booking-heading">
            <div className="student-home__booking-icon" aria-hidden="true">
              <StudentIcon name="calendar-clock" size={27} />
            </div>
            <div className="student-home__booking-content">
              <span className="student-home__booking-kicker">AGENDA CON TU COORDINACIÓN</span>
              <h2 id="booking-heading">¿Necesitas una cita?</h2>
              <p>Elige el trámite que necesitas, selecciona una fecha y confirma tu horario.</p>
              <button type="button" className="student-home__booking-button" onClick={goToCatalog} disabled={!tramites.length}>
                {tramites.length ? 'Solicitar cita' : 'No hay trámites disponibles'}
                {tramites.length > 0 && <StudentIcon name="arrow-right" size={17} />}
              </button>
            </div>
          </section>

          {/* Información registrada para este estudiante */}
          <section className="student-home__enrollment-card" aria-label="Información de matrícula">
            <div className="student-home__enrollment-left">
              <div className="student-home__enrollment-icon">
                <StudentIcon name="id-card" size={22} />
              </div>
              <div className="student-home__enrollment-info">
                <span className="student-home__enrollment-label">
                  NÚMERO DE CONTROL {student.numControl}
                </span>
                <strong className="student-home__enrollment-career">
                  {student.carrera}
                </strong>
              </div>
            </div>
          </section>

          {/* Catálogo de Trámites */}
          <section className="student-home__catalog" aria-labelledby="select-tramite-heading" ref={catalogRef} tabIndex={-1}>
            <div className="student-home__section-header">
              <div className="student-home__section-title-wrap">
                <span className="student-home__section-dot" aria-hidden="true" />
                <h2 id="select-tramite-heading" className="student-home__section-title">
                  1. Selecciona el trámite para tu cita
                </h2>
              </div>
              <span className="student-home__section-count">{tramites.length} disponibles</span>
            </div>
            <p className="student-home__catalog-hint">Toca un trámite para continuar con la selección de fecha y horario.</p>

            <div className="student-home__tramites-list">
              {tramites.length === 0 && <p className="student-home__empty">No hay trámites habilitados para tu carrera por el momento.</p>}
              {tramites.map((tramite) => (
                <button
                  key={tramite.id}
                  type="button"
                  className="student-home__tramite-card"
                  onClick={() => onSelectTramite(tramite)}
                >
                  <div className="student-home__tramite-icon">
                    <StudentIcon name={tramite.icono} size={22} />
                  </div>

                  <div className="student-home__tramite-body">
                    <div className="student-home__tramite-title-row">
                      <span className="student-home__tramite-name">
                        {tramite.tituloCorto || tramite.titulo}
                      </span>
                      {tramite.badge && (
                        <span
                          className={`student-home__tramite-badge student-home__tramite-badge--${tramite.badgeVariant}`}
                        >
                          {tramite.badge}
                        </span>
                      )}
                    </div>

                    <p className="student-home__tramite-desc">{tramite.descripcionCorta}</p>

                    {tramite.tiempoEstimado ? (
                      <div className="student-home__tramite-meta student-home__tramite-meta--split">
                        <span className="student-home__meta-item">
                          <StudentIcon name="clock" size={14} />
                          <span>{tramite.tiempoEstimado}</span>
                        </span>
                      </div>
                    ) : null}
                    <span className="student-home__tramite-action">Elegir y agendar cita <StudentIcon name="arrow-right" size={14} /></span>
                  </div>

                  <span className="student-home__tramite-chevron" aria-hidden="true">
                    <StudentIcon name="chevron-right" size={18} />
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Tu Última Solicitud */}
          <section className="student-home__last-request" aria-labelledby="last-request-heading">
            <div className="student-home__section-header">
              <h2 id="last-request-heading" className="student-home__section-title">
                Tu Última Solicitud
              </h2>
              <button
                type="button"
                className="student-home__history-link"
                onClick={() => onNavigateTab('student-citas')}
              >
                <span>Ver historial</span>
                <StudentIcon name="arrow-right" size={15} />
              </button>
            </div>

            {ultimaSolicitud ? <div
              className="student-home__request-card"
              onClick={() => onNavigateTab('student-citas')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onNavigateTab('student-citas')
              }}
            >
              <div className="student-home__request-icon">
                <StudentIcon name="receipt" size={20} />
              </div>
              <div className="student-home__request-info">
                <strong className="student-home__request-title">{ultimaSolicitud.titulo}</strong>
                <span className="student-home__request-sub">
                  {ultimaSolicitud.folio} • {ultimaSolicitud.tiempo}
                </span>
              </div>
              <span className="student-home__request-badge">{ultimaSolicitud.estado}</span>
            </div> : <p className="student-home__empty">Aún no tienes solicitudes o citas registradas.</p>}
          </section>
        </main>

        <StudentBottomNav activeTab="student-home" onNavigate={onNavigateTab} />
        <StudentAssistant onNavigate={onNavigateTab} />
      </div>
    </div>
  )
}

export default StudentHomePage
