import { useEffect, useRef, useState } from 'react'
import PasswordRules from '../modules/estudiantes/components/PasswordRules.jsx'
import { passwordIsValid } from '../modules/estudiantes/data/registroValidation.js'
import './profile-actions.css'

async function request(path, token, options = {}) {
  const response = await fetch(`/api/v1/perfil${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.mensaje || 'No se pudo completar la solicitud.')
  return result
}

function ProfileActions({ token, onPhotoChange }) {
  const [photo, setPhoto] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [accountRole, setAccountRole] = useState('')
  const [emailBusy, setEmailBusy] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const fileRef = useRef(null)
  const passwordFormRef = useRef(null)

  useEffect(() => {
    let active = true
    request('', token).then((profile) => {
      if (active) {
        setPhoto(profile.foto || '')
        setRecoveryEmail(profile.correoRecuperacion || '')
        setAccountRole(profile.rol || '')
        onPhotoChange?.(profile.foto || '')
      }
    }).catch((cause) => {
      if (active) setError(cause.message)
    })
    return () => { active = false }
  }, [token, onPhotoChange])

  async function uploadPhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    setNotice('')
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setError('Elige una imagen PNG o JPEG.')
      event.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen debe pesar menos de 2 MB.')
      event.target.value = ''
      return
    }
    setPhotoBusy(true)
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'))
        reader.readAsDataURL(file)
      })
      const result = await request('/foto', token, { method: 'PUT', body: JSON.stringify({ imagen: dataUrl }) })
      setPhoto(result.foto)
      onPhotoChange?.(result.foto)
      setNotice(result.mensaje)
    } catch (cause) {
      setError(cause.message)
    } finally {
      setPhotoBusy(false)
      event.target.value = ''
    }
  }

  async function removePhoto() {
    setPhotoBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await request('/foto', token, { method: 'DELETE' })
      setPhoto('')
      onPhotoChange?.('')
      setNotice(result.mensaje)
    } catch (cause) {
      setError(cause.message)
    } finally {
      setPhotoBusy(false)
    }
  }

  async function changePassword(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    const data = new FormData(event.currentTarget)
    const current = data.get('contrasenaActual')
    const confirmation = data.get('confirmacion')
    if (!passwordIsValid(newPassword)) {
      setPasswordTouched(true)
      setError('La contraseña nueva no cumple los requisitos indicados.')
      return
    }
    if (confirmation !== newPassword) {
      setError('La confirmación no coincide con la contraseña nueva.')
      return
    }
    setPasswordBusy(true)
    try {
      const result = await request('/contrasena', token, {
        method: 'PUT',
        body: JSON.stringify({ contrasenaActual: current, contrasenaNueva: newPassword }),
      })
      passwordFormRef.current?.reset()
      setNewPassword('')
      setPasswordTouched(false)
      setNotice(result.mensaje)
    } catch (cause) {
      setError(cause.message)
    } finally {
      setPasswordBusy(false)
    }
  }

  async function updateRecoveryEmail(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    const data = new FormData(event.currentTarget)
    setEmailBusy(true)
    try {
      const result = await request('/correo-recuperacion', token, {
        method: 'PUT',
        body: JSON.stringify({
          correo: recoveryEmail,
          contrasenaActual: data.get('contrasenaParaCorreo'),
        }),
      })
      setRecoveryEmail(result.correoRecuperacion)
      event.currentTarget.reset()
      setNotice(result.mensaje)
    } catch (cause) {
      setError(cause.message)
    } finally {
      setEmailBusy(false)
    }
  }

  return (
    <section className="profile-actions" aria-label="Administrar perfil">
      <div className="profile-actions__card">
        <div className="profile-actions__heading"><span aria-hidden="true">◎</span><div><h2>Fotografía de perfil</h2><p>Sube una imagen PNG o JPEG de hasta 2 MB.</p></div></div>
        <div className="profile-actions__photo-row">
          <div className="profile-actions__preview">{photo ? <img src={photo} alt="Fotografía actual del perfil" /> : <span aria-hidden="true">＋</span>}</div>
          <div className="profile-actions__photo-buttons">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={uploadPhoto} hidden />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={photoBusy}>{photoBusy ? 'Guardando…' : photo ? 'Cambiar fotografía' : 'Agregar fotografía'}</button>
            {photo && <button type="button" className="profile-actions__secondary" onClick={removePhoto} disabled={photoBusy}>Quitar fotografía</button>}
          </div>
        </div>
      </div>

      {accountRole !== 'ESTUDIANTE' && <form className="profile-actions__card" onSubmit={updateRecoveryEmail}>
        <div className="profile-actions__heading"><span aria-hidden="true">@</span><div><h2>Correo de recuperación</h2><p>Necesario para recuperar tu contraseña si pierdes el acceso a tu cuenta.</p></div></div>
        <label>Correo electrónico<input type="email" autoComplete="email" value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} maxLength={254} required /></label>
        <label>Confirma tu contraseña actual<input name="contrasenaParaCorreo" type="password" autoComplete="current-password" maxLength={72} required /></label>
        <button className="profile-actions__submit" type="submit" disabled={emailBusy}>{emailBusy ? 'Guardando…' : 'Guardar correo de recuperación'}</button>
      </form>}

      <form className="profile-actions__card" onSubmit={changePassword} ref={passwordFormRef}>
        <div className="profile-actions__heading"><span aria-hidden="true">⌑</span><div><h2>Cambiar contraseña</h2><p>Por seguridad, confirma primero tu contraseña actual.</p></div></div>
        <label>Contraseña actual<input name="contrasenaActual" type="password" autoComplete="current-password" maxLength={72} required /></label>
        <label>Contraseña nueva<input name="contrasenaNueva" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /><PasswordRules password={newPassword} showErrors={passwordTouched} /></label>
        <label>Confirmar contraseña nueva<input name="confirmacion" type="password" autoComplete="new-password" minLength={8} maxLength={72} required /></label>
        <button className="profile-actions__submit" type="submit" disabled={passwordBusy}>{passwordBusy ? 'Actualizando…' : 'Actualizar contraseña'}</button>
      </form>

      {error && <p className="profile-actions__message is-error" role="alert">{error}</p>}
      {notice && <p className="profile-actions__message" role="status">{notice}</p>}
    </section>
  )
}

export default ProfileActions
