import type { Metadata } from 'next'
import AuroraBackground from '@/components/AuroraBackground'
import SearchBar from '@/components/SearchBar'
import PricingSection from '@/components/PricingSection'
import HeroContent from '@/components/HeroContent'

export const metadata: Metadata = {
  title: '.claw — Your cozy home on the internet',
}

const FEATURES = [
  {
    icon: '⚡',
    title: 'Register in seconds',
    desc: 'Find your name, claim it, and you\'re done. No confusing steps, no waiting around.',
  },
  {
    icon: '🔗',
    title: 'Link everything',
    desc: 'Point your .claw name to your website, socials, wallet address, and more.',
  },
  {
    icon: '🔒',
    title: 'Yours forever',
    desc: 'Your domain is registered for a full year. Renew anytime to keep it permanently.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FCFCFD]">
      {/* Hero */}
      <section
        className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-20"
        aria-labelledby="hero-heading"
      >
        <AuroraBackground />

        {/* Hero content */}
        <HeroContent />
      </section>

      {/* Features */}
      <section
        className="max-w-6xl mx-auto px-6 py-24"
        aria-labelledby="features-heading"
      >
        <div className="text-center mb-12">
          <h2
            id="features-heading"
            className="text-3xl font-extrabold text-[#171717] mb-3"
            style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
          >
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="text-[#666666] text-lg max-w-xl mx-auto">
            We handle the complexity so you can focus on building your identity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-3xl p-8 border border-[#E5E5E5] hover:shadow-[0px_8px_30px_rgba(91,97,254,0.08)] transition-shadow duration-300"
              style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04), 0px 1px 3px rgba(0,0,0,0.02)' }}
            >
              <div
                className="mb-4 text-3xl w-12 h-12 flex items-center justify-center bg-[#F3F4F6] rounded-2xl"
                role="img"
                aria-label={title}
              >
                {icon}
              </div>
              <h3
                className="mb-2 text-lg font-bold text-[#171717]"
                style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
              >
                {title}
              </h3>
              <p className="text-sm text-[#666666] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />
    </main>
  )
}
