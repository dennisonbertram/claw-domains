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
