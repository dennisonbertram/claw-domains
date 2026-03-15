import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RateLimiter } from '../rate-limiter.js'

describe('RateLimiter', () => {
  let limiter: RateLimiter

  beforeEach(() => {
    limiter = new RateLimiter()
  })

  afterEach(() => {
    limiter.destroy()
  })

  it('allows first request', () => {
    expect(limiter.isAllowed('0x123')).toBe(true)
  })

  it('blocks second request within window', () => {
    limiter.record('0x123')
    expect(limiter.isAllowed('0x123')).toBe(false)
  })

  it('allows different addresses', () => {
    limiter.record('0x123')
    expect(limiter.isAllowed('0x456')).toBe(true)
  })

  it('is case-insensitive', () => {
    limiter.record('0xABC')
    expect(limiter.isAllowed('0xabc')).toBe(false)
  })

  it('allows after window expires', () => {
    vi.useFakeTimers()
    limiter.record('0x123')
    expect(limiter.isAllowed('0x123')).toBe(false)

    // Advance past 24h
    vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1)
    expect(limiter.isAllowed('0x123')).toBe(true)

    vi.useRealTimers()
  })
})
