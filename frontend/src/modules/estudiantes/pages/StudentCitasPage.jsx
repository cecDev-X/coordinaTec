import { useState } from 'react'
import StudentTopbar from '../components/StudentTopbar.jsx'
import StudentBottomNav from '../components/StudentBottomNav.jsx'
import StudentIcon from '../components/StudentIcon.jsx'
import '../css/student-citas.css'

function StudentCitasPage({
  student,
  proximasCitas,
  historialCitas,
  onNavigateTab,
  onNewCitaClick,
}) {
  const [filterTab, setFilterTab] = useState('actuales') // 'todas' | 'actuales'

  const totalCount = proximasCitas.length + historialCitas.length
  const actualesCount = proximasCitas.length

  function renderCita(cita) {
    const isConfirmed = cita.tipoEstado === 'confirmada'
    return (
      <article key={cita.id} className="student-citas__card">
        <div className="student-citas__card-top">
          <div>
            <span className="student-citas__folio">FOLIO {cita.folio}</span>
            <h3 className="student-citas__card-title">{cita.titulo}</h3>
          </div>
          <span className={`student-citas__status-badge ${cita.tipoEstado === 'rechazada' ? 'student-citas__status-badge--red' : 'student-citas__status-badge--blue'}`}>
            <StudentIcon name={isConfirmed ? 'clock' : cita.tipoEstado === 'atendida' ? 'check-circle' : 'dots-circle'} size={14} />
            <span>{cita.estado}</span>
          </span>
        </div>
        <div className="student-citas__inner-box">
          <div className="student-citas__datetime-row">
            <div className={`student-citas__date-icon ${isConfirmed ? 'is-solid' : 'is-soft'}`}>
              <StudentIcon name="calendar" size={18} />
            </div>
            <div className="student-citas__datetime-texts">
              <strong className={`student-citas__date-title ${isConfirmed ? 'is-blue' : ''}`}>{cita.fechaTexto}</strong>
              <span className="student-citas__time-sub">{cita.horaTexto}</span>
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="student-shell">
      <div className="student-shell__viewport">
        <StudentTopbar
          subtitle="Mis Citas"
          initials={student.iniciales}
          onAvatarClick={() => onNavigateTab('student-profile')}
        />

        <main className="student-main student-citas">
          {/* Cabecera Mis Citas */}
          <section className="student-citas__intro">
            <div className="student-citas__intro-texts">
              <h1 className="student-citas__title">Mis Citas</h1>
              <p className="student-citas__subtitle">
                Consulta y gestiona tus citas presenciales con la coordinación académica
              </p>
            </div>

            <button
              type="button"
              className="student-citas__cal-btn"
              onClick={onNewCitaClick}
              aria-label="Agendar nueva cita"
              title="Agendar nueva cita"
            >
              <StudentIcon name="calendar" size={22} />
            </button>
          </section>

          {/* Filtros / Tabs */}
          <div className="student-citas__tabs" role="tablist" aria-label="Filtrar citas">
            <button
              type="button"
              role="tab"
              aria-selected={filterTab === 'todas'}
              className={`student-citas__tab ${filterTab === 'todas' ? 'is-active' : ''}`}
              onClick={() => setFilterTab('todas')}
            >
              <span>Todas</span>
              <span className="student-citas__tab-count">{totalCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filterTab === 'actuales'}
              className={`student-citas__tab ${filterTab === 'actuales' ? 'is-active' : ''}`}
              onClick={() => setFilterTab('actuales')}
            >
              <span>Actuales / Pendientes</span>
              <span className="student-citas__tab-count">{actualesCount}</span>
            </button>
          </div>

          {/* Sección Próximas Citas */}
          <section className="student-citas__section" aria-labelledby="proximas-citas-heading">
            <div className="student-citas__section-header">
              <div className="student-citas__section-title-wrap">
                <span className="student-citas__blue-dot" aria-hidden="true" />
                <h2 id="proximas-citas-heading" className="student-citas__section-title">
                  Próximas Citas
                </h2>
              </div>
              <span className="student-citas__section-meta">ACTIVAS ({proximasCitas.length})</span>
            </div>

            <div className="student-citas__cards-list">
              {proximasCitas.length ? proximasCitas.map(renderCita) : <p className="student-citas__empty">No tienes citas actuales o pendientes.</p>}
            </div>
          </section>

          {/* Sección Historial de Citas */}
          {filterTab === 'todas' && <section className="student-citas__section" aria-labelledby="historial-citas-heading">
            <div className="student-citas__section-header">
              <div className="student-citas__section-title-wrap">
                <StudentIcon name="history-clock" size={19} />
                <h2 id="historial-citas-heading" className="student-citas__section-title">
                  Historial de Citas
                </h2>
              </div>
              <span className="student-citas__section-meta">
                {historialCitas.length} REGISTROS
              </span>
            </div>

            <div className="student-citas__cards-list">
              {historialCitas.length ? historialCitas.map(renderCita) : <p className="student-citas__empty">No hay citas anteriores registradas.</p>}
            </div>
          </section>}
        </main>

        <StudentBottomNav activeTab="student-citas" onNavigate={onNavigateTab} />
      </div>
    </div>
  )
}

export default StudentCitasPage
