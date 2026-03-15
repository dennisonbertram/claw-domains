export const CONTRACT_ADDRESSES = {
  5042002: {
    registry: '0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3' as `0x${string}`,
    resolver: '0x3DD454c7b4FFe55469a5710A86fe86ab9f85c75e' as `0x${string}`,
    usdc: '0x3600000000000000000000000000000000000000' as `0x${string}`,
  },
} as const

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES
