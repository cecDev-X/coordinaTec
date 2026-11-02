import { useState, useEffect } from 'react'
import {
  initialStudentProfile,
  officialNotice,
  tramitesCatalog,
  ultimaSolicitudHome,
  semanasDisponibles,
  horariosPorDefecto,
  initialCitasData,
  createCitaApi,
  fetchCitasEstudianteApi,
} from './data/estudiantesData.js'
import StudentLoginPage from './pages/StudentLoginPage.jsx'
import StudentHomePage from './pages/StudentHomePage.jsx'
import StudentSchedulePage from './pages/StudentSchedulePage.jsx'
import StudentConfirmPage from './pages/StudentConfirmPage.jsx'
import StudentCitasPage from './pages/StudentCitasPage.jsx'
import StudentProfilePage from './pages/StudentProfilePage.jsx'
import './css/estudiantes-layout.css'

function EstudiantesModule({ route, onNavigate, onLogoutToAdmin }) {
  const [student, setStudent] = useState(initialStudentProfile)
  const [selectedTramite, setSelectedTramite] = useState(tramitesCatalog[0])
  const [selectedDay, setSelectedDay] = useState(semanasDisponibles[0].dias[3]) // Jue 15 Oct por defecto
  const [selectedSlot, setSelectedSlot] = useState(horariosPorDefecto[2]) // 10:00 AM por defecto
  const [proximasCitas, setProximasCitas] = useState(initialCitasData.proximas)
  const [historialCitas] = useState(initialCitasData.historial)
  const [ultimaSolicitud, setUltimaSolicitud] = useState(ultimaSolicitudHome)
  const [isSubmittingCita, setIsSubmittingCita] = useState(false)

  // Sincroniza citas reales desde el backend de Spring Boot si existen
  useEffect(() => {
    let mounted = true
    async function loadBackendCitas() {
      const apiCitas = await fetchCitasEstudianteApi(student.numControl)
      if (!mounted || !Array.isArray(apiCitas) || apiCitas.length === 0) return

      const mappedApiCitas = apiCitas.map((c) => ({
        id: `api-${c.id || c.folio}`,
        folio: `#${c.folio}`,
        titulo: c.motivo || 'Trámite Académico',
        estado: c.estado === 'PROGRAMADA' ? 'Confirmada' : c.estado,
        tipoEstado: 'confirmada',
        destacada: true,
        fechaTexto: c.fecha,
        horaTexto: `${String(c.horaInicio || '10:00').slice(0, 5)} (Tolerancia 10 min)`,
        ubicacionTitulo: 'Módulo de Coordinación',
        ubicacionSub: 'Oficina de coordinación',
        atiende: 'Atiende: Usuario (Coordinadora)',
      }))

      setProximasCitas((prev) => {
        const existingFolios = new Set(prev.map((item) => item.folio))
        const nuevos = mappedApiCitas.filter((item) => !existingFolios.has(item.folio))
        return [...nuevos, ...prev]
      })
    }
    loadBackendCitas()
    return () => {
      mounted = false
    }
  }, [student.numControl])

  function handleLoginSuccess(userIdentifier) {
    if (userIdentifier && /^\d{8}$/.test(userIdentifier)) {
      setStudent((prev) => ({
        ...prev,
        numControl: userIdentifier,
        correo: `${userIdentifier}@itoaxaca.edu.mx`,
      }))
    }
    onNavigate('student-home')
  }

  function handleSelectTramite(tramite) {
    setSelectedTramite(tramite)
    onNavigate('student-schedule')
  }

  async function handleConfirmCita() {
    setIsSubmittingCita(true)

    const payload = {
      numControlEstudiante: student.numControl,
      fecha: selectedDay.id,
      horaInicio: selectedSlot.hora24,
      motivo: selectedTramite.tituloDetalle || selectedTramite.titulo,
    }

    const savedBackendCita = await createCitaApi(payload)
    setIsSubmittingCita(false)

    const nuevoFolio = savedBackendCita?.folio
      ? `#${savedBackendCita.folio}`
      : `#CT-2026-${Math.floor(1000 + Math.random() * 9000)}`

    const nuevaCitaCard = {
      id: `cita-${Date.now()}`,
      folio: nuevoFolio,
      titulo: selectedTramite.tituloDetalle || selectedTramite.titulo,
      estado: 'Confirmada',
      tipoEstado: 'confirmada',
      destacada: true,
      fechaTexto: `${selectedDay.fechaCompleta}, 2026`,
      horaTexto: `${selectedSlot.hora} (Tolerancia 10 min)`,
      ubicacionTitulo: 'Módulo de Coordinación',
      ubicacionSub: 'Oficina de coordinación',
      atiende: 'Atiende: Usuario (Coordinadora)',
    }

    setProximasCitas((prev) => [
      nuevaCitaCard,
      ...prev.map((item) => ({ ...item, destacada: false })),
    ])

    setUltimaSolicitud({
      titulo: selectedTramite.tituloDetalle || selectedTramite.titulo,
      folio: `Folio ${nuevoFolio}`,
      tiempo: 'Hace un momento',
      estado: 'CONFIRMADA',
    })

    onNavigate('student-citas')
  }

  function handleUpdateStudent(changes) {
    setStudent((prev) => ({ ...prev, ...changes }))
  }

  if (route === 'student-login') {
    return (
      <StudentLoginPage
        cicloPortal={student.cicloPortal}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToAdmin={onLogoutToAdmin}
      />
    )
  }

  if (route === 'student-schedule') {
    return (
      <StudentSchedulePage
        student={student}
        selectedTramite={selectedTramite}
        semanas={semanasDisponibles}
        horarios={horariosPorDefecto}
        selectedDay={selectedDay}
        selectedSlot={selectedSlot}
        onSelectDay={setSelectedDay}
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
      />
    )
  }

  if (route === 'student-profile') {
    return (
      <StudentProfilePage
        student={student}
        onUpdateStudent={handleUpdateStudent}
        onNavigateTab={onNavigate}
        onLogout={() => onNavigate('student-login')}
      />
    )
  }

  return (
    <StudentHomePage
      student={student}
      notice={officialNotice}
      tramites={tramitesCatalog}
      ultimaSolicitud={ultimaSolicitud}
      onSelectTramite={handleSelectTramite}
      onNavigateTab={onNavigate}
    />
  )
}

export default EstudiantesModule