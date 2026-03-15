'use client';

import { http } from 'wagmi';
import { createConfig } from '@privy-io/wagmi';
import { arcTestnet } from '@claw-domains/shared';

// Re-export for backward compatibility
export { arcTestnet };

export const config = createConfig({
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(),
  },
});
