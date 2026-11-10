import '../css/chief-analytics-summary.css'

const statusNames = {
  PROGRAMADA: 'Programadas',
  PENDIENTE: 'Pendientes',
  ATENDIDA: 'Atendidas',
  RECHAZADA: 'Rechazadas',
  CANCELADA: 'Canceladas',
}

function countBy(records, property) {
  const counts = new Map()
  records.forEach((record) => {
    const key = record[property] || 'Sin especificar'
    counts.set(key, (counts.get(key) || 0) + 1)
  })
  return [...counts.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((first, second) => second.total - first.total || first.label.localeCompare(second.label, 'es'))
    .slice(0, 5)
}

function ChiefAnalyticsSummary({ appointments }) {
  const byStatus = countBy(appointments, 'estado')
  const byCareer = countBy(appointments, 'carrera')
  const byProcedure = countBy(appointments, 'tramite')

  return (
    <section className="chief-analytics" aria-labelledby="chief-analytics-title">
      <header className="chief-analytics__header">
        <div><span>VISTA INSTITUCIONAL</span><h2 id="chief-analytics-title">Análisis de coordinación</h2><p>Resumen de citas por estatus, carrera y trámite.</p></div>
        <span className="chief-analytics__total"><strong>{appointments.length}</strong> citas analizadas</span>
      </header>
      <div className="chief-analytics__grid">
        <Breakdown title="Estatus de citas" items={byStatus.map((item) => ({ ...item, label: statusNames[item.label] || item.label }))} total={appointments.length} />
        <Breakdown title="Carreras con más actividad" items={byCareer} total={appointments.length} />
        <Breakdown title="Trámites más solicitados" items={byProcedure} total={appointments.length} />
      </div>
    </section>
  )
}

function Breakdown({ title, items, total }) {
  return (
    <article className="chief-analytics__card">
      <h3>{title}</h3>
      {items.length ? <ul>{items.map(({ label, total: count }) => (
        <li key={label}><div><span>{label}</span><strong>{count}</strong></div><span className="chief-analytics__track"><i style={{ width: `${Math.max(5, (count / Math.max(total, 1)) * 100)}%` }} /></span></li>
      ))}</ul> : <p className="chief-analytics__empty">No hay datos para analizar todavía.</p>}
    </article>
  )
}

export default ChiefAnalyticsSummary
