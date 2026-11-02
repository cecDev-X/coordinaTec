export const weekdays = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO']

const pendingStates = new Set(['PROGRAMADA', 'PENDIENTE', 'CONFIRMADA', 'REAGENDADA'])

export function isPending(estado) {
  return pendingStates.has(estado)
}

export function statusLabel(estado) {
  if (!estado) return 'Sin estado'
  const text = estado.toLocaleLowerCase('es')
  return text[0].toLocaleUpperCase('es') + text.slice(1)
}

export function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function mondayOf(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7))
}

export function shiftWeek(monday, weeks) {
  return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + weeks * 7)
}

export function appointmentsForWeek(appointments, monday, filter = 'all') {
  const firstDay = dateKey(monday)
  const lastDay = dateKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6))

  return appointments.filter((appointment) => (
    appointment.fecha >= firstDay && appointment.fecha <= lastDay &&
    (filter === 'all' || (filter === 'attended' && appointment.estado === 'ATENDIDA') ||
      (filter === 'pending' && isPending(appointment.estado)))
  ))
}

export function hoursFor(appointments) {
  const appointmentHours = appointments.map((appointment) => Number(appointment.horaInicio?.slice(0, 2)))
    .filter((hour) => Number.isInteger(hour) && hour >= 0 && hour <= 23)
  const first = Math.min(8, ...appointmentHours)
  const last = Math.max(17, ...appointmentHours)

  return Array.from({ length: last - first + 1 }, (_, index) => String(first + index).padStart(2, '0'))
}

function shortMonth(date) {
  const month = new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(date).replace('.', '')
  return month[0].toUpperCase() + month.slice(1)
}

export function weekLabel(monday) {
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)
  const start = `${monday.getDate()} ${shortMonth(monday)}`
  const end = `${sunday.getDate()} ${shortMonth(sunday)}`
  if (monday.getFullYear() !== sunday.getFullYear()) {
    return `${start} ${monday.getFullYear()} - ${end} ${sunday.getFullYear()}`
  }
  return `${start} - ${end}, ${sunday.getFullYear()}`
}
