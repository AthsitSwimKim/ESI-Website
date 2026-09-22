import { useParams } from 'react-router-dom'

import { Seo } from '@/components/ui/Seo'
import { getProjectBySlug } from '@/data/projects'
import { pageTitle } from '@/data/seo'

import { PageStub } from './PageStub'

export function ProjectDetailPage() {
  const { slug } = useParams()
  const project = getProjectBySlug(slug)
  // The route loader already threw a 404 for unknown slugs; this guard only narrows the type.
  if (!project) return null

  return (
    <>
      <Seo
        title={pageTitle(project.title)}
        description={project.description}
        path={`/projects/${project.slug}`}
        type="article"
      />
      <PageStub title={project.title} phase="Phase 6">
        <p>{project.description}</p>
        <p className="mt-2 text-esi-muted">
          {project.client} · {project.location}
        </p>
      </PageStub>
    </>
  )
}
