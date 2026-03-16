'use client'

import { motion } from 'framer-motion'

/**
 * Testnet pricing section — explains that domains are free and how to get test USDC.
 */
export default function PricingSection() {
  return (
    <section className="max-w-3xl mx-auto px-6 pb-24" aria-labelledby="pricing-heading">
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
          Testnet
        </div>

        <h2
          id="pricing-heading"
          className="text-3xl font-extrabold text-[#171717] mb-3"
          style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
        >
          Domains are free to try
        </h2>
        <p className="text-[#666666] text-lg mb-6 max-w-lg mx-auto">
          We&apos;re on Arc Testnet right now. Registration costs a tiny amount of test USDC — basically nothing.
        </p>

        <div className="bg-[#F9FAFB] rounded-2xl p-6 text-left max-w-md mx-auto">
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
