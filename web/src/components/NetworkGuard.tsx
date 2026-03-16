'use client'

import { useWallets } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'
import { useState } from 'react'

const ARC_TESTNET_CHAIN_ID = 5042002

export default function NetworkGuard() {
  const { isConnected } = useAccount()
  const { wallets } = useWallets()
  const [switching, setSwitching] = useState(false)

  // Get the active wallet and its actual chain
  const activeWallet = wallets[0]
  const walletChainId = activeWallet?.chainId ? parseInt(activeWallet.chainId.replace('eip155:', ''), 10) : null

  if (!isConnected || !activeWallet || walletChainId === ARC_TESTNET_CHAIN_ID) return null

  async function handleSwitch() {
    if (!activeWallet) return
    setSwitching(true)
    try {
      await activeWallet.switchChain(ARC_TESTNET_CHAIN_ID)
    } catch {
      // User rejected or wallet doesn't support it — try raw RPC as fallback
      try {
        const provider = await activeWallet.getEthereumProvider()
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${ARC_TESTNET_CHAIN_ID.toString(16)}`,
            chainName: 'Arc Testnet',
            nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
            rpcUrls: ['https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1'],
            blockExplorerUrls: ['https://testnet.arc.network'],
          }],
        })
      } catch {
        // User rejected adding the chain
      }
    } finally {
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
