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
    path: '/admin',
    loader: ({ request }) => {
      const url = new URL(request.url)
      const id = url.searchParams.get('project')
      if (!id || !/^\d+$/.test(id)) return null
      url.searchParams.delete('project')
      return replace(`/admin/projects/${id}${url.search}`)
    },
    HydrateFallback: PageSkeleton,
    lazy: () => import('@/pages/AdminPage').then((m) => ({ Component: m.AdminPage })),
  },
  {
    path: '/admin/projects/:projectId',
    HydrateFallback: PageSkeleton,
    lazy: () => import('@/pages/AdminPage').then((m) => ({ Component: m.AdminPage })),
  },
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootLayout errorBoundary />,
    HydrateFallback: PageSkeleton,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'admin/preview/:id',
        lazy: () =>
          import('@/pages/AdminPreviewPage').then((m) => ({ Component: m.AdminPreviewPage })),
      },
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
