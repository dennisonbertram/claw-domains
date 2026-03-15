import { Command } from 'commander'
import { formatEther, formatUnits } from 'viem'
import { USDC_ABI } from '@claw-domains/shared'
import { loadWallet } from '../wallet.js'
import { getPublicClient, getAddresses } from '../client.js'
import { success, error, type OutputOptions } from '../output.js'

export const balanceCommand = new Command('balance')
  .description('Show ARC and USDC balances')
  .action(async (_, cmd) => {
    const opts: OutputOptions = cmd.optsWithGlobals()
    try {
      const wallet = loadWallet()
      const client = getPublicClient()
      const addresses = getAddresses()

      const [arcBalance, usdcBalance] = await Promise.all([
        client.getBalance({ address: wallet.address as `0x${string}` }),
        client.readContract({
          address: addresses.usdc,
          abi: USDC_ABI,
          functionName: 'balanceOf',
          args: [wallet.address as `0x${string}`],
        }),
      ])

      success('Wallet balances', {
        address: wallet.address,
        arc: `${formatEther(arcBalance)} ARC`,
        usdc: `${formatUnits(usdcBalance as bigint, 6)} USDC`,
      }, opts)
    } catch (e: any) {
      error(e.message, opts)
    }
  })
