'use client'

import { motion } from 'framer-motion'

/**
 * [NÂNG CẤP V102.6] Bảng giá tên miền chuyên nghiệp (Issue #7).
 * Hiển thị rõ ràng phí USDC theo độ dài ký tự.
 */
export default function PricingSection() {
  const pricingPlans = [
    { length: '3 Characters', price: '100', description: 'Rare & Premium' },
    { length: '4 Characters', price: '50', description: 'Highly Desirable' },
    { length: '5+ Characters', price: '5', description: 'Standard & Affordable' },
  ]

  return (
    <section className="max-w-4xl mx-auto px-6 pb-24" aria-labelledby="pricing-heading">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white rounded-3xl border border-[#E5E5E5] p-8 text-center"
        style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04)' }}
      >
        <div className="inline-flex items-center gap-2 bg-[#D1FAE5] text-[#065F46] text-sm font-bold rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" aria-hidden="true" />
          Arc Testnet Pricing
        </div>

        <h2
          id="pricing-heading"
          className="text-3xl font-extrabold text-[#171717] mb-3"
          style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
        >
          Simple, Transparent Pricing
        </h2>
        <p className="text-[#666666] text-lg mb-8 max-w-lg mx-auto">
          Registration fees are paid in test USDC once per year.
        </p>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="p-6 rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] hover:border-[#5B61FE] transition-colors">
              <h4 className="text-sm font-bold text-[#666666] mb-1">{plan.length}</h4>
              <div className="text-2xl font-black text-[#171717] mb-2">
                {plan.price} <span className="text-sm font-normal">USDC/year</span>
              </div>
              <p className="text-xs text-[#9CA3AF]">{plan.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#F9FAFB] rounded-2xl p-6 text-left max-w-md mx-auto border-t-4 border-[#5B61FE]">
          <h3
            className="text-sm font-bold text-[#171717] mb-3"
            style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
          >
            How to get started
          </h3>
          <ol className="space-y-2 text-sm text-[#666666]">
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-[#5B61FE] text-white text-xs font-bold flex items-center justify-center">1</span>
              <span>
                Get free test USDC from the{' '}
                <a
                  href="https://faucet.circle.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5B61FE] hover:underline font-medium"
                >
                  Circle Faucet
                </a>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-[#5B61FE] text-white text-xs font-bold flex items-center justify-center">2</span>
              <span>Connect your wallet and switch to Arc Testnet</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-[#5B61FE] text-white text-xs font-bold flex items-center justify-center">3</span>
              <span>Search for a name you like and claim it</span>
            </li>
          </ol>
        </div>
      </motion.div>
    </section>
  )
}
