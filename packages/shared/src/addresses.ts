export const CONTRACT_ADDRESSES = {
  5042002: {
    registry: '0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C' as `0x${string}`,
    resolver: '0xDF4FaEc0390505f394172D87faa134872b2D54B4' as `0x${string}`,
    usdc: '0x3600000000000000000000000000000000000000' as `0x${string}`,
  },
} as const

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES
