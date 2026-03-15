# .claw Domains — Agent & Developer Guide

## What are .claw domains?

.claw domains are human-readable names on Arc Network — like ENS, but for the Arc ecosystem. Each domain (e.g. `alice.claw`) is an ERC-721 NFT that maps a name to wallet addresses and text records. Registration is paid in USDC.

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
| ClawRegistry | `0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C` |
| ClawResolver | `0xDF4FaEc0390505f394172D87faa134872b2D54B4` |
| USDC | `0x3600000000000000000000000000000000000000` |

## Pricing (USDC, 6 decimals)

| Name Length | Price | Raw Value |
|---|---|---|
| 5+ characters | $5 | `5000000` |
| 4 characters | $20 | `20000000` |
| 3 characters | $50 | `50000000` |
| 1-2 characters | $200 | `200000000` |

Registration duration is fixed at 1 year (365 days).

## Getting Testnet Funds

You need ARC (for gas) and testnet USDC (for registration):

- **ARC faucet**: [https://easyfaucetarc.xyz/](https://easyfaucetarc.xyz/)
- **USDC faucet**: [https://faucet.circle.com/](https://faucet.circle.com/) (select Arc Testnet)

## Registration Flow (using `cast`)

### Step 1: Check availability

```bash
cast call 0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C \
  "available(string)(bool)" "myname" \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1
```

Returns `true` if the name is available.

### Step 2: Get the price

```bash
cast call 0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C \
  "getUsdcPrice(string)(uint256)" "myname" \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1
```

Returns the price in USDC (6 decimals). For a 5+ character name, this returns `5000000` ($5).

### Step 3: Approve USDC spending

```bash
cast send 0x3600000000000000000000000000000000000000 \
  "approve(address,uint256)" \
  0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C 5000000 \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1 \
  --private-key $PRIVATE_KEY
```

### Step 4: Register the domain

```bash
cast send 0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C \
  "register(string,address)" "myname" 0xYOUR_ADDRESS \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1 \
  --private-key $PRIVATE_KEY
```

The domain NFT is minted to the specified address. Registration lasts 1 year.

## Resolver: Setting Records

The Resolver contract stores address and text records for each domain. You need the domain's **namehash** (a `bytes32` value) to interact with the resolver.

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

```bash
cast send 0xDF4FaEc0390505f394172D87faa134872b2D54B4 \
  "setAddr(bytes32,address)" $NODE 0xYOUR_ADDRESS \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1 \
  --private-key $PRIVATE_KEY
```

### Read an address record

```bash
cast call 0xDF4FaEc0390505f394172D87faa134872b2D54B4 \
  "addr(bytes32)(address)" $NODE \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1
```

### Set a text record

Supported text record keys: `avatar`, `url`, `email`, `twitter`, `github`, `description`

```bash
cast send 0xDF4FaEc0390505f394172D87faa134872b2D54B4 \
  "setText(bytes32,string,string)" $NODE "twitter" "@myhandle" \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1 \
  --private-key $PRIVATE_KEY
```

### Read a text record

```bash
cast call 0xDF4FaEc0390505f394172D87faa134872b2D54B4 \
  "text(bytes32,string)(string)" $NODE "twitter" \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1
```

## Renewing a Domain

To renew, you need the `tokenId` (which equals `uint256(namehash(label))`):

```bash
# Approve USDC for renewal
cast send 0x3600000000000000000000000000000000000000 \
  "approve(address,uint256)" \
  0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C 5000000 \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1 \
  --private-key $PRIVATE_KEY

# Renew (tokenId is uint256 of the namehash)
cast send 0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C \
  "renew(uint256)" $TOKEN_ID \
  --rpc-url https://arc-testnet.g.alchemy.com/v2/g4KibOrEWcbr0Su8y6WA1 \
  --private-key $PRIVATE_KEY
```

## Querying Domains (Ponder GraphQL)

The Ponder indexer provides a GraphQL API for querying registered domains.

**Endpoint**: `http://localhost:42069/graphql` (default local) or set via `CLAW_PONDER_URL` environment variable.

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
      resolver
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

## Label Validation Rules

- Lowercase alphanumeric and hyphens only: `[a-z0-9-]`
- Length: 1-63 characters
- Cannot start or end with a hyphen
- No dots (the `.claw` TLD is implicit)

## Key Contract Functions Reference

### ClawRegistry (`0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C`)

| Function | Type | Signature |
|---|---|---|
| `available(string name)` | view | Returns `bool` |
| `getUsdcPrice(string name)` | view | Returns `uint256` (USDC, 6 decimals) |
| `register(string name, address domainOwner)` | write | Registers and mints NFT |
| `renew(uint256 tokenId)` | write | Extends by 1 year |
| `nameExpires(uint256 tokenId)` | view | Returns `uint256` (unix timestamp) |
| `getName(uint256 tokenId)` | view | Returns `string` |
| `ownerOf(uint256 tokenId)` | view | Returns `address` |
| `setResolver(uint256 tokenId, address resolverAddr)` | write | Sets resolver contract |

### ClawResolver (`0xDF4FaEc0390505f394172D87faa134872b2D54B4`)

| Function | Type | Signature |
|---|---|---|
| `setAddr(bytes32 node, address newAddr)` | write | Set address record |
| `addr(bytes32 node)` | view | Returns `address` |
| `setText(bytes32 node, string key, string value)` | write | Set text record |
| `text(bytes32 node, string key)` | view | Returns `string` |

### USDC (`0x3600000000000000000000000000000000000000`)

| Function | Type | Signature |
|---|---|---|
| `approve(address spender, uint256 amount)` | write | Approve spending |
| `balanceOf(address account)` | view | Returns `uint256` |
| `allowance(address owner, address spender)` | view | Returns `uint256` |
