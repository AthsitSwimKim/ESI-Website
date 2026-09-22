import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { NetworkGraphic } from '@/components/ui/NetworkGraphic'
import { Seo } from '@/components/ui/Seo'
import { notFound } from '@/data/pages'
import { pageTitle } from '@/data/seo'
import { useT } from '@/i18n'

/** 404 (spec §49): dark full-height section with the network graphic and a light button. */
export function NotFoundPage() {
  const { t, l } = useT()
  return (
    <>
      <Seo title={pageTitle('404')} path="/404" />
      <section
        className="relative isolate flex min-h-[60vh] items-center overflow-hidden bg-gradient-dark py-24 text-white"
        aria-labelledby="nf-title"
      >
        <NetworkGraphic seed={17} opacity={0.3} className="absolute inset-0 -z-10 h-full w-full" />
        <Container className="relative text-center">
          <p className="text-[13px] font-semibold tracking-[.1em] text-esi-accent uppercase">
            {notFound.eyebrow}
          </p>
          <h1
            id="nf-title"
            className="mx-auto mt-3 max-w-[22ch] display-title text-[clamp(1.5rem,2.6vw,2.25rem)] leading-tight"
          >
            {l(notFound.title)}
          </h1>
          <Button variant="light" to={notFound.button.to} className="mt-8">
            {t('cta.backHome')}
          </Button>
        </Container>
      </section>
    </>
  )
}
