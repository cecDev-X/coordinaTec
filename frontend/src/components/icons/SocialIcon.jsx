const icons = {
  google: (
    <>
      <path fill="#4285f4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z" />
      <path fill="#34a853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z" />
      <path fill="#fbbc05" d="M6.4 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.34-2.59Z" />
      <path fill="#ea4335" d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.34 2.59A6 6 0 0 1 12 5.96Z" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1.5" fill="#0a66c2" />
      <circle cx="7.5" cy="8" r="1.3" fill="#fff" />
      <path fill="#fff" d="M6.4 10.5h2.2v7.2H6.4zm4 0h2.1v1c.5-.8 1.2-1.2 2.3-1.2 2.3 0 2.8 1.4 2.8 3.4v4h-2.2v-3.6c0-1.1 0-2-1.3-2s-1.5 1-1.5 2v3.6h-2.2Z" />
    </>
  ),
  facebook: (
    <>
      <circle cx="12" cy="12" r="11" fill="#1877f2" />
      <path fill="#fff" d="M15.3 13.4 15.8 10h-3.2V7.8c0-.9.4-1.8 1.9-1.8H16V3.2a20 20 0 0 0-2.5-.2C10.9 3 9.2 4.6 9.2 7.4V10H6.3v3.4h2.9v9.2a11 11 0 0 0 3.4.3v-9.5Z" />
    </>
  ),
}

function SocialIcon({ provider }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      {icons[provider]}
    </svg>
  )
}

export default SocialIcon
