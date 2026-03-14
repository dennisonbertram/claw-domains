'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { queryPonder } from '@/lib/ponder'

interface RecentDomain {
  name: string
  owner: string
  expires: string // bigint as string from GraphQL
}

/**
 * Displays recent domain registrations fetched from the Ponder indexer.
 * Queries the 6 most recent registrations and renders them in a grid.
 */
export default function RecentRegistrations() {
  const [domains, setDomains] = useState<RecentDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecent() {
      setLoading(true)
      setError(null)
      try {
        const data = await queryPonder<{ domains: { items: RecentDomain[] } }>(`
          {
            domains(orderBy: "registeredAt", orderDirection: "desc", limit: 6) {
              items {
                name
                owner
                expires
              }
            }
          }
        `)
        setDomains(data.domains.items)
      } catch (err) {
        console.error('Failed to fetch recent registrations:', err)
        setError('Could not load recent registrations.')
        setDomains([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecent()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#E5E5E5] bg-white p-4 animate-pulse"
            style={{ boxShadow: '0px 2px 12px rgba(0,0,0,0.03)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-12 bg-gray-100 rounded-full" />
            </div>
            <div className="h-3 w-28 bg-gray-100 rounded mb-1" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        {error}
      </div>
    )
  }

  if (domains.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E5E5E5] bg-white px-6 py-10 text-center text-sm text-[#666666]">
        No registrations yet. Be the first to claim a .claw domain!
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {domains.map(({ name, owner, expires }) => (
        <DomainCard key={name} name={name} owner={owner} expires={expires} />
      ))}
    </div>
  )
}

function DomainCard({
  name,
  owner,
  expires,
}: {
  name: string
  owner: string
  expires: string
}) {
  const expiryDate = new Date(Number(expires) * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link
      href={`/domain/${name}`}
      className="group flex flex-col gap-1 rounded-2xl border border-[#E5E5E5] bg-white p-4 transition-all hover:border-[#5B61FE] hover:shadow-md"
      style={{ boxShadow: '0px 2px 12px rgba(0,0,0,0.03)' }}
      aria-label={`View domain ${name}.claw`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[#171717] group-hover:text-[#5B61FE] transition-colors">
          {name}
          <span className="text-[#5B61FE]">.claw</span>
        </span>
        <span className="rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs text-green-700">active</span>
      </div>
      <div className="font-mono text-xs text-[#A3A3A3]">
        {owner.slice(0, 6)}...{owner.slice(-4)}
      </div>
      <div className="mt-1 text-xs text-[#999999]">Expires {expiryDate}</div>
    </Link>
  )
}
