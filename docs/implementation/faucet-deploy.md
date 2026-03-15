# Faucet Deployment to Railway

## Date
2026-03-15

## Overview
Deployed the `@claw-domains/faucet` package to Railway as a service under the "ai-domain-registrar" project.

## Deployment Details

| Item | Value |
|------|-------|
| Railway Project | ai-domain-registrar |
| Service Name | faucet |
| Public URL | https://faucet-production-0024.up.railway.app |
| Faucet Address | 0x41778a296556143172bC20B197bba71683E41377 |
| Build Method | Dockerfile (`Dockerfile.faucet`) |
| Runtime | Node.js 22 (node:22-slim) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `FAUCET_PRIVATE_KEY` | Deployer wallet private key (same as repo `.env` PRIVATE_KEY) |
| `PORT` | Auto-injected by Railway |

## API Endpoints

### GET /
Health check. Returns faucet address and USDC balance.
```json
{"status":"ok","faucetAddress":"0x41778a296556143172bC20B197bba71683E41377","balances":{"usdc":"14.890453"}}
```

### POST /fund
Send 0.01 USDC to a given address on Arc Testnet. Rate limited to once per address per 24 hours.

**Request:**
```json
{"address": "0x..."}
```

**Success Response:**
```json
{"success":true,"txHash":"0x...","amount":"0.01","token":"USDC"}
```

**Rate Limited Response (429):**
```json
{"success":false,"error":"Rate limited. Try again in 24 hours."}
```

## Build Configuration

The deployment uses a custom Dockerfile (`Dockerfile.faucet`) at the repo root, referenced via `railway.json`:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "dockerfilePath": "Dockerfile.faucet"
  }
}
```

The Dockerfile:
1. Uses `node:22-slim` base image
2. Installs only `packages/shared` and `packages/faucet` workspace dependencies
3. Builds `@claw-domains/shared` first, then `@claw-domains/faucet`
4. Runs `node packages/faucet/dist/index.js` as the start command

This approach was chosen over Railpack because Railpack had trouble with the npm workspaces setup (it detected pnpm as the package manager due to a stale `pnpm-lock.yaml`).

## Files Created/Modified

| File | Purpose |
|------|---------|
| `Dockerfile.faucet` | Docker build config for the faucet service |
| `railway.json` | Railway config-as-code pointing to the Dockerfile |
| `.dockerignore` | Excludes unnecessary files from Docker build context |

## Verification Results

All tests passed on 2026-03-15:

1. **Health check (GET /)**: Returns 200 with faucet address and USDC balance
2. **Fund endpoint (POST /fund)**: Successfully sent 0.01 USDC, returned tx hash `0x0606a3e449d3503ce8189138935c272182082c0cb8f7936de5723bba8d1bf4f1`
3. **Rate limiting**: Second request to same address returns 429 with rate limit message
4. **Balance verification**: USDC balance decreased from 14.901539 to 14.890453 after funding

## Notes

- The `railway.json` file applies to whichever service is currently linked. If deploying other services from this repo, either remove/rename the file or switch to service-specific Dockerfiles.
- The faucet uses the same private key as the deployer wallet from the `.env` file.
- Rate limiting is in-memory (resets on service restart). For MVP this is acceptable.
- The faucet sends 0.01 USDC (1 cent) per request on Arc Testnet (chain ID 5042002).
