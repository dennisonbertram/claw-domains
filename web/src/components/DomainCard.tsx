'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface DomainCardProps {
  name: string
  expires: string
  tokenId?: string
}

/**
 * Animated card for a .claw domain with lift-on-hover effect.
 *
 * Usage:
 *   <DomainCard name="alice" expires="Mar 2027" tokenId="12345" />
 */
export default function DomainCard({ name, expires, tokenId }: DomainCardProps) {
  return (
    <Link href={`/domain/${name}`} className="block focus:outline-none" tabIndex={0}>
      <motion.div
        className="relative bg-white rounded-3xl p-6 border border-[#E5E5E5] overflow-hidden cursor-pointer group"
        style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04), 0px 1px 3px rgba(0,0,0,0.02)' }}
        whileHover={{ y: -8, boxShadow: '0px 16px 40px rgba(91,97,254,0.12), 0px 4px 12px rgba(0,0,0,0.06)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        role="article"
        aria-label={`Domain: ${name}.claw, expires ${expires}`}
      >
        {/* Animated orb - top right */}
        <motion.div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(91,97,254,0.18) 0%, rgba(255,129,98,0.15) 60%, transparent 80%)',
            filter: 'blur(16px)',
          }}
          variants={{
            idle: { scale: 1, opacity: 0.6 },
            hover: { scale: 1.7, opacity: 0.9 },
          }}
          initial="idle"
          whileHover="hover"
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          aria-hidden="true"
        />

        {/* Expiry badge — top right */}
        <div className="flex justify-between items-start mb-8">
          <div
            className="text-xs text-[#A3A3A3] font-medium bg-[#F3F4F6] rounded-full px-2.5 py-1"
          >
            Expires {expires}
          </div>
        </div>

        {/* Domain name */}
        <div>
          <p
            className="font-bold text-2xl text-[#171717] group-hover:text-[#5B61FE] transition-colors duration-200"
            style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
          >
            {name}
            <span className="text-[#5B61FE]">.claw</span>
          </p>
          {tokenId && (
            <p className="mt-1 text-xs text-[#A3A3A3] font-mono truncate">
              #{tokenId.slice(0, 8)}...
            </p>
          )}
        </div>

        {/* Manage arrow */}
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#5B61FE] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Manage
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </motion.div>
    </Link>
  )
}
