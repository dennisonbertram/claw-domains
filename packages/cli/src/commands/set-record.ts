import { Command } from 'commander'
import { CLAW_RESOLVER_ABI, namehash, isValidLabel } from '@claw-domains/shared'
import { loadWallet } from '../wallet.js'
import { getPublicClient, getWalletClient, getAddresses } from '../client.js'
import { success, error, info, type OutputOptions } from '../output.js'

export const setRecordCommand = new Command('set-record')
  .argument('<name>', 'Domain name (without .claw)')
  .description('Set resolver records on a domain')
  .option('--addr <address>', 'Set address record')
  .option('--text <entries...>', 'Set text records as key value pairs (e.g. --text description "My domain" github myhandle)')
  .action(async (name: string, options, cmd) => {
    const opts: OutputOptions = cmd.optsWithGlobals()
    try {
      if (!isValidLabel(name)) {
        error(`Invalid domain name: "${name}"`, opts)
      }

      const wallet = loadWallet()
      const publicClient = getPublicClient()
      const walletClient = getWalletClient(wallet.privateKey as `0x${string}`)
      const addresses = getAddresses()
      const node = namehash(name)

      let recordCount = 0

      // Set address record
      if (options.addr) {
        info('Setting address record...', opts)
        const tx = await walletClient.writeContract({
          address: addresses.resolver,
          abi: CLAW_RESOLVER_ABI,
          functionName: 'setAddr',
          args: [node, options.addr as `0x${string}`],
        })
        await publicClient.waitForTransactionReceipt({ hash: tx })
        recordCount++
      }

      // Set text records (pairs of key value)
      if (options.text && options.text.length >= 2) {
        const entries = options.text as string[]
        for (let i = 0; i < entries.length - 1; i += 2) {
          const key = entries[i]
          const value = entries[i + 1]
          info(`Setting text record: ${key} = "${value}"`, opts)
          const tx = await walletClient.writeContract({
            address: addresses.resolver,
            abi: CLAW_RESOLVER_ABI,
            functionName: 'setText',
            args: [node, key, value],
          })
          await publicClient.waitForTransactionReceipt({ hash: tx })
          recordCount++
        }
      }

      if (recordCount === 0) {
        error('No records specified. Use --addr or --text.', opts)
      }

      success(`Set ${recordCount} record${recordCount > 1 ? 's' : ''} on ${name}.claw`, {
        domain: `${name}.claw`,
        records: String(recordCount),
      }, opts)
    } catch (e: any) {
      error(e.message, opts)
    }
  })
