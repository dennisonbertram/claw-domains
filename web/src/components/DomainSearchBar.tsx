'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { isValidLabel, getPriceDisplay } from '@/lib/contracts'

interface DomainSearchBarProps {
  /** Optional initial value */
  defaultValue?: string
  /** If true, shows a large hero variant */
  hero?: boolean
}

/**
 * Domain search bar.
 * - Validates label format on the client.
 * - Navigates to /register/[label] on submit.
 * - Shows price tier hint as user types.
 *
 * Usage:
 *   <DomainSearchBar hero />
 *   <DomainSearchBar defaultValue="alice" />
 */
export default function DomainSearchBar({ defaultValue = '', hero = false }: DomainSearchBarProps) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus in hero mode
  useEffect(() => {
    if (hero && inputRef.current) inputRef.current.focus()
  }, [hero])

  const label = value.trim().toLowerCase().replace(/\.claw$/i, '')
  const valid = label.length > 0 && isValidLabel(label)
  const priceHint = valid ? getPriceDisplay(label) : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label) return
    if (!isValidLabel(label)) {
      setError('Lowercase letters (a–z), numbers (0–9), and hyphens only. No leading or trailing hyphens.')
      return
    }
    setError('')
    router.push(`/register/${encodeURIComponent(label)}`)
  }

  const inputClass = hero
    ? 'w-full rounded-xl border border-gray-700 bg-gray-900 px-6 py-4 pr-28 text-lg text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/40 transition'
    : 'w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 pr-24 text-base text-white placeholder-gray-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition'

  return (
    <form onSubmit={handleSubmit} noValidate role="search" aria-label="Search for a .claw domain">
      <div className="relative flex w-full items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError('') }}
          placeholder="yourdomain"
          className={inputClass}
          aria-label="Domain name"
          aria-describedby={error ? 'domain-search-error' : undefined}
          autoComplete="off"
          spellCheck={false}
          maxLength={63}
        />

        {/* .claw suffix badge */}
        <span
          className={`pointer-events-none absolute right-16 font-semibold text-red-400 ${hero ? 'text-lg' : 'text-sm'}`}
          aria-hidden="true"
        >
          .claw
        </span>

        {/* Search button */}
        <button
          type="submit"
          className={`absolute right-0 flex h-full items-center justify-center rounded-r-xl px-4 font-medium text-white transition-colors ${
            valid
              ? 'bg-red-600 hover:bg-red-500'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          aria-label="Check availability"
        >
          {hero ? (
            <span className="text-sm">Check</span>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Price hint */}
      {priceHint && !error && (
        <p className="mt-2 text-sm text-gray-400">
          Registration fee: <span className="font-semibold text-white">{priceHint}</span> / year
        </p>
      )}

      {/* Validation error */}
      {error && (
        <p id="domain-search-error" className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
