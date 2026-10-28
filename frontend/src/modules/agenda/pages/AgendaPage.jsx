import { useState } from 'react'
import AgendaBanner from '../components/AgendaBanner.jsx'
import AgendaToolbar from '../components/AgendaToolbar.jsx'
import WeekCalendar from '../components/WeekCalendar.jsx'
import { mondayOf, SAMPLE_WEEK_START, shiftWeek } from '../data/agendaData.js'
import '../css/agenda-page.css'

function AgendaPage({ onAction }) {
  const [monday, setMonday] = useState(SAMPLE_WEEK_START)

  return (
    <div className="agenda-page">
      <AgendaBanner onRequests={() => onAction('La bandeja de solicitudes estará disponible próximamente.')} />
      <AgendaToolbar
        monday={monday}
        onToday={() => setMonday(mondayOf(new Date()))}
        onShiftWeek={(weeks) => setMonday((current) => shiftWeek(current, weeks))}
        onOtherView={(view) => onAction(`La vista de ${view} estará disponible próximamente.`)}
        onAdd={() => onAction('El formulario para agregar citas estará disponible próximamente.')}
      />
      <WeekCalendar
        monday={monday}
        onAppointment={(appointment) => onAction(`Cita de ${appointment.student}: ${appointment.title}. Datos de demostración.`)}
      />
    </div>
  )
}

export default AgendaPage
