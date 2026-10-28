import loginPattern from '../../../assets/auth/login-pattern.svg'
import '../css/auth-artwork.css'

function AuthArtwork() {
  return (
    <aside className="auth-artwork" aria-hidden="true">
      <img className="auth-artwork__pattern" src={loginPattern} alt="" />
      <div className="auth-artwork__card">
        <svg className="auth-artwork__layers" viewBox="0 0 64 64" fill="currentColor">
          <path d="m32 0 32 16-32 16L0 16Z" />
          <path d="M0 32h64L32 48Z" />
          <path d="M0 48h64L32 64Z" />
        </svg>
      </div>
    </aside>
  )
}

export default AuthArtwork
