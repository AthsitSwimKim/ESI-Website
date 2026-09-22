import { Link } from 'react-router-dom'

import { Seo } from '@/components/ui/Seo'
import { pageHeroes } from '@/data/pages'
import { pageTitle } from '@/data/seo'
import { services } from '@/data/services'
import { useT } from '@/i18n'

import { PageStub } from './PageStub'

export function SolutionsPage() {
  const { l } = useT()
  return (
    <>
      <Seo
        title={pageTitle('Solutions')}
        description={l(pageHeroes.solutions.lead!)}
        path="/solutions"
      />
      <PageStub title={l(pageHeroes.solutions.title)} phase="Phase 5">
        <ul className="list-disc pl-5">
          {services.map((s) => (
            <li key={s.slug}>
              <Link className="text-esi-blue hover:underline" to={`/solutions/${s.slug}`}>
                {l(s.name)}
              </Link>
            </li>
          ))}
        </ul>
      </PageStub>
    </>
  )
}
