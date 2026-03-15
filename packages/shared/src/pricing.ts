export function getPrice(label: string): bigint {
  const len = label.length
  if (len <= 2) return BigInt('100000000')
  if (len === 3) return BigInt('25000000')
  if (len === 4) return BigInt('10000000')
  return BigInt('5000000')
}

export function getPriceDisplay(label: string): string {
  const len = label.length
  if (len <= 2) return '$100 USDC'
  if (len === 3) return '$25 USDC'
  if (len === 4) return '$10 USDC'
  return '$5 USDC'
}
