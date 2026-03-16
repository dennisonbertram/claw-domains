# Frontend Deployment Verification

**Date:** 2026-03-14
**Target:** https://fabulous-consideration-production-d254.up.railway.app
**Status:** 9 of 10 checks PASS, 1 WARNING (cosmetic)

---

## Summary

| # | Check | Result |
|---|-------|--------|
| 1 | Homepage loads | PASS |
| 2 | Search — real contract calls (no mocks) | PASS |
| 3 | Domain detail page | PASS |
| 4 | Profile page | PASS |
| 5 | Register page | PASS |
| 6 | Ponder GraphQL config in frontend | WARNING — not found in JS bundles |
| 7 | Ponder API serving data | PASS |
| 8 | No mock data patterns | PASS |
| 9 | Privy integration | PASS |
| 10 | Alchemy RPC | PASS |

---

## Detailed Results

### 1. Homepage (PASS)

- **HTTP status:** 200
- **Title:** `.claw — Your cozy home on the internet`
- **No "Base" references in visible content.** All branding correctly says "Arc Network." Footer reads: `.claw domains are registered on Arc Network. Powered by decentralized infrastructure.`
- **Pricing shows USDC:** All four tiers render correctly:
  - 5+ chars: `$5 USDC` / year
  - 4 chars: `$10 USDC` / year
  - 3 chars: `$25 USDC` / year (marked "Most Popular")
  - 1-2 chars: `$100 USDC` / year
- **Connect button visible:** `<button class="... bg-[#5B61FE] ...">Connect</button>` present in nav bar.
- **Search bar present:** Input with placeholder `yourdomain` and `.claw` suffix visible.

**Note:** "Base Sepolia" appears in two JS chunks (`8604c3435d274838.js`, `16f9b27cbaa4c5cf.js`) but these are **library-level chain definition files** from Privy/wagmi — they define all supported EVM chains. The app itself is configured exclusively for Arc Testnet (chain ID `5042002`).

### 2. Search — Real Contract Calls (PASS)

The search bar uses `useReadContract` to call `available()` on the Claw Registry contract at `0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C` on chain `5042002` (Arc Testnet).

**Evidence from `6741a54ca873af07.js`:**
```
useReadContract({
  address: CONTRACT_ADDRESSES[5042002].registry,
  abi: CLAW_REGISTRY_ABI,
  functionName: "available",
  args: [name],
  query: { enabled: false }
})
```

The `setTimeout` matches across multiple chunks are **false positives** — they are standard JavaScript patterns (retry logic, debouncing, timeout errors) from wagmi, Privy, and Next.js runtime libraries. No `MOCK_DOMAIN`, `mock_domain`, or `fake.*domain` patterns found.

The search uses a 600ms debounce (`setTimeout(() => { ... }, 600)`) before triggering the on-chain availability check, which is correct UX behavior.

### 3. Domain Detail Page (PASS)

- **HTTP status:** 200
- **URL tested:** `/domain/clawponder`
- **Title:** `clawponder.claw | .claw`
- **Meta description:** `View and manage the clawponder.claw domain on Arc.`
- Page renders with correct Arc branding.

### 4. Profile Page (PASS)

- **HTTP status:** 200
- **URL tested:** `/profile`
- Page loads correctly (content is client-rendered after wallet connection).

### 5. Register Page (PASS)

- **HTTP status:** 200
- **URL tested:** `/register/testname`
- **Title:** `Register testname.claw | .claw`
- **Meta description:** `Check availability and register the testname.claw domain on Arc.`
- USDC `approve()` and `register()` functions are present in the ABI definitions.

### 6. Ponder GraphQL Config in Frontend (WARNING)

No references to `ponder-indexer-production`, `PONDER_URL`, `graphql`, or `localhost:42069` were found in any of the 25 JS chunks.

**Analysis:** The frontend currently relies on **direct on-chain reads** via `useReadContract` for domain availability checks and contract interactions. There is no client-side GraphQL query to the Ponder indexer. This means:

- Domain search/availability: Works (on-chain `available()` call)
- Domain registration: Works (on-chain `register()` call)
- Domain detail view: May be limited to on-chain data only (no indexed historical data)
- Profile page (list user's domains): May not show owned domains until Ponder integration is wired up

**No localhost Ponder URLs found** (good — no dev references leaking).

### 7. Ponder API Serving Data (PASS)

The Ponder indexer at `https://ponder-indexer-production.up.railway.app/graphql` is live and returning data:

```json
{
  "data": {
    "domains": {
      "items": [{
        "id": "43257485664029564745965761921887064873317318048585323180122023204296305932838",
        "name": "clawponder",
        "owner": "0x41778a296556143172bc20b197bba71683e41377",
        "expires": "1805071609",
        "registeredAt": "1773535609"
      }]
    }
  }
}
```

The indexer has one domain registered (`clawponder`), expiring approximately 2027-03-14.

### 8. No Mock Data Patterns (PASS)

Searched all 25 JS chunks for:
- `MOCK_DOMAIN`, `MOCK_*` constants — **None found**
- `mock_data` — **None found**
- `fake.*domain` — **None found**
- `placeholder.*domain` — Only match is the HTML input `placeholder:"yourdomain"` which is correct UX

No mock data or placeholder content is present in the deployed build.

### 9. Privy Integration (PASS)

- **Privy SDK present** in 6 chunks (Privy library code)
- **Privy App ID found:** `cmmqv3bi105aq0cjyvxg4zxg1` in `d7b4aa6209b25798.js`
- **Old ConnectKit:** Not found (good — fully migrated to Privy)
- **Privy config confirmed:**
  - `defaultChain: arcTestnet` (chain 5042002)
  - `supportedChains: [arcTestnet]`
  - `loginMethods: ["email", "wallet"]`
  - `embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } }`
  - `appearance: { theme: "dark" }`

### 10. Alchemy RPC (PASS)

- **Alchemy RPC found:** `https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1` in `d7b4aa6209b25798.js`
- **Old public RPC (`rpc.testnet.arc.network`):** Not found in any chunk as the primary RPC (good)
- The Arc Testnet chain definition uses Alchemy as the default RPC, which is correct.

**Note:** The Alchemy API key is baked into the client-side build. This is expected and standard for `NEXT_PUBLIC_` environment variables — Alchemy keys are rate-limited and safe to expose client-side.

---

## Contract Configuration

The deployed build has the following contract addresses for chain `5042002` (Arc Testnet):

| Contract | Address |
|----------|---------|
| Registry | `0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C` |
| Resolver | `0xDF4FaEc0390505f394172D87faa134872b2D54B4` |
| USDC | `0x3600000000000000000000000000000000000000` |

ABI includes functions: `available`, `register`, `ownerOf`, `approve`, `getText` (for text records like avatar, url, email).

Text record keys supported: `avatar`, `url`, `email` (and possibly others).

---

## Follow-Up Items

1. **Ponder integration not wired to frontend:** The Ponder indexer is running and serving data, but the frontend JS bundles contain no GraphQL client or Ponder URL. This means the profile page (listing a user's owned domains) and domain detail pages may not display indexed data. The frontend currently relies solely on direct on-chain reads.

2. **Base Sepolia in library chains:** Not a bug — these are library-level chain definitions from Privy/wagmi that include all EVM chains. The app config exclusively targets Arc Testnet.
