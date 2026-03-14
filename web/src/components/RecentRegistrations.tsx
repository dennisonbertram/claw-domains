'use client'

import Link from 'next/link'
import { useChainId } from 'wagmi'
import { CONTRACT_ADDRESSES, type SupportedChainId } from '@/lib/contracts'

/**
 * Displays recent domain registrations.
 * In production this would parse DomainRegistered events via getLogs or an indexer.
 * For now it shows placeholder data with a note about real event fetching.
 *
 * TODO: Replace static placeholders with actual event indexing once contracts are deployed.
 */

// Placeholder names to demonstrate the UI until contracts are deployed
const PLACEHOLDER_DOMAINS = [
  { name: 'alice', owner: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', expires: 1783872000 },
  { name: 'bob', owner: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', expires: 1783872000 },
  { name: 'claw', owner: '0xAbcD1234567890AbcD1234567890AbcD12345678', expires: 1783872000 },
  { name: 'degen', owner: '0x1234567890AbcD1234567890AbcD1234567890AB', expires: 1783872000 },
  { name: 'base', owner: '0x9876543210FeDcBa9876543210FeDcBa98765432', expires: 1783872000 },
  { name: 'satoshi', owner: '0xEF1234567890AbcD1234567890AbcD1234567890', expires: 1783872000 },
]

export default function RecentRegistrations() {
  const chainId = useChainId()
  const isSupportedChain = chainId in CONTRACT_ADDRESSES
  const registryAddress = isSupportedChain
    ? CONTRACT_ADDRESSES[chainId as SupportedChainId].registry
    : undefined

  // Check if contracts are deployed (non-zero address)
  const isDeployed =
    registryAddress && registryAddress !== '0x0000000000000000000000000000000000000000'

  // If deployed, you would fetch recent DomainRegistered events here.
  // const { data: logs } = useWatchContractEvent({ ... })
  // For now we use placeholders.

  return (
    <div>
      {!isDeployed && (
        <div className="mb-4 rounded-lg border border-yellow-800 bg-yellow-950/40 px-4 py-2 text-sm text-yellow-400">
          Contracts not yet deployed. Showing example registrations.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER_DOMAINS.map(({ name, owner, expires }) => (
          <DomainCard key={name} name={name} owner={owner} expires={expires} />
        ))}
      </div>
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
  expires: number
}) {
  const expiryDate = new Date(expires * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link
      href={`/domain/${name}`}
      className="group flex flex-col gap-1 rounded-xl border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-red-600 hover:bg-gray-800"
      aria-label={`View domain ${name}.claw`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-white group-hover:text-red-400 transition-colors">
          {name}
          <span className="text-red-400">.claw</span>
        </span>
        <span className="rounded bg-green-900/60 px-2 py-0.5 text-xs text-green-400">active</span>
      </div>
      <div className="font-mono text-xs text-gray-500">
        {owner.slice(0, 6)}...{owner.slice(-4)}
      </div>
      <div className="mt-1 text-xs text-gray-600">Expires {expiryDate}</div>
    </Link>
  )
}
