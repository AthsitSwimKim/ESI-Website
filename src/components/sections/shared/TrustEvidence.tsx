import { Container } from '@/components/ui/Container'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { trustEvidence, trustNote } from '@/data/trust'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

export function TrustEvidence({ className }: { className?: string }) {
  const { l } = useT()

  return (
    <section aria-label={l(trustNote)} className={cn('bg-esi-navy text-white', className)}>
      <Container className="py-8 md:py-10">
        <Reveal
          as="dl"
          staggerChildren={0.06}
          className="grid grid-cols-2 gap-x-5 gap-y-7 lg:grid-cols-4"
        >
          {trustEvidence.map((item) => (
            <RevealItem key={item.value} className="border-l-2 border-esi-accent pl-4 md:pl-5">
              <dd className="font-display text-3xl leading-none font-bold text-white italic md:text-4xl">
                {item.value}
              </dd>
              <dt className="mt-2 text-[13px] leading-snug text-white/70">{l(item.label)}</dt>
            </RevealItem>
          ))}
        </Reveal>
        <p className="mt-7 max-w-[90ch] text-[12px] leading-relaxed text-white/55">
          {l(trustNote)}
        </p>
      </Container>
    </section>
  )
}
