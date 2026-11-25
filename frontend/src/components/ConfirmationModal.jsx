import { useEffect, useRef } from 'react'
import './confirmation-modal.css'

function ConfirmationModal({ open, title, message, confirmLabel = 'Confirmar', danger = false, onConfirm, onCancel }) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    cancelRef.current?.focus()
    function onKeyDown(event) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null
  return (
    <div className="confirmation-modal__backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel()
    }}>
      <section className="confirmation-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-modal-title" aria-describedby="confirmation-modal-message">
        <span className={`confirmation-modal__icon${danger ? ' is-danger' : ''}`} aria-hidden="true">{danger ? '!' : '?'}</span>
        <h2 id="confirmation-modal-title">{title}</h2>
        <p id="confirmation-modal-message">{message}</p>
        <footer>
          <button ref={cancelRef} type="button" className="confirmation-modal__cancel" onClick={onCancel}>Volver</button>
          <button type="button" className={`confirmation-modal__confirm${danger ? ' is-danger' : ''}`} onClick={onConfirm}>{confirmLabel}</button>
        </footer>
      </section>
    </div>
  )
}

export default ConfirmationModal
