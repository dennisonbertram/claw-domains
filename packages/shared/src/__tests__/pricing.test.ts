import { describe, it, expect } from 'vitest'
import { getPrice, getPriceDisplay } from '../pricing.js'

describe('getPrice', () => {
  it('returns $100 for 1-char labels', () => {
    expect(getPrice('a')).toBe(100000000n)
  })

  it('returns $100 for 2-char labels', () => {
    expect(getPrice('ab')).toBe(100000000n)
  })

  it('returns $25 for 3-char labels', () => {
    expect(getPrice('abc')).toBe(25000000n)
  })

  it('returns $10 for 4-char labels', () => {
    expect(getPrice('abcd')).toBe(10000000n)
  })

  it('returns $5 for 5+ char labels', () => {
    expect(getPrice('abcde')).toBe(5000000n)
    expect(getPrice('longername')).toBe(5000000n)
  })
})

describe('getPriceDisplay', () => {
  it('matches getPrice tiers', () => {
    expect(getPriceDisplay('a')).toBe('$100 USDC')
    expect(getPriceDisplay('ab')).toBe('$100 USDC')
    expect(getPriceDisplay('abc')).toBe('$25 USDC')
    expect(getPriceDisplay('abcd')).toBe('$10 USDC')
    expect(getPriceDisplay('abcde')).toBe('$5 USDC')
  })
})
