import { useState } from 'react'
import InterfaceIcon from '../../../components/icons/InterfaceIcon.jsx'
import '../css/login-form.css'

function LoginForm({ onSubmit }) {
  const [passwordVisible, setPasswordVisible] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-form__fields">
        <div className="login-form__field">
          <label className="sr-only" htmlFor="username">Usuario</label>
          <span className="login-form__icon"><InterfaceIcon name="user" /></span>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Usuario"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
        </div>

        <div className="login-form__field login-form__field--password">
          <label className="sr-only" htmlFor="password">Contraseña</label>
          <span className="login-form__icon"><InterfaceIcon name="key" /></span>
          <input
            id="password"
            name="password"
            type={passwordVisible ? 'text' : 'password'}
            placeholder="Contraseña"
            autoComplete="current-password"
            required
          />
          <button
            className="login-form__password-toggle"
            type="button"
            aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={passwordVisible}
            aria-controls="password"
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            <InterfaceIcon name={passwordVisible ? 'eye' : 'eye-off'} />
          </button>
        </div>
      </div>

      <label className="login-form__remember">
        <input name="rememberMe" type="checkbox" />
        <span>Recordarme</span>
      </label>

      <button className="login-form__submit" type="submit">INGRESAR</button>
    </form>
  )
}

export default LoginForm
