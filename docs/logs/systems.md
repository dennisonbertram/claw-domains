# Systems Documentation

How the various systems in Claw Domains interact, and what you need to know when working on each one.

*Last updated: 2026-03-15*

## System Map

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  claw-web   │────▶│ponder-indexer│────▶│   Postgres    │
│  (Next.js)  │     │  (Ponder)    │     │  (Railway)    │
└──────┬──────┘     └──────┬───────┘     └──────────────┘
       │                   │
       │              ┌────▼────────────────────────┐
       └─────────────▶│  Arc Testnet (ID: 5042002)  │
                      │  Registry / Resolver / USDC  │
       ┌─────────────▶│                              │
       │              └─────────────────────────────┘
┌──────┴──────┐
│   faucet    │
│   (Hono)    │
└─────────────┘

┌─────────────┐
│  claw CLI   │──────▶ Arc Testnet (direct RPC)
│ (Commander) │
└─────────────┘

┌─────────────────────────┐
│  @claw-domains/shared   │
│  (ABIs, addresses,      │──── imported by web, CLI, ponder, faucet
│   pricing, chain config)│
└─────────────────────────┘
```

## Contracts (Solidity / Foundry)
- **Location**: `contracts/`
- **Framework**: Foundry
- **Chain**: Arc Testnet (Chain ID 5042002, RPC via Alchemy)
- **Active contracts (v2)**:
  - Registry: `0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3`
  - Resolver: `0x3DD454c7b4FFe55469a5710A86fe86ab9f85c75e`
  - USDC: `0x3600000000000000000000000000000000000000` (6 decimals)
- **Deploy block**: 32,041,752
- **Pricing**: Flat $0.00001 USDC (10 raw units) for all domain lengths
- **Interacts with**: Web frontend and CLI via viem, indexed by Ponder

## Shared Package
- **Location**: `packages/shared/`
- **Package name**: `@claw-domains/shared`
- **Exports**: ABIs, contract addresses, chain config (`arcTestnet`), `namehash`, pricing functions, Ponder client (`queryPonder`)
- **Imported by**: web, CLI, ponder, faucet
- **Key files**: `src/addresses.ts`, `src/pricing.ts`, `src/chains.ts`, `src/abis/`
- **Critical rule**: All contract addresses and chain config must live here. No hardcoding in consumers.

## Web Frontend
- **Location**: `web/`
- **Framework**: Next.js (App Router, React Server Components)
- **Dockerfile**: `Dockerfile.web` (node:20-slim, standalone output)
- **Deployed at**: https://claw-web-production.up.railway.app
- **Key routes**: `/` (home/search), `/domains` (explore all domains)
- **Key bridge files**:
  - `src/lib/contracts.ts` -- re-exports from shared (addresses, ABIs, pricing)
  - `src/lib/ponder.ts` -- re-exports `queryPonder` from shared
  - `src/lib/wagmi.ts` -- imports `arcTestnet` chain from shared
- **Interacts with**: Smart contracts via viem/wagmi, Ponder indexer via GraphQL
- **Env vars**: `NEXT_PUBLIC_PONDER_URL` (Ponder GraphQL endpoint)

## Ponder Indexer
- **Location**: `packages/ponder/`
- **Framework**: Ponder
- **Dockerfile**: `Dockerfile.ponder` (node:20-slim)
- **Deployed at**: https://ponder-indexer-production.up.railway.app
- **Database**: Railway-managed PostgreSQL (schemas: `ponder`, `ponder_sync`)
- **Indexes from**: Block 32,041,752 (v2 deploy block)
- **Interacts with**: Arc Testnet (reads events), Postgres (stores indexed data), web frontend (serves GraphQL)
- **Env vars**: `DATABASE_URL`, `ALCHEMY_API_KEY`
- **Gotcha**: Changing contracts or start block requires dropping Ponder schemas in Postgres before restarting

## CLI
- **Location**: `packages/cli/`
- **Package name**: `@claw-domains/cli`
- **Framework**: Commander.js
- **Commands**: `init`, `register`, `lookup`, `list`, `set-record`, `get-record`, `renew`, `balance`
- **Interacts with**: Arc Testnet directly via RPC (no Ponder dependency)

## Faucet
- **Location**: `packages/faucet/`
- **Package name**: `@claw-domains/faucet`
- **Framework**: Hono
- **Dockerfile**: `Dockerfile.faucet` (node:20-slim)
- **Deployed at**: https://faucet-production-69f7.up.railway.app
- **Endpoint**: `POST /fund` with rate limiting
- **Interacts with**: Arc Testnet (sends testnet USDC/ETH to requesting addresses)
- **Env vars**: `PRIVATE_KEY`, `ALCHEMY_API_KEY`

## Railway (Deployment)
- **Project**: "Claw domains" (ID: `886d63a3-15c7-4672-bc56-5924e7818d40`)
- **Services**: claw-web, ponder-indexer, faucet, Postgres
- **Deploy method**: GitHub auto-deploy on push to `main`
- **Config**: Per-service Dockerfile paths set via Railway GraphQL API (no `railway.json`)
- **All Dockerfiles**: Use `node:20-slim` base (not Alpine -- native binaries break on musl)

---

*When adding a new system or modifying interactions, update this document.*
