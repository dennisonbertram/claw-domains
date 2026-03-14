# Web Frontend Source Reference

Generated: 2026-03-14
Purpose: Consolidated source code reference for implementation agents.

---

## Table of Contents

1. [contracts.ts](#1-contractsts) -- Contract addresses, ABIs, namehash, pricing, validation
2. [SearchBar.tsx](#2-searchbartsx) -- Hero search bar with live availability checking
3. [RegisterClient.tsx](#3-registerclienttsx) -- Registration page client component
4. [DomainClient.tsx](#4-domainclienttsx) -- Domain profile/management page
5. [PricingSection.tsx](#5-pricingsectiontsx) -- Pricing tier cards
6. [TxStatus.tsx](#6-txstatustsx) -- Transaction status indicator component
7. [RecordRow.tsx](#7-recordrowtsx) -- Single record row for domain profile
8. [RecentRegistrations.tsx](#8-recentregistrationstsx) -- Recent domain registrations list
9. [register/[name]/page.tsx](#9-registernamepage) -- Register route server component
10. [domain/[name]/page.tsx](#10-domainnamepage) -- Domain route server component

---

## 1. contracts.ts

**Path:** `/Users/dennisonbertram/Develop/claw-domains/web/src/lib/contracts.ts`

```typescript
import { keccak256, encodePacked, toHex } from 'viem'

// ─────────────────────────────────────────────────────────────────────────────
// Contract Addresses
// TODO: Update these after deploying to testnet / mainnet
// ─────────────────────────────────────────────────────────────────────────────

export const CONTRACT_ADDRESSES = {
  // Arc Testnet (chainId 5042002)
  5042002: {
    registry: '0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C' as `0x${string}`,
    resolver: '0xDF4FaEc0390505f394172D87faa134872b2D54B4' as `0x${string}`,
    usdc: '0x3600000000000000000000000000000000000000' as `0x${string}`,
  },
} as const

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES

// ─────────────────────────────────────────────────────────────────────────────
// ABIs
// ─────────────────────────────────────────────────────────────────────────────

export const CLAW_REGISTRY_ABI = [
  // Read
  {
    name: 'available',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'name', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'nameExpires',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getPrice',
    type: 'function',
    stateMutability: 'pure',
    inputs: [{ name: 'name', type: 'string' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'resolver',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'getName',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  // Write
  {
    name: 'register',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'domainOwner', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'renew',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'setResolver',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'resolverAddr', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'transferFrom',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
  // Events
  {
    name: 'DomainRegistered',
    type: 'event',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'owner', type: 'address', indexed: false },
      { name: 'expires', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'DomainRenewed',
    type: 'event',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'newExpires', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
    ],
  },
] as const

export const CLAW_RESOLVER_ABI = [
  // Read
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'text',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
    ],
    outputs: [{ name: '', type: 'string' }],
  },
  // Write
  {
    name: 'setAddr',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'newAddr', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'setText',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    outputs: [],
  },
  // Events
  {
    name: 'AddrChanged',
    type: 'event',
    inputs: [
      { name: 'node', type: 'bytes32', indexed: true },
      { name: 'addr', type: 'address', indexed: false },
    ],
  },
  {
    name: 'TextChanged',
    type: 'event',
    inputs: [
      { name: 'node', type: 'bytes32', indexed: true },
      { name: 'key', type: 'string', indexed: false },
      { name: 'value', type: 'string', indexed: false },
    ],
  },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// Namehash utilities — matches ClawNamehash.sol exactly
// ENS-style: namehash(label.claw) = keccak256(keccak256(bytes32(0), keccak256("claw")), keccak256(label))
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the ENS-style namehash for a .claw domain label.
 * Matches ClawNamehash.namehash() in Solidity exactly.
 *
 * @param label - e.g. "alice" for "alice.claw"
 * @returns bytes32 namehash as hex string
 */
export function namehash(label: string): `0x${string}` {
  // Start from the root namehash (bytes32(0))
  let node: `0x${string}` = toHex(0n, { size: 32 })

  // Hash the TLD "claw": keccak256(abi.encodePacked(node, keccak256("claw")))
  const clawHash = keccak256(encodePacked(['string'], ['claw']))
  node = keccak256(encodePacked(['bytes32', 'bytes32'], [node, clawHash]))

  // Hash the label: keccak256(abi.encodePacked(node, keccak256(label)))
  const labelHash = keccak256(encodePacked(['string'], [label]))
  node = keccak256(encodePacked(['bytes32', 'bytes32'], [node, labelHash]))

  return node
}

/**
 * Convert a domain label to its uint256 token ID.
 * Matches ClawNamehash.labelToId() in Solidity.
 *
 * @param label - e.g. "alice"
 * @returns BigInt token ID
 */
export function labelToId(label: string): bigint {
  const hash = namehash(label)
  return BigInt(hash)
}

// ─────────────────────────────────────────────────────────────────────────────
// Label validation — matches ClawNamehash.isValidLabel() in Solidity
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate a domain label.
 * - 1-63 characters
 * - lowercase alphanumeric + hyphens only
 * - no leading or trailing hyphens
 */
export function isValidLabel(label: string): boolean {
  if (!label || label.length === 0 || label.length > 63) return false
  if (label.startsWith('-') || label.endsWith('-')) return false
  return /^[a-z0-9-]+$/.test(label)
}

// ─────────────────────────────────────────────────────────────────────────────
// Pricing — USDC (6 decimals). Matches ClawRegistry constants on Arc.
// ─────────────────────────────────────────────────────────────────────────────

export function getPrice(label: string): bigint {
  const len = label.length
  if (len <= 2) return BigInt('100000000') // $100 USDC
  if (len === 3) return BigInt('25000000')  // $25 USDC
  if (len === 4) return BigInt('10000000')  // $10 USDC
  return BigInt('5000000')                   // $5 USDC
}

export function getPriceDisplay(label: string): string {
  const len = label.length
  if (len <= 2) return '$100 USDC'
  if (len === 3) return '$25 USDC'
  if (len === 4) return '$10 USDC'
  return '$5 USDC'
}

// ─────────────────────────────────────────────────────────────────────────────
// Text record keys used in ClawResolver
// ─────────────────────────────────────────────────────────────────────────────

export const TEXT_RECORD_KEYS = [
  'avatar',
  'url',
  'email',
  'twitter',
  'github',
  'description',
] as const

export type TextRecordKey = typeof TEXT_RECORD_KEYS[number]
```

---

## 2. SearchBar.tsx

**Path:** `/Users/dennisonbertram/Develop/claw-domains/web/src/components/SearchBar.tsx`

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { isValidLabel, getPriceDisplay } from '@/lib/contracts'

type SearchStatus = 'idle' | 'checking' | 'available' | 'taken'

/**
 * Hero search bar with live availability checking (mocked with setTimeout).
 * Debounces 600ms, then simulates an async availability check.
 *
 * Usage:
 *   <SearchBar />
 */
export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<SearchStatus>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const label = query.trim().toLowerCase().replace(/\.claw$/i, '')
  const isValid = label.length >= 1 && isValidLabel(label)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!isValid || label.length < 3) {
      setStatus('idle')
      return
    }

    setStatus('checking')

    debounceRef.current = setTimeout(() => {
      // Mock availability: deterministic based on label (for demo consistency)
      const charSum = label.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
      const mockAvailable = charSum % 3 !== 0
      setStatus(mockAvailable ? 'available' : 'taken')
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [label, isValid])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    router.push(`/register/${encodeURIComponent(label)}`)
  }

  const suggestions = label
    ? [`${label}0`, `${label}x`, `${label}-me`, `${label}hq`].filter(isValidLabel)
    : []

  return (
    <div className="w-full max-w-2xl mx-auto" role="search" aria-label="Search for a .claw domain">
      <form onSubmit={handleSubmit} noValidate>
        <div className="relative w-full group">
          {/* Gradient glow behind the bar */}
          <div
            className="absolute -inset-1 rounded-3xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #5B61FE 0%, #FF8162 100%)',
            }}
            aria-hidden="true"
          />

          {/* Bar */}
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl h-20 flex items-center overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.06)] focus-within:shadow-[0px_0px_30px_rgba(91,97,254,0.15)] transition-all duration-300">
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="yourdomain"
              className="w-full h-full bg-transparent pl-8 pr-36 text-2xl text-[#171717] placeholder-[#A3A3A3] outline-none"
              style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
              aria-label="Domain name to search"
              autoComplete="off"
              spellCheck={false}
              maxLength={63}
              autoFocus
            />

            {/* .claw suffix */}
            <span
              className="absolute right-20 text-2xl font-bold text-[#5B61FE]/50 select-none pointer-events-none"
              style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
              aria-hidden="true"
            >
              .claw
            </span>

            {/* Arrow / search button */}
            <button
              type="submit"
              aria-label="Search domain"
              className="absolute right-4 w-10 h-10 bg-[#171717] text-white rounded-xl flex items-center justify-center hover:bg-[#5B61FE] transition-colors duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      <div className="mt-3 min-h-[48px]">
        <AnimatePresence mode="wait">
          {status === 'checking' && (
            <motion.div
              key="checking"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 text-[#666666] text-sm px-2"
            >
              <svg className="w-4 h-4 animate-spin text-[#5B61FE]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Checking availability...
            </motion.div>
          )}

          {status === 'available' && isValid && (
            <motion.div
              key="available"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-between gap-3 px-2"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-[#D1FAE5] text-[#065F46] text-xs font-bold rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
                  Available
                </span>
                <span className="text-[#171717] font-medium text-sm">
                  <span className="font-mono font-bold">{label}.claw</span> is ready to claim!
                </span>
                <span className="text-xs text-[#666666] bg-[#F3F4F6] rounded-full px-2.5 py-1 font-medium">
                  {getPriceDisplay(label)} / yr
                </span>
              </div>
              <Link
                href={`/register/${encodeURIComponent(label)}`}
                className="shrink-0 inline-flex items-center gap-1 bg-[#FF8162] hover:bg-[#e86d50] text-white text-sm font-semibold rounded-xl px-4 py-2 transition-colors duration-200"
              >
                Claim it
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </motion.div>
          )}

          {status === 'taken' && isValid && (
            <motion.div
              key="taken"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-between gap-3 px-2"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-[#F3F4F6] text-[#666666] text-xs font-bold rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A3A3A3]" aria-hidden="true" />
                  Taken
                </span>
                <span className="text-[#666666] text-sm">
                  <span className="font-mono font-semibold text-[#171717]">{label}.claw</span> is already taken.
                </span>
              </div>
              <div className="flex gap-1.5">
                {suggestions.slice(0, 2).map((s) => (
                  <Link
                    key={s}
                    href={`/register/${encodeURIComponent(s)}`}
                    className="text-xs font-mono bg-[#EEF2FF] text-[#5B61FE] hover:bg-[#5B61FE] hover:text-white rounded-lg px-2.5 py-1.5 transition-colors duration-200 font-medium"
                  >
                    {s}.claw
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

---

## 3. RegisterClient.tsx

**Path:** `/Users/dennisonbertram/Develop/claw-domains/web/src/app/register/[name]/RegisterClient.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import TxStatus from '@/components/TxStatus'
import { isValidLabel, getPriceDisplay } from '@/lib/contracts'

// canvas-confetti is loaded dynamically to avoid SSR issues
type ConfettiFn = (opts: Record<string, unknown>) => void
let confetti: ConfettiFn | null = null
if (typeof window !== 'undefined') {
  import('canvas-confetti').then((m) => {
    confetti = m.default as ConfettiFn
  })
}

interface Props {
  label: string
}

type PageState = 'loading' | 'available' | 'taken' | 'confirming' | 'success' | 'error'

/**
 * Redesigned registration page client component.
 * Mocks blockchain calls with useState + setTimeout.
 */
export default function RegisterClient({ label }: Props) {
  const [pageState, setPageState] = useState<PageState>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  const isValid = isValidLabel(label)
  const priceDisplay = getPriceDisplay(label)

  // Simulate availability check on mount
  useEffect(() => {
    if (!isValid) return
    const timer = setTimeout(() => {
      const charSum = label.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
      const mockAvailable = charSum % 3 !== 0
      setPageState(mockAvailable ? 'available' : 'taken')
    }, 800)
    return () => clearTimeout(timer)
  }, [label, isValid])

  function handleClaim() {
    setPageState('confirming')
    // Simulate confirming then success
    setTimeout(() => {
      setPageState('success')
      // Trigger confetti
      if (confetti) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#5B61FE', '#FF8162', '#A78BFA', '#10B981'],
        })
      }
    }, 2000)
  }

  const suggestions = isValid
    ? [`${label}0`, `${label}x`, `${label}-me`, `${label}hq`].filter(isValidLabel)
    : []

  if (!isValid) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5E5E5] p-10 text-center shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
          <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
          <h1
            className="text-2xl font-extrabold text-[#171717] mb-3"
            style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
          >
            Invalid name
          </h1>
          <p className="text-[#666666] text-sm mb-6">
            <code className="font-mono bg-[#F3F4F6] px-2 py-0.5 rounded text-[#EF4444]">{label}</code>
            {' '}is not a valid .claw name. Use lowercase letters, numbers, and hyphens only.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#5B61FE] hover:bg-[#4A50E2] text-white font-semibold rounded-xl px-6 py-3 transition-colors"
          >
            Try another name
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FCFCFD] pt-28 pb-16">
      <div className="max-w-lg mx-auto px-6">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#171717] transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to search
        </Link>

        <AnimatePresence mode="wait">
          {/* Loading */}
          {pageState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-10 h-10 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-2 border-[#E5E5E5]" />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-t-[#5B61FE] border-r-transparent border-b-transparent border-l-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <p className="text-[#666666] text-sm">Checking availability...</p>
            </motion.div>
          )}

          {/* Available */}
          {pageState === 'available' && (
            <motion.div
              key="available"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-center"
            >
              {/* Domain display */}
              <div className="mb-8">
                <p
                  className="text-5xl font-bold text-[#171717] mb-3"
                  style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
                >
                  {label}
                  <span className="text-[#5B61FE]">.claw</span>
                </p>
                <span className="inline-flex items-center gap-1.5 bg-[#D1FAE5] text-[#065F46] text-sm font-bold rounded-full px-4 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" aria-hidden="true" />
                  Available
                </span>
              </div>

              {/* Details card */}
              <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 mb-6 text-left shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
                <div className="flex justify-between items-center py-3 border-b border-[#E5E5E5]">
                  <span className="text-sm text-[#666666]">Name</span>
                  <span className="font-mono text-sm font-semibold text-[#171717]">{label}.claw</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#E5E5E5]">
                  <span className="text-sm text-[#666666]">Duration</span>
                  <span className="text-sm font-semibold text-[#171717]">1 year</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-[#666666]">Registration fee</span>
                  <span
                    className="text-xl font-bold text-[#5B61FE]"
                    style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
                  >
                    {priceDisplay}
                  </span>
                </div>
              </div>

              {/* CTA button */}
              <motion.button
                onClick={handleClaim}
                className="w-full h-14 bg-[#FF8162] hover:bg-[#e86d50] text-white font-bold text-base rounded-2xl transition-colors flex items-center justify-center gap-2"
                whileTap={{ scale: 0.97 }}
                aria-label={`Claim ${label}.claw`}
              >
                Claim {label}.claw
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </motion.button>

              <p className="mt-3 text-xs text-[#A3A3A3] text-center">
                Connect wallet at the next step to complete registration
              </p>
            </motion.div>
          )}

          {/* Confirming */}
          {pageState === 'confirming' && (
            <motion.div
              key="confirming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p
                className="text-4xl font-bold text-[#171717] mb-3"
                style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
              >
                {label}<span className="text-[#5B61FE]">.claw</span>
              </p>
              <div className="mt-6">
                <TxStatus state="confirming" />
              </div>
            </motion.div>
          )}

          {/* Success */}
          {pageState === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center"
            >
              <motion.div
                className="text-6xl mb-6"
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                aria-hidden="true"
              >
                🎉
              </motion.div>

              <h1
                className="text-4xl font-extrabold text-[#171717] mb-3"
                style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
              >
                You own it!
              </h1>
              <p className="text-[#666666] text-lg mb-2">
                <span
                  className="font-mono font-bold text-[#5B61FE]"
                >
                  {label}.claw
                </span>{' '}
                is officially yours.
              </p>
              <p className="text-[#A3A3A3] text-sm mb-8">
                Registered for 1 year.
              </p>

              <div className="mt-4">
                <TxStatus state="success" />
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/domain/${label}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#5B61FE] hover:bg-[#4A50E2] text-white font-semibold rounded-2xl px-6 py-3 transition-colors"
                >
                  Start managing your domain
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center gap-2 bg-white border border-[#E5E5E5] hover:bg-[#F3F4F6] text-[#171717] font-semibold rounded-2xl px-6 py-3 transition-colors"
                >
                  My Domains
                </Link>
              </div>
            </motion.div>
          )}

          {/* Taken */}
          {pageState === 'taken' && (
            <motion.div
              key="taken"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="text-4xl mb-4" aria-hidden="true">😔</div>
              <h1
                className="text-3xl font-extrabold text-[#171717] mb-3"
                style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
              >
                Already taken
              </h1>
              <p className="text-[#666666] mb-8">
                <span className="font-mono font-semibold text-[#171717]">{label}.claw</span>{' '}
                has already been claimed. Try one of these instead:
              </p>

              {/* Suggestions */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {suggestions.map((s) => (
                  <Link
                    key={s}
                    href={`/register/${encodeURIComponent(s)}`}
                    className="bg-white border border-[#E5E5E5] hover:border-[#5B61FE] hover:shadow-[0px_0px_0px_2px_rgba(91,97,254,0.15)] rounded-2xl p-4 text-left transition-all group"
                  >
                    <p
                      className="font-mono font-bold text-[#171717] group-hover:text-[#5B61FE] transition-colors"
                    >
                      {s}<span className="text-[#5B61FE]">.claw</span>
                    </p>
                    <p className="text-xs text-[#A3A3A3] mt-1">Check availability →</p>
                  </Link>
                ))}
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-[#5B61FE] hover:underline"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Search for something else
              </Link>
            </motion.div>
          )}

          {/* Error */}
          {pageState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <TxStatus state="error" errorMessage={errorMsg || 'An error occurred. Please try again.'} />
              <button
                onClick={() => setPageState('available')}
                className="mt-6 text-sm text-[#5B61FE] hover:underline"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

---

## 4. DomainClient.tsx

**Path:** `/Users/dennisonbertram/Develop/claw-domains/web/src/app/domain/[name]/DomainClient.tsx`

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import RecordRow from '@/components/RecordRow'
import { isValidLabel, TEXT_RECORD_KEYS, type TextRecordKey } from '@/lib/contracts'

interface Props {
  label: string
}

// Mock domain data for demo
const MOCK_DOMAIN = {
  owner: '0x1234567890abcdef1234567890abcdef12345678',
  registered: 'Mar 12, 2025',
  expires: 'Mar 12, 2026',
  records: {
    eth: '0x1234567890abcdef1234567890abcdef12345678',
    url: 'https://example.com',
    twitter: '@example',
    github: 'example',
    email: '',
    description: 'My personal .claw domain',
    avatar: '',
  },
}

const TEXT_KEY_LABELS: Record<TextRecordKey, string> = {
  avatar: 'Avatar',
  url: 'Website',
  email: 'Email',
  twitter: 'Twitter',
  github: 'GitHub',
  description: 'Description',
}

/**
 * Generates a deterministic gradient from a domain label string.
 * Used for the cover image.
 */
function getCoverGradient(name: string): string {
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return `linear-gradient(135deg, hsl(${hue},70%,85%) 0%, hsl(${(hue + 60) % 360},80%,90%) 100%)`
}

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

/**
 * Redesigned domain profile page.
 * Shows cover, domain name, stats, and records with edit mode.
 */
export default function DomainClient({ label }: Props) {
  const [editMode, setEditMode] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [records, setRecords] = useState(MOCK_DOMAIN.records)

  const isValid = isValidLabel(label)
  const coverGradient = getCoverGradient(label)

  if (!isValid) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5E5E5] p-10 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
          <h1
            className="text-2xl font-bold text-[#171717] mb-3"
            style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
          >
            Invalid domain
          </h1>
          <p className="text-[#666666] text-sm mb-6">
            <code className="font-mono bg-[#F3F4F6] px-2 py-0.5 rounded text-[#EF4444]">{label}</code>{' '}
            is not a valid .claw name.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#5B61FE] text-white font-semibold rounded-xl px-6 py-3 hover:bg-[#4A50E2] transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    )
  }

  function startEdit(key: string, currentValue: string) {
    setEditingKey(key)
    setEditValue(currentValue)
  }

  function saveEdit(key: string) {
    if (key === 'eth') {
      setRecords((r) => ({ ...r, eth: editValue }))
    } else {
      setRecords((r) => ({ ...r, [key]: editValue }))
    }
    setEditingKey(null)
    setEditValue('')
  }

  const activeRecords = [
    records.eth && { key: 'eth', label: 'ETH Address', value: records.eth },
    records.url && { key: 'url', label: 'Website', value: records.url },
    records.twitter && { key: 'twitter', label: 'Twitter', value: records.twitter },
    records.github && { key: 'github', label: 'GitHub', value: records.github },
    records.email && { key: 'email', label: 'Email', value: records.email },
    records.description && { key: 'description', label: 'Description', value: records.description },
  ].filter(Boolean) as { key: string; label: string; value: string }[]

  return (
    <div className="min-h-screen bg-[#FCFCFD] pt-20">
      {/* Cover */}
      <div
        className="w-full h-48 rounded-b-3xl"
        style={{ background: coverGradient }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* Domain header — overlaps cover */}
        <div className="-mt-8 mb-6 relative">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1
                className="text-4xl font-bold text-[#171717]"
                style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
              >
                {label}
                <span className="text-[#5B61FE]">.claw</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 bg-[#D1FAE5] text-[#065F46] text-xs font-bold rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
                  Active
                </span>
                <Link
                  href="/"
                  className="text-xs text-[#A3A3A3] hover:text-[#666666] transition-colors"
                >
                  ← Back
                </Link>
              </div>
            </div>
            <motion.button
              onClick={() => setEditMode((e) => !e)}
              className={`h-10 px-5 rounded-xl font-semibold text-sm transition-colors ${
                editMode
                  ? 'bg-[#5B61FE] text-white hover:bg-[#4A50E2]'
                  : 'bg-white border border-[#E5E5E5] text-[#171717] hover:bg-[#F3F4F6]'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {editMode ? 'Done editing' : 'Edit domain'}
            </motion.button>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — stats */}
          <div className="lg:col-span-1">
            <div
              className="bg-white rounded-3xl border border-[#E5E5E5] p-6"
              style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04)' }}
            >
              <h2
                className="text-sm font-bold text-[#A3A3A3] uppercase tracking-wider mb-4"
              >
                Domain Info
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs text-[#A3A3A3] font-medium mb-1">Registered</dt>
                  <dd className="text-sm font-semibold text-[#171717]">{MOCK_DOMAIN.registered}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#A3A3A3] font-medium mb-1">Expires</dt>
                  <dd className="text-sm font-semibold text-[#171717]">{MOCK_DOMAIN.expires}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#A3A3A3] font-medium mb-1">Owner</dt>
                  <dd
                    className="text-sm font-semibold text-[#171717] font-mono truncate"
                    title={MOCK_DOMAIN.owner}
                  >
                    {truncateAddress(MOCK_DOMAIN.owner)}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 pt-4 border-t border-[#E5E5E5]">
                <Link
                  href={`/register/${label}`}
                  className="w-full flex items-center justify-center gap-2 bg-[#F3F4F6] hover:bg-[#E5E5E5] text-[#171717] text-sm font-semibold rounded-xl py-2.5 transition-colors"
                >
                  Renew domain
                </Link>
              </div>
            </div>
          </div>

          {/* Right — records */}
          <div className="lg:col-span-2">
            <div
              className="bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden"
              style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
                <h2
                  className="font-bold text-[#171717]"
                  style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
                >
                  Records
                </h2>
                {editMode && (
                  <span className="text-xs text-[#5B61FE] font-medium bg-[#EEF2FF] rounded-full px-2.5 py-1">
                    Edit mode
                  </span>
                )}
              </div>

              {activeRecords.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-[#A3A3A3] text-sm">No records set yet.</p>
                  <button
                    onClick={() => setEditMode(true)}
                    className="mt-3 text-sm text-[#5B61FE] hover:underline"
                  >
                    Add your first record
                  </button>
                </div>
              ) : (
                <div>
                  {activeRecords.map(({ key, label: keyLabel, value }) => (
                    <div key={key}>
                      {editingKey === key ? (
                        <div className="flex items-center gap-3 p-4 border-b border-[#E5E5E5] bg-[#F9FAFB]">
                          <span className="shrink-0 bg-[#EEF2FF] text-[#5B61FE] text-xs font-bold rounded-md px-2 py-1 min-w-[80px] text-center">
                            {keyLabel}
                          </span>
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 font-mono text-sm text-[#171717] bg-white border border-[#5B61FE] rounded-lg px-3 py-1.5 outline-none"
                            autoFocus
                            aria-label={`Edit ${keyLabel}`}
                          />
                          <button
                            onClick={() => saveEdit(key)}
                            className="shrink-0 text-xs font-bold bg-[#5B61FE] text-white rounded-lg px-3 py-1.5 hover:bg-[#4A50E2] transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingKey(null)}
                            className="shrink-0 text-xs font-medium text-[#666666] hover:text-[#171717] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <RecordRow
                          label={keyLabel}
                          value={value}
                          editable={editMode}
                          onEdit={() => startEdit(key, value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add record button in edit mode */}
              {editMode && (
                <div className="px-6 py-4 border-t border-[#E5E5E5]">
                  <p className="text-xs text-[#A3A3A3]">
                    In production, changes are submitted as transactions to the resolver contract.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 5. PricingSection.tsx

**Path:** `/Users/dennisonbertram/Develop/claw-domains/web/src/components/PricingSection.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'

const TIERS = [
  {
    chars: '5+ chars',
    price: '0.01 ETH',
    desc: 'Great for long, expressive names',
    popular: false,
  },
  {
    chars: '4 chars',
    price: '0.05 ETH',
    desc: 'Short and sweet handles',
    popular: false,
  },
  {
    chars: '3 chars',
    price: '0.1 ETH',
    desc: 'Rare and memorable',
    popular: true,
  },
  {
    chars: '1-2 chars',
    price: '0.5 ETH',
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
```

---

## 6. TxStatus.tsx

**Path:** `/Users/dennisonbertram/Develop/claw-domains/web/src/components/TxStatus.tsx`

```tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'

type TxState = 'pending' | 'confirming' | 'success' | 'error'

interface TxStatusProps {
  state: TxState
  errorMessage?: string
}

const PENDING_MESSAGES = [
  'Preparing your domain...',
  'Almost there...',
  'Connecting to the network...',
  'Getting things ready...',
]

/**
 * Redesigned transaction progress component.
 * Shows friendly status messages and animated states.
 *
 * Usage:
 *   <TxStatus state="pending" />
 *   <TxStatus state="success" />
 *   <TxStatus state="error" errorMessage="Something went wrong" />
 */
export default function TxStatus({ state, errorMessage }: TxStatusProps) {
  const msg = PENDING_MESSAGES[Math.floor(Date.now() / 2000) % PENDING_MESSAGES.length]

  return (
    <AnimatePresence mode="wait">
      {state === 'pending' && (
        <motion.div
          key="pending"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 bg-[#FFF8F0] border border-[#F59E0B]/30 rounded-2xl px-5 py-4"
          role="status"
          aria-live="polite"
          aria-label="Transaction pending"
        >
          <div className="relative w-5 h-5 shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-[#F59E0B]/20" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-t-[#F59E0B] border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#92400E]">Waiting for confirmation</p>
            <p className="text-xs text-[#B45309] mt-0.5">{msg}</p>
          </div>
        </motion.div>
      )}

      {state === 'confirming' && (
        <motion.div
          key="confirming"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 bg-[#EEF2FF] border border-[#5B61FE]/30 rounded-2xl px-5 py-4"
          role="status"
          aria-live="polite"
          aria-label="Transaction confirming"
        >
          <div className="relative w-5 h-5 shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-[#5B61FE]/20" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-t-[#5B61FE] border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3730A3]">Registering your domain</p>
            <p className="text-xs text-[#4338CA] mt-0.5">This takes just a moment...</p>
          </div>
        </motion.div>
      )}

      {state === 'success' && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 bg-[#ECFDF5] border border-[#10B981]/30 rounded-2xl px-5 py-4"
          role="status"
          aria-live="polite"
          aria-label="Transaction successful"
        >
          <div className="w-6 h-6 shrink-0 bg-[#10B981] rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#065F46]">All done!</p>
            <p className="text-xs text-[#059669] mt-0.5">Your domain has been secured.</p>
          </div>
        </motion.div>
      )}

      {state === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-start gap-3 bg-[#FEF2F2] border border-[#EF4444]/30 rounded-2xl px-5 py-4"
          role="alert"
          aria-live="assertive"
          aria-label="Transaction failed"
        >
          <div className="w-5 h-5 shrink-0 mt-0.5 bg-[#EF4444] rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#991B1B]">Something went wrong</p>
            {errorMessage && (
              <p className="text-xs text-[#B91C1C] mt-0.5 break-all">{errorMessage}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## 7. RecordRow.tsx

**Path:** `/Users/dennisonbertram/Develop/claw-domains/web/src/components/RecordRow.tsx`

```tsx
'use client'

interface RecordRowProps {
  /** The record key label (e.g. "Website", "Twitter") */
  label: string
  /** The record value */
  value: string
  /** Whether to show copy/edit actions */
  editable?: boolean
  onEdit?: () => void
}

/**
 * A single record row for the domain profile page.
 * Shows key badge, value, and hover actions.
 *
 * Usage:
 *   <RecordRow label="Website" value="https://example.com" editable onEdit={() => {}} />
 */
export default function RecordRow({ label, value, editable, onEdit }: RecordRowProps) {
  function handleCopy() {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(value)
    }
  }

  const isUrl = value.startsWith('http://') || value.startsWith('https://')

  return (
    <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5] last:border-0 hover:bg-[#F3F4F6] transition-colors group">
      {/* Key */}
      <span className="shrink-0 bg-[#F3F4F6] text-[#666666] text-xs font-bold rounded-md px-2 py-1 min-w-[80px] text-center">
        {label}
      </span>

      {/* Value */}
      <div className="flex-1 mx-4 min-w-0">
        {isUrl ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-[#5B61FE] hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <span className="font-mono text-sm text-[#171717] truncate block">{value}</span>
        )}
      </div>

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 shrink-0">
        <button
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
          title="Copy to clipboard"
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E5E5] transition-colors text-[#666666] hover:text-[#171717]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>

        {editable && onEdit && (
          <button
            onClick={onEdit}
            aria-label={`Edit ${label}`}
            title="Edit"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#EEF2FF] hover:bg-[#5B61FE] hover:text-white transition-colors text-[#5B61FE]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
```

---

## 8. RecentRegistrations.tsx

**Path:** `/Users/dennisonbertram/Develop/claw-domains/web/src/components/RecentRegistrations.tsx`

```tsx
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
```

---

## 9. register/[name]/page.tsx

**Path:** `/Users/dennisonbertram/Develop/claw-domains/web/src/app/register/[name]/page.tsx`

```tsx
import type { Metadata } from 'next'
import RegisterClient from './RegisterClient'

interface Props {
  params: Promise<{ name: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  const label = decodeURIComponent(name).toLowerCase()
  return {
    title: `Register ${label}.claw`,
    description: `Check availability and register the ${label}.claw domain on Base.`,
  }
}

/**
 * /register/[name] — Server component shell.
 * Passes the label to the client component that handles chain reads and writes.
 */
export default async function RegisterPage({ params }: Props) {
  const { name } = await params
  const label = decodeURIComponent(name).toLowerCase()
  return <RegisterClient label={label} />
}
```

---

## 10. domain/[name]/page.tsx

**Path:** `/Users/dennisonbertram/Develop/claw-domains/web/src/app/domain/[name]/page.tsx`

```tsx
import type { Metadata } from 'next'
import DomainClient from './DomainClient'

interface Props {
  params: Promise<{ name: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  const label = decodeURIComponent(name).toLowerCase()
  return {
    title: `${label}.claw`,
    description: `View and manage the ${label}.claw domain on Base.`,
  }
}

/**
 * /domain/[name] — Server component shell.
 */
export default async function DomainPage({ params }: Props) {
  const { name } = await params
  const label = decodeURIComponent(name).toLowerCase()
  return <DomainClient label={label} />
}
```

---

## Key Observations for Implementation

### Current State
- **All blockchain interactions are mocked** -- availability checks use a deterministic `charSum % 3` formula, registration simulates with `setTimeout`
- **Pricing mismatch**: `contracts.ts` uses USDC pricing ($5-$100), but `PricingSection.tsx` displays ETH pricing (0.01-0.5 ETH). These are inconsistent.
- **RecentRegistrations** uses `wagmi` (`useChainId`) but no other component does -- the rest is fully mocked
- **Chain target**: Arc Testnet (chainId 5042002) with deployed contract addresses

### Shared Patterns
- All client components use `'use client'` directive
- Font families: `var(--font-geist-mono, monospace)` for domain names/prices, `var(--font-outfit, Outfit, sans-serif)` for headings
- Color palette: `#5B61FE` (primary blue), `#FF8162` (CTA orange), `#171717` (text), `#666666` (secondary text), `#A3A3A3` (muted), `#10B981` (success green), `#EF4444` (error red)
- Rounded corners: `rounded-2xl` / `rounded-3xl`
- Animation library: `framer-motion`

### Contract Interface Summary
- **Registry**: `available()`, `getPrice()`, `register()`, `renew()`, `ownerOf()`, `getName()`, `nameExpires()`, `setResolver()`, `transferFrom()`
- **Resolver**: `addr()`, `text()`, `setAddr()`, `setText()`
- **Events**: `DomainRegistered`, `DomainRenewed`, `Transfer`, `AddrChanged`, `TextChanged`
- **Label validation**: 1-63 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphens
- **Namehash**: ENS-style `keccak256(keccak256(bytes32(0), keccak256("claw")), keccak256(label))`
