import { keccak256, encodePacked, toHex } from 'viem'

export function namehash(label: string): `0x${string}` {
  let node: `0x${string}` = toHex(0n, { size: 32 })
  const clawHash = keccak256(encodePacked(['string'], ['claw']))
  node = keccak256(encodePacked(['bytes32', 'bytes32'], [node, clawHash]))
  const labelHash = keccak256(encodePacked(['string'], [label]))
  node = keccak256(encodePacked(['bytes32', 'bytes32'], [node, labelHash]))
  return node
}

export function labelToId(label: string): bigint {
  const hash = namehash(label)
  return BigInt(hash)
}

export function isValidLabel(label: string): boolean {
  if (!label || label.length === 0 || label.length > 63) return false
  if (label.startsWith('-') || label.endsWith('-')) return false
  return /^[a-z0-9-]+$/.test(label)
}
