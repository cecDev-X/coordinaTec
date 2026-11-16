import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/global.css'
import StudentApp from './StudentApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode><StudentApp /></StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/student-sw.js').catch(() => {})
  })
}
