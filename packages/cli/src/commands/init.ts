import { Command } from 'commander'
import { createWallet, saveWallet, walletExists } from '../wallet.js'
import { success, error, info, type OutputOptions } from '../output.js'

export const initCommand = new Command('init')
  .description('Generate a new wallet and fund it via faucet')
  .option('--faucet-url <url>', 'Faucet URL', process.env.CLAW_FAUCET_URL || 'http://localhost:3000')
  .action(async (options, cmd) => {
    const opts: OutputOptions = cmd.optsWithGlobals()
    try {
      if (walletExists()) {
        error('Wallet already exists. Delete ~/.claw/keystore.json to reinitialize.', opts)
      }

      const keystore = createWallet()
      saveWallet(keystore)
      info(`Generated wallet: ${keystore.address}`, opts)

      // Call faucet
      try {
        const res = await fetch(`${options.faucetUrl}/fund`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: keystore.address }),
        })
        if (res.ok) {
          const data = await res.json()
          info(`Funded with ${data.amount || '0.01'} USDC`, opts)
        } else {
          info('Faucet unavailable -- fund your wallet manually', opts)
        }
      } catch {
        info('Faucet unavailable -- fund your wallet manually', opts)
      }

      success('Wallet initialized', {
        address: keystore.address,
        keystore: '~/.claw/keystore.json',
      }, opts)
    } catch (e: any) {
      error(e.message, opts)
    }
  })
