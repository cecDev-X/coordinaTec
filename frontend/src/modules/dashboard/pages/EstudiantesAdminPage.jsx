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
  const [attempt, setAttempt] = useState(0)
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const headers = { Authorization: `Bearer ${token}` }
    const load = role === 'JEFE_COORDINADORES'
      ? Promise.all([
        fetch('/api/v1/jefe-coordinadores/alumnos', { headers, signal: controller.signal }),
        fetch('/api/v1/jefe-coordinadores/carreras', { headers, signal: controller.signal }),
      ]).then(async ([studentsResponse, careersResponse]) => {
        if (!studentsResponse.ok || !careersResponse.ok) throw new Error('No fue posible cargar el directorio de alumnos.')
        const [registeredStudents, availableCareers] = await Promise.all([studentsResponse.json(), careersResponse.json()])
        return { registeredStudents, availableCareers }
      })
      : fetch('/api/v1/catalogos/citas', { headers, signal: controller.signal }).then(async (response) => {
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
      })
    load.then(({ registeredStudents, availableCareers }) => {
      setStudents(registeredStudents)
      setCareers(availableCareers)
      if (role === 'COORDINADOR' && availableCareers.length === 1) {
        setSelectedCareer(availableCareers[0])
      }
    }).catch((requestError) => {
      if (!controller.signal.aborted) setError(requestError.message)
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [attempt, role, token, username])

  async function submitStudent(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const data = new FormData(event.currentTarget)
    const payload = {
      numControl: data.get('numControl'), nombres: data.get('nombres'), apellidos: data.get('apellidos'),
      carrera: data.get('carrera'), correo: data.get('correo'), password: data.get('password'),
    }
    try {
      const response = await fetch(editing
        ? `/api/v1/jefe-coordinadores/alumnos/${encodeURIComponent(editing.numControl)}`
        : '/api/v1/jefe-coordinadores/alumnos', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.mensaje || 'No se pudo guardar el alumno.')
      setMessage(result.mensaje)
      setFormOpen(false)
      setEditing(null)
      setAttempt((current) => current + 1)
    } catch (cause) { setMessage(cause.message) } finally { setSaving(false) }
  }

  async function deleteStudent(student) {
    if (!window.confirm(`¿Eliminar al alumno ${student.nombre} (${student.numControl})?`)) return
    setMessage('')
    try {
      const response = await fetch(`/api/v1/jefe-coordinadores/alumnos/${encodeURIComponent(student.numControl)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.mensaje || 'No se pudo eliminar el alumno.')
      setMessage('Alumno eliminado.')
      setAttempt((current) => current + 1)
    } catch (cause) { setMessage(cause.message) }
  }

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
        {(role !== 'COORDINADOR' || careers.length > 1) && <button type="button" className="admin-students__back" onClick={() => { setSelectedCareer(undefined); setQuery('') }}>← <span>Volver a carreras</span></button>}
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
          {role === 'JEFE_COORDINADORES' && <button type="button" className="admin-students__add" onClick={() => { setEditing(null); setFormOpen(true) }}>＋ Agregar alumno</button>}
          <label className="admin-students__search"><span className="sr-only">Buscar alumno</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, control o carrera" /></label>
        </header>
        {error ? <p className="admin-students__feedback" role="alert">{error}</p> : loading ? <p className="admin-students__feedback" role="status">Cargando alumnos…</p> : filteredStudents.length === 0 ? <p className="admin-students__feedback">{students.length ? 'No se encontraron alumnos con esa búsqueda.' : 'No hay alumnos registrados para mostrar.'}</p> : (
          <div className="admin-students__table-wrap"><table>
            <thead><tr><th>Nombre completo</th><th>Número de control</th><th>Carrera</th>{role === 'JEFE_COORDINADORES' && <th>Acciones</th>}</tr></thead>
            <tbody>{filteredStudents.map((student) => <tr key={student.numControl}><td>{student.nombre}</td><td>{student.numControl}</td><td>{student.carrera}</td>{role === 'JEFE_COORDINADORES' && <td><button type="button" onClick={() => { setEditing(student); setFormOpen(true) }}>Editar</button>{' '}<button type="button" onClick={() => deleteStudent(student)}>Eliminar</button></td>}</tr>)}</tbody>
          </table></div>
        )}
      </section>
      {message && <p className="admin-students__feedback" role="status">{message}</p>}
      {formOpen && <div className="admin-students__modal-backdrop"><form className="admin-students__form" onSubmit={submitStudent}>
        <h2>{editing ? 'Editar alumno' : 'Agregar alumno'}</h2>
        <label>Número de control<input name="numControl" defaultValue={editing?.numControl || ''} pattern="(?:[0-9]{8}|C[0-9]{8})" maxLength="9" title="8 dígitos o C seguida de 8 dígitos" required disabled={Boolean(editing)} /></label>
        <label>Nombres<input name="nombres" defaultValue={editing?.nombres || ''} maxLength="100" required /></label>
        <label>Apellidos<input name="apellidos" defaultValue={editing?.apellidos || ''} maxLength="100" required /></label>
        <label>Carrera<select name="carrera" defaultValue={editing?.carrera || selectedCareer || careers[0] || ''} required>{careers.map((career) => <option key={career} value={career}>{career}</option>)}</select></label>
        <label>Correo electrónico<input name="correo" type="email" defaultValue={editing?.correo || ''} maxLength="254" required={!editing} /></label>
        <label>{editing ? 'Nueva contraseña (opcional)' : 'Contraseña'}<input name="password" type="password" minLength="8" maxLength="72" required={!editing} /></label>
        <footer><button type="button" onClick={() => { setFormOpen(false); setEditing(null) }} disabled={saving}>Cancelar</button><button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button></footer>
      </form></div>}
    </section>
  )
}

export default EstudiantesAdminPage
