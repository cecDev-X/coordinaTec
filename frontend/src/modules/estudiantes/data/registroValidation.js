export const nameIsValid = (value) => /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u.test(value.trim())

export const passwordRequirements = [
  { label: 'Entre 8 y 72 caracteres', test: (value) => value.length >= 8 && value.length <= 72 },
  { label: 'Una letra minúscula', test: (value) => /[a-z]/.test(value) },
  { label: 'Una letra mayúscula', test: (value) => /[A-Z]/.test(value) },
  { label: 'Un número', test: (value) => /\d/.test(value) },
  { label: 'Un carácter especial (por ejemplo, ! o @)', test: (value) => /[^A-Za-z0-9\s]/.test(value) },
]

export const passwordIsValid = (value) => passwordRequirements.every((requirement) => requirement.test(value))
