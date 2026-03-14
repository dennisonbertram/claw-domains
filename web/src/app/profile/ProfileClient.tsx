'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import DomainCard from '@/components/DomainCard'
import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'
import { queryPonder } from '@/lib/ponder'

interface DomainData {
  id: string
  name: string
  owner: string
  expires: string // bigint as string from GraphQL
}

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
 * Queries domains owned by the connected wallet from the Ponder indexer.
 */
export default function ProfileClient() {
  const { isConnected, address } = useAccount()
  const { login } = usePrivy()
  const [domains, setDomains] = useState<DomainData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected || !address) {
      setDomains([])
      return
    }

    const ownerAddress = address.toLowerCase()

    async function fetchDomains() {
      setLoading(true)
      setError(null)
      try {
        const data = await queryPonder<{ domains: { items: DomainData[] } }>(`
          query MyDomains($owner: String!) {
            domains(where: { owner: $owner }, orderBy: "registeredAt", orderDirection: "desc") {
              items {
                id
                name
                owner
                expires
              }
            }
          }
        `, { owner: ownerAddress })
        setDomains(data.domains.items)
      } catch (err) {
        console.error('Failed to fetch domains:', err)
        setError('Could not load domains. Indexer may be starting up.')
        setDomains([])
      } finally {
        setLoading(false)
      }
    }

    fetchDomains()
  }, [isConnected, address])

  function formatExpiry(expiryStr: string): string {
    const date = new Date(Number(expiryStr) * 1000)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

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
            <div className="text-5xl mb-5" aria-hidden="true">&#x1F99E;</div>
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
                  {loading ? '-' : domains.length}
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

            {/* Error state */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-2xl border border-yellow-300 bg-yellow-50 px-5 py-4 text-sm text-yellow-800"
              >
                {error}
              </motion.div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl border border-[#E5E5E5] p-6 animate-pulse"
                    style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04)' }}
                  >
                    <div className="h-4 w-20 bg-gray-200 rounded-full mb-8" />
                    <div className="h-7 w-32 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && domains.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl border border-[#E5E5E5] p-16 text-center"
                style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04)' }}
              >
                <div className="text-4xl mb-4" aria-hidden="true">&#x1F50D;</div>
                <h2
                  className="text-lg font-bold text-[#171717] mb-2"
                  style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
                >
                  No domains yet
                </h2>
                <p className="text-[#666666] text-sm mb-6 max-w-sm mx-auto">
                  Register your first .claw domain!
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#5B61FE] hover:bg-[#4A50E2] text-white rounded-xl font-medium transition-colors"
                >
                  Browse Domains
                </Link>
              </motion.div>
            )}

            {/* Domain cards grid */}
            {!loading && domains.length > 0 && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {domains.map((domain) => (
                  <motion.div key={domain.id} variants={cardVariants}>
                    <DomainCard
                      name={domain.name}
                      expires={formatExpiry(domain.expires)}
                      tokenId={domain.id}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
