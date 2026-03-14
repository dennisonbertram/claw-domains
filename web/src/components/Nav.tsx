'use client'

import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'

/**
 * Floating pill navigation bar.
 * Fixed at top, centered, with frosted glass effect.
 *
 * Usage: included in RootLayout — no props needed.
 */
export default function Nav() {
  const { login, logout, authenticated, user } = usePrivy()

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
          {authenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70 font-mono">
                {user?.wallet?.address
                  ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                  : 'Connected'}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="px-4 py-1.5 text-sm bg-[var(--primary)] hover:bg-[var(--primary)]/90 rounded-full transition-colors text-white font-medium"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
