const paths = {
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
  document: <><path d="M6 3h9l4 4v14H6zM15 3v5h4M9 13h7M9 17h7" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  settings: <><path d="M10 3h4l.7 2.2 2 .9 2.1-1 2 3.4-1.8 1.5v2.1l1.8 1.5-2 3.4-2.1-1-2 .9L14 20h-4l-.7-2.2-2-.9-2.1 1-2-3.4L5 13v-2.1L3.2 9.4l2-3.4 2.1 1 2-.9L10 3Z" /><circle cx="12" cy="11.5" r="2.5" /></>,
  logout: <><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 8l4 4-4 4M9 12h9" /></>,
  bell: <><path d="M18 8a6 6 0 1 0-12 0c0 8-3 8-3 10h18c0-2-3-2-3-10ZM10 21h4" /></>,
  mail: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  list: <><path d="M9 7h11M9 12h11M9 17h11M4 7h.01M4 12h.01M4 17h.01" /></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  check: <path d="m4 12 5 5L20 6" />,
  users: <><circle cx="9" cy="7" r="3" /><path d="M3 19v-2a6 6 0 0 1 12 0v2ZM17 10a3 3 0 0 1 0 6M17 13c3 0 5 2 5 5v1h-5" /></>,
  ban: <><circle cx="12" cy="12" r="9" /><path d="M6 6l12 12" /></>,
  trending: <path d="M3 17 9 11l4 3 7-8M15 6h5v5" />,
  school: <><path d="m2 9 10-5 10 5-10 5L2 9ZM6 12v5c3 3 9 3 12 0v-5M22 9v7" /></>,
  warning: <><path d="m12 3 10 18H2L12 3Z" /><path d="M12 9v5m0 3h.01" /></>,
  archive: <><rect x="3" y="5" width="18" height="4" rx="1" /><path d="M5 9v11h14V9M10 13h4" /></>,
  chart: <><path d="M4 19h16M6 16v-4M11 16V8M16 16V5M21 16v-6" /></>,
  megaphone: <><path d="M3 10h4l11-5v14L7 14H3v-4ZM7 14l2 6h4l-2-4M20 9l2-2M20 15l2 2" /></>,
  x: <path d="M5 5 19 19M19 5 5 19" />,
  folder: <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3V7Z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></>,
  down: <path d="m5 9 7 7 7-7" />,
  plus: <path d="M12 4v16M4 12h16" />,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  left: <path d="m15 5-7 7 7 7" />,
  circle: <circle cx="12" cy="12" r="8" />,
  edit: <><path d="M12 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-7" /><path d="m10 14 9-9 3 3-9 9-4 1z" /></>,
}

function DashboardIcon({ name, size = 16, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export default DashboardIcon
