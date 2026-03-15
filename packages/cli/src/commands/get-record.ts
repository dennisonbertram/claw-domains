import { Command } from 'commander'
import { CLAW_RESOLVER_ABI, namehash, TEXT_RECORD_KEYS, isValidLabel } from '@claw-domains/shared'
import { getPublicClient, getAddresses } from '../client.js'
import { success, error, type OutputOptions } from '../output.js'

export const getRecordCommand = new Command('get-record')
  .argument('<name>', 'Domain name (without .claw)')
  .description('Read resolver records for a domain')
  .action(async (name: string, _, cmd) => {
    const opts: OutputOptions = cmd.optsWithGlobals()
    try {
      if (!isValidLabel(name)) {
        error(`Invalid domain name: "${name}"`, opts)
      }

      const publicClient = getPublicClient()
      const addresses = getAddresses()
      const node = namehash(name)

      const records: Record<string, string> = {}

      // Read addr record
      try {
        const addr = await publicClient.readContract({
          address: addresses.resolver,
          abi: CLAW_RESOLVER_ABI,
          functionName: 'addr',
          args: [node],
        }) as `0x${string}`
        if (addr && addr !== '0x0000000000000000000000000000000000000000') {
          records.addr = addr
        }
      } catch {}

      // Read text records
      for (const key of TEXT_RECORD_KEYS) {
        try {
          const value = await publicClient.readContract({
            address: addresses.resolver,
            abi: CLAW_RESOLVER_ABI,
            functionName: 'text',
            args: [node, key],
          }) as string
          if (value) records[key] = value
        } catch {}
      }

      if (Object.keys(records).length === 0) {
        if (opts.json) {
          console.log(JSON.stringify({ success: true, domain: `${name}.claw`, records: {} }))
        } else {
          console.log(`No records found for ${name}.claw`)
        }
        return
      }

      success(`Records for ${name}.claw`, records, opts)
    } catch (e: any) {
      error(e.message, opts)
    }
  })
