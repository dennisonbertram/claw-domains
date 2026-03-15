import { Command } from 'commander'
import { CLAW_REGISTRY_ABI, CLAW_RESOLVER_ABI, namehash, labelToId, TEXT_RECORD_KEYS } from '@claw-domains/shared'
import { getPublicClient, getAddresses } from '../client.js'
import { success, error, type OutputOptions } from '../output.js'
import { lookupDomain, getTextRecords, getAddrRecord } from '../ponder-client.js'

export const lookupCommand = new Command('lookup')
  .argument('<name>', 'Domain name to look up (without .claw)')
  .description('Look up a .claw domain')
  .option('--on-chain', 'Force on-chain lookup (skip ponder)')
  .action(async (name: string, options, cmd) => {
    const opts: OutputOptions = cmd.optsWithGlobals()
    try {
      const node = namehash(name)
      const tokenId = labelToId(name)

      if (!options.onChain) {
        // Try ponder first
        try {
          const domain = await lookupDomain(name)
          if (domain) {
            const textRecords = await getTextRecords(node)
            const addrRecord = await getAddrRecord(node)
            const expiryDate = new Date(Number(domain.expires) * 1000).toISOString().split('T')[0]

            const records: Record<string, string> = {}
            if (addrRecord) records.addr = addrRecord
            for (const r of textRecords) records[r.key] = r.value

            success(`${name}.claw`, {
              domain: `${name}.claw`,
              owner: domain.owner,
              tokenId: domain.id,
              node,
              expires: expiryDate,
              ...(Object.keys(records).length > 0 ? { records: JSON.stringify(records) } : {}),
            }, opts)
            return
          }
        } catch {
          // Fall through to on-chain
        }
      }

      // On-chain fallback
      const publicClient = getPublicClient()
      const addresses = getAddresses()

      const [owner, expires] = await Promise.all([
        publicClient.readContract({
          address: addresses.registry,
          abi: CLAW_REGISTRY_ABI,
          functionName: 'ownerOf',
          args: [tokenId],
        }).catch(() => null),
        publicClient.readContract({
          address: addresses.registry,
          abi: CLAW_REGISTRY_ABI,
          functionName: 'nameExpires',
          args: [tokenId],
        }).catch(() => 0n),
      ])

      if (!owner) {
        error(`${name}.claw not found`, opts)
        return
      }

      // Read records on-chain
      const records: Record<string, string> = {}
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

      const expiryDate = new Date(Number(expires as bigint) * 1000).toISOString().split('T')[0]

      success(`${name}.claw`, {
        domain: `${name}.claw`,
        owner: owner as string,
        tokenId: `0x${tokenId.toString(16)}`,
        node,
        expires: expiryDate,
        ...(Object.keys(records).length > 0 ? { records: JSON.stringify(records) } : {}),
      }, opts)
    } catch (e: any) {
      error(e.message, opts)
    }
  })
