import { useState, useEffect, useMemo } from 'react'
import {
  buildScheduleWeeks,
  createCitaApi,
  cancelStudentCitaApi,
  fetchCitasEstudianteApi,
  fetchCitaCatalogosApi,
  fetchDisponibilidadApi,
  fetchHorariosCoordinadorApi,
  fetchStudentProfileApi,
  fetchTramitesApi,
} from './data/estudiantesData.js'
import StudentLoginPage from './pages/StudentLoginPage.jsx'
import StudentRegisterPage from './pages/StudentRegisterPage.jsx'
import StudentRecoveryPage from './pages/StudentRecoveryPage.jsx'
import StudentResetPage from './pages/StudentResetPage.jsx'
import StudentHomePage from './pages/StudentHomePage.jsx'
import StudentSchedulePage from './pages/StudentSchedulePage.jsx'
import StudentConfirmPage from './pages/StudentConfirmPage.jsx'
import StudentCitasPage from './pages/StudentCitasPage.jsx'
import StudentProfilePage from './pages/StudentProfilePage.jsx'
import './css/estudiantes-layout.css'

function EstudiantesModule({ route, onNavigate }) {
  const [student, setStudent] = useState(null)
  const [selectedTramite, setSelectedTramite] = useState(null)
  const [selectedDayId, setSelectedDayId] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [tramites, setTramites] = useState([])
  const [citaCatalogos, setCitaCatalogos] = useState({ coordinadores: [], formatos: [] })
  const [scheduleBlocks, setScheduleBlocks] = useState([])
  const [horarios, setHorarios] = useState([])
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
  const [citaError, setCitaError] = useState('')
  const [proximasCitas, setProximasCitas] = useState([])
  const [historialCitas, setHistorialCitas] = useState([])
  const [ultimaSolicitud, setUltimaSolicitud] = useState(null)
  const [isLoadingPortal, setIsLoadingPortal] = useState(true)
  const [portalError, setPortalError] = useState('')
  const [isSubmittingCita, setIsSubmittingCita] = useState(false)
  const [cancelingFolio, setCancelingFolio] = useState(null)
  const [cancelNotice, setCancelNotice] = useState('')

  const semanas = useMemo(() => {
    const allowedBlocks = selectedTramite
      ? scheduleBlocks.filter((block) => (block.tramiteIds || []).map(Number).includes(Number(selectedTramite.id)))
      : []
    return buildScheduleWeeks(allowedBlocks)
  }, [scheduleBlocks, selectedTramite])
  const availableDays = semanas.flatMap((week) => week.dias)
  const selectedDay = availableDays.find((day) => day.id === selectedDayId) || availableDays[0] || null

  function applyCitas(records) {
    const mapped = records.map(mapCitaFromDatabase)
    const actual = mapped.filter((cita) => ['PROGRAMADA', 'PENDIENTE'].includes(cita.estadoDb))
    const historial = mapped.filter((cita) => !['PROGRAMADA', 'PENDIENTE'].includes(cita.estadoDb))
    setProximasCitas(actual)
    setHistorialCitas(historial)
    setUltimaSolicitud(mapped[0] ? {
      titulo: mapped[0].titulo,
      folio: `Folio #${mapped[0].folio}`,
      tiempo: mapped[0].fechaTexto,
      estado: mapped[0].estado,
    } : null)
  }

  // Carga datos del estudiante y las colecciones mostradas en Inicio desde el backend.
  useEffect(() => {
    let mounted = true
    if (['student-login', 'student-register', 'student-recovery', 'student-reset'].includes(route)) {
      return () => { mounted = false }
    }

    const numControl = sessionStorage.getItem('coordinaTecStudentControl')
    if (!numControl) {
      onNavigate('student-login')
      return () => { mounted = false }
    }

    Promise.all([
      fetchStudentProfileApi(numControl),
      fetchCitasEstudianteApi(numControl),
      fetchTramitesApi(),
      fetchCitaCatalogosApi(),
    ]).then(async ([profile, citas, catalogoTramites, catalogosCita]) => {
      if (!mounted) return
      if (!profile) {
        sessionStorage.removeItem('coordinaTecStudentControl')
        sessionStorage.removeItem('coordinaTecStudentToken')
        onNavigate('student-login')
        return
      }
       setStudent(withStudentPresentation(profile))
       const idsHabilitados = new Set((catalogosCita.tramitesHabilitados || []).map(Number))
       const tramitesDeCarrera = catalogoTramites.filter((tramite) => idsHabilitados.has(Number(tramite.id)))
       setTramites(tramitesDeCarrera)
      const catalogosAsignados = {
        ...catalogosCita,
        coordinadores: catalogosCita.coordinadores.filter((coordinador) => coordinador.carreras?.includes(profile.carrera)),
      }
      setCitaCatalogos(catalogosAsignados)
       setSelectedTramite((current) => tramitesDeCarrera.find((tramite) => Number(tramite.id) === Number(current?.id)) || tramitesDeCarrera[0] || null)
      applyCitas(citas)
      const coordinador = catalogosAsignados.coordinadores[0]
      const horarioCoordinador = coordinador
        ? await fetchHorariosCoordinadorApi(coordinador.rfc)
        : []
      if (!mounted) return
       setScheduleBlocks(horarioCoordinador)
       setIsLoadingPortal(false)
    }).catch((error) => {
      if (!mounted) return
      if (error.status === 401 || error.status === 403) {
        sessionStorage.removeItem('coordinaTecStudentControl')
        sessionStorage.removeItem('coordinaTecStudentToken')
        onNavigate('student-login')
        return
      }
      setPortalError(error.message || 'No se pudieron cargar los datos del estudiante.')
      setIsLoadingPortal(false)
    })

    return () => {
      mounted = false
    }
  }, [route, onNavigate])

  const coordinadorCita = citaCatalogos.coordinadores[0]
  const formatoCita = citaCatalogos.formatos.find((formato) =>
    normalizeLabel(formato.tipoTramite) === normalizeLabel(selectedTramite?.nombre || selectedTramite?.titulo)
      && formato.carrerasHabilitadas?.includes(student?.carrera),
  )

  useEffect(() => {
    if (route !== 'student-schedule' || !selectedDay || !coordinadorCita || !formatoCita) {
      return undefined
    }

    let mounted = true
    Promise.resolve().then(() => {
      if (mounted) {
        setIsLoadingAvailability(true)
        setCitaError('')
      }
      return fetchDisponibilidadApi(coordinadorCita.rfc, selectedDay.id, selectedTramite.id, student.carrera)
    }).then((slots) => {
      if (!mounted) return
      setHorarios(slots)
      setSelectedSlot(slots[0] || null)
      setIsLoadingAvailability(false)
    }).catch((error) => {
      if (!mounted) return
      setHorarios([])
      setSelectedSlot(null)
      setCitaError(error.message || 'No se pudo consultar la disponibilidad.')
      setIsLoadingAvailability(false)
    })

    return () => { mounted = false }
  }, [route, selectedDay, coordinadorCita, formatoCita, selectedTramite?.id, student?.carrera])

  function handleLoginSuccess(studentRecord) {
    sessionStorage.setItem('coordinaTecStudentControl', studentRecord.numControl)
    sessionStorage.setItem('coordinaTecStudentToken', studentRecord.token)
    setStudent(withStudentPresentation(studentRecord))
    setIsLoadingPortal(true)
    setPortalError('')
    onNavigate('student-home')
  }

  function handleSelectTramite(tramite) {
    setSelectedTramite(tramite)
    setSelectedSlot(null)
    setCitaError('')
    onNavigate('student-schedule')
  }

  async function handleConfirmCita() {
    setCitaError('')
    if (!selectedDay || !selectedSlot || !coordinadorCita || !formatoCita) {
      setCitaError('Selecciona una fecha y horario disponibles; verifica que el trámite tenga formato y coordinador registrados.')
      return
    }
    setIsSubmittingCita(true)
    try {
      await createCitaApi({
        numControlEstudiante: student.numControl,
        fecha: selectedDay.id,
        horaInicio: selectedSlot.hora24,
        motivo: selectedTramite.tituloDetalle || selectedTramite.titulo,
        coordinadorRfc: coordinadorCita.rfc,
        formatoFolio: formatoCita.folio,
      })
      applyCitas(await fetchCitasEstudianteApi(student.numControl))
      onNavigate('student-citas')
    } catch (error) {
      setCitaError(error.message || 'No se pudo guardar la cita. Intenta de nuevo.')
    } finally {
      setIsSubmittingCita(false)
    }
  }

  async function handleCancelCita(folio) {
    if (!window.confirm(`¿Cancelar la cita ${folio}? Esta acción no se puede deshacer.`)) return
    setCancelNotice('')
    setCancelingFolio(folio)
    try {
      await cancelStudentCitaApi(folio)
      setCancelNotice(`La cita ${folio} fue cancelada.`)
      applyCitas(await fetchCitasEstudianteApi(student.numControl))
    } catch (error) {
      setCancelNotice(error.message || 'No se pudo cancelar la cita.')
      // Recargar la lista si la cancelación se guardó, pero falló la consulta posterior.
      try { applyCitas(await fetchCitasEstudianteApi(student.numControl)) } catch { /* mostrar el error original */ }
    } finally {
      setCancelingFolio(null)
    }
  }

  if (route === 'student-login') {
    return (
      <StudentLoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => onNavigate('student-register')}
        onRecoverPassword={() => onNavigate('student-recovery')}
      />
    )
  }

  if (route === 'student-register') {
    return (
      <StudentRegisterPage
        onRegisterSuccess={handleLoginSuccess}
        onBackToLogin={() => onNavigate('student-login')}
      />
    )
  }

  if (route === 'student-recovery') {
    return <StudentRecoveryPage onBackToLogin={() => onNavigate('student-login')} />
  }

  if (route === 'student-reset') {
    return <StudentResetPage onBackToLogin={() => onNavigate('student-login')} onRequestNew={() => onNavigate('student-recovery')} />
  }

  if (isLoadingPortal || !student) {
    return (
      <div className="student-shell">
        <div className="student-shell__viewport">
          <main className="student-main" aria-live="polite">
            <p>{portalError || 'Cargando tus datos desde CoordinaTec...'}</p>
            {portalError && <button type="button" onClick={() => onNavigate('student-login')}>Volver a iniciar sesión</button>}
          </main>
        </div>
      </div>
    )
  }

  if (route === 'student-schedule') {
    return (
      <StudentSchedulePage
        student={student}
        selectedTramite={selectedTramite}
        semanas={semanas}
        horarios={horarios}
        selectedDay={selectedDay}
        selectedSlot={selectedSlot}
        isLoadingAvailability={isLoadingAvailability}
        bookingError={getBookingError({ selectedTramite, formatoCita, coordinadorCita, semanas, citaError })}
        onSelectDay={(day) => { setSelectedDayId(day.id); setSelectedSlot(null) }}
        onSelectSlot={setSelectedSlot}
        onBack={() => onNavigate('student-home')}
        onContinue={() => onNavigate('student-confirm')}
        onAvatarClick={() => onNavigate('student-profile')}
      />
    )
  }

  if (route === 'student-confirm') {
    return (
      <StudentConfirmPage
        student={student}
        tramite={selectedTramite}
        selectedDay={selectedDay}
        selectedSlot={selectedSlot}
        isSubmitting={isSubmittingCita}
        error={citaError}
        onBack={() => onNavigate('student-schedule')}
        onConfirm={handleConfirmCita}
        onAvatarClick={() => onNavigate('student-profile')}
      />
    )
  }

  if (route === 'student-citas') {
    return (
      <StudentCitasPage
        student={student}
        proximasCitas={proximasCitas}
        historialCitas={historialCitas}
        onNavigateTab={onNavigate}
        onNewCitaClick={() => onNavigate('student-schedule')}
        onCancelCita={handleCancelCita}
        cancelingFolio={cancelingFolio}
        cancelNotice={cancelNotice}
      />
    )
  }

  if (route === 'student-profile') {
    return (
      <StudentProfilePage
        student={student}
        onNavigateTab={onNavigate}
        onLogout={() => {
          sessionStorage.removeItem('coordinaTecStudentControl')
          sessionStorage.removeItem('coordinaTecStudentToken')
          setStudent(null)
          onNavigate('student-login')
        }}
      />
    )
  }

  return (
      <StudentHomePage
        student={student}
        tramites={tramites}
        ultimaSolicitud={ultimaSolicitud}
      onSelectTramite={handleSelectTramite}
      onNavigateTab={onNavigate}
    />
  )
}

function withStudentPresentation(record) {
  const initials = record.nombre.trim().split(/\s+/).slice(0, 2)
    .map((part) => part[0]).join('').toLocaleUpperCase('es')
  return { ...record, iniciales: initials }
}

function normalizeLabel(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es')
}

function getBookingError({ selectedTramite, formatoCita, coordinadorCita, semanas, citaError }) {
  if (citaError) return citaError
  if (!selectedTramite) return 'Selecciona un trámite para agendar una cita.'
  if (!formatoCita) return 'Este trámite aún no tiene un formato asociado en el catálogo de coordinación.'
  if (!coordinadorCita) return 'No hay un coordinador disponible para registrar citas.'
  if (!semanas.length) return 'El coordinador no habilitó días para atender este trámite.'
  return ''
}

function formatCitaDate(value) {
  if (!value) return ''
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function mapCitaFromDatabase(cita) {
  const statusLabels = {
    PROGRAMADA: 'Programada',
    PENDIENTE: 'Pendiente',
    ATENDIDA: 'Atendida',
    RECHAZADA: 'Rechazada',
    CANCELADA: 'Cancelada',
    NO_ASISTIO: 'No asistió',
  }
  return {
    id: cita.folio,
    folio: cita.folio,
    titulo: cita.tramite,
    estadoDb: cita.estado,
    estado: statusLabels[cita.estado] || cita.estado,
    tipoEstado: cita.estado === 'PROGRAMADA' || cita.estado === 'PENDIENTE'
      ? 'confirmada'
      : cita.estado === 'ATENDIDA' ? 'atendida' : ['RECHAZADA', 'CANCELADA', 'NO_ASISTIO'].includes(cita.estado) ? 'rechazada' : 'pendiente',
    fechaTexto: formatCitaDate(cita.fecha),
    fecha: cita.fecha,
    horaTexto: cita.horaInicio?.slice(0, 5) || '',
  }
}

export default EstudiantesModule
