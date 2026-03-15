import { Hono } from 'hono'
import { createPublicClient, createWalletClient, http, formatUnits, parseUnits, isAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arcTestnet, CONTRACT_ADDRESSES, USDC_ABI } from '@claw-domains/shared'
import { RateLimiter } from './rate-limiter.js'

const USDC_AMOUNT = parseUnits('0.01', 6) // 1 cent

export function createApp() {
  const app = new Hono()
  const limiter = new RateLimiter()

  const privateKey = process.env.FAUCET_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('FAUCET_PRIVATE_KEY environment variable is required')
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`)
  const addresses = CONTRACT_ADDRESSES[5042002]

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(),
  })

  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(),
  })

  // Health check
  app.get('/', async (c) => {
    try {
      const usdcBalance = await publicClient.readContract({
        address: addresses.usdc,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [account.address],
      })

      return c.json({
        status: 'ok',
        faucetAddress: account.address,
        balances: {
          usdc: formatUnits(usdcBalance as bigint, 6),
        },
      })
    } catch (e: any) {
      return c.json({ status: 'error', message: e.message }, 500)
    }
  })

  // Fund endpoint
  app.post('/fund', async (c) => {
    try {
      const body = await c.req.json()
      const { address } = body

      if (!address || !isAddress(address)) {
        return c.json({ success: false, error: 'Invalid address' }, 400)
      }

      if (!limiter.isAllowed(address)) {
        return c.json({ success: false, error: 'Rate limited. Try again in 24 hours.' }, 429)
      }

      // Send USDC
      const usdcTx = await walletClient.writeContract({
        address: addresses.usdc,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [address as `0x${string}`, USDC_AMOUNT],
      })

      await publicClient.waitForTransactionReceipt({ hash: usdcTx })

      limiter.record(address)

      return c.json({
        success: true,
        txHash: usdcTx,
        amount: '0.01',
        token: 'USDC',
      })
    } catch (e: any) {
      return c.json({ success: false, error: e.message }, 500)
    }
  })

  return app
}
