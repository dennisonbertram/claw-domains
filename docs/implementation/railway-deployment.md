# Railway Deployment Setup (2026-03-15)

## Summary

The Claw Domains stack is deployed on Railway as four services under a single project. Deploys are triggered automatically by pushing to `main` on GitHub.

## Project Details

| Field | Value |
|-------|-------|
| Project Name | Claw domains |
| Project ID | `886d63a3-15c7-4672-bc56-5924e7818d40` |
| Deploy Trigger | GitHub auto-deploy (push to `main`) |
| Config Method | Per-service Dockerfile paths via Railway GraphQL API (no `railway.json`) |

## Services

| Service | Dockerfile | URL |
|---------|-----------|-----|
| claw-web | `Dockerfile.web` | https://claw-web-production.up.railway.app |
| ponder-indexer | `Dockerfile.ponder` | https://ponder-indexer-production.up.railway.app |
| faucet | `Dockerfile.faucet` | https://faucet-production-69f7.up.railway.app |
| Postgres | Railway managed | Internal only |

## Docker Configuration

All Dockerfiles use `node:20-slim` as the base image. Alpine (`node:20-alpine`) was rejected because native binary dependencies (lightningcss, @tailwindcss/oxide, @rollup) fail to build on musl libc.

### Key Docker Fixes Applied

1. **Native binary reinstall**: Dockerfiles force-reinstall native binaries (`lightningcss`, `@tailwindcss/oxide`, `@rollup/rollup-linux-x64-gnu`) inside the container to get the correct platform binaries
2. **Next.js standalone + monorepo**: The web Dockerfile uses Next.js `output: 'standalone'` mode, which requires careful path handling in a monorepo context (copying `node_modules`, setting correct working directory)
3. **Base image**: `node:20-slim` chosen over Alpine for glibc compatibility with native modules

## Environment Variables

### claw-web
- `NEXT_PUBLIC_PONDER_URL` -- Ponder indexer URL (set to ponder-indexer Railway URL)
- Standard Next.js vars

### ponder-indexer
- `DATABASE_URL` -- PostgreSQL connection string (Railway Postgres internal URL)
- `ALCHEMY_API_KEY` -- RPC access for Arc Testnet

### faucet
- `PRIVATE_KEY` -- Funder wallet private key
- `ALCHEMY_API_KEY` -- RPC access for Arc Testnet

## Deployment Workflow

1. Commit changes to `main` branch
2. Push to GitHub
3. Railway detects the push and builds all services in parallel
4. Each service builds from its respective Dockerfile at the repo root
5. Services deploy and health checks confirm availability

### Manual Deploy (if webhook fails)

```bash
railway up
# or
git commit --allow-empty -m "trigger deploy" && git push
```

## Architecture Diagram

```
                    GitHub (main branch)
                           │
                    Railway Auto-Deploy
                    ┌──────┼──────────────┐
                    │      │              │
              ┌─────▼──┐ ┌▼───────────┐ ┌▼───────┐
              │claw-web │ │ponder-indexer│ │ faucet │
              │(Next.js)│ │ (Ponder)    │ │ (Hono) │
              └────┬────┘ └──────┬──────┘ └───┬────┘
                   │             │             │
                   │        ┌────▼────┐        │
                   │        │Postgres │        │
                   │        └─────────┘        │
                   │                           │
              ┌────▼───────────────────────────▼────┐
              │       Arc Testnet (Chain 5042002)    │
              │   Registry / Resolver / USDC         │
              └─────────────────────────────────────┘
```

## Frontend Contract Wiring

The web frontend has no hardcoded contract addresses. Everything flows through the shared package:

| Frontend File | Re-exports From | Content |
|---------------|----------------|---------|
| `web/src/lib/contracts.ts` | `@claw-domains/shared` | Addresses, ABIs, pricing, validation |
| `web/src/lib/ponder.ts` | `@claw-domains/shared` | `queryPonder` function |
| `web/src/lib/wagmi.ts` | `@claw-domains/shared` | `arcTestnet` chain definition |

Production Ponder URL is set via `web/.env.production`:
```
NEXT_PUBLIC_PONDER_URL=https://ponder-indexer-production.up.railway.app
```
