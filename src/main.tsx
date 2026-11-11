import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { refreshPublishedProjects } from './lib/publishedProjects'
import './styles/index.css'

if (import.meta.hot) {
  const refreshPublished = () => {
    if (!/^\/admin(?:\/|$)/.test(window.location.pathname)) window.location.reload()
  }
  import.meta.hot.on('esi:projects-published', refreshPublished)
  import.meta.hot.dispose(() => import.meta.hot?.off('esi:projects-published', refreshPublished))
}

async function start() {
  // Retain the packaged public catalogue during a temporary API outage.
  await refreshPublishedProjects().catch(() => {})
  const { default: App } = await import('./App')
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void start()
