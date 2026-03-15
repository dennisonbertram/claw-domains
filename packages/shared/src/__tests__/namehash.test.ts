import { describe, it, expect } from 'vitest'
import { namehash, labelToId, isValidLabel } from '../namehash.js'

describe('namehash', () => {
  it('returns a bytes32 hex string', () => {
    const hash = namehash('alice')
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/)
  })

  it('returns consistent results', () => {
    expect(namehash('alice')).toBe(namehash('alice'))
  })

  it('returns different hashes for different labels', () => {
    expect(namehash('alice')).not.toBe(namehash('bob'))
  })
})

describe('labelToId', () => {
  it('returns a BigInt', () => {
    const id = labelToId('alice')
    expect(typeof id).toBe('bigint')
  })

  it('matches BigInt of namehash', () => {
    const hash = namehash('alice')
    expect(labelToId('alice')).toBe(BigInt(hash))
  })
})

describe('isValidLabel', () => {
  it('accepts valid labels', () => {
    expect(isValidLabel('alice')).toBe(true)
    expect(isValidLabel('my-domain')).toBe(true)
    expect(isValidLabel('a')).toBe(true)
    expect(isValidLabel('a'.repeat(63))).toBe(true)
    expect(isValidLabel('test123')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(isValidLabel('')).toBe(false)
  })

  it('rejects leading hyphen', () => {
    expect(isValidLabel('-start')).toBe(false)
  })

  it('rejects trailing hyphen', () => {
    expect(isValidLabel('end-')).toBe(false)
  })

  it('rejects uppercase', () => {
    expect(isValidLabel('UPPER')).toBe(false)
  })

  it('rejects spaces', () => {
    expect(isValidLabel('has space')).toBe(false)
  })

  it('rejects labels over 63 chars', () => {
    expect(isValidLabel('a'.repeat(64))).toBe(false)
  })

  it('rejects special characters', () => {
    expect(isValidLabel('special!char')).toBe(false)
  })
})
