# V2 Contract Migration (2026-03-15)

## Summary

Deployed new v2 contracts to Arc Testnet, replacing the v1 contracts. Updated all shared configuration, the Ponder indexer, and verified end-to-end functionality with a test domain registration.

## Contract Addresses

### V1 (Retired)

| Contract | Address |
|----------|---------|
| Registry | `0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C` |
| Resolver | `0xDF4FaEc0390505f394172D87faa134872b2D54B4` |

### V2 (Active)

| Contract | Address |
|----------|---------|
| Registry | `0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3` |
| Resolver | `0x3DD454c7b4FFe55469a5710A86fe86ab9f85c75e` |
| USDC     | `0x3600000000000000000000000000000000000000` (unchanged, 6 decimals) |

- **Chain**: Arc Testnet (Chain ID 5042002)
- **Deploy block**: 32,041,752

## Files Updated

- `packages/shared/src/addresses.ts` -- updated registry and resolver addresses
- `packages/ponder/ponder.config.ts` -- pointed to new contracts and deploy block

## Testnet Pricing Update

As part of the v2 migration, domain pricing was changed from a tiered model to a flat rate to make testnet experimentation easier.

### Old Pricing (Tiered)

| Domain Length | On-Chain Price | Off-Chain Price (shared pkg) |
|---------------|---------------|------------------------------|
| 1-2 chars     | $200 USDC     | $100 USDC                    |
| 3 chars       | $50 USDC      | $25 USDC                     |
| 4 chars       | $20 USDC      | $10 USDC                     |
| 5+ chars      | $5 USDC       | $5 USDC                      |

**Note**: There was a discrepancy between on-chain and off-chain prices for 1-4 character domains. The off-chain prices in `packages/shared/src/pricing.ts` were roughly half the on-chain prices. This has been resolved by moving to flat pricing.

### New Pricing (Flat)

All domains regardless of length: **$0.00001 USDC** (10 raw units, since USDC has 6 decimals).

- **On-chain**: `setPrices([10, 10, 10, 10])` called on registry
  - Tx: `0xcbc2a7d767ad4b07a1b9a1fbc2dc28c3601353b71edaed1525ed7ddfba8ca251`
- **Off-chain**: `packages/shared/src/pricing.ts` updated to return flat `10n` / "$0.00001 USDC"
- **Rationale**: Testnet USDC is scarce. Flat near-zero pricing lets users register as many domains as they want for testing.

## Ponder Indexer Schema Reset

During the migration, the Ponder indexer's PostgreSQL schemas (`ponder`, `ponder_sync`) had to be dropped and recreated.

- **Error**: `MigrationError: Schema "ponder" was previously used by a different Ponder app`
- **Cause**: The v1 indexer configuration locked the schemas. Changing contracts/start block constituted a "different app" from Ponder's perspective.
- **Fix**: Dropped both `ponder` and `ponder_sync` schemas in PostgreSQL, then restarted the indexer. It re-indexed from the v2 deploy block (32,041,752).

## End-to-End Verification

After migration, the full stack was verified:

1. **Domain registration**: `testclaw.claw` registered to deployer `0x41778a296556143172bC20B197bba71683E41377`
   - Tx: `0x472e8cd5ec87eac4a71a2368c3c983d9a61411ce204887d2f147a9c13d32d4ec`
2. **Ponder indexer**: Confirmed working -- returns the domain via GraphQL queries
3. **Web frontend**: Returns HTTP 200, domain data visible
4. **All Railway services**: Deployed and healthy
