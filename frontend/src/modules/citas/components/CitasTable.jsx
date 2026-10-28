import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import '../css/citas-table.css'

function CitasTable({ rows, total, page, pageCount, onPageChange, onAction }) {
  return (
    <section className="citas-table" aria-label="Citas actuales registradas">
      <p className="citas-table__mobile-hint">Desliza la tabla para ver todas las columnas →</p>
      <div className="citas-table__scroll">
        <table>
          <colgroup>
            <col className="citas-table__col-control" />
            <col className="citas-table__col-name" />
            <col className="citas-table__col-semester" />
            <col className="citas-table__col-career" />
            <col className="citas-table__col-procedure" />
            <col className="citas-table__col-date" />
            <col className="citas-table__col-status" />
            <col className="citas-table__col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">No.<br />Control</th>
              <th scope="col">Nombre</th>
              <th scope="col">Semestre</th>
              <th scope="col">Carrera</th>
              <th scope="col">Trámite</th>
              <th scope="col">Fecha</th>
              <th scope="col">Estatus</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((cita) => (
              <tr key={cita.control}>
                <td className="citas-table__control">{cita.control}</td>
                <td>{cita.nombre}</td>
                <td>{cita.semestre}</td>
                <td>{cita.carrera}</td>
                <td>{cita.tramite}</td>
                <td className="citas-table__date">{cita.fecha}</td>
                <td className="citas-table__status-cell">
                  <span className={`citas-table__status citas-table__status--${cita.estatus.toLowerCase()}`}>{cita.estatus}</span>
                </td>
                <td className="citas-table__actions-cell">
                  <button
                    type="button"
                    className="citas-table__action"
                    aria-label={`Acciones para la cita de ${cita.nombre}`}
                    onClick={() => onAction(`Las acciones de la cita de ${cita.nombre} estarán disponibles próximamente.`)}
                  >
                    <DashboardIcon name="more" size={15} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" className="citas-table__empty">No se encontraron citas con esos filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="citas-table__footer">
        <span>Mostrando {rows.length} de {total} citas registradas</span>
        <div className="citas-table__pagination" aria-label="Paginación">
          <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Anterior</button>
          <span aria-current="page">{page}</span>
          <button type="button" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>Siguiente</button>
        </div>
      </footer>
    </section>
  )
}

export default CitasTable
