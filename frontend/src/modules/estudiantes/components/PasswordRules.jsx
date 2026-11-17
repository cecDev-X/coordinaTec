import { passwordRequirements } from '../data/registroValidation.js'

function PasswordRules({ password, showErrors }) {
  return <div className="student-register__rules" aria-live="polite">
    <span>La contraseña necesita:</span>
    <ul>{passwordRequirements.map(({ label, test }) => <li key={label} className={showErrors && !test(password) ? 'is-invalid' : ''}>
      {test(password) && password ? '✓ ' : '• '}{label}
    </li>)}</ul>
  </div>
}

export default PasswordRules
