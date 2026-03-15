import { describe, it, expect } from 'vitest'
import { createWallet } from '../wallet.js'

describe('createWallet', () => {
  it('generates a valid keystore', () => {
    const keystore = createWallet()
    expect(keystore.version).toBe(1)
    expect(keystore.privateKey).toMatch(/^0x[0-9a-f]{64}$/)
    expect(keystore.address).toMatch(/^0x[0-9a-fA-F]{40}$/)
    expect(keystore.createdAt).toBeTruthy()
  })

  it('generates unique wallets', () => {
    const k1 = createWallet()
    const k2 = createWallet()
    expect(k1.privateKey).not.toBe(k2.privateKey)
    expect(k1.address).not.toBe(k2.address)
  })
})
