# .claw Domains — Agent & Developer Guide

## What are .claw domains?

.claw domains are the identity layer for AI agents on Arc Network. Built on Arc — a chain designed for ultra-cheap, ultra-fast transactions — .claw domains give your agent a human-readable name (e.g. `my-agent.claw`), an official payment address, and a rich set of metadata records so people can find, verify, and interact with your agent. Arc's low fees and near-instant finality make it ideal for AI agent payments, where microtransactions need to settle quickly without eating into margins.

Each domain is an ERC-721 NFT owned by the agent's operator. Register your agent, set a payment address so users can pay it, attach contact records (email, url, twitter, github, description), and add any custom key-value metadata you need. The domain is yours — an NFT you own and control.

## Network

| Property | Value |
|---|---|
| Chain | Arc Testnet |
| Chain ID | `5042002` |
| RPC URL | `https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1` |
| Block Explorer | `https://testnet.arc.network` |
| Native Currency | ARC (18 decimals) |

## Contract Addresses

| Contract | Address |
|---|---|
| ClawRegistry | `0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3` |
| ClawResolver | `0x3DD454c7b4FFe55469a5710A86fe86ab9f85c75e` |
| USDC | `0x3600000000000000000000000000000000000000` |

## Pricing

We're on testnet — registration costs a negligible amount of test USDC (10 raw units, or $0.00001) for any domain length. Basically free.

Registration duration is fixed at 1 year (365 days).

## Getting Testnet Funds

You need ARC (for gas) and testnet USDC (for registration):

- **USDC faucet**: [https://faucet.circle.com/](https://faucet.circle.com/) (select Arc Testnet)
- **ARC faucet**: [https://easyfaucetarc.xyz/](https://easyfaucetarc.xyz/)

## Registration Flow (using `cast`)

### Step 1: Check availability

```bash
cast call 0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3 \
  "available(string)(bool)" "myname" \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1
```

Returns `true` if the name is available.

### Step 2: Get the price

```bash
cast call 0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3 \
  "getUsdcPrice(string)(uint256)" "myname" \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1
```

Returns the price in USDC raw units (6 decimals). Currently returns `10` for all names.

### Step 3: Approve USDC spending

```bash
cast send 0x3600000000000000000000000000000000000000 \
  "approve(address,uint256)" \
  0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3 1000000 \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1 \
  --private-key $PRIVATE_KEY
```

### Step 4: Register the domain

```bash
cast send 0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3 \
  "register(string,address)" "myname" 0xYOUR_ADDRESS \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1 \
  --private-key $PRIVATE_KEY
```

The domain NFT is minted to the specified address. Registration lasts 1 year.

## Resolver: Setting Records

The Resolver contract stores address and text records for each domain. Use address records to set your agent's official payment address, and text records to publish contact info and metadata about your agent. You need the domain's **namehash** (a `bytes32` value) to interact with the resolver.

### Computing the namehash

The namehash for `label.claw` is computed as:

```
node = keccak256(keccak256(0x00..00 || keccak256("claw")) || keccak256(label))
```

You can compute it with cast:

```bash
# Step 1: hash "claw"
CLAW_HASH=$(cast keccak "claw")

# Step 2: hash(0x00..00 || CLAW_HASH) — the .claw TLD node
TLD_NODE=$(cast keccak $(cast abi-encode "f(bytes32,bytes32)" 0x0000000000000000000000000000000000000000000000000000000000000000 $CLAW_HASH))

# Step 3: hash(TLD_NODE || keccak(label)) — the full domain node
LABEL_HASH=$(cast keccak "myname")
NODE=$(cast keccak $(cast abi-encode "f(bytes32,bytes32)" $TLD_NODE $LABEL_HASH))
```

### Set an address record

Set the payment address for your agent so users and other agents can send it funds. Because Arc settles transactions in seconds with negligible gas costs, payments to your agent's .claw address arrive almost instantly — no waiting, no expensive fees cutting into what you earn.

```bash
cast send 0x3DD454c7b4FFe55469a5710A86fe86ab9f85c75e \
  "setAddr(bytes32,address)" $NODE 0xYOUR_ADDRESS \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1 \
  --private-key $PRIVATE_KEY
```

### Read an address record

```bash
cast call 0x3DD454c7b4FFe55469a5710A86fe86ab9f85c75e \
  "addr(bytes32)(address)" $NODE \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1
```

### Set a text record

Use text records to publish your agent's contact info and metadata. Common keys include `email`, `url`, `twitter`, `github`, and `description` — but you can use any custom key to store arbitrary metadata about your agent.

```bash
cast send 0x3DD454c7b4FFe55469a5710A86fe86ab9f85c75e \
  "setText(bytes32,string,string)" $NODE "twitter" "@myhandle" \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1 \
  --private-key $PRIVATE_KEY
```

### Read a text record

```bash
cast call 0x3DD454c7b4FFe55469a5710A86fe86ab9f85c75e \
  "text(bytes32,string)(string)" $NODE "twitter" \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1
```

## Renewing a Domain

To renew, you need the `tokenId` (which equals `uint256(namehash(label))`):

```bash
# Approve USDC for renewal
cast send 0x3600000000000000000000000000000000000000 \
  "approve(address,uint256)" \
  0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3 1000000 \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1 \
  --private-key $PRIVATE_KEY

# Renew (tokenId is uint256 of the namehash)
cast send 0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3 \
  "renew(uint256)" $TOKEN_ID \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1 \
  --private-key $PRIVATE_KEY
```

## Querying Domains (Ponder GraphQL)

The Ponder indexer provides a GraphQL API for querying registered domains.

**Endpoint**: `https://ponder-indexer-production.up.railway.app/graphql`

### Example queries

**Look up a domain by name:**

```graphql
{
  domains(where: { name: "alice" }) {
    items {
      id
      name
      owner
      expires
      registeredAt
    }
  }
}
```

**List all domains for an owner:**

```graphql
{
  domains(where: { owner: "0x..." }) {
    items {
      id
      name
      expires
    }
  }
}
```

**List recent registrations:**

```graphql
{
  domains(orderBy: "registeredAt", orderDirection: "desc", limit: 10) {
    items {
      name
      owner
      registeredAt
    }
  }
}
```

## Label Validation Rules

- Lowercase alphanumeric and hyphens only: `[a-z0-9-]`
- Length: 1-63 characters
- Cannot start or end with a hyphen
- No dots (the `.claw` TLD is implicit)

## Key Contract Functions Reference

### ClawRegistry (`0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3`)

| Function | Type | Signature |
|---|---|---|
| `available(string name)` | view | Returns `bool` |
| `getUsdcPrice(string name)` | view | Returns `uint256` (USDC, 6 decimals) |
| `register(string name, address domainOwner)` | write | Registers and mints NFT |
| `registerWithPermit(string name, address domainOwner, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)` | write | Register with USDC permit (single tx) |
| `renew(uint256 tokenId)` | write | Extends by 1 year |
| `renewWithPermit(uint256 tokenId, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)` | write | Renew with USDC permit (single tx) |
| `nameExpires(uint256 tokenId)` | view | Returns `uint256` (unix timestamp) |
| `getName(uint256 tokenId)` | view | Returns `string` |
| `ownerOf(uint256 tokenId)` | view | Returns `address` |
| `setResolver(uint256 tokenId, address resolverAddr)` | write | Sets resolver contract |

### ClawResolver (`0x3DD454c7b4FFe55469a5710A86fe86ab9f85c75e`)

| Function | Type | Signature |
|---|---|---|
| `setAddr(bytes32 node, address newAddr)` | write | Set address record |
| `addr(bytes32 node)` | view | Returns `address` |
| `setText(bytes32 node, string key, string value)` | write | Set text record (any key) |
| `text(bytes32 node, string key)` | view | Returns `string` |

### USDC (`0x3600000000000000000000000000000000000000`)

| Function | Type | Signature |
|---|---|---|
| `approve(address spender, uint256 amount)` | write | Approve spending |
| `balanceOf(address account)` | view | Returns `uint256` |
| `allowance(address owner, address spender)` | view | Returns `uint256` |
