import DashboardIcon from '../../dashboard/components/DashboardIcon.jsx'
import '../css/tramites-table.css'

function TramitesTable({ rows, total, onAction }) {
  return (
    <section className="tramites-table" aria-label="Trámites registrados">
      <p className="tramites-table__mobile-hint">Desliza la tabla para ver todas las columnas →</p>
      <div className="tramites-table__scroll">
        <table>
          <colgroup>
            <col className="tramites-table__col-id" />
            <col className="tramites-table__col-name" />
            <col className="tramites-table__col-period" />
            <col className="tramites-table__col-requirements" />
            <col className="tramites-table__col-status" />
            <col className="tramites-table__col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Nombre del trámite</th>
              <th scope="col">Periodo<br />(días)</th>
              <th scope="col">Requisitos</th>
              <th scope="col">Estatus</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((tramite) => (
              <tr key={tramite.id}>
                <td className="tramites-table__id">{tramite.id}</td>
                <td className="tramites-table__name"><span>{tramite.nombre}</span></td>
                <td className="tramites-table__period">{tramite.periodo}</td>
                <td>{tramite.requisitos}</td>
                <td className="tramites-table__status-cell">
                  <span className={`tramites-table__status tramites-table__status--${tramite.estatus === 'Activo' ? 'active' : 'inactive'}`}>
                    {tramite.estatus}
                  </span>
                </td>
                <td className="tramites-table__actions-cell">
                  <button
                    type="button"
                    className="tramites-table__action"
                    aria-label={`Acciones para ${tramite.nombre}`}
                    onClick={() => onAction(`Las acciones para ${tramite.nombre} estarán disponibles próximamente.`)}
                  >
                    <DashboardIcon name="more" size={15} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="tramites-table__empty">No se encontraron trámites con esos filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="tramites-table__footer">
        <span>Mostrando {rows.length} de {total} trámites registrados</span>
        <div className="tramites-table__pagination" aria-label="Paginación">
          <button type="button" disabled>Anterior</button>
          <span aria-current="page">1</span>
          <button type="button" disabled>Siguiente</button>
        </div>
      </footer>
    </section>
  )
}

export default TramitesTable
