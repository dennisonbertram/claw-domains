'use client'

import { motion } from 'framer-motion'

const TIERS = [
  {
    chars: '5+ chars',
    price: '$5 USDC',
    desc: 'Great for long, expressive names',
    popular: false,
  },
  {
    chars: '4 chars',
    price: '$10 USDC',
    desc: 'Short and sweet handles',
    popular: false,
  },
  {
    chars: '3 chars',
    price: '$25 USDC',
    desc: 'Rare and memorable',
    popular: true,
  },
  {
    chars: '1-2 chars',
    price: '$100 USDC',
    desc: 'Ultra-exclusive identities',
    popular: false,
  },
]

/**
 * Pricing section with 4 tier cards.
 * Animates in on mount with stagger.
 *
 * Usage:
 *   <PricingSection />
 */
export default function PricingSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-24" aria-labelledby="pricing-heading">
      <div className="text-center mb-12">
        <h2
          id="pricing-heading"
          className="text-3xl font-extrabold text-[#171717] mb-3"
          style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
        >
          Simple, transparent pricing
        </h2>
        <p className="text-[#666666] text-lg">
          Per year. No hidden fees. Cancel anytime by not renewing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.chars}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
            className={`relative bg-white rounded-2xl p-6 border transition-shadow hover:shadow-[0px_8px_30px_rgba(91,97,254,0.10)] ${
              tier.popular
                ? 'border-[#5B61FE] shadow-[0px_4px_20px_rgba(91,97,254,0.12)]'
                : 'border-[#E5E5E5]'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#5B61FE] text-white text-xs font-bold rounded-full px-3 py-1">
                  Most Popular
                </span>
              </div>
            )}

            <p className="text-sm font-semibold text-[#666666] mb-2">{tier.chars}</p>
            <p
              className="text-3xl font-bold text-[#5B61FE] mb-1"
              style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
            >
              {tier.price}
            </p>
            <p className="text-xs text-[#A3A3A3] font-medium mb-3">per year</p>
            <p className="text-sm text-[#666666]">{tier.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
