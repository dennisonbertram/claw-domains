'use client'

import { motion } from 'framer-motion'

/**
 * Animated aurora background — three soft color orbs floating slowly.
 * Designed to sit behind hero content (position: absolute, z-0).
 *
 * Usage:
 *   <div className="relative overflow-hidden">
 *     <AuroraBackground />
 *     <div className="relative z-10">Content here</div>
 *   </div>
 */
export default function AuroraBackground() {
  return (
    <div
      className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      {/* Orb 1 — indigo/brand */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(91,97,254,0.35) 0%, rgba(91,97,254,0) 70%)',
          filter: 'blur(40px)',
          top: '10%',
          left: '20%',
        }}
        animate={{
          x: [0, 60, -40, 20, 0],
          y: [0, -40, 30, -20, 0],
          scale: [1, 1.1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Orb 2 — coral/accent */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,129,98,0.28) 0%, rgba(255,129,98,0) 70%)',
          filter: 'blur(50px)',
          top: '30%',
          right: '15%',
        }}
        animate={{
          x: [0, -50, 30, -20, 0],
          y: [0, 40, -30, 10, 0],
          scale: [1, 0.9, 1.15, 0.98, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Orb 3 — purple */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, rgba(167,139,250,0) 70%)',
          filter: 'blur(45px)',
          bottom: '20%',
          left: '35%',
        }}
        animate={{
          x: [0, 30, -60, 15, 0],
          y: [0, -20, 50, -10, 0],
          scale: [1, 1.08, 0.92, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  )
}
