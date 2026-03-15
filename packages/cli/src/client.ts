import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arcTestnet, CONTRACT_ADDRESSES } from '@claw-domains/shared'

export function getPublicClient() {
  return createPublicClient({
    chain: arcTestnet,
    transport: http(),
  })
}

export function getWalletClient(privateKey: `0x${string}`) {
  const account = privateKeyToAccount(privateKey)
  return createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(),
  })
}

export function getAddresses() {
  return CONTRACT_ADDRESSES[5042002]
}
