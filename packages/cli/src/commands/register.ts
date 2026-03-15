import { Command } from 'commander'
import {
  CLAW_REGISTRY_ABI, USDC_ABI,
  isValidLabel, namehash, labelToId, getPrice, getPriceDisplay,
} from '@claw-domains/shared'
import { loadWallet } from '../wallet.js'
import { getPublicClient, getWalletClient, getAddresses } from '../client.js'
import { success, error, info, type OutputOptions } from '../output.js'

export const registerCommand = new Command('register')
  .argument('<name>', 'Domain name to register (without .claw)')
  .description('Register a .claw domain')
  .action(async (name: string, _, cmd) => {
    const opts: OutputOptions = cmd.optsWithGlobals()
    try {
      if (!isValidLabel(name)) {
        error(`Invalid domain name: "${name}". Use lowercase alphanumeric and hyphens only.`, opts)
      }

      const wallet = loadWallet()
      const publicClient = getPublicClient()
      const walletClient = getWalletClient(wallet.privateKey as `0x${string}`)
      const addresses = getAddresses()

      // Check availability
      const available = await publicClient.readContract({
        address: addresses.registry,
        abi: CLAW_REGISTRY_ABI,
        functionName: 'available',
        args: [name],
      })

      if (!available) {
        error(`${name}.claw is not available`, opts)
      }

      const price = getPrice(name)
      info(`Price: ${getPriceDisplay(name)}`, opts)

      // Check USDC allowance and approve if needed
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

      // Register
      info('Registering domain...', opts)
      const registerTx = await walletClient.writeContract({
        address: addresses.registry,
        abi: CLAW_REGISTRY_ABI,
        functionName: 'register',
        args: [name, wallet.address as `0x${string}`],
      })
      const receipt = await publicClient.waitForTransactionReceipt({ hash: registerTx })

      const tokenId = labelToId(name)
      const node = namehash(name)

      // Get expiry
      const expires = await publicClient.readContract({
        address: addresses.registry,
        abi: CLAW_REGISTRY_ABI,
        functionName: 'nameExpires',
        args: [tokenId],
      }) as bigint

      const expiryDate = new Date(Number(expires) * 1000).toISOString().split('T')[0]

      success(`${name}.claw registered`, {
        domain: `${name}.claw`,
        tokenId: `0x${tokenId.toString(16)}`,
        node,
        expires: expiryDate,
        price: getPriceDisplay(name),
        tx: receipt.transactionHash,
      }, opts)
    } catch (e: any) {
      error(e.message, opts)
    }
  })
