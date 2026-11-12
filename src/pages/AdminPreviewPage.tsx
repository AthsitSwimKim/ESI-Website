import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Container } from '@/components/ui/Container'
import { AdminAccountMenu } from '@/components/admin/AdminAccountMenu'
import { Seo } from '@/components/ui/Seo'
import { useT } from '@/i18n'
import { projectApi, projectApiMessage } from '@/lib/projectApi'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import type { Project } from '@/types'

export function AdminPreviewPage() {
  const { id } = useParams()
  const { search } = useLocation()
  const { t } = useT()
  const [project, setProject] = useState<Project>()
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    projectApi
      .get()
      .then((data) => {
        if (active) {
          setProject(data.projects.find((item) => String(item.id) === id))
          setLoaded(true)
        }
      })
      .catch((reason) => {
        if (active) {
          setError(projectApiMessage(reason))
          setLoaded(true)
        }
      })
    return () => {
      active = false
    }
  }, [id])

  return (
    <>
      <meta name="robots" content="noindex, nofollow, noarchive" />
      <aside className="border-b border-esi-border bg-esi-light py-4">
        <Container className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-esi-blue">
            <strong>{t('admin.previewDraft')}</strong> · {t('admin.previewNotice')}
          </p>
          <Link
            to={{
              pathname: project
                ? `/admin-portal-update/projects/${project.id}`
                : '/admin-portal-update/',
              search,
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-esi-border bg-white px-4 py-2 text-sm font-semibold text-esi-blue"
          >
            <ArrowLeft size={16} aria-hidden />
            {t('admin.backToEditor')}
          </Link>
          <Link
            to="/projects"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-esi-blue"
          >
            {t('admin.back')}
          </Link>
          <AdminAccountMenu />
        </Container>
      </aside>
      {!loaded ? (
        <Container className="py-20">
          <Seo
            title={`${t('admin.previewDraft')} | ESI`}
            path={`/admin-portal-update/preview/${id}`}
          />
          <p role="status">{t('a11y.loading')}</p>
        </Container>
      ) : project ? (
        <ProjectDetailPage previewProject={project} />
      ) : (
        <>
          <Seo
            title={`${t('admin.previewMissing')} | ESI`}
            description={t('admin.pageDescription')}
            path={`/admin-portal-update/preview/${id ?? ''}`}
          />
          <Container className="py-20">
            <h1 className="display-title text-2xl text-esi-blue">{t('admin.previewMissing')}</h1>
            <p className="mt-4 text-esi-muted">
              {error
                ? t(`admin.${error}` as 'admin.backendUnavailable')
                : t('admin.previewMissingHelp')}
            </p>
          </Container>
        </>
      )}
    </>
  )
}
