const API_BASE_URL = 'http://localhost:8080/api/v1'

export const initialStudentProfile = {
  nombre: 'Diego',
  iniciales: 'Dg',
  carrera: 'Ingeniería en Sistemas Computacionales',
  carreraCorto: 'ISC',
  numControl: '23160887',
  matriculaInicio: '22160887',
  semestre: '7° Semestre',
  estatus: 'Regular',
  estatusLargo: 'Alumno Regular',
  cicloActivo: 'Ene - Jun 2026',
  departamento: 'Depto. de Sistemas y Computación',
  correo: '23160887@itoaxaca.edu.mx',
  telefono: '+52 951 123 4567',
  notificacionesCitas: true,
  recordatoriosCorreo: true,
}

export const officialNotice = {
  titulo: 'AVISO OFICIAL',
  fechaCierre: 'Cierre 22 Oct',
  descripcion: 'Recepción de dictámenes y solicitudes de ajuste académico en coordinación.',
  resumenCorto: 'Recepción de dictámenes y a...',
}

export const tramitesCatalog = [
  {
    id: 'baja-materia',
    clave: 'T003',
    titulo: 'Baja de materia',
    tituloDetalle: 'Baja de Materia',
    badge: 'ACTIVO',
    badgeVariant: 'blue',
    descripcionCorta: 'Solicita el retiro de asignatura...',
    tiempoEstimado: 'Est. 24 - 48 hrs',
    tiempoDetalle: '1 día hábil',
    area: 'Comité Académico',
    departamento: 'Depto. de Sistemas y Computación',
    icono: 'book-open',
    metaTipo: 'clock',
    requisitosTexto:
      'Para proceder con la solicitud de Baja de Materia, deberás presentar los documentos oficiales debidamente llenados y firmados. Asegúrate de cumplir con los créditos mínimos requeridos y no adeudar material en laboratorios.',
    validaciones: ['Créditos en regla', 'Sin adeudos labs'],
    formatos: [
      {
        id: 'fmt-1',
        titulo: 'Formato Solicitud Baja de Materia',
        tituloCorto: 'Formato Solicitud B',
        subtitulo: 'PDF · 245 KB',
        tipo: 'pdf',
        accion: 'Bajar',
      },
      {
        id: 'fmt-2',
        titulo: 'Guía Procedimiento Académico',
        tituloCorto: 'Guía Procedimiento',
        subtitulo: 'PDF · 180 KB',
        tipo: 'pdf-doc',
        accion: 'Bajar',
      },
      {
        id: 'fmt-3',
        titulo: 'Kardex Simple Actualizado',
        tituloCorto: 'Kardex Simple Actuali',
        subtitulo: 'Portal TecNM · Consulta directa',
        tipo: 'external',
        accion: 'SII',
        url: 'https://sii.itoaxaca.edu.mx/',
      },
    ],
  },
  {
    id: 'cambio-horario',
    clave: 'T004',
    titulo: 'Cambio de horario',
    tituloCorto: 'Cambio de hor',
    tituloDetalle: 'Cambio de Horario / Grupo',
    badge: 'CUPO SUJETO',
    badgeVariant: 'neutral',
    descripcionCorta: 'Reubica grupo u horario para...',
    validacionTexto: 'Validación en línea',
    tiempoDetalle: '1 a 2 días hábiles',
    departamento: 'Depto. de Sistemas y Computación',
    icono: 'history-clock',
    metaTipo: 'desk',
    requisitosTexto:
      'Para solicitar cambio de grupo u horario deberás justificar el cruce de asignaturas o motivo laboral y verificar disponibilidad en el grupo destino.',
    validaciones: ['Horario vigente', 'Cupo verificado'],
    formatos: [
      {
        id: 'fmt-ch-1',
        titulo: 'Formato Cambio de Grupo',
        tituloCorto: 'Formato Cambio Gru',
        subtitulo: 'PDF · 210 KB',
        tipo: 'pdf',
        accion: 'Bajar',
      },
      {
        id: 'fmt-ch-2',
        titulo: 'Carga Académica Actual',
        tituloCorto: 'Carga Académica Act',
        subtitulo: 'Portal TecNM · Consulta directa',
        tipo: 'external',
        accion: 'SII',
        url: 'https://sii.itoaxaca.edu.mx/',
      },
    ],
  },
  {
    id: 'carga-maxima',
    clave: 'T005',
    titulo: 'Carga máxima',
    tituloCorto: 'Carga máxim',
    tituloDetalle: 'Carga Superior a la Máxima',
    badge: 'PROMEDIO ≥ 85',
    badgeVariant: 'blue',
    descripcionCorta: 'Solicitud de créditos adicionales...',
    validacionTexto: 'Dictamen Especial',
    tiempoDetalle: '2 días hábiles',
    departamento: 'Depto. de Sistemas y Computación',
    icono: 'gauge',
    metaTipo: 'verified',
    requisitosTexto:
      'Revisión previa de kárdex con promedio mínimo de 85 puntos requerida y sin asignaturas en curso especial.',
    validaciones: ['Promedio ≥ 85', 'Sin cursos especiales'],
    formatos: [
      {
        id: 'fmt-cm-1',
        titulo: 'Solicitud de Créditos Adicionales',
        tituloCorto: 'Solicitud Créditos A',
        subtitulo: 'PDF · 195 KB',
        tipo: 'pdf',
        accion: 'Bajar',
      },
      {
        id: 'fmt-cm-2',
        titulo: 'Kardex Simple Actualizado',
        tituloCorto: 'Kardex Simple Actuali',
        subtitulo: 'Portal TecNM · Consulta directa',
        tipo: 'external',
        accion: 'SII',
        url: 'https://sii.itoaxaca.edu.mx/',
      },
    ],
  },
  {
    id: 'baja-temporal',
    clave: 'T006',
    titulo: 'Baja temporal',
    tituloCorto: 'Baja temporal',
    tituloDetalle: 'Baja Temporal del Semestre',
    badge: '',
    badgeVariant: 'none',
    descripcionCorta: 'Suspensión programada de...',
    validacionTexto: 'Norma TecNM Art. 38',
    tiempoDetalle: '2 a 3 días hábiles',
    departamento: 'Depto. de Sistemas y Computación',
    icono: 'pause-circle',
    metaTipo: 'rule',
    requisitosTexto:
      'La baja temporal suspende tus estudios durante el semestre en curso conforme al Artículo 38 del lineamiento académico del TecNM.',
    validaciones: ['Sin adeudos biblioteca', 'Sin adeudos labs'],
    formatos: [
      {
        id: 'fmt-bt-1',
        titulo: 'Formato Oficial Baja Temporal',
        tituloCorto: 'Formato Baja Tempo',
        subtitulo: 'PDF · 260 KB',
        tipo: 'pdf',
        accion: 'Bajar',
      },
      {
        id: 'fmt-bt-2',
        titulo: 'Constancia de No Adeudo',
        tituloCorto: 'Constancia No Adeu',
        subtitulo: 'PDF · 150 KB',
        tipo: 'pdf-doc',
        accion: 'Bajar',
      },
    ],
  },
  {
    id: 'otro-tramite',
    clave: 'T007',
    titulo: 'Otro trámite o asesoría',
    tituloCorto: 'Otro trámite o asesoría',
    tituloDetalle: 'Asesoría Académica / Otro Trámite',
    badge: '',
    badgeVariant: 'none',
    descripcionCorta: 'Dudas de convalidación, servicio...',
    validacionTexto: 'Cita con Coordinador',
    tiempoDetalle: 'Atención directa',
    departamento: 'Depto. de Sistemas y Computación',
    icono: 'headset',
    metaTipo: 'chat',
    requisitosTexto:
      'Acude con tu credencial institucional vigente y los documentos de soporte relacionados con tu consulta académica o convalidación.',
    validaciones: ['Credencial vigente', 'Matrícula activa'],
    formatos: [
      {
        id: 'fmt-ot-1',
        titulo: 'Formato Único de Atención',
        tituloCorto: 'Formato Único Aten',
        subtitulo: 'PDF · 140 KB',
        tipo: 'pdf-doc',
        accion: 'Bajar',
      },
    ],
  },
]

export const ultimaSolicitudHome = {
  titulo: 'Ajuste de Carga',
  folio: 'Folio #2026-ISC-0419',
  tiempo: 'Ayer',
  estado: 'EN REVISIÓN',
}

export function buildScheduleWeeks(horarios, startDate = new Date(), weekCount = 8) {
  const scheduledDays = new Set(horarios.map((horario) => horario.diaSemana))
  const today = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))

  return Array.from({ length: weekCount }, (_, weekOffset) => {
    const weekMonday = new Date(monday)
    weekMonday.setDate(monday.getDate() + weekOffset * 7)
    const dias = Array.from({ length: 7 }, (_, dayOffset) => {
      const date = new Date(weekMonday)
      date.setDate(weekMonday.getDate() + dayOffset)
      if (date < today || !scheduledDays.has(dayOffset + 1)) return null
      const id = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
      const dateLabel = date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      return {
        id,
        diaCorto: date.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', ''),
        numero: String(date.getDate()),
        mesCorto: date.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''),
        fechaCompleta: dateLabel,
        fechaCorta: date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' }),
        tieneCupo: true,
      }
    }).filter(Boolean)

    if (!dias.length) return null
    return {
      id: dias[0].id,
      rangoTexto: dias.length === 1 ? dias[0].fechaCorta : `${dias[0].fechaCorta} - ${dias[dias.length - 1].fechaCorta}`,
      dias,
    }
  }).filter(Boolean)
}

export async function fetchCitaCatalogosApi() {
  const response = await fetch(`${API_BASE_URL}/catalogos/citas`)
  if (!response.ok) throw new Error(`No se pudieron consultar coordinadores y formatos (${response.status}).`)
  return response.json()
}

export async function fetchHorariosCoordinadorApi(rfc) {
  const response = await fetch(`${API_BASE_URL}/coordinadores/${encodeURIComponent(rfc)}/horarios`)
  if (!response.ok) throw new Error(`No se pudo consultar el horario del coordinador (${response.status}).`)
  return response.json()
}

export async function fetchDisponibilidadApi(rfc, fecha, duracionMinutos) {
  const params = new URLSearchParams({ fecha, duracionMinutos: String(duracionMinutos) })
  const response = await fetch(`${API_BASE_URL}/coordinadores/${encodeURIComponent(rfc)}/disponibilidad?${params}`)
  if (!response.ok) throw new Error(`No se pudo consultar la disponibilidad (${response.status}).`)
  const slots = await response.json()
  return slots.map((hora24) => {
    const [hours, minutes] = hora24.split(':').map(Number)
    const hour12 = ((hours + 11) % 12) + 1
    return {
      id: hora24.slice(0, 5),
      hora: `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`,
      hora24: hora24.length === 5 ? `${hora24}:00` : hora24,
      disponible: true,
    }
  })
}

export const initialCitasData = {
  proximas: [
    {
      id: 'cita-1',
      folio: '#CT-2026-0887',
      titulo: 'Baja de Materia',
      estado: 'Confirmada',
      tipoEstado: 'confirmada',
      destacada: true,
      fechaTexto: 'Jueves 15 de Octubre, 2026',
      horaTexto: '10:00 AM (Tolerancia 10 min)',
      ubicacionTitulo: 'Módulo de Coordinación',
      ubicacionSub: 'Oficina de coordinación',
      atiende: 'Atiende: Usuario (Coordinadora)',
    },
    {
      id: 'cita-2',
      folio: '#CT-2026-0914',
      titulo: 'Carga Superior a la Máxima',
      estado: 'En Revisión',
      tipoEstado: 'revision',
      destacada: false,
      fechaTexto: 'Martes 20 de Octubre, 2026',
      horaTexto: '11:30 AM • Sujeto a validación de créditos',
      notaInterna: 'Revisión previa de kárdex con promedio mínimo de 85 puntos requerida.',
      pieNota: 'Confirmación por correo en 24h',
    },
  ],
  historial: [
    {
      id: 'hist-1',
      folio: '#CT-2026-0740',
      titulo: 'Asesoría de Convalidación',
      estado: 'Reagendada',
      tipoEstado: 'reagendada',
      fechaAnterior: '10 de Octubre',
      fechaNueva: '22 de Octubre, 09:00 AM',
      motivo: 'Motivo: Cambio de horario solicitado por coordinación por reunión de academia.',
    },
    {
      id: 'hist-2',
      folio: '#CT-2026-0612',
      titulo: 'Cambio de Carrera / Grupo',
      estado: 'Atendida',
      tipoEstado: 'atendida',
      fechaTexto: '28 de Septiembre, 2026 • 12:00 PM',
      dictamenTitulo: 'Dictamen Coordinación',
      dictamenTexto: 'Resolución aprobada y registrada en SII de manera satisfactoria.',
    },
    {
      id: 'hist-3',
      folio: '#CT-2026-0509',
      titulo: 'Ajuste Extemporáneo',
      estado: 'Rechazada',
      tipoEstado: 'rechazada',
      fechaTexto: '15 de Septiembre, 2026',
      causaRechazo: 'Causa: Falta de firmas en formato de solicitud oficial y adeudo activo en biblioteca central.',
    },
  ],
}

async function postStudentAuth(path, payload) {
  const response = await fetch(`${API_BASE_URL}/estudiantes/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(result.mensaje || 'No se pudo completar la solicitud.')
    error.status = response.status
    throw error
  }
  return result
}

export function loginStudentApi(numControl, password) {
  return postStudentAuth('sesion', { numControl, password })
}

export function registerStudentApi({ numControl, nombres, apellidos, carrera, password }) {
  return postStudentAuth('registro', { numControl, nombres, apellidos, carrera, password })
}

export async function fetchStudentProfileApi(numControl) {
  const response = await fetch(`${API_BASE_URL}/estudiantes/${encodeURIComponent(numControl)}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`No se pudo consultar el perfil (${response.status}).`)
  return response.json()
}

export async function fetchTramitesApi() {
  const response = await fetch(`${API_BASE_URL}/tramites`)
  if (!response.ok) throw new Error(`No se pudieron consultar los trámites (${response.status}).`)
  const records = await response.json()
  return records.filter((tramite) => tramite.activo).map((tramite) => ({
    ...tramite,
    titulo: tramite.nombre,
    tituloCorto: tramite.nombre,
    tituloDetalle: tramite.nombre,
    descripcionCorta: tramite.requisitos,
    requisitosTexto: tramite.requisitos,
    tiempoEstimado: `${tramite.periodo} ${tramite.periodo === 1 ? 'día' : 'días'}`,
    tiempoDetalle: `${tramite.periodo} ${tramite.periodo === 1 ? 'día' : 'días'}`,
    clave: String(tramite.id),
    badge: tramite.prioridad,
    badgeVariant: tramite.prioridad === 'ALTA' ? 'blue' : 'neutral',
    icono: 'receipt',
  }))
}

export async function createCitaApi({ numControlEstudiante, fecha, horaInicio, motivo, coordinadorRfc, formatoFolio }) {
  const response = await fetch(`${API_BASE_URL}/citas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      numControlEstudiante,
      fecha,
      horaInicio,
      motivo,
      coordinadorRfc,
      formatoFolio,
    }),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(result.mensaje || result.detail || `No se pudo guardar la cita (${response.status}).`)
  }
  return result
}

export async function fetchCitasEstudianteApi(numControl) {
  const response = await fetch(`${API_BASE_URL}/citas/estudiantes/${encodeURIComponent(numControl)}`)
  if (!response.ok) throw new Error(`No se pudieron consultar tus citas (${response.status}).`)
  return response.json()
}
