import { MotionConfig } from 'motion/react'
import { RouterProvider } from 'react-router-dom'

import { LangProvider } from '@/i18n'
import { router } from '@/routes'

export default function App() {
  return (
    <LangProvider>
      {/* reducedMotion="user" disables transform animations for people who asked the OS for less motion */}
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </LangProvider>
  )
}
