'use client'

import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { useState } from 'react'

const ARC_TESTNET_CHAIN_ID = 5042002

const ARC_TESTNET_PARAMS = {
  chainId: `0x${ARC_TESTNET_CHAIN_ID.toString(16)}`,
  chainName: 'Arc Testnet',
  nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
  rpcUrls: ['https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1'],
  blockExplorerUrls: ['https://testnet.arc.network'],
}

export default function NetworkGuard() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [switching, setSwitching] = useState(false)

  if (!isConnected || chainId === ARC_TESTNET_CHAIN_ID) return null

  async function handleSwitch() {
    setSwitching(true)
    try {
      // First try wagmi's switchChain (works if chain is already in wallet)
      switchChain(
        { chainId: ARC_TESTNET_CHAIN_ID },
        {
          onError: async () => {
            // If switch fails, try adding the chain via window.ethereum
            try {
              const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string; params: unknown[] }) => Promise<unknown> } }).ethereum
              if (ethereum) {
                await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [ARC_TESTNET_PARAMS],
                })
              }
            } catch {
              // User rejected or wallet doesn't support it
            }
            setSwitching(false)
          },
          onSuccess: () => setSwitching(false),
        },
      )
    } catch {
      setSwitching(false)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#FEF3C7] border-b border-[#F59E0B] px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-[#92400E] font-medium">
          Wrong network detected. Please switch to Arc Testnet to use Claw Domains.
        </p>
        <button
          onClick={handleSwitch}
          disabled={switching}
          className="shrink-0 px-4 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-60 text-white text-sm font-semibold rounded-full transition-colors"
        >
          {switching ? 'Switching...' : 'Switch to Arc Testnet'}
        </button>
      </div>
    </div>
  )
}
