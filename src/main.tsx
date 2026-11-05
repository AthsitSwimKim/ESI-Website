import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import './styles/index.css'

if (import.meta.hot) {
  const refreshPublished = () => {
    if (!/^\/admin(?:\/|$)/.test(window.location.pathname)) window.location.reload()
  }
  import.meta.hot.on('esi:projects-published', refreshPublished)
  import.meta.hot.dispose(() => import.meta.hot?.off('esi:projects-published', refreshPublished))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
