'use client';

import { http } from 'wagmi';
import { type Chain } from 'viem';
import { createConfig } from '@privy-io/wagmi';

export const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ARC',
    symbol: 'ARC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.arc.network'],
    },
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://testnet.arc.network' },
  },
} as const satisfies Chain;

export const config = createConfig({
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(),
  },
});
