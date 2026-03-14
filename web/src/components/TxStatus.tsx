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
