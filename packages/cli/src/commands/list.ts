import { Command } from 'commander'
import { loadWallet } from '../wallet.js'
import { listDomainsByOwner } from '../ponder-client.js'
import { success, error, info, type OutputOptions } from '../output.js'

export const listCommand = new Command('list')
  .description('List domains owned by your wallet')
  .action(async (_, cmd) => {
    const opts: OutputOptions = cmd.optsWithGlobals()
    try {
      const wallet = loadWallet()
      const domains = await listDomainsByOwner(wallet.address)

      if (domains.length === 0) {
        if (opts.json) {
          console.log(JSON.stringify({ success: true, domains: [] }))
        } else {
          info('No domains found', opts)
        }
        return
      }

      if (opts.json) {
        console.log(JSON.stringify({
          success: true,
          owner: wallet.address,
          domains: domains.map(d => ({
            name: `${d.name}.claw`,
            tokenId: d.id,
            expires: new Date(Number(d.expires) * 1000).toISOString().split('T')[0],
          })),
        }))
      } else {
        console.log(`Domains owned by ${wallet.address}:\n`)
        for (const d of domains) {
          const expiryDate = new Date(Number(d.expires) * 1000).toISOString().split('T')[0]
          console.log(`  ${d.name}.claw  (expires ${expiryDate})`)
        }
        console.log(`\n  Total: ${domains.length}`)
      }
    } catch (e: any) {
      error(e.message, opts)
    }
  })
