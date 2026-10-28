// Sample appointments for the week shown in the design. No API calls or persistence.
export const SAMPLE_WEEK_START = new Date(2026, 9, 12)

export const hours = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM']
export const weekdays = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES']

export const appointments = [
  { id: 'ajuste', day: 0, hour: 0, title: 'Ajuste de Carga', student: 'Luna Cebonios S', registration: '23160896' },
  { id: 'justificante', day: 2, hour: 1, title: 'Justificante', student: 'Velásquez Ignacio', registration: '22161272' },
  { id: 'baja', day: 0, hour: 2, title: 'Baja de Materia', student: 'Diego Revilla M', registration: '23160887' },
  { id: 'otro', day: 4, hour: 2, title: 'Otro trámite', student: 'Sánchez Hdez', registration: '22161272' },
]

export function mondayOf(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7))
}

export function shiftWeek(monday, weeks) {
  return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + weeks * 7)
}

function shortMonth(date) {
  const month = new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(date).replace('.', '')
  return month[0].toUpperCase() + month.slice(1)
}

export function weekLabel(monday) {
  const friday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4)
  const start = `${monday.getDate()} ${shortMonth(monday)}`
  const end = `${friday.getDate()} ${shortMonth(friday)}`
  return `${start} - ${end}, ${friday.getFullYear()}`
}
