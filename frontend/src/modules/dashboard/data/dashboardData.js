const pendingStates = new Set(['PROGRAMADA', 'PENDIENTE', 'CONFIRMADA', 'REAGENDADA'])

export const metrics = [
  {
    id: 'pending',
    label: 'Citas pendientes',
    icon: 'clock',
    tone: 'amber',
    detail: 'Requieren atención',
    detailIcon: 'trending',
  },
  {
    id: 'attended-today',
    label: 'Atendidas hoy',
    icon: 'check',
    tone: 'green',
    detail: 'Registradas hoy (hora de Oaxaca)',
    detailIcon: 'check',
  },
  {
    id: 'students',
    label: 'Alumnos en plataforma',
    icon: 'users',
    tone: 'blue',
    detail: 'El resumen de alumnos aún no está conectado',
    detailIcon: 'school',
  },
  {
    id: 'rejected',
    label: 'Trámites rechazados',
    icon: 'ban',
    tone: 'red',
    detail: 'El flujo de rechazo aún no está disponible',
    detailIcon: 'warning',
  },
]

export function isPendingAppointment(appointment) {
  return pendingStates.has(appointment.estado)
}

export function countPendingAppointments(appointments) {
  return appointments.filter(isPendingAppointment).length
}

function dateInOaxaca(value) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value)
}

export function countAppointmentsAttendedToday(appointments, now = new Date()) {
  const today = dateInOaxaca(now)
  return appointments.filter((appointment) => (
    appointment.estado === 'ATENDIDA' &&
    appointment.fechaAtencion &&
    dateInOaxaca(new Date(appointment.fechaAtencion)) === today
  )).length
}

export function getUpcomingAppointments(appointments, now = new Date()) {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`

  return appointments
    .filter((appointment) => (
      isPendingAppointment(appointment) &&
      (appointment.fecha > today || (appointment.fecha === today && appointment.horaInicio >= currentTime))
    ))
    .sort((first, second) => (
      first.fecha.localeCompare(second.fecha) ||
      first.horaInicio.localeCompare(second.horaInicio) ||
      first.folio.localeCompare(second.folio)
    ))
    .slice(0, 3)
}

export function formatAppointmentDate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' })
    .format(new Date(year, month - 1, day))
    .replace('.', '')
}

export function formatStatus(value) {
  if (!value) return 'Sin estado'
  const text = value.toLocaleLowerCase('es')
  return text[0].toLocaleUpperCase('es') + text.slice(1)
}
