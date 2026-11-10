import { useEffect, useMemo, useState } from 'react'
import CareerSelection from '../components/CareerSelection.jsx'
import '../css/estudiantes-admin-page.css'

function EstudiantesAdminPage({ token, role, username }) {
  const [students, setStudents] = useState([])
  const [careers, setCareers] = useState([])
  const [selectedCareer, setSelectedCareer] = useState(undefined)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/v1/catalogos/citas', {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error(`No fue posible cargar el directorio de alumnos (HTTP ${response.status}).`)
      const data = await response.json()
      if (!Array.isArray(data.estudiantes) || !Array.isArray(data.coordinadores)) throw new Error('La respuesta del servidor no es válida.')
      let availableCareers
      if (role === 'JEFE_COORDINADORES') {
        const careersResponse = await fetch('/api/v1/jefe-coordinadores/carreras', { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
        if (!careersResponse.ok) throw new Error('No se pudo cargar el catálogo de carreras.')
        availableCareers = await careersResponse.json()
      } else {
        availableCareers = data.coordinadores.find((item) => item.rfc.toLocaleLowerCase() === username?.toLocaleLowerCase())?.carreras || []
      }
      return { registeredStudents: data.estudiantes, availableCareers }
    }).then(({ registeredStudents, availableCareers }) => {
      setStudents(registeredStudents)
      setCareers(availableCareers)
    }).catch((requestError) => {
      if (!controller.signal.aborted) setError(requestError.message)
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [role, token, username])

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es')
    return students.filter((student) => (
      (selectedCareer === null || selectedCareer === undefined || student.carrera === selectedCareer) &&
      (!normalizedQuery || `${student.nombre} ${student.numControl} ${student.carrera}`.toLocaleLowerCase('es').includes(normalizedQuery))
    ))
  }, [query, selectedCareer, students])

  const careerCount = new Set(filteredStudents.map((student) => student.carrera)).size

  if (!loading && !error && selectedCareer === undefined) {
    const careerSummary = careers.map((nombre) => ({ nombre, total: students.filter((student) => student.carrera === nombre).length }))
    return <CareerSelection title="Alumnos por carrera" description={role === 'JEFE_COORDINADORES' ? 'Explora los alumnos registrados en cada carrera o consulta toda la institución.' : 'Consulta los alumnos de las carreras que tienes asignadas.'} countLabel="alumnos" total={students.length} careers={careerSummary} onSelect={setSelectedCareer} />
  }

  return (
    <section className="admin-students">
      <header className="admin-students__heading">
        <button type="button" className="admin-students__back" onClick={() => { setSelectedCareer(undefined); setQuery('') }}>← <span>Volver a carreras</span></button>
        <p className="admin-students__eyebrow">DIRECTORIO ACADÉMICO</p>
        <h1>{selectedCareer ? `Alumnos · ${selectedCareer}` : 'Todos los alumnos'}</h1>
        <p className="admin-students__description">{role === 'JEFE_COORDINADORES' ? 'Consulta todos los alumnos registrados en la plataforma.' : 'Consulta alumnos pertenecientes a las carreras que tienes asignadas.'}</p>
      </header>

      <div className="admin-students__summary">
        <article><span>Alumnos en esta vista</span><strong>{loading ? '—' : filteredStudents.length.toLocaleString('es-MX')}</strong></article>
        <article><span>Carreras representadas</span><strong>{loading ? '—' : careerCount.toLocaleString('es-MX')}</strong></article>
      </div>

      <section className="admin-students__directory" aria-labelledby="admin-students-list-title">
        <header className="admin-students__directory-heading">
          <div><h2 id="admin-students-list-title">Directorio de alumnos</h2><p>{loading ? 'Cargando registros…' : `${filteredStudents.length} alumnos`}</p></div>
          <label className="admin-students__search"><span className="sr-only">Buscar alumno</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, control o carrera" /></label>
        </header>
        {error ? <p className="admin-students__feedback" role="alert">{error}</p> : loading ? <p className="admin-students__feedback" role="status">Cargando alumnos…</p> : filteredStudents.length === 0 ? <p className="admin-students__feedback">{students.length ? 'No se encontraron alumnos con esa búsqueda.' : 'No hay alumnos registrados para mostrar.'}</p> : (
          <div className="admin-students__table-wrap"><table>
            <thead><tr><th>Nombre completo</th><th>Número de control</th><th>Carrera</th></tr></thead>
            <tbody>{filteredStudents.map((student) => <tr key={student.numControl}><td>{student.nombre}</td><td>{student.numControl}</td><td>{student.carrera}</td></tr>)}</tbody>
          </table></div>
        )}
      </section>
    </section>
  )
}

export default EstudiantesAdminPage
