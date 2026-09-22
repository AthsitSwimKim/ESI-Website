import { useParams } from 'react-router-dom'

import { Seo } from '@/components/ui/Seo'
import { pageTitle } from '@/data/seo'
import { getServiceBySlug } from '@/data/services'
import { useT } from '@/i18n'

import { PageStub } from './PageStub'

export function SolutionDetailPage() {
  const { slug } = useParams()
  const { l } = useT()
  const service = getServiceBySlug(slug)
  // The route loader already threw a 404 for unknown slugs; this guard only narrows the type.
  if (!service) return null

  return (
    <>
      <Seo
        title={pageTitle(l(service.name))}
        description={l(service.tagline)}
        path={`/solutions/${service.slug}`}
      />
      <PageStub title={l(service.name)} phase="Phase 5">
        <p>{l(service.description)}</p>
        <ul className="mt-4 list-disc pl-5">
          {service.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </PageStub>
    </>
  )
}
