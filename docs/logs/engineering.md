# Engineering Log

Chronological record of bugs found, fixes applied, and engineering decisions.

Format: `[YYYY-MM-DD] CATEGORY: Description`

Categories: BUG, FIX, DECISION, REFACTOR, REGRESSION, HOTFIX

---

<!-- New entries go at the top -->

[2026-03-15] DECISION: Deployed v2 contracts to Arc Testnet. Registry `0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3`, Resolver `0x3DD454c7b4FFe55469a5710A86fe86ab9f85c75e`. Deploy block 32,041,752. V1 contracts retired.

[2026-03-15] FIX: Resolved on-chain/off-chain pricing discrepancy. V1 had different prices in the contract vs shared package (e.g., 1-2 char domains were $200 on-chain but $100 off-chain). Moved to flat $0.00001 USDC pricing for all domain lengths on testnet. On-chain: `setPrices([10, 10, 10, 10])`. Off-chain: `packages/shared/src/pricing.ts` updated.

[2026-03-15] FIX: Ponder indexer schema conflict. Error: `MigrationError: Schema "ponder" was previously used by a different Ponder app`. Fixed by dropping `ponder` and `ponder_sync` schemas in Postgres, allowing fresh re-indexing from v2 deploy block.

[2026-03-15] DECISION: Added `/domains` explore page. Server component (`web/src/app/domains/page.tsx`) queries Ponder GraphQL. Client component (`DomainsClient.tsx`) renders table with Name, Owner, Registered, Expires columns. Nav updated with "Explore" link.

[2026-03-15] DECISION: Railway deployment configured for all services. Project "Claw domains" with four services: claw-web, ponder-indexer, faucet, Postgres. GitHub auto-deploy on push to main. Per-service Dockerfiles at repo root using `node:20-slim` base image.

[2026-03-15] FIX: Docker builds failing on Alpine due to native binary incompatibilities (lightningcss, @tailwindcss/oxide, @rollup). Switched from `node:20-alpine` to `node:20-slim` and added force-reinstall of native binaries in Dockerfiles.

[2026-03-15] DECISION: Frontend contract wiring consolidated through `@claw-domains/shared`. No hardcoded addresses in web frontend. `web/src/lib/contracts.ts`, `ponder.ts`, and `wagmi.ts` all re-export from shared package.

[2026-03-15] FIX: End-to-end verification completed. Test domain `testclaw.claw` registered (tx `0x472e8cd...`), confirmed visible in Ponder GraphQL and web frontend. All Railway services healthy.
