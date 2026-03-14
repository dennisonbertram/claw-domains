'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import DomainCard from '@/components/DomainCard'
import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'

// Mock domains for demo (shown when wallet is connected)
const MOCK_DOMAINS = [
  { name: 'alice', expires: 'Mar 2027', tokenId: '0xabc123def456' },
  { name: 'dev', expires: 'Jan 2026', tokenId: '0xfed987cba654' },
  { name: 'coolproject', expires: 'Aug 2026', tokenId: '0x111222333444' },
]

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

/**
 * Profile page — "My Domains".
 * Shows mock domains when wallet is connected, friendly empty state otherwise.
 */
export default function ProfileClient() {
  const { isConnected } = useAccount()
  const { login } = usePrivy()

  return (
    <div className="min-h-screen bg-[#FCFCFD] pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-4xl font-extrabold text-[#171717] mb-2"
            style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
          >
            My Domains
          </h1>
          <p className="text-[#666666]">
            All your .claw names, in one place.
          </p>
        </div>

        {/* Not connected */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl border border-[#E5E5E5] p-16 text-center"
            style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04)' }}
          >
            <div className="text-5xl mb-5" aria-hidden="true">🦞</div>
            <h2
              className="text-xl font-bold text-[#171717] mb-3"
              style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
            >
              Connect your account
            </h2>
            <p className="text-[#666666] text-sm mb-8 max-w-sm mx-auto">
              Connect your wallet to see and manage all your .claw domains in one place.
            </p>
            <button
              onClick={() => login()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#5B61FE] hover:bg-[#4A50E2] text-white rounded-xl font-medium transition-colors"
            >
              Connect Wallet
            </button>
          </motion.div>
        )}

        {/* Connected — show domains */}
        {isConnected && (
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-white border border-[#E5E5E5] rounded-2xl px-5 py-3 flex items-center gap-3">
                <span
                  className="text-2xl font-bold text-[#5B61FE]"
                  style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
                >
                  {MOCK_DOMAINS.length}
                </span>
                <span className="text-sm text-[#666666]">domains registered</span>
              </div>
              <Link
                href="/"
                className="ml-auto inline-flex items-center gap-2 bg-[#5B61FE] hover:bg-[#4A50E2] text-white font-semibold text-sm rounded-xl px-5 py-3 transition-colors"
              >
                + Register new
              </Link>
            </div>

            {/* Domain cards grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {MOCK_DOMAINS.map((domain) => (
                <motion.div key={domain.name} variants={cardVariants}>
                  <DomainCard
                    name={domain.name}
                    expires={domain.expires}
                    tokenId={domain.tokenId}
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
