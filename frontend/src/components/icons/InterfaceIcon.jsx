const icons = {
  user: (
    <>
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M5.5 20v-2a6.5 6.5 0 0 1 13 0v2z" />
    </>
  ),
  key: (
    <path d="M14.5 3a6.5 6.5 0 0 0-6.2 8.4L3 16.7V21h4v-3h3v-3l2.1-2.1A6.5 6.5 0 1 0 14.5 3ZM16 7h.01" />
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'eye-off': (
    <>
      <path d="m3 3 18 18M10.6 5.1 12 5c6.5 0 10 7 10 7a19 19 0 0 1-3.1 3.9M6.2 6.2A20 20 0 0 0 2 12s3.5 7 10 7a12 12 0 0 0 5.1-1.2M10 10a3 3 0 0 0 4 4" />
    </>
  ),
}

function InterfaceIcon({ name }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}

export default InterfaceIcon
