import SocialIcon from '../../../components/icons/SocialIcon.jsx'
import '../css/social-login.css'

const providers = [
  { id: 'google', name: 'Google' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'facebook', name: 'Facebook' },
]

function SocialLogin({ onSelect }) {
  return (
    <div className="social-login">
      <div className="social-login__divider"><span>O ingresa con:</span></div>

      <div className="social-login__providers" role="group" aria-label="Acceder con una cuenta externa">
        {providers.map((provider) => (
          <button
            className="social-login__button"
            key={provider.id}
            type="button"
            aria-label={`Ingresar con ${provider.name}`}
            onClick={() => onSelect(provider.name)}
          >
            <SocialIcon provider={provider.id} />
            <span>{provider.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SocialLogin
