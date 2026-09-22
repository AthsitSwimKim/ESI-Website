import { company } from '@/data/company'
import { seo } from '@/data/seo'

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
export function Seo({
  title,
  description = seo.siteDescription,
  path,
  image = seo.ogImage,
  type = 'website',
}: SeoProps) {
  const url = company.siteUrl + (path === '/' ? '' : path)
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={company.shortName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={company.siteUrl + image} />
      <meta property="og:locale" content={seo.locale} />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  )
}
