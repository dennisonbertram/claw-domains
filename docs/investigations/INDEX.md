# Investigations Index

| File | Description |
|------|-------------|
| [arc-testnet-faucet.md](arc-testnet-faucet.md) | Arc testnet faucet investigation |
| [circle-chain-research.md](circle-chain-research.md) | Circle chain research investigation |
| [megaeth-research.md](megaeth-research.md) | MegaETH research investigation |
| [frontend-audit.md](frontend-audit.md) | Exhaustive audit of mock data, placeholder content, and missing on-chain wiring in the web frontend |
| [source-reference.md](source-reference.md) | Consolidated source code reference of all key web frontend files for implementation agents |
| [ponder-build-error.md](ponder-build-error.md) | Root cause analysis of ponder BuildError "Cannot convert undefined or null to object" -- config uses 0.10+ API with 0.9.28 runtime |
| [ponder-version-review.md](ponder-version-review.md) | API comparison of ponder 0.9.28 vs 0.16.4 — all code is already 0.16-compatible, only package.json version needs updating |
| [ponder-indexer-verification.md](ponder-indexer-verification.md) | Verification of ponder indexer deployment 7d5f2a5b — two blocking issues: RPC unreachable from Railway, duplicate graphql module. Domain "clawponder" registered on-chain but indexer can't sync. |
| [frontend-deployment-verification.md](frontend-deployment-verification.md) | Comprehensive verification of deployed frontend (2026-03-14) — 9/10 checks pass, Ponder GraphQL not wired to frontend yet |
| [usdc-permit-bundling.md](usdc-permit-bundling.md) | Research on USDC EIP-2612 permit support and Arc Testnet transaction bundling options for single-action domain registration |
| [arc-testnet-usdc-research.md](arc-testnet-usdc-research.md) | Deep on-chain verification of Arc Testnet USDC (0x3600...): FiatTokenV2 behind AdminUpgradeabilityProxy, EIP-2612 permit confirmed, EIP-3009 confirmed, Permit2 deployed, full contract not a precompile |

*Investigation docs are added as debugging sessions and deep dives are conducted.*
