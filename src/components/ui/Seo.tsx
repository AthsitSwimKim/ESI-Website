import { company } from '@/data/company'
import { seo } from '@/data/seo'
import { useT } from '@/i18n'

interface SeoProps {
  title: string
  description?: string
  /** Route path starting with '/', used for the canonical + og:url. */
  path: string
  image?: string
  type?: 'website' | 'article'
}

/**
 * Per-page metadata. React 19 hoists <title>, <meta> and <link> rendered anywhere in the tree
 * into <head>, so no Helmet is needed (architecture.md §6). Render it first in every page.
 */
export function Seo({ title, description, path, image = seo.ogImage, type = 'website' }: SeoProps) {
  const { l } = useT()
  const url = company.siteUrl + (path === '/' ? '' : path)
  const resolvedDescription = description || l(seo.siteDescription)
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={company.shortName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={company.siteUrl + image} />
      <meta property="og:locale" content={l(seo.locale)} />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  )
}
