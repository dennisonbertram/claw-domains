# Ponder Indexer Research for Claw Domains

**Date:** 2026-03-14
**Purpose:** Evaluate and document how to build a Ponder indexer for the Claw Domains project, indexing domain registration, ownership, and resolver events on Arc Testnet.

---

## Table of Contents

1. [What is Ponder](#1-what-is-ponder)
2. [Project Setup](#2-project-setup)
3. [Project Structure](#3-project-structure)
4. [Configuration (ponder.config.ts)](#4-configuration-ponderconfigts)
5. [Schema Definition (ponder.schema.ts)](#5-schema-definition-ponderschemats)
6. [Event Handlers (src/index.ts)](#6-event-handlers-srcindexts)
7. [GraphQL API (src/api/index.ts)](#7-graphql-api-srcapiindexts)
8. [Custom Chain Configuration (Arc Testnet)](#8-custom-chain-configuration-arc-testnet)
9. [Deployment to Railway](#9-deployment-to-railway)
10. [Gotchas and Considerations](#10-gotchas-and-considerations)
11. [Claw Domains Implementation Plan](#11-claw-domains-implementation-plan)
12. [Sources](#12-sources)

---

## 1. What is Ponder

Ponder is an open-source TypeScript framework for building blockchain application backends. It:

- Fetches and decodes event logs from EVM-compatible chains
- Runs user-defined TypeScript indexing functions to transform raw events into custom data models
- Stores indexed data in PostgreSQL (production) or PGlite (development)
- Auto-generates a GraphQL API from your schema
- Supports hot-reloading in development
- Handles reorgs, RPC failures, and backfill automatically

It is essentially a modern, TypeScript-first alternative to The Graph's subgraph approach, but self-hosted and much simpler to develop with.

---

## 2. Project Setup

### Create a new Ponder project

```bash
pnpm create ponder
```

This scaffolds a new project with all the necessary files. For our use case (adding to an existing monorepo), we would create it as a package:

```bash
# From the claw-domains root
mkdir -p packages/ponder
cd packages/ponder
pnpm create ponder
```

Or manually initialize:

```bash
mkdir -p packages/ponder
cd packages/ponder
pnpm init
pnpm add ponder viem hono
pnpm add -D typescript @types/node
```

### package.json scripts

```json
{
  "name": "@claw-domains/indexer",
  "private": true,
  "scripts": {
    "dev": "ponder dev",
    "start": "ponder start",
    "codegen": "ponder codegen"
  },
  "dependencies": {
    "ponder": "^0.10",
    "viem": "^2.0",
    "hono": "^4.0"
  },
  "devDependencies": {
    "typescript": "^5.0",
    "@types/node": "^20.0"
  }
}
```

---

## 3. Project Structure

```
packages/ponder/
├── ponder.config.ts          # Chain + contract configuration
├── ponder.schema.ts          # Database schema (tables, relations, indexes)
├── src/
│   ├── index.ts              # Event handlers (indexing functions)
│   └── api/
│       └── index.ts          # GraphQL API + custom endpoints
├── abis/
│   ├── Registry.ts           # Registry contract ABI
│   └── Resolver.ts           # Resolver contract ABI
├── .env.local                # Local environment variables
├── tsconfig.json
└── package.json
```

---

## 4. Configuration (ponder.config.ts)

The config file defines chains, contracts, and database settings. Here is the full config for Claw Domains:

```typescript
import { createConfig } from "ponder";
import { RegistryAbi } from "./abis/Registry";
import { ResolverAbi } from "./abis/Resolver";

export default createConfig({
  chains: {
    arcTestnet: {
      id: 5042002,
      rpc: process.env.PONDER_RPC_URL_ARC_TESTNET,
    },
  },
  contracts: {
    Registry: {
      abi: RegistryAbi,
      chain: "arcTestnet",
      address: "0x0fdC78e7a68B8c5197895bf92C0058d47f2cc33C",
      startBlock: 0, // Replace with actual deployment block for efficiency
    },
    Resolver: {
      abi: ResolverAbi,
      chain: "arcTestnet",
      address: "0xDF4FaEc0390505f394172D87faa134872b2D54B4",
      startBlock: 0, // Replace with actual deployment block for efficiency
    },
  },
});
```

### Key configuration options

| Option | Description |
|--------|-------------|
| `chains.{name}.id` | Chain ID (5042002 for Arc Testnet) |
| `chains.{name}.rpc` | HTTP RPC URL (env var recommended) |
| `chains.{name}.ws` | Optional WebSocket URL for faster sync |
| `contracts.{name}.abi` | TypeScript ABI with `as const` |
| `contracts.{name}.chain` | Which chain this contract is on |
| `contracts.{name}.address` | Contract address (single, array, or factory) |
| `contracts.{name}.startBlock` | Block to start indexing from (use deployment block!) |
| `contracts.{name}.endBlock` | Optional block to stop indexing |
| `contracts.{name}.filter` | Optional event/argument filtering |
| `contracts.{name}.includeCallTraces` | Enable call trace indexing |
| `contracts.{name}.includeTransactionReceipts` | Include tx receipts in event data |

### Database configuration

Ponder auto-selects the database:
- If `DATABASE_URL` env var is set, it uses PostgreSQL
- Otherwise, it uses PGlite (local file-based, great for development)

Explicit configuration:

```typescript
export default createConfig({
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL,
    poolConfig: { max: 30 },
  },
  // ... chains, contracts
});
```

---

## 5. Schema Definition (ponder.schema.ts)

The schema uses `onchainTable` from Ponder (built on Drizzle ORM). Available column types:

| Type | Use case |
|------|----------|
| `t.text()` | Strings (names, keys) |
| `t.hex()` | EVM addresses, bytes32, hex values |
| `t.bigint()` | uint256, int256 values |
| `t.integer()` | Small integers |
| `t.boolean()` | Boolean flags |
| `t.real()` / `t.doublePrecision()` | Floating point |

### Full schema for Claw Domains

```typescript
import { onchainTable, relations, index } from "ponder";

// ─── Domain registrations ────────────────────────────────────
export const domain = onchainTable(
  "domain",
  (t) => ({
    id: t.bigint().primaryKey(),          // tokenId
    name: t.text().notNull(),
    owner: t.hex().notNull(),             // current owner address
    registrant: t.hex().notNull(),        // original registrant
    expires: t.bigint().notNull(),        // expiry timestamp
    registeredAt: t.bigint().notNull(),   // block timestamp of registration
    renewedAt: t.bigint(),                // last renewal timestamp
    resolverAddress: t.hex(),             // address of the resolver contract
  }),
  (table) => ({
    ownerIdx: index().on(table.owner),
    nameIdx: index().on(table.name),
  }),
);

// ─── Transfer history ────────────────────────────────────────
export const transfer = onchainTable(
  "transfer",
  (t) => ({
    id: t.text().primaryKey(),            // txHash-logIndex
    tokenId: t.bigint().notNull(),
    from: t.hex().notNull(),
    to: t.hex().notNull(),
    timestamp: t.bigint().notNull(),
    blockNumber: t.bigint().notNull(),
    transactionHash: t.hex().notNull(),
  }),
  (table) => ({
    tokenIdIdx: index().on(table.tokenId),
    fromIdx: index().on(table.from),
    toIdx: index().on(table.to),
  }),
);

// ─── Resolver records (addresses) ───────────────────────────
export const addrRecord = onchainTable(
  "addr_record",
  (t) => ({
    node: t.hex().primaryKey(),           // namehash (bytes32)
    addr: t.hex().notNull(),              // resolved address
    updatedAt: t.bigint().notNull(),
  }),
);

// ─── Resolver records (text) ─────────────────────────────────
export const textRecord = onchainTable(
  "text_record",
  (t) => ({
    id: t.text().primaryKey(),            // node-key composite
    node: t.hex().notNull(),              // namehash (bytes32)
    key: t.text().notNull(),              // e.g. "avatar", "url", "description"
    value: t.text().notNull(),
    updatedAt: t.bigint().notNull(),
  }),
  (table) => ({
    nodeIdx: index().on(table.node),
    keyIdx: index().on(table.key),
  }),
);

// ─── Account aggregate ──────────────────────────────────────
export const account = onchainTable(
  "account",
  (t) => ({
    address: t.hex().primaryKey(),
    domainCount: t.integer().notNull().default(0),
  }),
);

// ─── Relations ───────────────────────────────────────────────
export const domainRelations = relations(domain, ({ many }) => ({
  transfers: many(transfer),
  textRecords: many(textRecord),
}));

export const transferRelations = relations(transfer, ({ one }) => ({
  domain: one(domain, { fields: [transfer.tokenId], references: [domain.id] }),
}));

export const textRecordRelations = relations(textRecord, ({ one }) => ({
  domain: one(domain, { fields: [textRecord.node], references: [domain.id] }),
}));
```

### Schema design notes

- **`domain` table**: Tracks the current state of each domain. Updated on register, transfer, renew.
- **`transfer` table**: Append-only history of all ERC-721 transfers.
- **`addrRecord` / `textRecord` tables**: Resolver data, updated on `AddrChanged` / `TextChanged`.
- **`account` table**: Aggregates domain count per owner address.
- **Indexes**: Added on frequently-queried columns (owner, name, node) for GraphQL performance.

---

## 6. Event Handlers (src/index.ts)

Event handlers are registered with `ponder.on("ContractName:EventName", handler)`. The handler receives `event` (decoded args + block/tx data) and `context` (database + chain info + contract read client).

### Full event handlers for Claw Domains

```typescript
import { ponder } from "ponder:registry";
import {
  domain,
  transfer,
  addrRecord,
  textRecord,
  account,
} from "ponder:schema";

// ─── DomainRegistered ────────────────────────────────────────
ponder.on("Registry:DomainRegistered", async ({ event, context }) => {
  const { tokenId, name, owner, expires } = event.args;

  // Create or update the domain record
  await context.db
    .insert(domain)
    .values({
      id: tokenId,
      name,
      owner,
      registrant: owner,
      expires,
      registeredAt: event.block.timestamp,
      renewedAt: null,
      resolverAddress: null,
    })
    .onConflictDoUpdate({
      name,
      owner,
      registrant: owner,
      expires,
      registeredAt: event.block.timestamp,
    });

  // Update account domain count
  await context.db
    .insert(account)
    .values({
      address: owner,
      domainCount: 1,
    })
    .onConflictDoUpdate((row) => ({
      domainCount: row.domainCount + 1,
    }));
});

// ─── DomainRenewed ───────────────────────────────────────────
ponder.on("Registry:DomainRenewed", async ({ event, context }) => {
  const { tokenId, newExpiry } = event.args;

  await context.db.update(domain, { id: tokenId }).set({
    expires: newExpiry,
    renewedAt: event.block.timestamp,
  });
});

// ─── Transfer (ERC-721) ─────────────────────────────────────
ponder.on("Registry:Transfer", async ({ event, context }) => {
  const { from, to, tokenId } = event.args;
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  // Record transfer history
  await context.db.insert(transfer).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    tokenId,
    from,
    to,
    timestamp: event.block.timestamp,
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
  });

  // Update domain owner (skip mint transfers handled by DomainRegistered)
  if (from !== zeroAddress) {
    await context.db.update(domain, { id: tokenId }).set({
      owner: to,
    });

    // Decrement sender's domain count
    const senderAccount = await context.db.find(account, { address: from });
    if (senderAccount) {
      await context.db.update(account, { address: from }).set({
        domainCount: senderAccount.domainCount - 1,
      });
    }

    // Increment receiver's domain count
    await context.db
      .insert(account)
      .values({
        address: to,
        domainCount: 1,
      })
      .onConflictDoUpdate((row) => ({
        domainCount: row.domainCount + 1,
      }));
  }
});

// ─── AddrChanged (Resolver) ─────────────────────────────────
ponder.on("Resolver:AddrChanged", async ({ event, context }) => {
  const { node, addr } = event.args;

  await context.db
    .insert(addrRecord)
    .values({
      node,
      addr,
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      addr,
      updatedAt: event.block.timestamp,
    });
});

// ─── TextChanged (Resolver) ─────────────────────────────────
ponder.on("Resolver:TextChanged", async ({ event, context }) => {
  const { node, key, value } = event.args;

  await context.db
    .insert(textRecord)
    .values({
      id: `${node}-${key}`,
      node,
      key,
      value,
      updatedAt: event.block.timestamp,
    })
    .onConflictDoUpdate({
      value,
      updatedAt: event.block.timestamp,
    });
});
```

### Key patterns in event handlers

1. **Upsert pattern**: Use `.insert().values().onConflictDoUpdate()` when a record may or may not exist.
2. **Find + update**: Use `context.db.find()` then `context.db.update()` for conditional logic.
3. **Composite IDs**: For history tables (transfers), use `txHash-logIndex` as a unique ID.
4. **Reading contract state**: Use `context.client` (a viem public client) to call view functions if needed:

```typescript
const name = await context.client.readContract({
  abi: RegistryAbi,
  address: "0x0fdC78e7a68B8c5197895bf92C0058d47f2cc33C",
  functionName: "getName",
  args: [tokenId],
});
```

---

## 7. GraphQL API (src/api/index.ts)

Ponder auto-generates a GraphQL API from your schema. You enable it by registering Hono middleware:

```typescript
import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { graphql } from "ponder";

const app = new Hono();

// GraphQL endpoint (also serves GraphiQL explorer on GET requests)
app.use("/graphql", graphql({ db, schema }));

// Optional: custom REST endpoints
app.get("/health", (c) => c.text("ok"));

export default app;
```

### Auto-generated query types

For each `onchainTable`, Ponder generates:
- **Singular query**: `domain(id: ...)` -- fetch one record by primary key
- **Plural query**: `domains(where: ..., orderBy: ..., limit: ..., after: ..., offset: ...)` -- fetch multiple with filtering, sorting, pagination

### Example GraphQL queries for Claw Domains

**Get a domain by tokenId:**
```graphql
query {
  domain(id: "1") {
    id
    name
    owner
    expires
    registeredAt
  }
}
```

**List all domains for an owner:**
```graphql
query {
  domains(where: { owner: "0x1234..." }, orderBy: "registeredAt", orderDirection: "desc") {
    items {
      id
      name
      owner
      expires
      registeredAt
    }
    totalCount
  }
}
```

**Search domains with pagination:**
```graphql
query {
  domains(limit: 10, offset: 0, orderBy: "name", orderDirection: "asc") {
    items {
      id
      name
      owner
      expires
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}
```

**Get text records for a domain node:**
```graphql
query {
  textRecords(where: { node: "0xabcdef..." }) {
    items {
      key
      value
      updatedAt
    }
  }
}
```

**Get transfer history:**
```graphql
query {
  transfers(
    where: { tokenId: "1" }
    orderBy: "timestamp"
    orderDirection: "desc"
  ) {
    items {
      from
      to
      timestamp
      transactionHash
    }
  }
}
```

### Filtering operators

| Operator | Description | Example |
|----------|-------------|---------|
| `{column}` | Equals | `owner: "0x..."` |
| `{column}_not` | Not equals | `owner_not: "0x..."` |
| `{column}_in` | In list | `owner_in: ["0x...", "0x..."]` |
| `{column}_gt` | Greater than | `expires_gt: "1700000000"` |
| `{column}_gte` | Greater or equal | `registeredAt_gte: "1600000000"` |
| `{column}_lt` | Less than | `expires_lt: "1800000000"` |
| `{column}_lte` | Less or equal | |
| `{column}_contains` | String contains | `name_contains: "claw"` |
| `{column}_starts_with` | String starts with | `name_starts_with: "my"` |
| `{column}_ends_with` | String ends with | `name_ends_with: ".claw"` |
| `AND` / `OR` | Compose filters | `AND: [{ ... }, { ... }]` |

### Frontend integration

From a Next.js frontend, query the Ponder GraphQL API:

```typescript
const PONDER_URL = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069";

async function fetchDomains(owner: string) {
  const response = await fetch(`${PONDER_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetDomains($owner: String!) {
          domains(where: { owner: $owner }) {
            items {
              id
              name
              expires
              registeredAt
            }
            totalCount
          }
        }
      `,
      variables: { owner },
    }),
  });
  const { data } = await response.json();
  return data.domains;
}
```

---

## 8. Custom Chain Configuration (Arc Testnet)

Arc Testnet is a custom EVM chain not natively supported by viem's chain definitions. Ponder handles this well -- you only need the chain ID and RPC URL.

### Chain config in ponder.config.ts

```typescript
chains: {
  arcTestnet: {
    id: 5042002,
    rpc: process.env.PONDER_RPC_URL_ARC_TESTNET,
    // Optional: WebSocket for faster block detection
    // ws: process.env.PONDER_WS_URL_ARC_TESTNET,
  },
},
```

### Environment variable

```env
PONDER_RPC_URL_ARC_TESTNET=https://rpc-testnet.arc.network
```

### What Ponder needs from the RPC

Ponder uses standard JSON-RPC methods:
- `eth_getLogs` -- to fetch event logs
- `eth_getBlockByNumber` -- to get block data
- `eth_chainId` -- to verify chain ID
- `eth_call` -- for contract read calls in indexing functions

As long as the Arc Testnet RPC supports these standard methods, Ponder will work. No custom chain definition (like viem's `defineChain`) is needed in the Ponder config.

---

## 9. Deployment to Railway

Railway is the recommended hosting platform for Ponder. Here is the complete deployment process.

### Step-by-step

1. **Push to GitHub**: Ensure the Ponder project is in a GitHub repository.

2. **Create Railway project**: Log into Railway, select **New Project** -> **Deploy from GitHub repo**, choose your repo.

3. **Provision PostgreSQL**: Click **Create** -> **Database** -> **Add PostgreSQL**. Copy the `DATABASE_URL` connection string.

4. **Set environment variables** on the Ponder service:
   - `DATABASE_URL` -- reference the Railway PostgreSQL variable
   - `PONDER_RPC_URL_ARC_TESTNET` -- `https://rpc-testnet.arc.network`

5. **Set custom start command** in Settings -> Deploy:
   ```
   pnpm start --schema $RAILWAY_DEPLOYMENT_ID
   ```
   The `--schema` flag is required for zero-downtime deployments. Each deployment gets its own database schema, and Railway swaps traffic once the new deployment is healthy.

6. **Generate a public domain** in Settings -> Networking. This is the URL your frontend will query.

7. **Configure healthcheck** in Settings -> Deploy:
   - Healthcheck Path: `/ready`
   - Healthcheck Timeout: `3600` (seconds, the maximum -- Ponder needs time for initial backfill)

8. **Monorepo setup** (if Ponder is in `packages/ponder/`):
   - Set Root Directory to `packages/ponder`
   - Or use start command: `cd packages/ponder && pnpm start --schema $RAILWAY_DEPLOYMENT_ID`

### Railway configuration summary

| Setting | Value |
|---------|-------|
| Start command | `pnpm start --schema $RAILWAY_DEPLOYMENT_ID` |
| Healthcheck path | `/ready` |
| Healthcheck timeout | `3600` |
| Database | Railway PostgreSQL |
| Env: DATABASE_URL | From Railway Postgres service |
| Env: PONDER_RPC_URL_ARC_TESTNET | `https://rpc-testnet.arc.network` |

### Production database config

When `DATABASE_URL` is set, Ponder automatically uses PostgreSQL. No explicit `database` configuration is needed in `ponder.config.ts`, but you can add it for clarity:

```typescript
export default createConfig({
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL,
  },
  // ... chains, contracts
});
```

---

## 10. Gotchas and Considerations

### Custom chain gotchas

1. **startBlock matters a lot**: Setting `startBlock: 0` on a chain with millions of blocks means Ponder scans every block from genesis. Always use the contract deployment block number. This can reduce initial sync from hours to minutes.

2. **RPC rate limits**: Ponder makes many `eth_getLogs` calls during backfill. If the Arc Testnet RPC has rate limits, Ponder handles retries automatically but sync will be slow. Consider using a dedicated/premium RPC endpoint if available.

3. **RPC compatibility**: Some custom chains have non-standard RPC behavior. If `eth_getLogs` doesn't support large block ranges, Ponder will automatically chunk requests. This should work transparently.

4. **No WebSocket required**: Ponder works fine with HTTP-only RPC. WebSocket (`ws`) is optional and only helps with faster new-block detection (polling vs. subscription).

5. **Block finality**: Ponder handles chain reorgs automatically. On testnets with fast block times or unusual finality, this should still work but watch for edge cases.

### Schema gotchas

6. **bigint primary keys**: When using `t.bigint()` as a primary key, GraphQL queries expect the value as a string (e.g., `domain(id: "1")`), not a number.

7. **Hex values are lowercase**: Ponder normalizes all hex values to lowercase. Be consistent in your frontend queries.

8. **No migrations**: Schema changes in development cause Ponder to drop and recreate tables. In production, use the `--schema` flag for isolated deployments.

### Event handler gotchas

9. **Event ordering**: Events within a block are processed in log index order. Across blocks, they are processed in block order. You can rely on this ordering.

10. **Transfer events on mint**: ERC-721 `Transfer` events fire on mint (from address zero). The `DomainRegistered` handler and `Transfer` handler will both fire. Design your handlers to handle this overlap (e.g., skip owner updates when `from` is zero address in Transfer handler).

11. **No async outside handlers**: All database operations must happen inside indexing functions. You cannot set up timers or external API calls.

### Deployment gotchas

12. **Healthcheck timeout**: Set this to the maximum (3600s on Railway). Initial backfill can take a long time, and Railway will kill the service if the healthcheck fails before backfill completes.

13. **Zero-downtime deployments**: The `--schema $RAILWAY_DEPLOYMENT_ID` flag is essential. Without it, deployments will have downtime as the database is wiped and re-indexed.

14. **Database size**: Each deployment creates a new schema. Old schemas are not automatically cleaned up. Monitor database size on Railway.

### Performance considerations

15. **Database indexes**: Add indexes on columns you filter/sort by in GraphQL queries. Without indexes, queries on large datasets will be slow.

16. **Limit query depth**: Ponder recommends limiting GraphQL query depth to 2 layers maximum to avoid performance issues.

---

## 11. Claw Domains Implementation Plan

### ABI files needed

Create two ABI files from the contract ABIs. These must use `as const` assertion:

**abis/Registry.ts** -- Include events: `DomainRegistered`, `DomainRenewed`, `Transfer`, and any view functions you want to call (e.g., `getName`, `getPrice`, `available`).

**abis/Resolver.ts** -- Include events: `AddrChanged`, `TextChanged`, and view functions: `addr`, `text`.

### Files to create

| File | Purpose |
|------|---------|
| `packages/ponder/package.json` | Dependencies and scripts |
| `packages/ponder/tsconfig.json` | TypeScript config |
| `packages/ponder/ponder.config.ts` | Chain + contract config |
| `packages/ponder/ponder.schema.ts` | Database schema |
| `packages/ponder/src/index.ts` | Event handlers |
| `packages/ponder/src/api/index.ts` | GraphQL API setup |
| `packages/ponder/abis/Registry.ts` | Registry ABI |
| `packages/ponder/abis/Resolver.ts` | Resolver ABI |
| `packages/ponder/.env.local` | Local env vars |
| `packages/ponder/.gitignore` | Ignore .ponder, node_modules, .env.local |

### Data flow

```
Arc Testnet (EVM)
    │
    ▼ (eth_getLogs via RPC)
Ponder Indexer
    │
    ▼ (indexing functions transform events)
PostgreSQL Database
    │
    ▼ (auto-generated)
GraphQL API (:42069/graphql)
    │
    ▼ (fetch from frontend)
Next.js Web App
```

### Key queries the frontend will need

1. **My domains**: All domains owned by a connected wallet address
2. **Domain lookup**: Search for a domain by name
3. **Domain details**: Full info for a domain (owner, expiry, resolver records)
4. **Transfer history**: All transfers for a domain
5. **Text records**: Avatar, URL, description for a domain
6. **Recent registrations**: Latest domains registered (for a landing page feed)
7. **Domain availability**: Check if a name is taken (can also be done on-chain)

---

## 12. Sources

- [Ponder Documentation -- Get Started](https://ponder.sh/docs/get-started)
- [Ponder Documentation -- Contract Configuration](https://ponder.sh/docs/config/contracts)
- [Ponder Documentation -- Indexing Functions API Reference](https://ponder.sh/docs/api-reference/ponder/indexing-functions)
- [Ponder Documentation -- GraphQL API](https://ponder.sh/docs/query/graphql)
- [Ponder Documentation -- Deploy on Railway](https://ponder.sh/docs/production/railway)
- [Ponder Documentation -- Config API Reference](https://ponder.sh/docs/api-reference/ponder/config)
- [Ponder Documentation -- Schema Tables](https://ponder.sh/docs/0.10/schema/tables)
- [Ponder Documentation -- CLI Reference](https://ponder.sh/docs/0.10/api-reference/ponder/cli)
- [Ponder Documentation -- Self-Hosting](https://ponder.sh/docs/0.10/production/self-hosting)
- [Ponder GitHub Repository](https://github.com/ponder-sh/ponder)
- [Railway Ponder Template](https://railway.com/template/ma-2Wo)
