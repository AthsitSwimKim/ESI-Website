import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { projectAdminPlugin } from './server/project-admin.mjs'
import { devAdminAuthPlugin } from './server/dev-admin-auth.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), devAdminAuthPlugin(), projectAdminPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // base: '/subfolder/', // only if the site is hosted under a sub-path (see architecture.md §9)
})
