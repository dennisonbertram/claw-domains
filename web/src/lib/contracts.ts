import { keccak256, encodePacked, toHex } from 'viem'

// ─────────────────────────────────────────────────────────────────────────────
// Contract Addresses
// TODO: Update these after deploying to testnet / mainnet
// ─────────────────────────────────────────────────────────────────────────────

export const CONTRACT_ADDRESSES = {
  // Arc Testnet (chainId 5042002)
  5042002: {
    registry: '0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C' as `0x${string}`,
    resolver: '0xDF4FaEc0390505f394172D87faa134872b2D54B4' as `0x${string}`,
    usdc: '0x3600000000000000000000000000000000000000' as `0x${string}`,
  },
} as const

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES

// ─────────────────────────────────────────────────────────────────────────────
// ABIs
// ─────────────────────────────────────────────────────────────────────────────

export const CLAW_REGISTRY_ABI = [
  // Read
  {
    name: 'available',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'name', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'nameExpires',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getPrice',
    type: 'function',
    stateMutability: 'pure',
    inputs: [{ name: 'name', type: 'string' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'resolver',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'getName',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  // Write
  {
    name: 'register',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'domainOwner', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'renew',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'setResolver',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'resolverAddr', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'transferFrom',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
  // Events
  {
    name: 'DomainRegistered',
    type: 'event',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'owner', type: 'address', indexed: false },
      { name: 'expires', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'DomainRenewed',
    type: 'event',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'newExpires', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
    ],
  },
] as const

export const CLAW_RESOLVER_ABI = [
  // Read
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'text',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
    ],
    outputs: [{ name: '', type: 'string' }],
  },
  // Write
  {
    name: 'setAddr',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'newAddr', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'setText',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    outputs: [],
  },
  // Events
  {
    name: 'AddrChanged',
    type: 'event',
    inputs: [
      { name: 'node', type: 'bytes32', indexed: true },
      { name: 'addr', type: 'address', indexed: false },
    ],
  },
  {
    name: 'TextChanged',
    type: 'event',
    inputs: [
      { name: 'node', type: 'bytes32', indexed: true },
      { name: 'key', type: 'string', indexed: false },
      { name: 'value', type: 'string', indexed: false },
    ],
  },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// Namehash utilities — matches ClawNamehash.sol exactly
// ENS-style: namehash(label.claw) = keccak256(keccak256(bytes32(0), keccak256("claw")), keccak256(label))
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the ENS-style namehash for a .claw domain label.
 * Matches ClawNamehash.namehash() in Solidity exactly.
 *
 * @param label - e.g. "alice" for "alice.claw"
 * @returns bytes32 namehash as hex string
 */
export function namehash(label: string): `0x${string}` {
  // Start from the root namehash (bytes32(0))
  let node: `0x${string}` = toHex(0n, { size: 32 })

  // Hash the TLD "claw": keccak256(abi.encodePacked(node, keccak256("claw")))
  const clawHash = keccak256(encodePacked(['string'], ['claw']))
  node = keccak256(encodePacked(['bytes32', 'bytes32'], [node, clawHash]))

  // Hash the label: keccak256(abi.encodePacked(node, keccak256(label)))
  const labelHash = keccak256(encodePacked(['string'], [label]))
  node = keccak256(encodePacked(['bytes32', 'bytes32'], [node, labelHash]))

  return node
}

/**
 * Convert a domain label to its uint256 token ID.
 * Matches ClawNamehash.labelToId() in Solidity.
 *
 * @param label - e.g. "alice"
 * @returns BigInt token ID
 */
export function labelToId(label: string): bigint {
  const hash = namehash(label)
  return BigInt(hash)
}

// ─────────────────────────────────────────────────────────────────────────────
// Label validation — matches ClawNamehash.isValidLabel() in Solidity
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate a domain label.
 * - 1-63 characters
 * - lowercase alphanumeric + hyphens only
 * - no leading or trailing hyphens
 */
export function isValidLabel(label: string): boolean {
  if (!label || label.length === 0 || label.length > 63) return false
  if (label.startsWith('-') || label.endsWith('-')) return false
  return /^[a-z0-9-]+$/.test(label)
}

// ─────────────────────────────────────────────────────────────────────────────
// Pricing — USDC (6 decimals). Matches ClawRegistry constants on Arc.
// ─────────────────────────────────────────────────────────────────────────────

export function getPrice(label: string): bigint {
  const len = label.length
  if (len <= 2) return BigInt('100000000') // $100 USDC
  if (len === 3) return BigInt('25000000')  // $25 USDC
  if (len === 4) return BigInt('10000000')  // $10 USDC
  return BigInt('5000000')                   // $5 USDC
}

export function getPriceDisplay(label: string): string {
  const len = label.length
  if (len <= 2) return '$100 USDC'
  if (len === 3) return '$25 USDC'
  if (len === 4) return '$10 USDC'
  return '$5 USDC'
}

// ─────────────────────────────────────────────────────────────────────────────
// Text record keys used in ClawResolver
// ─────────────────────────────────────────────────────────────────────────────

export const TEXT_RECORD_KEYS = [
  'avatar',
  'url',
  'email',
  'twitter',
  'github',
  'description',
] as const

export type TextRecordKey = typeof TEXT_RECORD_KEYS[number]

// ─────────────────────────────────────────────────────────────────────────────
// USDC ERC-20 ABI (minimal interface for approve/allowance/balanceOf/transfer)
// ─────────────────────────────────────────────────────────────────────────────

export const USDC_ABI = [
  {
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
