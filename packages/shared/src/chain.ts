import { defineChain } from 'viem'

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  testnet: true,
  nativeCurrency: {
    decimals: 18,
    name: 'ARC',
    symbol: 'ARC',
  },
  rpcUrls: {
    default: {
      http: ['https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1'],
    },
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://testnet.arc.network' },
  },
})
