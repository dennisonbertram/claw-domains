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
