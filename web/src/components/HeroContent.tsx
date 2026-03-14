'use client'

import { motion } from 'framer-motion'
import SearchBar from '@/components/SearchBar'

/**
 * Animated hero content for the home page.
 * Extracted to a client component to use framer-motion in a server page.
 *
 * Usage:
 *   <HeroContent />
 */
export default function HeroContent() {
  return (
    <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-4xl mx-auto">
      {/* Heading */}
      <motion.h1
        id="hero-heading"
        className="text-5xl md:text-7xl font-extrabold text-[#171717] leading-tight mb-6 tracking-tight"
        style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Your cozy home{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #5B61FE 0%, #FF8162 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          on the internet.
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-lg md:text-xl text-[#666666] mb-10 max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
      >
        Find, claim, and manage your .claw identity in seconds.
      </motion.p>

      {/* Search bar */}
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      >
        <SearchBar />
      </motion.div>

      {/* Trust strip */}
      <motion.p
        className="mt-8 text-sm text-[#A3A3A3] flex items-center gap-2 flex-wrap justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <span>Trusted by builders</span>
        <span className="text-[#E5E5E5]">·</span>
        <span>No crypto jargon</span>
        <span className="text-[#E5E5E5]">·</span>
        <span>Yours forever</span>
      </motion.p>
    </div>
  )
}
