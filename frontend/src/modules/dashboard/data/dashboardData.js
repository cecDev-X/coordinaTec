// Sample content for the UI until the coordinator endpoints are connected.
export const metrics = [
  {
    label: 'Citas pendientes', value: '12', icon: 'clock', tone: 'amber',
    detail: '+4 en las últimas 2 hrs', detailIcon: 'trending',
  },
  {
    label: 'Atendidas hoy', value: '45', icon: 'check', tone: 'green',
    detail: '82% resueltas favorablemente', detailIcon: 'check',
  },
  {
    label: 'Alumnos en plataforma', value: '1,250', icon: 'users', tone: 'blue',
    detail: 'Total matriculados ISC', detailIcon: 'school',
  },
  {
    label: 'Trámites rechazados', value: '2', icon: 'ban', tone: 'red',
    detail: 'Por adeudo o requisitos', detailIcon: 'warning',
  },
]

export const appointments = [
  {
    id: 'monica', time: '09:00', name: 'Mónica Castillo H.',
    description: 'Ajuste de Carga · Matrícula 22168341', status: 'Confirmada', tone: 'green',
  },
  {
    id: 'carlos', time: '09:30', name: 'Carlos E. Castellanos',
    description: 'Baja Temporal de Semestre · Matrícula 21160912', status: 'En Sala de Espera', tone: 'amber',
  },
  {
    id: 'diego', time: '10:15', name: 'Diego Revilla Magali Sarai',
    description: 'Carga Superior a la Máxima · Matrícula 23160887', status: 'Programada', tone: 'blue',
  },
]

export const announcements = [
  {
    id: 'deadline', title: 'Cierre de trámites', date: '22 Oct', icon: 'megaphone', tone: 'orange',
    content: 'Límite para recepción de dictámenes extraordinarios y bajas de asignatura ante el Comité Académico.',
  },
  {
    id: 'sync', title: 'SUITO sincronizado', date: 'Hoy 07:00', icon: 'chart', tone: 'green',
    content: 'Base de datos de kardex y créditos actualizada correctamente con el servidor central de Servicios Escolares.',
  },
]
