import { Link } from 'react-router-dom'

import { Seo } from '@/components/ui/Seo'
import { pageHeroes } from '@/data/pages'
import { projects } from '@/data/projects'
import { pageTitle } from '@/data/seo'
import { useT } from '@/i18n'

import { PageStub } from './PageStub'

export function ProjectsPage() {
  const { l } = useT()
  return (
    <>
      <Seo
        title={pageTitle('Projects')}
        description={l(pageHeroes.projects.lead!)}
        path="/projects"
      />
      <PageStub title={l(pageHeroes.projects.title)} phase="Phase 6">
        <ul className="list-disc pl-5">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link className="text-esi-blue hover:underline" to={`/projects/${p.slug}`}>
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </PageStub>
    </>
  )
}
