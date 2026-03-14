# Plan: Wire Up All Frontend Mock Data + Build Ponder Indexer

## Goal
Replace every piece of mock/placeholder data in the frontend with real on-chain data. Build and deploy a Ponder indexer. Deploy everything to Railway. When done, zero mocked data remains.

## Architecture

```
[Arc Testnet] → [Ponder Indexer] → [PostgreSQL] → [GraphQL API]
                                                        ↓
[Arc Testnet] ← [Web Frontend (wagmi)] ←──────── [GraphQL queries]
```

Frontend reads directly from chain for single-item lookups (availability, domain details, records).
Frontend queries Ponder GraphQL for list views (my domains, recent registrations).

---

## Wave 1: Foundation (parallel, no dependencies)

### Agent 1A: contracts.ts + Quick Fixes
**Issues**: #6, #7, #8, #13
- [x] Add USDC ERC-20 ABI (approve, allowance, balanceOf) to contracts.ts
- [x] Fix PricingSection.tsx — replace ETH prices with correct USDC prices from getPriceDisplay()
- [x] Fix metadata "on Base" → "on Arc" in register/page.tsx and domain/page.tsx
- [x] Remove unused DomainSearchBar.tsx
- [x] Fix RPC URL in wagmi.ts (rpc-testnet → rpc.testnet) — already done

### Agent 1B: Build Ponder Indexer Package
**Issues**: #11
- [x] Create packages/ponder/ directory structure
- [x] ponder.config.ts — Registry + Resolver contracts on Arc Testnet
- [x] ponder.schema.ts — domain, transfer, textRecord, addrRecord, account tables
- [x] src/index.ts — Event handlers for DomainRegistered, DomainRenewed, Transfer, AddrChanged, TextChanged
- [x] src/api/index.ts — GraphQL API setup
- [x] ABI files from contracts
- [x] package.json, tsconfig.json, .env.local.example

---

## Wave 2: On-Chain Reads (parallel, depends on Wave 1A for USDC ABI)

### Agent 2A: SearchBar + Registration Flow
**Issues**: #1, #2, #9, #14
- [x] SearchBar.tsx — Replace setTimeout mock with useReadContract for registry.available()
- [x] RegisterClient.tsx — Full registration flow:
  1. Check availability on-chain
  2. Check USDC balance
  3. USDC approve tx
  4. registry.register() tx
  5. Real tx tracking with useWaitForTransactionReceipt
- [x] Wire TxStatus to real tx hashes
- [x] Show USDC balance before registration

### Agent 2B: Domain Detail Page
**Issues**: #4, #5, #10
- [x] DomainClient.tsx — Replace MOCK_DOMAIN with on-chain reads:
  - registry.ownerOf(tokenId) for owner
  - registry.nameExpires(tokenId) for expiry
  - resolver.addr(node) for ETH address
  - resolver.text(node, key) for each text record
- [x] Record editing — useWriteContract for resolver.setAddr() and resolver.setText()
- [x] Ownership gating — only show edit button to domain owner
- [x] Fix renew button — call registry.renew() instead of linking to register page

---

## Wave 3: Indexer Integration (depends on Wave 1B for Ponder)

### Agent 3A: Profile Page + Recent Registrations
**Issues**: #3, #12
- [x] ProfileClient.tsx — Query Ponder GraphQL for user's domains instead of MOCK_DOMAINS
- [x] Wire up RecentRegistrations component with Ponder data
- [x] Add RecentRegistrations to homepage if desired

---

## Wave 4: Deploy (depends on all above)

### Agent 4A: Deploy Everything to Railway
- [x] Deploy Ponder indexer as separate Railway service with PostgreSQL
- [x] Set PONDER_RPC_URL_1 env var
- [x] Configure healthcheck path /ready, timeout 3600s
- [x] Start command: pnpm start --schema $RAILWAY_DEPLOYMENT_ID
- [x] Redeploy web frontend with Ponder GraphQL URL env var
- [x] Verify all pages work with real data

---

## Verification Checklist
- [ ] SearchBar checks real availability on-chain
- [ ] Registration flow sends real USDC approve + register txs
- [ ] Domain detail shows real owner, expiry, records from chain
- [ ] Record editing sends real resolver transactions
- [ ] Profile page shows real domains from Ponder indexer
- [ ] PricingSection shows correct USDC prices
- [ ] No "Base" references remain (all "Arc")
- [ ] TxStatus tracks real transaction confirmations
- [ ] Ponder indexer is live on Railway
- [ ] Web frontend is live on Railway
- [ ] npm test passes
- [ ] npm run build passes
