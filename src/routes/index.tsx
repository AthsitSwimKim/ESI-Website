import { createBrowserRouter, replace, type LoaderFunctionArgs } from 'react-router-dom'

import { PageSkeleton, RootLayout, type RouteHandle } from '@/components/layout/RootLayout'
import { getProjectBySlug } from '@/data/projects'
import { getServiceBySlug } from '@/data/services'
import { HomePage } from '@/pages/HomePage'

/** Throwing a 404 Response sends the router to the root errorElement (RootLayout → NotFoundPage). */
function notFound(): never {
  throw new Response('Not Found', { status: 404, statusText: 'Not Found' })
}

const requireService = ({ params }: LoaderFunctionArgs) =>
  getServiceBySlug(params.slug) ? null : notFound()
const requireProject = ({ params }: LoaderFunctionArgs) =>
  getProjectBySlug(params.slug) ? null : notFound()

const hideCta: RouteHandle = { hideCta: true }

/** Routes exactly as spec §9. Home is eager; every other page is code-split. */
export const router = createBrowserRouter([
  {
    path: '/admin-portal-update',
    HydrateFallback: PageSkeleton,
    lazy: () =>
      import('@/components/admin/AdminAuthLayout').then((m) => ({ Component: m.AdminAuthLayout })),
    children: [
      {
        index: true,
        loader: ({ request }) => {
          const url = new URL(request.url)
          const id = url.searchParams.get('project')
          if (!id || !/^\d+$/.test(id)) return null
          url.searchParams.delete('project')
          return replace(`/admin-portal-update/projects/${id}${url.search}`)
        },
        lazy: () => import('@/pages/AdminPage').then((m) => ({ Component: m.AdminPage })),
      },
      {
        path: 'login',
        lazy: () => import('@/pages/AdminLoginPage').then((m) => ({ Component: m.AdminLoginPage })),
      },
      {
        path: 'projects/:projectId',
        lazy: () => import('@/pages/AdminPage').then((m) => ({ Component: m.AdminPage })),
      },
      {
        path: 'audit-logs',
        lazy: () =>
          import('@/pages/AdminAuditLogPage').then((m) => ({ Component: m.AdminAuditLogPage })),
      },
      {
        path: 'preview',
        element: <RootLayout />,
        children: [
          {
            path: ':id',
            lazy: () =>
              import('@/pages/AdminPreviewPage').then((m) => ({ Component: m.AdminPreviewPage })),
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootLayout errorBoundary />,
    HydrateFallback: PageSkeleton,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'about',
        lazy: () => import('@/pages/AboutPage').then((m) => ({ Component: m.AboutPage })),
      },
      {
        path: 'solutions',
        lazy: () => import('@/pages/SolutionsPage').then((m) => ({ Component: m.SolutionsPage })),
      },
      {
        path: 'solutions/:slug',
        loader: requireService,
        lazy: () =>
          import('@/pages/SolutionDetailPage').then((m) => ({ Component: m.SolutionDetailPage })),
      },
      {
        path: 'industries',
        lazy: () => import('@/pages/IndustriesPage').then((m) => ({ Component: m.IndustriesPage })),
      },
      {
        path: 'projects',
        lazy: () => import('@/pages/ProjectsPage').then((m) => ({ Component: m.ProjectsPage })),
      },
      {
        path: 'projects/:slug',
        loader: requireProject,
        lazy: () =>
          import('@/pages/ProjectDetailPage').then((m) => ({ Component: m.ProjectDetailPage })),
      },
      {
        path: 'contact',
        handle: hideCta,
        lazy: () => import('@/pages/ContactPage').then((m) => ({ Component: m.ContactPage })),
      },
      { path: '*', loader: notFound },
    ],
  },
])
