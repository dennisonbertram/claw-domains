# Investigation: Ponder BuildError "Cannot convert undefined or null to object"

**Date**: 2026-03-14
**Status**: Root cause identified, fix provided
**Severity**: Blocking (prevents deployment on Railway)

## Problem

The ponder indexer at `packages/ponder/` fails on Railway with:
```
BuildError: Cannot convert undefined or null to object
```

This error occurs during ponder's internal build step (not npm build) when running `ponder start`. It also fails identically in `ponder dev` mode, but the TUI masks the error -- it just shows "Waiting to start..." forever with "Resolve the error and save your changes to reload the server."

## Root Cause

**The `ponder.config.ts` uses ponder 0.10+ API syntax (`chains`, `id`, `chain`) but the installed version is ponder 0.9.28 which expects 0.9.x syntax (`networks`, `chainId`, `network`).**

### The Mismatch

Our config (`ponder.config.ts`):
```typescript
export default createConfig({
  chains: {            // WRONG for 0.9.x -- should be "networks"
    arcTestnet: {
      id: 5042002,     // WRONG for 0.9.x -- should be "chainId"
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    Registry: {
      abi: RegistryAbi,
      chain: "arcTestnet",   // WRONG for 0.9.x -- should be "network"
      address: "0x...",
      startBlock: 0,
    },
  },
});
```

What ponder 0.9.28 expects:
```typescript
export default createConfig({
  networks: {          // CORRECT for 0.9.x
    arcTestnet: {
      chainId: 5042002, // CORRECT for 0.9.x
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    Registry: {
      abi: RegistryAbi,
      network: "arcTestnet", // CORRECT for 0.9.x
      address: "0x...",
      startBlock: 0,
    },
  },
});
```

### Why It Throws

1. `createConfig()` is a pass-through function -- it returns the object as-is with no transformation.
2. The build step calls `buildConfigAndIndexingFunctions()` in `configAndIndexingFunctions.js`.
3. Line 65: `Object.entries(config.networks)` -- but `config.networks` is `undefined` (we passed `chains` instead).
4. `Object.entries(undefined)` throws: `TypeError: Cannot convert undefined or null to object`.
5. This is caught and re-thrown as `BuildError: Cannot convert undefined or null to object`.

### Verified via Source Code

- Type definitions at `node_modules/ponder/dist/types/config/index.d.ts` confirm `createConfig` expects `networks` (with `chainId` and `transport`), NOT `chains`.
- The internal build code at `node_modules/ponder/dist/esm/build/configAndIndexingFunctions.js:65` does `Object.entries(config.networks)`.

## Secondary Issue: onConflictDoUpdate API

In `src/index.ts`, there are two different patterns used for `onConflictDoUpdate`:

1. **Function pattern** (lines 24-26, 72-74): `.onConflictDoUpdate((row) => ({ domainCount: row.domainCount + 1 }))`
2. **Object pattern** (lines 97-100, 117-120): `.onConflictDoUpdate({ addr: ..., updatedAt: ... })`

Per ponder 0.9 documentation and examples, `onConflictDoUpdate` takes a plain object, not a function. The function pattern may work or may cause runtime errors during indexing.

## Fix

### Fix 1: ponder.config.ts (CRITICAL)

Change `chains` -> `networks`, `id` -> `chainId`, and `chain` -> `network`:

```typescript
import { createConfig } from "ponder";
import { http } from "viem";
import { RegistryAbi } from "./abis/Registry";
import { ResolverAbi } from "./abis/Resolver";

export default createConfig({
  networks: {
    arcTestnet: {
      chainId: 5042002,
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    Registry: {
      abi: RegistryAbi,
      network: "arcTestnet",
      address: "0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C",
      startBlock: 0,
    },
    Resolver: {
      abi: ResolverAbi,
      network: "arcTestnet",
      address: "0xDF4FaEc0390505f394172D87faa134872b2D54B4",
      startBlock: 0,
    },
  },
});
```

### Fix 2: src/index.ts (SECONDARY)

Change function-style `onConflictDoUpdate` to object-style. The function pattern `(row) => ({...})` is not supported in 0.9.x -- use plain objects instead.

For the `domainCount` increment pattern, use a raw SQL expression or restructure the logic to avoid needing row references in the conflict handler.

### Fix 3: Railway Environment Variables

Ensure Railway has these environment variables set:
- `PONDER_RPC_URL_1` - the RPC URL for Arc testnet
- `DATABASE_URL` - PostgreSQL connection string
- `DATABASE_SCHEMA` - Required for `ponder start` (e.g., `public` or a custom schema name)

## Reproduction

Local reproduction confirmed with:
```bash
cd packages/ponder
PONDER_RPC_URL_1=https://rpc.testnet.arc.network \
  DATABASE_URL=postgresql://localhost:5432/test \
  DATABASE_SCHEMA=public \
  npx ponder start
```

Output:
```
7:52:13 PM INFO  build      Using Postgres database localhost:5432/test (from DATABASE_URL env var)
7:52:13 PM ERROR build      Failed build
BuildError: Cannot convert undefined or null to object
```

## Alternative: Upgrade to Ponder 0.10+

Instead of fixing the config for 0.9.x, you could upgrade ponder to 0.10+ where the `chains`/`id`/`chain` syntax is the correct API. However, 0.10+ may have other breaking changes in the schema, handlers, or API layer that would need to be audited.
