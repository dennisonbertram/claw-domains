# Ponder Indexer Verification

**Date**: 2026-03-14
**Deployment ID**: `7d5f2a5b-697b-49a8-a09d-7d43ba93cd59`
**Status**: FAILED — two blocking issues found

---

## Summary

The ponder indexer deployment (7d5f2a5b) has **two blocking issues** preventing it from functioning:

1. **RPC Unreachable from Railway**: The Arc testnet RPC (`rpc.testnet.arc.network`) consistently times out from Railway's servers. The RPC works fine from a local machine.
2. **Duplicate GraphQL Module**: Two conflicting versions of the `graphql` npm package are installed, breaking the GraphQL API endpoint entirely.

---

## Issue 1: Arc Testnet RPC Unreachable from Railway

### Symptoms
- Ponder fails to start with: `RetryableError: Failed to connect to JSON-RPC`
- Every `eth_chainId` request to `https://rpc.testnet.arc.network` times out after 10s
- Retry count reaches 10 with exponential backoff before ponder gives up
- Railway keeps restarting the process (crash loop), deployment stays in `DEPLOYING` state indefinitely

### Evidence
```
[ERROR] Build failed (stage=diagnostic)
RetryableError: Failed to connect to JSON-RPC

[WARN] Received JSON-RPC error
  chain=arcTestnet hostname=rpc.testnet.arc.network
  method=eth_chainId retry_count=10
  TimeoutError: The request took too long to respond.
```

### Local RPC Test (works)
```bash
curl -s -X POST https://rpc.testnet.arc.network \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Returns: {"jsonrpc":"2.0","id":1,"result":"0x4cef52"}
```

### Root Cause
The Arc testnet RPC is likely blocking or rate-limiting requests from cloud provider IP ranges (Railway runs on GCP/AWS). This is common with public testnets.

### Fix Options
1. **Use a third-party RPC provider** that supports Arc testnet (Alchemy, QuickNode, etc.)
2. **Set up an RPC proxy** on a non-cloud IP that Railway can connect to
3. **Contact Arc team** to whitelist Railway's IP range

---

## Issue 2: Duplicate GraphQL Module

### Symptoms
GraphQL API returns error on every query:
```
Cannot use GraphQLSchema from another module or realm.
Ensure that there is only one instance of "graphql" in the node_modules directory.
```

### Root Cause
Two conflicting versions of `graphql` are installed:
- `node_modules/graphql` → **v16.13.1** (top-level, installed by hono or another dep)
- `node_modules/ponder/node_modules/graphql` → **v16.8.2** (bundled with ponder)

When ponder creates a GraphQL schema using its bundled v16.8.2, and the API handler tries to use it with the top-level v16.13.1, the instanceof checks fail.

### Fix
Add a `resolutions` field (for yarn) or `overrides` field (for npm) in `package.json`:

```json
{
  "overrides": {
    "graphql": "16.8.2"
  }
}
```

Or with yarn:
```json
{
  "resolutions": {
    "graphql": "16.8.2"
  }
}
```

Then delete `node_modules` and reinstall.

---

## Domain Registration (Successful)

Despite the indexer issues, the on-chain domain registration was completed successfully from a local machine:

| Step | Result |
|------|--------|
| USDC Balance | 19,905,992 (19.9 USDC) |
| Domain availability (`clawponder`) | Available = true |
| USDC Approval (5 USDC) | TX: `0x653d7195...` — SUCCESS |
| Domain Registration | TX: `0x7546cb56ad13130a329091bfba4c629dbbf2bb2985aab9d65bd9c2add8b8cbab` — SUCCESS |
| Post-registration availability check | Available = false (confirmed) |
| Block number | 31,901,548 |
| Owner | `0x41778a296556143172bC20B197bba71683E41377` |

### Registration Details
- **Domain**: `clawponder`
- **Token ID**: `0x5fa2de86e206a995a3adb23b23af3ad452f6ecbb2b1c3f59a41f4f95d7bbfa26`
- **Contract**: `0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C`
- **Chain**: Arc Testnet (chain ID 5042002)

### Indexer Pickup
**NOT verified** — the indexer cannot sync because the RPC is unreachable from Railway. Once both issues above are fixed, the indexer should pick up this domain from the `DomainRegistered` event at block 31,901,548.

---

## Ponder Configuration

- **RPC URL env var**: `PONDER_RPC_URL_1` = `https://rpc.testnet.arc.network`
- **Start block**: 31,874,007
- **Registry contract**: `0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C`
- **Resolver contract**: `0xDF4FaEc0390505f394172D87faa134872b2D54B4`

---

## Next Steps

1. **Fix GraphQL duplicate module**: Add `overrides` or `resolutions` for `graphql` package in `packages/ponder/package.json`
2. **Fix RPC connectivity**: Either find an Arc testnet RPC provider that works from cloud IPs, or set up a proxy
3. **Redeploy** after both fixes
4. **Verify indexer** picks up the `clawponder` domain registration at block 31,901,548
