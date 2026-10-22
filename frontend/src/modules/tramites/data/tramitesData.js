// Sample records for the interface; no API calls or persistence.
export const tramites = [
  {
    id: 'T001', nombre: 'Ajuste de Selección de Materias', periodo: 2,
    requisitos: 'Kardex, Solicitud firmada (2)', estatus: 'Desactivado', prioridad: 'Media',
  },
  {
    id: 'T002', nombre: 'Solicitud de Carga Superior a la Máxima', periodo: 5,
    requisitos: 'Kardex, Carta motivos, Solicitud (3)', estatus: 'Desactivado', prioridad: 'Alta',
  },
  {
    id: 'T003', nombre: 'Baja de Materia', periodo: 1,
    requisitos: 'Solicitud de baja (1)', estatus: 'Activo', prioridad: 'Baja',
  },
  {
    id: 'T004', nombre: 'Baja Temporal', periodo: 5,
    requisitos: 'Solicitud de baja, Identificación, Justificación (3)', estatus: 'Activo', prioridad: 'Alta',
  },
]
