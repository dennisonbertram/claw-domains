'use client'

import Link from 'next/link'
import { ConnectKitButton } from 'connectkit'

/**
 * Floating pill navigation bar.
 * Fixed at top, centered, with frosted glass effect.
 *
 * Usage: included in RootLayout — no props needed.
 */
export default function Nav() {
  return (
    <nav
      className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl z-50"
      aria-label="Main navigation"
    >
      <div className="bg-white/80 backdrop-blur-md border border-[#E5E5E5] rounded-full shadow-[0px_4px_20px_rgba(0,0,0,0.06)] flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-[#171717] hover:opacity-80 transition-opacity"
          aria-label="Claw Domains home"
          style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
        >
          <span role="img" aria-hidden="true">🦞</span>
          <span>.claw</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="hidden sm:block text-sm text-[#666666] hover:text-[#171717] transition-colors font-medium"
          >
            My Domains
          </Link>
          <ConnectKitButton />
        </div>
      </div>
    </nav>
  )
}
