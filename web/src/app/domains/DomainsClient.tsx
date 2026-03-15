'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { queryPonder } from '@/lib/ponder'

interface DomainData {
  id: string
  name: string
  owner: string
  expires: string
  registeredAt: string
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
    },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function DomainsClient() {
  const [domains, setDomains] = useState<DomainData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDomains() {
      setLoading(true)
      setError(null)
      try {
        const data = await queryPonder<{ domains: { items: DomainData[] } }>(`
          {
            domains(orderBy: "registeredAt", orderDirection: "desc", limit: 100) {
              items {
                id
                name
                owner
                expires
                registeredAt
              }
            }
          }
        `)
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
  }, [])

  function formatTimestamp(ts: string): string {
    const date = new Date(Number(ts) * 1000)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function truncateAddress(addr: string): string {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
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
            All Domains
          </h1>
          <p className="text-[#666666]">
            Every .claw name registered on the network.
          </p>
        </div>

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
          <div
            className="bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden"
            style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04)' }}
          >
            <div className="border-b border-[#E5E5E5] px-6 py-3 grid grid-cols-[1fr_1fr_auto_auto] gap-4">
              {['Name', 'Owner', 'Registered', 'Expires'].map((h) => (
                <div key={h} className="h-3 w-16 bg-gray-200 rounded" />
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border-b border-[#F3F4F6] last:border-0 px-6 py-4 grid grid-cols-[1fr_1fr_auto_auto] gap-4 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-28 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
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
            <div className="text-4xl mb-4" aria-hidden="true">&#x1F30D;</div>
            <h2
              className="text-lg font-bold text-[#171717] mb-2"
              style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
            >
              No domains registered yet
            </h2>
            <p className="text-[#666666] text-sm mb-6 max-w-sm mx-auto">
              Be the first to claim a .claw domain!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#5B61FE] hover:bg-[#4A50E2] text-white rounded-xl font-medium transition-colors"
            >
              Register a Domain
            </Link>
          </motion.div>
        )}

        {/* Domain table */}
        {!loading && domains.length > 0 && (
          <motion.div
            className="bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden"
            style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04)' }}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Table header */}
            <div className="border-b border-[#E5E5E5] px-6 py-3 grid grid-cols-[1fr_1fr_auto_auto] gap-4">
              <span className="text-xs font-semibold text-[#999999] uppercase tracking-wide">Name</span>
              <span className="text-xs font-semibold text-[#999999] uppercase tracking-wide">Owner</span>
              <span className="text-xs font-semibold text-[#999999] uppercase tracking-wide">Registered</span>
              <span className="text-xs font-semibold text-[#999999] uppercase tracking-wide">Expires</span>
            </div>

            {/* Table rows */}
            {domains.map((domain) => (
              <motion.div key={domain.id} variants={rowVariants}>
                <Link
                  href={`/domain/${domain.name}`}
                  className="group border-b border-[#F3F4F6] last:border-0 px-6 py-4 grid grid-cols-[1fr_1fr_auto_auto] gap-4 items-center hover:bg-[#FAFAFE] transition-colors"
                  aria-label={`View domain ${domain.name}.claw`}
                >
                  <span className="font-semibold text-[#171717] group-hover:text-[#5B61FE] transition-colors">
                    {domain.name}<span className="text-[#5B61FE]">.claw</span>
                  </span>
                  <span className="font-mono text-sm text-[#A3A3A3]">
                    {truncateAddress(domain.owner)}
                  </span>
                  <span className="text-sm text-[#666666]">
                    {formatTimestamp(domain.registeredAt)}
                  </span>
                  <span className="text-sm text-[#666666]">
                    {formatTimestamp(domain.expires)}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
