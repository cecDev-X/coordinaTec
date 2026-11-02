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
  cicloPortal: 'Ciclo 2024-B',
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

export const semanasDisponibles = [
  {
    id: 'oct-12-16',
    rangoTexto: '12 Oct - 16 Oct, 2026',
    dias: [
      { id: '2026-10-12', diaCorto: 'Lun', numero: '12', mesCorto: 'Oct', fechaCompleta: 'Lunes 12 de Octubre', fechaCorta: 'Lunes 12 Oct', tieneCupo: true },
      { id: '2026-10-13', diaCorto: 'Mar', numero: '13', mesCorto: 'Oct', fechaCompleta: 'Martes 13 de Octubre', fechaCorta: 'Martes 13 Oct', tieneCupo: true },
      { id: '2026-10-14', diaCorto: 'Mié', numero: '14', mesCorto: 'Oct', fechaCompleta: 'Miércoles 14 de Octubre', fechaCorta: 'Miércoles 14 Oct', tieneCupo: false },
      { id: '2026-10-15', diaCorto: 'Jue', numero: '15', mesCorto: 'Oct', fechaCompleta: 'Jueves 15 de Octubre', fechaCorta: 'Jueves 15 Oct', tieneCupo: true },
      { id: '2026-10-16', diaCorto: 'Vie', numero: '16', mesCorto: 'Oct', fechaCompleta: 'Viernes 16 de Octubre', fechaCorta: 'Viernes 16 Oct', tieneCupo: true },
    ],
  },
  {
    id: 'oct-19-23',
    rangoTexto: '19 Oct - 23 Oct, 2026',
    dias: [
      { id: '2026-10-19', diaCorto: 'Lun', numero: '19', mesCorto: 'Oct', fechaCompleta: 'Lunes 19 de Octubre', fechaCorta: 'Lunes 19 Oct', tieneCupo: true },
      { id: '2026-10-20', diaCorto: 'Mar', numero: '20', mesCorto: 'Oct', fechaCompleta: 'Martes 20 de Octubre', fechaCorta: 'Martes 20 Oct', tieneCupo: true },
      { id: '2026-10-21', diaCorto: 'Mié', numero: '21', mesCorto: 'Oct', fechaCompleta: 'Miércoles 21 de Octubre', fechaCorta: 'Miércoles 21 Oct', tieneCupo: true },
      { id: '2026-10-22', diaCorto: 'Jue', numero: '22', mesCorto: 'Oct', fechaCompleta: 'Jueves 22 de Octubre', fechaCorta: 'Jueves 22 Oct', tieneCupo: false },
      { id: '2026-10-23', diaCorto: 'Vie', numero: '23', mesCorto: 'Oct', fechaCompleta: 'Viernes 23 de Octubre', fechaCorta: 'Viernes 23 Oct', tieneCupo: true },
    ],
  },
]

export const horariosPorDefecto = [
  { id: '08:30', hora: '08:30 AM', hora24: '08:30:00', disponible: true },
  { id: '09:15', hora: '09:15 AM', hora24: '09:15:00', disponible: true },
  { id: '10:00', hora: '10:00 AM', hora24: '10:00:00', disponible: true },
  { id: '11:30', hora: '11:30 AM', hora24: '11:30:00', disponible: false },
  { id: '12:15', hora: '12:15 PM', hora24: '12:15:00', disponible: true },
  { id: '13:00', hora: '01:00 PM', hora24: '13:00:00', disponible: true },
]

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

export async function loginStudentApi(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch {
    return null
  }
}

export async function createCitaApi({ numControlEstudiante, fecha, horaInicio, motivo }) {
  try {
    const response = await fetch(`${API_BASE_URL}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numControlEstudiante,
        fecha,
        horaInicio,
        motivo,
      }),
    })
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch {
    return null
  }
}

export async function fetchCitasEstudianteApi(numControl) {
  try {
    const response = await fetch(`${API_BASE_URL}/citas/estudiantes/${numControl}`)
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch {
    return []
  }
}