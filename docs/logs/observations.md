# Observations Log

Patterns noticed, potential issues, and things worth watching.

Format: `[YYYY-MM-DD] Description — Impact/Priority`

---

<!-- New entries go at the top -->

[2026-03-15] On-chain and off-chain domain pricing were out of sync in v1. On-chain prices (set via `setPrices`) were roughly 2x the prices in `packages/shared/src/pricing.ts` for 1-4 character domains. This would have caused the frontend to show users a lower price than what the contract actually charged, leading to failed transactions. Resolved by moving to flat pricing, but worth watching for if tiered pricing is ever reintroduced. — High priority / resolved.

[2026-03-15] Ponder treats a configuration change (different contracts, different start block) as a "different app" and refuses to reuse existing schemas. This means any contract redeployment requires dropping Ponder's Postgres schemas (`ponder`, `ponder_sync`) before restarting the indexer. Worth automating or documenting as a runbook step for future migrations. — Medium priority / noted.

[2026-03-15] Alpine-based Docker images (`node:20-alpine`) break with native Node.js binaries that expect glibc (lightningcss, @tailwindcss/oxide, @rollup). This is a recurring pattern in the Node.js ecosystem. Using `node:20-slim` (Debian-based) avoids the issue. Keep this in mind if any new native dependencies are added. — Low priority / ongoing.
