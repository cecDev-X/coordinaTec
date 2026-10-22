import '../css/brand-logo.css'

function BrandLogo() {
  return (
    <div className="brand-logo" role="img" aria-label="Coordina Tec">
      <svg viewBox="0 0 94 56" className="brand-logo__mark" aria-hidden="true">
        <rect x="25" y="1" width="66" height="14" rx="7" fill="#e2e8f0" stroke="#cbd7e8" />
        <rect x="8" y="21" width="73" height="14" rx="7" fill="#008dc8" />
        <rect x="29" y="21" width="22" height="14" rx="7" fill="#ff761a" />
        <rect x="8" y="21" width="34" height="14" rx="7" fill="#e2e8f0" stroke="#cbd7e8" />
        <rect x="1" y="40" width="69" height="14" rx="7" fill="#e2e8f0" stroke="#cbd7e8" />
        <rect x="27" y="40" width="43" height="14" rx="7" fill="#008dc8" />
      </svg>
      <span className="brand-logo__wordmark" aria-hidden="true">
        <span>coordina</span>
        <span className="brand-logo__tec">Tec</span>
      </span>
    </div>
  )
}

export default BrandLogo
