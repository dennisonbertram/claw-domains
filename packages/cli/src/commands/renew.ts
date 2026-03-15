import { Command } from 'commander'
import { CLAW_REGISTRY_ABI, USDC_ABI, isValidLabel, labelToId, getPrice, getPriceDisplay } from '@claw-domains/shared'
import { loadWallet } from '../wallet.js'
import { getPublicClient, getWalletClient, getAddresses } from '../client.js'
import { success, error, info, type OutputOptions } from '../output.js'

export const renewCommand = new Command('renew')
  .argument('<name>', 'Domain name to renew (without .claw)')
  .description('Renew a .claw domain for another year')
  .action(async (name: string, _, cmd) => {
    const opts: OutputOptions = cmd.optsWithGlobals()
    try {
      if (!isValidLabel(name)) {
        error(`Invalid domain name: "${name}"`, opts)
      }

      const wallet = loadWallet()
      const publicClient = getPublicClient()
      const walletClient = getWalletClient(wallet.privateKey as `0x${string}`)
      const addresses = getAddresses()
      const tokenId = labelToId(name)
      const price = getPrice(name)

      info(`Renewal price: ${getPriceDisplay(name)}`, opts)

      // Check and approve USDC
      const allowance = await publicClient.readContract({
        address: addresses.usdc,
        abi: USDC_ABI,
        functionName: 'allowance',
        args: [wallet.address as `0x${string}`, addresses.registry],
      }) as bigint

      if (allowance < price) {
        info('Approving USDC...', opts)
        const approveTx = await walletClient.writeContract({
          address: addresses.usdc,
          abi: USDC_ABI,
          functionName: 'approve',
          args: [addresses.registry, price],
        })
        await publicClient.waitForTransactionReceipt({ hash: approveTx })
      }

      info('Renewing domain...', opts)
      const renewTx = await walletClient.writeContract({
        address: addresses.registry,
        abi: CLAW_REGISTRY_ABI,
        functionName: 'renew',
        args: [tokenId],
      })
      const receipt = await publicClient.waitForTransactionReceipt({ hash: renewTx })

      // Get new expiry
      const newExpires = await publicClient.readContract({
        address: addresses.registry,
        abi: CLAW_REGISTRY_ABI,
        functionName: 'nameExpires',
        args: [tokenId],
      }) as bigint

      const expiryDate = new Date(Number(newExpires) * 1000).toISOString().split('T')[0]

      success(`${name}.claw renewed`, {
        domain: `${name}.claw`,
        newExpiry: expiryDate,
        price: getPriceDisplay(name),
        tx: receipt.transactionHash,
      }, opts)
    } catch (e: any) {
      error(e.message, opts)
    }
  })
