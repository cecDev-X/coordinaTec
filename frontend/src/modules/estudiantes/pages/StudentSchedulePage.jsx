import { useState } from 'react'
import StudentFlowHeader from '../components/StudentFlowHeader.jsx'
import StudentIcon from '../components/StudentIcon.jsx'
import '../css/student-schedule.css'

function StudentSchedulePage({
  student,
  selectedTramite,
  semanas,
  horarios,
  selectedDay,
  selectedSlot,
  isLoadingAvailability,
  bookingError,
  onSelectDay,
  onSelectSlot,
  onBack,
  onContinue,
  onAvatarClick,
}) {
  const [weekIndex, setWeekIndex] = useState(0)
  const currentWeek = semanas[weekIndex] || semanas[0]

  function handlePrevWeek() {
    if (semanas.length < 2) return
    setWeekIndex((prev) => {
      const nextIdx = prev > 0 ? prev - 1 : semanas.length - 1
      onSelectDay(semanas[nextIdx].dias[0])
      return nextIdx
    })
  }

  function handleNextWeek() {
    if (semanas.length < 2) return
    setWeekIndex((prev) => {
      const nextIdx = prev < semanas.length - 1 ? prev + 1 : 0
      onSelectDay(semanas[nextIdx].dias[0])
      return nextIdx
    })
  }

  return (
    <div className="student-shell">
      <div className="student-shell__viewport">
        <StudentFlowHeader
          title="Agendar Cita"
          initials={student.iniciales}
          onBack={onBack}
          onAvatarClick={onAvatarClick}
        />

        <main className="student-main student-main--flow student-schedule">
          {/* Barra de Progreso Paso 2 de 3 */}
          <section className="student-schedule__stepper" aria-label="Progreso del trámite">
            <div className="student-schedule__stepper-top">
              <span className="student-schedule__stepper-kicker">
                <i className="student-schedule__stepper-dot" aria-hidden="true" />
                TRÁMITE ACADÉMICO
              </span>
              <span className="student-schedule__stepper-step">Paso 2 de 3</span>
            </div>

            <div className="student-schedule__bars" aria-hidden="true">
              <span className="student-schedule__bar is-filled" />
              <span className="student-schedule__bar is-filled" />
              <span className="student-schedule__bar" />
            </div>

            <div className="student-schedule__stepper-bottom">
              <strong>Selección de Cita Presencial</strong>
              <span>TecNM ITO</span>
            </div>
          </section>

          {/* Título e instrucciones */}
          <section className="student-schedule__intro">
            <div className="student-schedule__heading-row">
              <span className="student-schedule__heading-icon">
                <StudentIcon name="calendar-clock" size={22} />
              </span>
              <h2 className="student-schedule__heading">Hora disponible</h2>
            </div>
            <p className="student-schedule__description">
              Cita para <strong>{selectedTramite?.titulo || selectedTramite?.nombre}</strong>. Elige una fecha y horario disponibles con Coordinación Académica.
            </p>
          </section>

          {/* Selector de Semana y Días */}
          <section className="student-schedule__calendar-card" aria-label="Selector de día">
            <div className="student-schedule__week-bar">
              <div className="student-schedule__week-label">
                <StudentIcon name="calendar" size={18} />
                <strong>{currentWeek?.rangoTexto || 'Sin fechas disponibles'}</strong>
              </div>
              <div className="student-schedule__week-nav">
                <button
                  type="button"
                  className="student-schedule__week-btn"
                  onClick={handlePrevWeek}
                  disabled={semanas.length < 2}
                  aria-label="Semana anterior"
                >
                  <StudentIcon name="chevron-left" size={16} />
                </button>
                <button
                  type="button"
                  className="student-schedule__week-btn"
                  onClick={handleNextWeek}
                  disabled={semanas.length < 2}
                  aria-label="Semana siguiente"
                >
                  <StudentIcon name="chevron-right" size={16} />
                </button>
              </div>
            </div>

            {currentWeek ? <div className="student-schedule__days-grid">
              {currentWeek.dias.map((dia) => {
                const isSelected = selectedDay?.id === dia.id
                return (
                  <button
                    key={dia.id}
                    type="button"
                    className={`student-schedule__day-btn ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => onSelectDay(dia)}
                    aria-pressed={isSelected}
                  >
                    <span className="student-schedule__day-name">{dia.diaCorto}</span>
                    <strong className="student-schedule__day-num">{dia.numero}</strong>
                    <span
                      className={`student-schedule__day-dot ${dia.tieneCupo ? 'has-cupo' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                )
              })}
            </div> : <p className="student-schedule__availability-message">No hay fechas habilitadas en los horarios del coordinador.</p>}
          </section>

          {/* Cuadrícula de Horarios Disponibles */}
          <section className="student-schedule__slots-section" aria-label="Horarios disponibles">
            <div className="student-schedule__slots-header">
              <h3 className="student-schedule__slots-title">
                Horarios
                <br />
                disponibles
              </h3>
              <div className="student-schedule__legend">
                <span className="student-schedule__legend-item">
                  <i className="student-schedule__legend-dot student-schedule__legend-dot--busy" />
                  Ocupado
                </span>
                <span className="student-schedule__legend-item student-schedule__legend-item--chosen">
                  <i className="student-schedule__legend-dot student-schedule__legend-dot--chosen" />
                  Elegido
                </span>
              </div>
            </div>

            {bookingError && <p className="student-schedule__availability-message" role="status">{bookingError}</p>}
            {isLoadingAvailability ? <p className="student-schedule__availability-message" role="status">Consultando disponibilidad...</p> : horarios.length ? <div className="student-schedule__slots-grid">
              {horarios.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id
                const isBusy = !slot.disponible
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isBusy}
                    className={`student-schedule__slot-card ${
                      isSelected ? 'is-selected' : ''
                    } ${isBusy ? 'is-busy' : ''}`}
                    onClick={() => onSelectSlot(slot)}
                    aria-pressed={isSelected}
                  >
                    <div className="student-schedule__slot-info">
                      <strong className="student-schedule__slot-time">{slot.hora}</strong>
                      <span className="student-schedule__slot-status">
                        {isBusy ? 'Ocupado' : isSelected ? 'Seleccionado' : 'Disponible'}
                      </span>
                    </div>

                    <div className="student-schedule__slot-indicator" aria-hidden="true">
                      {isBusy ? (
                        <StudentIcon name="lock" size={17} />
                      ) : isSelected ? (
                        <span className="student-schedule__slot-check">
                          <StudentIcon name="check" size={14} />
                        </span>
                      ) : (
                        <span className="student-schedule__slot-radio" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div> : !bookingError && <p className="student-schedule__availability-message">No hay espacios disponibles para esta fecha.</p>}
          </section>

          {/* Tarjeta Resumen Cita Confirmada Previa */}
          <section className="student-schedule__summary-card" aria-live="polite">
            <div className="student-schedule__summary-icon">
              <StudentIcon name="calendar-check" size={22} />
            </div>
            <div className="student-schedule__summary-body">
              <span className="student-schedule__summary-kicker">SELECCIÓN DE CITA</span>
              <strong className="student-schedule__summary-datetime">
                {selectedDay?.fechaCompleta || 'Selecciona una fecha'} — {selectedSlot?.hora || 'Selecciona un horario'}
              </strong>
              <span className="student-schedule__summary-location">
                <StudentIcon name="door" size={14} />
                <span>Módulo de Coordinación</span>
              </span>
            </div>
          </section>

          {/* Nota Informativa */}
          <div className="student-schedule__info-note">
            <span className="student-schedule__info-icon">
              <StudentIcon name="info" size={18} />
            </span>
            <p>
              Recuerda presentarte 5 minutos antes con tu credencial institucional, número de
              control y requisitos (Si aplica).
            </p>
          </div>

          {/* Botón Continuar */}
          <div className="student-schedule__actions">
            <button
              type="button"
              className="student-schedule__continue-btn"
              onClick={onContinue}
              disabled={Boolean(bookingError) || isLoadingAvailability || !selectedSlot}
            >
              <span>Continuar</span>
              <StudentIcon name="arrow-right" size={19} />
            </button>
            <p className="student-schedule__cancel-policy">
              Podrás cancelar sin penalización hasta 2 horas antes.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudentSchedulePage
