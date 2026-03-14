'use client'

interface AddressDisplayProps {
  address: string
  /** If true, show full address; otherwise truncate to 0x1234...5678 */
  full?: boolean
  className?: string
}

/**
 * Renders an Ethereum address with optional truncation and copy-to-clipboard.
 *
 * Usage:
 *   <AddressDisplay address="0x1234...5678" />
 *   <AddressDisplay address="0x1234...5678" full />
 */
export default function AddressDisplay({ address, full = false, className = '' }: AddressDisplayProps) {
  const display = full
    ? address
    : `${address.slice(0, 6)}...${address.slice(-4)}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(address)
    } catch {
      // Clipboard API unavailable; silently ignore
    }
  }

  return (
    <button
      onClick={copy}
      title={`Copy ${address}`}
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-sm hover:bg-gray-800 transition-colors ${className}`}
      aria-label={`Copy address ${address}`}
    >
      <span>{display}</span>
      <svg className="h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </button>
  )
}
