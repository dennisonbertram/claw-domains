import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const CLAW_DIR = join(homedir(), '.claw')
const KEYSTORE_PATH = join(CLAW_DIR, 'keystore.json')

interface Keystore {
  version: 1
  privateKey: string
  address: string
  createdAt: string
}

export function getKeystorePath(): string {
  return KEYSTORE_PATH
}

export function walletExists(): boolean {
  return existsSync(KEYSTORE_PATH)
}

export function createWallet(): Keystore {
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)
  const keystore: Keystore = {
    version: 1,
    privateKey,
    address: account.address,
    createdAt: new Date().toISOString(),
  }
  return keystore
}

export function saveWallet(keystore: Keystore): void {
  mkdirSync(CLAW_DIR, { recursive: true })
  writeFileSync(KEYSTORE_PATH, JSON.stringify(keystore, null, 2), { mode: 0o600 })
}

export function loadWallet(): Keystore {
  if (!walletExists()) {
    throw new Error('No wallet found. Run "claw init" first.')
  }
  const data = readFileSync(KEYSTORE_PATH, 'utf-8')
  return JSON.parse(data) as Keystore
}
