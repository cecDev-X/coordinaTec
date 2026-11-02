import { useState } from 'react'
import StudentFlowHeader from '../components/StudentFlowHeader.jsx'
import StudentIcon from '../components/StudentIcon.jsx'
import '../css/student-confirm.css'

function StudentConfirmPage({
  student,
  tramite,
  selectedDay,
  selectedSlot,
  isSubmitting,
  onBack,
  onConfirm,
  onAvatarClick,
}) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [downloadToast, setDownloadToast] = useState('')

  function handleFormatAction(formato) {
    if (formato.tipo === 'external' && formato.url) {
      window.open(formato.url, '_blank', 'noopener,noreferrer')
      return
    }

    // Genera un documento de texto/formato descargable de demostración para el estudiante
    const content = [
      'TECNOLÓGICO NACIONAL DE MÉXICO - INSTITUTO TECNOLÓGICO DE OAXACA',
      `DEPARTAMENTO: ${tramite.departamento}`,
      `DOCUMENTO: ${formato.titulo}`,
      `ESTUDIANTE: ${student.nombre} (${student.numControl})`,
      `TRÁMITE: ${tramite.tituloDetalle} (Clave ${tramite.clave})`,
      `CITA PROGRAMADA: ${selectedDay?.fechaCorta} a las ${selectedSlot?.hora}`,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${formato.titulo.replace(/\s+/g, '_')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setDownloadToast(`Descargando: ${formato.titulo}`)
    setTimeout(() => setDownloadToast(''), 3000)
  }

  return (
    <div className="student-shell">
      <div className="student-shell__viewport">
        <StudentFlowHeader
          title="Detalle De Trámite"
          initials={student.iniciales}
          onBack={onBack}
          onAvatarClick={onAvatarClick}
        />

        <main className="student-main student-main--flow student-confirm">
          {/* Card Principal del Trámite */}
          <section className="student-confirm__card" aria-labelledby="confirm-tramite-title">
            <div className="student-confirm__top-meta">
              <span className="student-confirm__active-pill">
                <i className="student-confirm__active-dot" aria-hidden="true" />
                TRÁMITE ACADÉMICO ACTIVO
              </span>
              <span className="student-confirm__time-est">
                <StudentIcon name="clock" size={15} />
                <span>{tramite.tiempoDetalle || '1 día hábil'}</span>
              </span>
            </div>

            <h2 id="confirm-tramite-title" className="student-confirm__title">
              {tramite.tituloDetalle || tramite.titulo}
            </h2>

            <p className="student-confirm__code-line">
              Clave de Trámite: <strong>{tramite.clave}</strong> · {tramite.departamento}
            </p>

            <div className="student-confirm__assigned-slot">
              <div className="student-confirm__slot-icon">
                <StudentIcon name="calendar-check" size={20} />
              </div>
              <div className="student-confirm__slot-texts">
                <span className="student-confirm__slot-kicker">HORARIO ASIGNADO</span>
                <strong className="student-confirm__slot-value">
                  {selectedDay?.fechaCorta || 'Jueves 15 Oct'}, {selectedSlot?.hora || '10:00 AM'}
                </strong>
              </div>
              <span className="student-confirm__slot-verified" aria-hidden="true">
                <StudentIcon name="check-circle" size={20} />
              </span>
            </div>
          </section>

          {/* Card de Requisitos */}
          <section className="student-confirm__card" aria-labelledby="requisitos-heading">
            <div className="student-confirm__section-title-row">
              <div className="student-confirm__shield-icon">
                <StudentIcon name="shield-check" size={20} />
              </div>
              <h3 id="requisitos-heading" className="student-confirm__section-title">
                Requisitos
              </h3>
            </div>

            <p className="student-confirm__req-text">{tramite.requisitosTexto}</p>

            <div className="student-confirm__validations-grid">
              {(tramite.validaciones || []).map((val) => (
                <div key={val} className="student-confirm__validation-chip">
                  <StudentIcon name="check" size={15} />
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Card de Formatos Oficiales */}
          <section className="student-confirm__card" aria-labelledby="formatos-heading">
            <div className="student-confirm__formats-header">
              <div>
                <h3 id="formatos-heading" className="student-confirm__section-title">
                  Formatos Oficiales
                </h3>
                <p className="student-confirm__formats-sub">
                  Descarga, llena y anexa a tu expediente
                </p>
              </div>
              <span className="student-confirm__files-count">
                {tramite.formatos?.length || 0}
                <br />
                Archivos
              </span>
            </div>

            {downloadToast && (
              <div className="student-confirm__toast" role="status">
                {downloadToast}
              </div>
            )}

            <div className="student-confirm__formats-list">
              {(tramite.formatos || []).map((formato) => {
                const isExternal = formato.tipo === 'external'
                return (
                  <div key={formato.id} className="student-confirm__format-item">
                    <div
                      className={`student-confirm__format-icon ${
                        isExternal ? 'is-external' : 'is-pdf'
                      }`}
                    >
                      <StudentIcon name="file-pdf" size={20} />
                    </div>

                    <div className="student-confirm__format-info">
                      <strong className="student-confirm__format-name">
                        {formato.tituloCorto || formato.titulo}
                      </strong>
                      <span className="student-confirm__format-meta">{formato.subtitulo}</span>
                    </div>

                    <button
                      type="button"
                      className="student-confirm__format-btn"
                      onClick={() => handleFormatAction(formato)}
                    >
                      <StudentIcon name={isExternal ? 'external-link' : 'download'} size={15} />
                      <span>{formato.accion}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Card de Aceptación y Botón Confirmar */}
          <section className="student-confirm__card student-confirm__footer-card">
            <label className="student-confirm__terms-label">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span>
                He leído y acepto los términos y requisitos del trámite académico ante la
                coordinación.
              </span>
            </label>

            <button
              type="button"
              disabled={!acceptedTerms || isSubmitting}
              className={`student-confirm__submit-btn ${acceptedTerms ? 'is-ready' : ''}`}
              onClick={onConfirm}
            >
              <StudentIcon name="check-double" size={19} />
              <span>{isSubmitting ? 'Confirmando...' : 'Confirmar'}</span>
            </button>
          </section>
        </main>
      </div>
    </div>
  )
}

export default StudentConfirmPage