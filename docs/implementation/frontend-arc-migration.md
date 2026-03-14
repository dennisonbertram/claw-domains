# Frontend Migration: Base -> Arc Network

## Summary

Migrated the claw-domains frontend from Base/Base Sepolia to Arc Testnet (chain ID 5042002). Replaced ETH-based pricing with USDC pricing. Build passes successfully.

## Files Modified

### `web/src/lib/wagmi.ts`
- Added `defineChain` import from `viem` to define custom Arc Testnet chain
- Defined `arcTestnet` chain: ID 5042002, RPC `https://rpc.testnet.arc.network`, explorer `https://testnet.arcscan.app`
- Native currency set to USDC (decimals 18)
- Replaced `[base, baseSepolia]` chains with `[arcTestnet]`
- Updated app description from "on Base" to "on Arc"

### `web/src/lib/contracts.ts`
- Replaced Base Mainnet (8453) and Base Sepolia (84532) contract address entries with Arc Testnet (5042002)
- Added USDC token address: `0x3600000000000000000000000000000000000000`
- Registry and resolver addresses remain as TODO placeholders pending deployment
- Updated `getPrice()`: now returns USDC amounts (6 decimals) -- $100/$25/$10/$5 based on label length
- Updated `getPriceDisplay()`: now returns "$X USDC" strings instead of "X ETH"

### Files Unchanged (no modifications needed)
- `web/src/components/SearchBar.tsx` -- uses `getPriceDisplay()` which now returns USDC values automatically
- `web/src/app/register/[name]/RegisterClient.tsx` -- uses `getPriceDisplay()`, no ETH/USDC toggle existed

## Build Output

```
Next.js 16.1.6 (Turbopack)
Compiled successfully in 3.3s
Generating static pages (5/5) in 354.2ms

Routes:
  / (Static)
  /domain/[name] (Dynamic)
  /profile (Static)
  /register/[name] (Dynamic)
```

Build: SUCCESS -- no errors, no warnings (other than unrelated lockfile detection).

## Notes
- Arc Testnet chain ID: 5042002
- USDC address on Arc: `0x3600000000000000000000000000000000000000`
- Contract addresses (registry, resolver) need to be updated after deployment to Arc
